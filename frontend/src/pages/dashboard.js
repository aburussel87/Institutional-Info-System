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

const sampleLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const sampleData = [5, 12, 8, 6, 9, 3, 7];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [routine, setRoutine] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [courses, setCourses] = useState([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const navigate = useNavigate();

  const handleShowRoutineModal = () => setShowRoutineModal(true);
  const handleCloseRoutineModal = () => setShowRoutineModal(false);

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
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
        const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = today.toLocaleDateString('en-GB');
        setCurrentDate(`${weekday}, ${formattedDate}`);

        setRoutine(data.routine?.[weekday] || ["No classes scheduled for today."]);
      } catch (err) {
        setMsg(err.message || 'Unknown error');
        setTimeout(() => navigate('/login'), 1000);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const chartData = {
    labels: sampleLabels,
    datasets: [{
      label: 'Student Logins',
      data: sampleData,
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(201, 203, 207, 0.7)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(201, 203, 207, 1)'
      ],
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Login Activity',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="main-content container-fluid px-4">
      <Header />
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1 className="h4 text-primary">Welcome to the Dashboard{user ? `, ${user.user_id || ''}` : ''}!</h1>
        <Button variant="outline-primary" onClick={handleShowRoutineModal}>
          Today's Routine <i className="bi bi-calendar-check ms-2"></i>
        </Button>
      </div>
      {msg && (
        <div className="alert alert-danger text-center" role="alert">
          {msg}
        </div>
      )}

      {/* Information Boxes (2x2 Grid) */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card info-card h-100"> {/* Removed shadow-sm */}
            <div className="card-body text-center">
              <h5 className="card-title text-muted">Total Enrolled Courses</h5>
              <p className="card-text display-5 fw-bold text-success">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card info-card h-100"> {/* Removed shadow-sm */}
            <div className="card-body text-center">
              <h5 className="card-title text-muted">Upcoming Classes Today</h5>
              <p className="card-text display-5 fw-bold text-info">
                {routine.filter(item => item !== "No classes scheduled for today.").length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card info-card h-100"> {/* Removed shadow-sm */}
            <div className="card-body text-center">
              <h5 className="card-title text-muted">New Notifications</h5>
              <p className="card-text display-5 fw-bold text-warning">--</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card info-card h-100"> {/* Removed shadow-sm */}
            <div className="card-body text-center">
              <h5 className="card-title text-muted">Average Grade</h5>
              <p className="card-text display-5 fw-bold text-primary">B+</p>
            </div>
          </div>
        </div>
      </div>


      {/* Enrolled Courses Section */}
      <div className="card mb-4"> {/* Removed shadow-sm */}
        <div className="card-body">
          <h5 className="card-title text-primary mb-3">Your Enrolled Courses</h5>
          {courses.length === 0 ? (
            <p className="text-muted">You are not currently enrolled in any courses.</p>
          ) : (
            // Added a scrollable container for the course cards
            <div className="courses-scroll-container">
              {courses.map((course) => (
                <div key={course.id} className="card mb-3 course-card-item"> {/* Each course is now a separate card, no shadow-sm here either */}
                  <div className="card-body d-flex align-items-center py-3 justify-content-between">
                    {/* Part 1: Image, ID, Title, Offered By */}
                    <div className="d-flex align-items-center me-3 flex-shrink-0"> {/* me-3 for spacing to Part 2, flex-shrink-0 to prevent this part from shrinking too much */}
                      <img
                        src={course.image_url || `https://via.placeholder.com/50?text=${course.course_title ? course.course_title.charAt(0) : '?'}`}
                        alt={course.course_title.charAt(0) || 'Course'}
                        className="rounded-circle me-3 course-image"
                      />
                      <div className="d-flex flex-column text-nowrap"> {/* text-nowrap tries to keep title/offeredby on one line if space allows */}
                        <h5 className="mb-0 text-dark text-truncate" style={{ maxWidth: '500px' }}> {/* Add maxWidth for potential truncation */}
                          {course.course_id}: {course.course_title}
                        </h5>
                        <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '150px' }}>
                          <strong>Offered By:</strong> {course.offered_by}
                        </p>
                      </div>
                    </div>

                    {/* Part 2: Teacher Name (Middle, bold, large font, centered) */}
                    <div className="text-center flex-grow-1 px-2"> {/* flex-grow-1 to take available space, px-2 for internal padding */}
                      <p className="my-0 fw-bold fs-6 text-info text-nowrap text-truncate" style={{ maxWidth: '200px', margin: '0 auto' }}>
                        {course.teacher_name || 'N/A'}
                      </p>
                    </div>

                    {/* Part 3: Credits (Tail of the box) */}
                    <div className="d-flex align-items-center ms-3 flex-shrink-0"> {/* ms-3 for spacing from Part 2, flex-shrink-0 to prevent shrinking */}
                      <span className="badge bg-success fs-6 text-nowrap">
                        {course.credit_hours ? course.credit_hours : 4} Credits {/* Default to 4 if null/undefined */}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Login Activity Graph */}
      <div className="card mb-4"> {/* Removed shadow-sm */}
        <div className="card-body">
          <h5 className="card-title text-primary mb-3">Login Activity (Last 7 Days)</h5>
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Today's Routine Modal */}
      <Modal show={showRoutineModal} onHide={handleCloseRoutineModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Today's Routine - {currentDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {routine.length > 0 && routine[0] !== "No classes scheduled for today." ? (
            <ul className="list-group list-group-flush">
              {routine.map((item, idx) => (
                <li key={idx} className="list-group-item d-flex align-items-center">
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
          <Button variant="secondary" onClick={handleCloseRoutineModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;