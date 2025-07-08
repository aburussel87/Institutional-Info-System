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
      'rgba(255, 99, 132, 0.8)', // Red
      'rgba(54, 162, 235, 0.8)', // Blue
      'rgba(255, 206, 86, 0.8)', // Yellow
      'rgba(75, 192, 192, 0.8)', // Teal
      'rgba(153, 102, 255, 0.8)',// Purple
      'rgba(255, 159, 64, 0.8)', 
      'rgba(201, 203, 207, 0.8)' 
    ];

    const borderColorsSolid = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(201, 203, 207, 1)'
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const formattedDateKey = date.toISOString().split('T')[0];
      const dayName = daysOfWeekShort[date.getDay()];

      labels.push(dayName);
      loginCounts.push(dataMap.get(formattedDateKey) || 0);
      backgroundColors.push(colors[6 - i]); // Assign color based on position (0-6)
      borderColors.push(borderColorsSolid[6 - i]);
    }

    return {
      labels: labels,
      datasets: [{
        label: 'Student Logins',
        data: loginCounts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 5
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
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Login Activity',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#333'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        bodyFont: { size: 14 },
        titleFont: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          stepSize: 1,
          font: { size: 12 },
          color: '#555'
        },
        title: {
          display: true,
          text: 'Number of Logins',
          font: { size: 14, weight: 'bold' },
          color: '#555'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 12, weight: 'bold' },
          color: '#555'
        },
        title: {
          display: true,
          text: 'Day of Week',
          font: { size: 14, weight: 'bold' },
          color: '#555'
        }
      }
    }
  };

  return (
    <div className="main-content container-fluid px-4">
      <Header />
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1 className="h4 text-primary">Welcome to the Dashboard{user ? `, ${user.user_id}` : ''}!</h1>
        <Button variant="outline-primary" onClick={handleShowRoutineModal}>
          Today's Routine <i className="bi bi-calendar-check ms-2"></i>
        </Button>
      </div>

      {msg && <div className="alert alert-danger text-center">{msg}</div>}

      <div className="row g-4 mb-4">
        <div className="col-lg-6 col-md-6">
          <div className="card info-card h-100">
            <div className="card-body text-center">
              <h5 className="text-muted">Total Enrolled Courses</h5>
              <p className="display-5 fw-bold text-success">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6">
          <div className="card info-card h-100">
            <div className="card-body text-center">
              <h5 className="text-muted">Upcoming / Ongoing Class</h5>
              <p className="fs-5 fw-bold text-info">
                {findNextOrOngoingClass()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-primary mb-3">Your Enrolled Courses</h5>
          {courses.length === 0 ? (
            <p className="text-muted">You are not currently enrolled in any courses.</p>
          ) : (
            <div className="courses-scroll-container">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card mb-3 course-card-item"
                  onClick={() => fetchCourseDetails(course)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body d-flex align-items-center py-3 justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src={course.photo || `https://ui-avatars.com/api/?name=${course.course_title}&background=007bff&color=fff&bold=true&size=128`}
                        alt="User"
                        className="rounded-circle me-4"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <div className="d-flex flex-column">
                        <h5 className="mb-0 text-dark text-truncate" style={{ maxWidth: '300px' }}>
                          {course.course_id}: {course.course_title}
                        </h5>
                        <p className="mb-0 text-muted small">
                          <strong>Offered By:</strong> {course.offered_by}
                        </p>
                      </div>
                    </div>
                    <span className="badge bg-success fs-6">
                      {course.credit_hours || 4} Credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-primary mb-3">Login Activity (Last 7 Days)</h5>
          <div style={{ height: '300px' }}>
            {loadingChart ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                <Spinner animation="border" variant="primary" />
                <p className="ms-2">Loading chart...</p>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      <Modal show={showRoutineModal} onHide={handleCloseRoutineModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Today's Routine - {currentDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {routine.length > 0 && routine[0] !== "No classes scheduled for today." ? (
            <ul className="list-group list-group-flush">
              {routine.map((item, idx) => (
                <li key={idx} className="list-group-item">
                  <i className="bi bi-clock-fill me-2 text-info"></i>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-center">No classes scheduled for today.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRoutineModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCourseModal} onHide={handleCloseCourseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Course Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {courseDetails ? (
            <div className="classic-course-info p-4">
              <h3 className="classic-title mb-3">{courseDetails.course_id}: {courseDetails.course_title}</h3>

              <dl className="classic-definition-list">
                <dt>Department:</dt>
                <dd>{courseDetails.department_name}</dd>

                <dt>Semester:</dt>
                <dd>{courseDetails.semester}</dd>

                <dt>Offered By:</dt>
                <dd>{courseDetails.offered_by}</dd>

                <dt>Total Enrolled Students:</dt>
                <dd>{courseDetails.enrolled_students}</dd>
              </dl>

              <section>
                <h4 className="mt-4 mb-2 classic-subtitle">Assigned Teacher{courseDetails.assigned_teachers.length > 1 ? 's' : ''}:</h4>
                {courseDetails.assigned_teachers.length > 0 ? (
                  <ul className="classic-teacher-list">
                    {courseDetails.assigned_teachers.map(t => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted fst-italic">No teachers assigned.</p>
                )}
              </section>
            </div>
          ) : (
            <p>Loading details…</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCourseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;