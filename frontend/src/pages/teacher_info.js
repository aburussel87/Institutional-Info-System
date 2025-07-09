import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/teacher_info.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherInfo = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');

      if (!token || !user_id) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/teacher-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ required_uid: user_id })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            alert('Session expired or unauthorized. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(errorData.error || 'Failed to fetch teacher information.');
        }

        const data = await response.json();

        if (!data.success || !data.teacher) {
          throw new Error('No teacher information found.');
        }

        setTeacher(data.teacher);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherInfo();
  }, [navigate]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <>
      <Header />
      <div className="teacher-container">
        <div className="card profile-card">
          <img
            src={`data:image/jpeg;base64,${teacher.photo}`}
            alt="Teacher"
            className="profile-photo"
          />
          <h2>{teacher.username}</h2>
          <p>{teacher.teacher_info.designation}</p>
        </div>

        <div className="card info-card">
          <h3>Basic Info</h3>
          <p><strong>Email:</strong> {teacher.email}</p>
          <p><strong>Phone:</strong> {teacher.phone}</p>
          <p><strong>DOB:</strong> {teacher.dob}</p>
          <p><strong>Gender:</strong> {teacher.gender}</p>
          <p><strong>Date Joined:</strong> {teacher.date_joined}</p>
          <p><strong>Last Login:</strong> {teacher.last_login}</p>
          <p><strong>2FA:</strong> {teacher.two_fa_enabled ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Active:</strong> {teacher.is_active ? 'Yes' : 'No'}</p>
        </div>

        <div className="card info-card">
          <h3>Teacher Info</h3>
          <p><strong>Teacher ID:</strong> {teacher.teacher_info.teacher_id}</p>
          <p><strong>Hire Date:</strong> {teacher.teacher_info.hire_date}</p>
        </div>

        <div className="card info-card">
          <h3>Department</h3>
          <p><strong>ID:</strong> {teacher.department.department_id}</p>
          <p><strong>Name:</strong> {teacher.department.name}</p>
        </div>

        <div className="card info-card">
          <h3>Emergency Contact</h3>
          <p><strong>Name:</strong> {teacher.emergency_contact.name}</p>
          <p><strong>Mobile:</strong> {teacher.emergency_contact.mobile}</p>
          <p><strong>Address:</strong> {teacher.emergency_contact.address}</p>
        </div>

        {teacher.advisor_info?.total_students && (
          <div className="card info-card">
            <h3>Advisor Info</h3>
            <p><strong>Total Students:</strong> {teacher.advisor_info.total_students}</p>
          </div>
        )}

        {teacher.hod_info?.department_id && (
          <div className="card info-card">
            <h3>HOD Info</h3>
            <p><strong>Department ID:</strong> {teacher.hod_info.department_id}</p>
            <p><strong>Assigned On:</strong> {teacher.hod_info.assigned_on}</p>
            <p><strong>Resigned On:</strong> {teacher.hod_info.resigned_on || 'Still serving'}</p>
          </div>
        )}

        {teacher.provost_info?.hall_id && (
          <div className="card info-card">
            <h3>Provost Info</h3>
            <p><strong>Hall ID:</strong> {teacher.provost_info.hall_id}</p>
            <p><strong>Assigned On:</strong> {teacher.provost_info.assigned_on}</p>
            <p><strong>Resigned On:</strong> {teacher.provost_info.resigned_on || 'Still serving'}</p>
          </div>
        )}

        <div className="card info-card">
          <h3>Courses Taught</h3>
          {teacher.courses_taught?.length > 0 ? (
            <ul>
              {teacher.courses_taught.map((course, idx) => (
                <li key={idx}>
                  <strong>{course.course_title}</strong> ({course.section_type}) – {course.academic_session}
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses assigned.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherInfo;
