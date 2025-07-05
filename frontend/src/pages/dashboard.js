import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/header';
import API_BASE_URL from '../config/config';
import { Bar } from 'react-chartjs-2';
import { Modal, Button } from 'react-bootstrap';
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
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
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

        const today = new Date();
        let weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = today.toLocaleDateString('en-GB');
        setCurrentDate(`${weekday}, ${formattedDate}`);

        setRoutine(data.routine?.[weekday] || ["No classes scheduled for today."]);
        setRoutineMap(data.routine || {});
      } catch (err) {
        setMsg(err.message || 'Unknown error');
        setTimeout(() => navigate('/login'), 1000);
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

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Student Logins',
      data: [5, 12, 8, 6, 9, 3, 7],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Weekly Login Activity',
        font: { size: 16 }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
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
            <Bar data={chartData} options={chartOptions} />
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
