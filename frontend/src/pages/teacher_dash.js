import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/teacher_header'; 
import API_BASE_URL from '../config/config';
import { Bar } from 'react-chartjs-2';
import { Modal, Button, Spinner } from 'react-bootstrap';
import '../styles/teacher_dash.css';

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
  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setCourseDetails(null);
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
        console.error("Failed to fetch teacher data:", err); 
        setMsg(err.message || 'Failed to load dashboard. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }finally{
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
    <div className="tdash-container">
      <Header />
      <div className="tdash-header-section">
        <h2 className="tdash-welcome-title">
          Welcome, {teacher ? teacher.username : 'Teacher'}
        </h2>
        <p className="tdash-subtitle">Here is an overview of your courses</p>
      </div>

      {msg && <div className="tdash-error-msg">{msg}</div>}

      <div className="tdash-overview">
        <div className="tdash-card">
          <h4 className="tdash-card-title">Total Courses</h4>
          <p className="tdash-card-value">{courses.length}</p>
        </div>
      </div>

     

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-primary mb-3">You are assigned with the following courses</h5>
          {courses.length === 0 ? (
            <p className="text-muted">You are not currently assigned with any courses.</p>
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
                          <strong>Section:</strong> {course.section_type}
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

export default TeacherDashboard;