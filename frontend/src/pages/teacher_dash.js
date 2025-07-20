import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/teacher_header';
import API_BASE_URL from '../config/config';
import { Bar } from 'react-chartjs-2';
import { Modal, Button, Spinner } from 'react-bootstrap';
import '../styles/teacher_dash.css';
import AddCourseMaterialForm from './addCourseMaterialForm';
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

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showCourseMaterials, setShowCourseMaterials] = useState(false);
  const [courseMaterials, setCourseMaterials] = useState([]);




  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setCourseDetails(null);
    setShowAddMaterial(false);
    setShowCourseMaterials(false);
  };

  useEffect(() => {
    setLoadingChart(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 10000);
      return;
    }
    const fetchTeacherData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/teacher`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Unknown error');
        }
        const data = await response.json();
        const teacherInfo = data.teacher;
        if (teacherInfo) {
          setTeacher(teacherInfo);
          setCourses(teacherInfo.courses_taught || []);
          setSessionInfo(data.session_info);
        } else {
          throw new Error('Teacher data not found in response.');
        }
      } catch (err) {
        setMsg(err.message || 'Failed to load dashboard. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchTeacherData();
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


  useEffect(() => {
    if (!showCourseMaterials) return;

    const fetchCourseMaterials = async () => {
      if (!courseDetails || !teacher) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/courseMaterials/get`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            course_id: courseDetails.course_id,
            uploaded_by: teacher.user_id
          })
        });
        if (!res.ok) throw new Error("Failed to fetch course materials");
        const data = await res.json();
        setCourseMaterials(Array.isArray(data.materials) ? data.materials : []);
        console.log(data.materials);
      } catch (err) {
        alert(err.message);
      } finally {
       
      }
    };

    fetchCourseMaterials();
  }, [showCourseMaterials, courseDetails, teacher]);




  //handling pdf download function- can be added anywhere we need
  const handleDownloadPdf = (pdfData, filename = "notification.pdf") => {
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
      console.error("Failed to process PDF:", err);
      alert("Failed to download PDF: Invalid data.");
    }
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
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
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
      backgroundColors.push(colors[6 - i]);
      borderColors.push(borderColorsSolid[6 - i]);
    }
    return {
      labels: labels,
      datasets: [{
        label: 'User Logins',
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
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: { display: true, text: 'Weekly Login Activity', font: { size: 18, weight: 'bold' }, color: '#333' },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += context.parsed.y + ' logins';
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
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1, font: { size: 12 }, color: '#555' },
        title: { display: true, text: 'Number of Logins', font: { size: 14, weight: 'bold' }, color: '#555' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 'bold' }, color: '#555' },
        title: { display: true, text: 'Day of Week', font: { size: 14, weight: 'bold' }, color: '#555' }
      }
    }
  };

