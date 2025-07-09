import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/teacher_info.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherInfo = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [teacherError, setTeacherError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
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
          body: JSON.stringify({ required_uid: localStorage.getItem('user_id') })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            alert('Session expired or unauthorized. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(errorData.error || 'Failed to fetch teacher profile.');
        }

        const data = await response.json();

        if (!data.success || !data.teacher) {
          throw new Error('No teacher profile found or malformed data.');
        }

        // The key is 'teacher' in the response, and its value is the actual teacher object
        setTeacherData(data.teacher);
      } catch (err) {
        setTeacherError(err.message);
      } finally {
        setLoadingTeacher(false);
      }
    };

    fetchTeacherProfile();
  }, [navigate]);

  if (loadingTeacher) return <div className="teacher-profile-loader">Loading teacher profile...</div>;
  if (teacherError) return <div className="teacher-profile-error-msg">{teacherError}</div>;

  return (
    <>
      <Header />
      <div className="teacher-profile-container">
        <div className="teacher-profile-card">
          <img
            src={`${API_BASE_URL}/user/photo/${teacherData.teacher_info.teacher_id}`} 
            alt="User"
            className="rounded-circle shadow-sm"
            style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid white' }}
            onError={(e) => { 
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${teacherData.username}&background=007bff&color=fff&bold=true&size=128`;
            }}
          />
          <h2>{teacherData.username}</h2>
          <p>{teacherData.teacher_info.designation}</p>
        </div>

        <div className="teacher-info-card">
          <h3>Basic Profile</h3>
          <p><strong>Email:</strong> {teacherData.email}</p>
          <p><strong>Phone:</strong> {teacherData.phone}</p>
          <p><strong>DOB:</strong> {teacherData.dob}</p>
          <p><strong>Gender:</strong> {teacherData.gender}</p>
          <p><strong>Date Joined:</strong> {new Date(teacherData.date_joined).toLocaleDateString()}</p>
          <p><strong>Last Login:</strong> {new Date(teacherData.last_login).toLocaleString()}</p>
          <p><strong>2FA:</strong> {teacherData.two_fa_enabled ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Active:</strong> {teacherData.is_active ? 'Yes' : 'No'}</p>
        </div>

        <div className="teacher-info-card">
          <h3>Academic Details</h3>
          <p><strong>Teacher ID:</strong> {teacherData.teacher_info.teacher_id}</p>
          <p><strong>Hire Date:</strong> {new Date(teacherData.teacher_info.hire_date).toLocaleDateString()}</p>
        </div>

        <div className="teacher-info-card">
          <h3>Department</h3>
          <p><strong>ID:</strong> {teacherData.department.department_id}</p>
          <p><strong>Name:</strong> {teacherData.department.name}</p>
        </div>

        <div className="teacher-info-card">
          <h3>Emergency Contact</h3>
          <p><strong>Name:</strong> {teacherData.emergency_contact.name}</p>
          <p><strong>Mobile:</strong> {teacherData.emergency_contact.mobile}</p>
          <p><strong>Address:</strong> {teacherData.emergency_contact.address}</p>
        </div>

        {teacherData.advisor_info?.total_students && (
          <div className="teacher-info-card">
            <h3>Advisor Role</h3>
            <p><strong>Total Students Advised:</strong> {teacherData.advisor_info.total_students}</p>
          </div>
        )}

        {teacherData.hod_info?.department_id && (
          <div className="teacher-info-card">
            <h3>Head of Department Role</h3>
            <p><strong>Department ID:</strong> {teacherData.hod_info.department_id}</p>
            <p><strong>Assigned On:</strong> {new Date(teacherData.hod_info.assigned_on).toLocaleDateString()}</p>
            <p><strong>Resigned On:</strong> {teacherData.hod_info.resigned_on ? new Date(teacherData.hod_info.resigned_on).toLocaleDateString() : 'Still serving'}</p>
          </div>
        )}

        {teacherData.provost_info?.hall_id && (
          <div className="teacher-info-card">
            <h3>Provost Role</h3>
            <p><strong>Hall ID:</strong> {teacherData.provost_info.hall_id}</p>
            <p><strong>Assigned On:</strong> {new Date(teacherData.provost_info.assigned_on).toLocaleDateString()}</p>
            <p><strong>Resigned On:</strong> {teacherData.provost_info.resigned_on ? new Date(teacherData.provost_info.resigned_on).toLocaleDateString() : 'Still serving'}</p>
          </div>
        )}

        <div className="teacher-info-card">
          <h3>Courses Taught</h3>
          {teacherData.courses_taught?.length > 0 ? (
            <ul className="teacher-courses-list">
              {teacherData.courses_taught.map((course, idx) => (
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