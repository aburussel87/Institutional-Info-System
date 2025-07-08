import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/teacher_header'; 
import API_BASE_URL from '../config/config';
import '../styles/teacher_dash.css';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
        } else {
          throw new Error('Teacher data not found in response.');
        }

      } catch (err) {
        console.error("Failed to fetch teacher data:", err); // More descriptive error log
        setMsg(err.message || 'Failed to load dashboard. Please try again.');
        setTimeout(() => navigate('/login'), 2000); // Give user more time to read message
      }
    };

    fetchTeacherData();
  }, [navigate]);

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

      <div className="tdash-courses-section">
        <h4 className="tdash-courses-title">Courses You Teach</h4>
        {courses.length === 0 ? (
          <p className="tdash-empty-msg">No courses assigned yet.</p>
        ) : (
          <div className="tdash-course-list">
            {courses.map((course, index) => (
              <div className="tdash-course-card" key={`${course.course_id}-${index}`}>
                <h5 className="tdash-course-name">
                  {course.course_id}: {course.course_title}
                </h5>
                <p className="tdash-course-credit">
                  Credits: {course.credit_hours} | Section: {course.section_type}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;