const CourseMaterialsViewer = ({ materials, onDownload }) => {
  const [index, setIndex] = useState(0);

  if (!materials || materials.length === 0) {
    return <p>No materials uploaded.</p>;
  }

  const current = materials[index];
  const formattedDate = new Date(current.upload_date).toLocaleString();

  const prev = () => setIndex((i) => (i > 0 ? i - 1 : 0));
  const next = () => setIndex((i) => (i < materials.length - 1 ? i + 1 : materials.length - 1));

  return (
    <div
      style={{
        textAlign: "center",
        padding: "1rem",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          minHeight: "150px",
          transition: "all 0.3s ease",
          maxWidth: "90%",
          margin: "0 auto",
        }}
      >
        {/* Left arrow */}
        <button
          onClick={prev}
          style={{
            position: "absolute",
            top: "50%",
            left: "-60px",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            fontSize: "2rem",
            color: "rgba(0,0,0,0.3)",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
        >
          &#8592;
        </button>
        <div style={{ padding: "0 1rem" }}>
          <h5 style={{ marginBottom: "1rem", color: "#333" }}>{current.description}</h5>
          <p style={{ fontSize: "0.7rem", color: "#666" }}>
            Uploaded on: <strong>{formattedDate}</strong>
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onDownload(current.pdf)}
            style={{ marginTop: "0.3rem" }}
          >
            📄 Download PDF
          </Button>
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          style={{
            position: "absolute",
            top: "50%",
            right: "-60px",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            fontSize: "2rem",
            color: "rgba(0,0,0,0.3)",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
        >
          &#8594;
        </button>
      </div>

      <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#888" }}>
        Material {index + 1} of {materials.length}
      </p>
    </div>
  );
};

  return (
    <div className="tdash-container">
      <Header />
      <div className="tdash-header-section">
        <h2 className="tdash-welcome-title">
          Welcome, {teacher ? teacher.username : 'Teacher'}
        </h2>
      </div>

      {msg && <div className="tdash-error-msg">{msg}</div>}

      <div className="tdash-overview d-flex flex-wrap gap-3">
        <div className="tdash-card flex-grow-1" style={{ minWidth: '250px', background: 'linear-gradient(135deg, #c6d3d5ff, #e9f7ef)', borderRadius: '12px', padding: '1.2rem', color: '#333', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <h4 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.8rem', color: '#2c3e50', letterSpacing: '0.5px' }}>👨‍🏫 Teacher Info</h4>
          <p style={{ marginBottom: '0.4rem', fontSize: '2rem' }}>
            <span style={{ color: '#007bff', fontWeight: '600' }}>{teacher?.username || 'username'}</span>
          </p>
          <p style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            <strong style={{ color: '#555' }}>Department:</strong>{' '}
            <span style={{ color: '#16a085', fontWeight: '600' }}>{teacher?.department.name || 'Department Name'}</span>
          </p>
          <p style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            <strong style={{ color: '#555' }}>Designation:</strong>{' '}
            <span style={{ color: '#8e44ad', fontWeight: '600' }}>{teacher?.teacher_info.designation || 'PhD in Artificial Intelligence'}</span>
          </p>
        </div>

        <div className="tdash-card flex-grow-1 d-flex flex-column align-items-center justify-content-center" style={{ minWidth: '200px', background: 'linear-gradient(135deg, #e9f7ef, #c6d3d5ff)', borderRadius: '12px', padding: '1.2rem', color: '#333', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <h4 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.8rem', color: '#2c3e50', letterSpacing: '0.5px' }}>📚 Total Courses</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27ae60', margin: '0' }}>{courses.length}</p>
          {teacher?.provost_info.hall_id && <p style={{ marginBottom: '0', fontSize: '2rem' }}><span style={{ color: '#e67e22', fontWeight: '600' }}>Hall Provost</span></p>}
          {teacher?.hod_info.department_id && <p style={{ marginBottom: '0', fontSize: '2rem' }}><span style={{ color: '#e67e22', fontWeight: '800' }}>Head of the Department</span></p>}
          {teacher?.advisor_info.total_students && <p style={{ marginBottom: '0', fontSize: '2rem' }}><span style={{ color: '#e67e22', fontWeight: '800' }}>Advising {teacher.advisor_info.total_students} students</span></p>}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-primary mb-3">You are assigned with the following courses</h5>
          {courses.length === 0 ? <p className="text-muted">You are not currently assigned with any courses.</p> : (
            <div className="courses-scroll-container">
              {courses.map((course) => (
                <div key={course.id} className="card mb-3 course-card-item" onClick={() => fetchCourseDetails(course)} style={{ cursor: 'pointer' }}>
                  <div className="card-body d-flex align-items-center py-3 justify-content-between">
                    <div className="d-flex align-items-center">
                      <img src={course.photo || `https://ui-avatars.com/api/?name=${course.course_title}&background=007bff&color=fff&bold=true&size=128`} alt="User" className="rounded-circle me-4" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                      <div className="d-flex flex-column">
                        <h5 className="mb-0 text-dark text-truncate" style={{ maxWidth: '300px' }}>{course.course_id}: {course.course_title}</h5>
                        <p className="mb-0 text-muted small"><strong>Section:</strong> {course.section_type}</p>
                      </div>
                    </div>
                    <span className="badge bg-success fs-6">{course.credit_hours || 4} Credits</span>
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
            {loadingChart ? <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}><Spinner animation="border" variant="primary" /><p className="ms-2">Loading chart...</p></div> : <Bar data={chartData} options={chartOptions} />}
          </div>
        </div>
      </div>

      <Modal show={showCourseModal} onHide={handleCloseCourseModal} centered>
        <Modal.Header closeButton><Modal.Title>Course Info</Modal.Title></Modal.Header>
        <Modal.Body>
          {courseDetails ? (
            <div className="classic-course-info p-4">
              <h3 className="classic-title mb-3">{courseDetails.course_id}: {courseDetails.course_title}</h3>
              <dl className="classic-definition-list">
                <dt>Department:</dt><dd>{courseDetails.department_name}</dd>
                <dt>Semester:</dt><dd>{courseDetails.semester}</dd>
                <dt>Offered By:</dt><dd>{courseDetails.offered_by}</dd>
                <dt>Total Enrolled Students:</dt><dd>{courseDetails.enrolled_students}</dd>
              </dl>
              <div className="mt-4">
                <Button variant="outline-primary" size="sm" onClick={() => setShowAddMaterial(!showAddMaterial)} className="mb-2">{showAddMaterial ? 'Hide Add Course Material' : 'Add Course Material'}</Button>
                {showAddMaterial && <div className="mt-4"><AddCourseMaterialForm courseId={courseDetails.course_id} teacherId={teacher.user_id} onSuccess={() => alert('Material uploaded')} /></div>}
                <span style={{ display: 'inline-block', width: '1rem' }}></span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowCourseMaterials(!showCourseMaterials)}
                  className="mb-2"
                >
                  {showCourseMaterials ? 'Hide Course Materials' : 'Show Course Materials'}
                </Button>

                {showCourseMaterials && (
                  <CourseMaterialsViewer materials={courseMaterials} onDownload={handleDownloadPdf} />
                )}
              </div>
            </div>
          ) : <p>Loading details…</p>}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={handleCloseCourseModal}>Close</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
