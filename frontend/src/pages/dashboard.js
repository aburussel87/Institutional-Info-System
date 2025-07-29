import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/header';
import API_BASE_URL from '../config/config';
import { Bar } from 'react-chartjs-2';
import { Modal, Button, Spinner } from 'react-bootstrap';
import '../styles/dashboard.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [routine, setRoutine] = useState([]);
  const [routineMap, setRoutineMap] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [courses, setCourses] = useState([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [sessionInfo, setSessionInfo] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [showCourseMaterials, setShowCourseMaterials] = useState(false);
  const [courseMaterials, setCourseMaterials] = useState([]);

  const navigate = useNavigate();

  const handleCloseRoutineModal = () => setShowRoutineModal(false);
  const handleShowRoutineModal = () => setShowRoutineModal(true);
  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setCourseDetails(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    const fetchDashboardData = async () => {
      setLoadingChart(true);
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/student`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const error = await response.json();
          alert('Failed to load dashboard: ' + (error.error || 'Unknown error'));
          setTimeout(() => navigate('/login'), 1000);
          return;
        }
        const data = await response.json();
        setUser(data.user);
        setCourses(data.courses || []);
        setSessionInfo(data.session_info || []);
        const today = new Date();
        let weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = today.toLocaleDateString('en-GB');
        setCurrentDate(`${weekday}, ${formattedDate}`);
        setRoutine(data.routine?.[weekday] || ["No classes scheduled for today."]);
        setRoutineMap(data.routine || {});
      } catch (err) {
        setMsg(err.message || 'Unknown error');
        setTimeout(() => navigate('/login'), 1000);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (!showCourseMaterials) return;
    const fetchCourseMaterials = async () => {
      if (!courseDetails) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/courseMaterials/student/get`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            course_id: courseDetails.course_id
          })
        });
        if (!res.ok) throw new Error("Failed to fetch course materials");
        const data = await res.json();
        setCourseMaterials(Array.isArray(data.materials) ? data.materials : []);
      } catch (err) {
        alert(err.message);
      }
    };
    fetchCourseMaterials();
  }, [showCourseMaterials, courseDetails]);

  const CourseMaterialsViewer = ({ materials, onDownload }) => {
    const [index, setIndex] = useState(0);
    if (!materials || materials.length === 0) {
      return <p className="text-muted">No materials uploaded.</p>;
    }
    const current = materials[index];
    const formattedDate = new Date(current.upload_date).toLocaleString();
    const prev = () => setIndex((i) => (i > 0 ? i - 1 : 0));
    const next = () => setIndex((i) => (i < materials.length - 1 ? i + 1 : materials.length - 1));
    return (
      <div className="material-viewer-modern d-flex flex-column align-items-center p-3">
        <div className="viewer-box-classic w-100 d-flex align-items-center justify-content-between rounded shadow-sm mb-2 p-3">
          <button
            onClick={prev}
            className="arrow-btn-classic"
            disabled={index === 0}
            aria-label="Previous"
          >
            &#8592;
          </button>
          <div className="material-content flex-fill text-center">
            <h6 className="material-title mb-2">{current.description}</h6>
            <p className="material-date small mb-2">
              Uploaded: <span className="fw-semibold">{formattedDate}</span>
            </p>
            <Button
              size="sm"
              variant="primary"
              className="rounded-pill"
              onClick={() => onDownload(current.pdf)}
            >
              Download PDF
            </Button>
          </div>
          <button
            onClick={next}
            className="arrow-btn-classic"
            disabled={index === materials.length - 1}
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>
        <div className="mt-1 text-secondary">Material {index + 1} of {materials.length}</div>
      </div>
    );
  };

  const handleDownloadPdf = (pdfData, filename = "material.pdf") => {
    if (!pdfData || !pdfData.data) {
      alert("No PDF data available.");
      return;
    }
    try {
      const byteArray = new Uint8Array(pdfData.data);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download PDF: Invalid data.");
    }
  };

  const fetchCourseDetails = async (course) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/course-details/${course.course_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch course details");
      const data = await res.json();
      setCourseDetails(data.course[0]);
      setShowCourseModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const findNextOrOngoingClass = () => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayIdx = now.getDay();
    const todayName = weekdays[todayIdx];
    const tomorrowIdx = (todayIdx + 1) % 7;
    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    }
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayRoutine = routineMap[todayName] || [];
    const isFreeOrHoliday = (list) =>
      list.length > 0 && ['Free day', 'holiday', 'no classes'].some(keyword =>
        list[0].toLowerCase().includes(keyword));
    if (!todayRoutine || isFreeOrHoliday(todayRoutine)) {
      return todayRoutine[0] || 'Free Day';
    }
    for (let item of todayRoutine) {
      const match = item.match(/- (\d{2}:\d{2})$/);
      if (match) {
        const classTime = timeToMinutes(match[1]);
        if (currentMinutes >= classTime && currentMinutes <= classTime + 50) {
          return `Ongoing: ${item}`;
        } else if (classTime > currentMinutes) {
          return `Upcoming: ${item}`;
        }
      }
    }
    const tomorrowName = weekdays[tomorrowIdx];
    const tomorrowRoutine = routineMap?.[tomorrowName] || [];
    if (!tomorrowRoutine || isFreeOrHoliday(tomorrowRoutine)) {
      return tomorrowRoutine[0] || 'Free Day';
    }
    return `Next: ${tomorrowRoutine[0]}`;
  };

  const chartData = useMemo(() => {
    const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const labels = [];
    const loginCounts = [];
    const backgroundColors = [];
    const borderColors = [];
    const dataMap = new Map();
    sessionInfo.forEach(item => {
      const dateKey = new Date(item.login_date).toISOString().split('T')[0];
      dataMap.set(dateKey, parseInt(item.login_count, 10));
    });
    const colors = [
      'rgba(33, 133, 208, 0.7)',
      'rgba(219, 68, 55, 0.7)',
      'rgba(244, 180, 0, 0.7)',
      'rgba(15, 157, 88, 0.7)',
      'rgba(60, 64, 67, 0.7)',
      'rgba(142, 36, 170, 0.7)',
      'rgba(239, 83, 80, 0.7)'
    ];
    const borderColorsSolid = [
      'rgba(33, 133, 208, 1)',
      'rgba(219, 68, 55, 1)',
      'rgba(244, 180, 0, 1)',
      'rgba(15, 157, 88, 1)',
      'rgba(60, 64, 67, 1)',
      'rgba(142, 36, 170, 1)',
      'rgba(239, 83, 80, 1)'
    ];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const formattedDateKey = date.toISOString().split('T')[0];
      const dayName = daysOfWeekShort[date.getDay()];
      labels.push(dayName);
      loginCounts.push(dataMap.get(formattedDateKey) || 0);
      backgroundColors.push(colors[6 - i]);
      borderColors.push(borderColorsSolid[6 - i]);
    }
    return {
      labels: labels,
      datasets: [{
        label: 'Student Logins',
        data: loginCounts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }, [sessionInfo]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 15,
            family: 'Poppins, system-ui'
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Login Activity',
        font: {
          size: 20,
          weight: '600',
          family: 'Poppins, system-ui'
        },
        color: '#222'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' logins';
            }
            return label;
          }
        },
        backgroundColor: 'rgba(33,133,208,0.95)',
        bodyFont: { size: 15, weight: '500', family: 'Poppins, system-ui' },
        titleFont: { size: 17, weight: '600' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(33,133,208,0.07)'
        },
        ticks: {
          stepSize: 1,
          font: { size: 13, family: 'IBM Plex Sans, system-ui' },
          color: '#495464'
        },
        title: {
          display: true,
          text: 'Logins',
          font: { size: 15, weight: '700' },
          color: '#495464'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 13, weight: '700' },
          color: '#495464'
        },
        title: {
          display: true,
          text: 'Day',
          font: { size: 15, weight: '700' },
          color: '#495464'
        }
      }
    }
  };

  return (
    <div className="dashboard-container-modern container-fluid px-4 py-3">
      <Header />
      <div className="d-flex justify-content-between align-items-center mt-4 mb-5">
        <h2 className="dashboard-title-classic text-primary">
          Welcome{user ? <span className="text-dark">, {user.user_id}</span> : ''}!
        </h2>
        <Button variant="primary" className="rounded-pill" onClick={handleShowRoutineModal}>
          Today's Routine <i className="bi bi-calendar-check ms-2"></i>
        </Button>
      </div>
      {msg && <div className="alert alert-danger py-2 text-center classic-alert">{msg}</div>}
      <div className="row g-4 mb-4">
        <div className="col-lg-6 col-md-12">
          <div className="card info-card-classic text-center shadow h-100">
            <div className="card-body">
              <h6 className="text-secondary text-uppercase fw-bold small mb-2">Total Enrolled Courses</h6>
              <div className="display-4 text-success fw-bold">{courses.length}</div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12">
          <div className="card info-card-classic text-center shadow h-100">
            <div className="card-body">
              <h6 className="text-secondary text-uppercase fw-bold small mb-2">Upcoming / Ongoing Class</h6>
              <div className="fs-5 fw-bold text-info modern-ongoing">
                {findNextOrOngoingClass()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-4 shadow">
        <div className="card-body">
          <h5 className="mb-4 text-primary classic-section-title">Your Enrolled Courses</h5>
          {courses.length === 0 ? (
            <div className="text-muted text-center py-5">You are not currently enrolled in any courses.</div>
          ) : (
            <div className="courses-scroll-container d-flex flex-wrap gap-4 justify-content-start">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card card-modern border-0 course-card shadow-sm"
                  onClick={() => fetchCourseDetails(course)}
                  style={{ cursor: 'pointer', width: '350px' }}
                >
                  <div className="d-flex align-items-center p-4">
                    <img
                      src={course.photo || `https://ui-avatars.com/api/?name=${course.course_title}&background=33a2d0&color=fff&size=128`}
                      alt="Course"
                      className="rounded-circle me-4 course-thumb shadow"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="course-label text-primary small fw-bold mb-1">{course.course_id}</div>
                      <div className="course-title fs-5 fw-semibold text-truncate" style={{ maxWidth: '220px' }}>
                        {course.course_title}
                      </div>
                      <div className="text-secondary small"><b>Offered By: </b>{course.offered_by}</div>
                    </div>
                    <span className="badge rounded-pill bg-success fs-6 ms-auto px-3 py-2" style={{ fontSize: '1rem', fontWeight: 300 }}>
                      {course.credit_hours || 4} Credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card mb-4 shadow">
        <div className="card-body">
          <h5 className="mb-4 text-primary classic-section-title">Login Activity (Last 7 Days)</h5>
          <div style={{ height: '310px', background: '#f7f9fa', borderRadius: '12px', padding: '1rem' }}>
            {loadingChart ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                <Spinner animation="grow" variant="primary" />
                <span className="ms-2 text-secondary">Loading chart...</span>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
      <Modal show={showRoutineModal} onHide={handleCloseRoutineModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Today's Routine - <span className="text-info">{currentDate}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-3">
          {routine.length > 0 && routine[0] !== "No classes scheduled for today." ? (
            <ul className="list-group list-group-flush">
              {routine.map((item, idx) => (
                <li key={idx} className="list-group-item d-flex align-items-center fs-6 py-3">
                  <i className="bi bi-clock-fill me-2 text-info"></i>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted text-center py-3">No classes scheduled for today.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-pill" onClick={handleCloseRoutineModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCourseModal} onHide={handleCloseCourseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Course Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {courseDetails ? (
            <div className="classic-course-info p-3">
              <h4 className="classic-title mb-4 text-primary fw-bold">{courseDetails.course_id}: {courseDetails.course_title}</h4>
              <dl className="classic-definition-list mb-4">
                <dt className="text-secondary">Offered By:</dt>
                <dd className="text-dark mb-3">{courseDetails.offered_by}</dd>
              </dl>
              <section>
                <div className="mb-3">
                  <h6 className="mb-2 text-info classic-subtitle">Assigned Teacher{courseDetails.assigned_teachers.length > 1 ? 's' : ''}:</h6>
                  {courseDetails.assigned_teachers.length > 0 ? (
                    <ul className="classic-teacher-list">
                      {courseDetails.assigned_teachers.map(t => (
                        <li key={t} className="text-dark">{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted fst-italic">No teachers assigned.</div>
                  )}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="my-3 rounded-pill"
                    onClick={() => setShowCourseMaterials(!showCourseMaterials)}
                  >
                    {showCourseMaterials ? 'Hide Course Materials' : 'Show Course Materials'}
                  </Button>
                  {showCourseMaterials && (
                    <CourseMaterialsViewer materials={courseMaterials} onDownload={handleDownloadPdf} />
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-4">Loading details…</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-pill" onClick={handleCloseCourseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
