import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/teacher_info.modern.css';

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
            Authorization: `Bearer ${token}`
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

        setTeacherData(data.teacher);
      } catch (err) {
        setTeacherError(err.message);
      } finally {
        setLoadingTeacher(false);
      }
    };

    fetchTeacherProfile();
  }, [navigate]);

  if (loadingTeacher)
    return (
      <div className="teacher-loader d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  if (teacherError)
    return (
      <div className="teacher-error alert alert-danger text-center m-4" role="alert">
        {teacherError}
      </div>
    );

  // Helper to format date safely
  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const formatDateTime = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return isNaN(date)
      ? 'Invalid Date'
      : date.toLocaleString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  return (
    <>
      <Header />
      <main className="teacher-profile-wrapper">
        <section className="teacher-profile-header card shadow rounded-4 p-4 d-flex flex-column flex-md-row align-items-center gap-4">
          <img
            src={`${API_BASE_URL}/user/photo/${teacherData.teacher_info.teacher_id}`}
            alt={teacherData.username}
            className="teacher-avatar rounded-circle shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                teacherData.username
              )}&background=007bff&color=fff&bold=true&size=128`;
            }}
          />
          <div>
            <h1 className="teacher-name mb-1">{teacherData.username}</h1>
            <p className="teacher-designation mb-0">{teacherData.teacher_info.designation}</p>
          </div>
        </section>

        <section className="teacher-info-grid mt-4 container-xl">
          <div className="teacher-info-card card shadow rounded-4 p-4">
            <h3 className="card-title">Basic Profile</h3>
            <div className="info-desc">
              <span>Email:</span> <span>{teacherData.email || 'N/A'}</span>
            </div>
            <div className="info-desc">
              <span>Phone:</span> <span>{teacherData.phone || 'N/A'}</span>
            </div>
            <div className="info-desc">
              <span>DOB:</span> <span>{formatDate(teacherData.dob)}</span>
            </div>
            <div className="info-desc">
              <span>Gender:</span> <span>{teacherData.gender || 'N/A'}</span>
            </div>
            <div className="info-desc">
              <span>Date Joined:</span> <span>{formatDate(teacherData.date_joined)}</span>
            </div>
            <div className="info-desc">
              <span>Last Login:</span> <span>{formatDateTime(teacherData.last_login)}</span>
            </div>
            <div className="info-desc">
              <span>Two-Factor Auth:</span> <span>{teacherData.two_fa_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="info-desc">
              <span>Active:</span> <span>{teacherData.is_active ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="teacher-info-card card shadow rounded-4 p-4">
            <h3 className="card-title">Academic Details</h3>
            <div className="info-desc">
              <span>Teacher ID:</span> <span>{teacherData.teacher_info.teacher_id}</span>
            </div>
            <div className="info-desc">
              <span>Hire Date:</span> <span>{formatDate(teacherData.teacher_info.hire_date)}</span>
            </div>
          </div>

          <div className="teacher-info-card card shadow rounded-4 p-4">
            <h3 className="card-title">Department</h3>
            <div className="info-desc">
              <span>ID:</span> <span>{teacherData.department.department_id}</span>
            </div>
            <div className="info-desc">
              <span>Name:</span> <span>{teacherData.department.name}</span>
            </div>
          </div>

          <div className="teacher-info-card card shadow rounded-4 p-4">
            <h3 className="card-title">Emergency Contact</h3>
            <div className="info-desc">
              <span>Name:</span> <span>{teacherData.emergency_contact.name}</span>
            </div>
            <div className="info-desc">
              <span>Mobile:</span> <span>{teacherData.emergency_contact.mobile}</span>
            </div>
            <div className="info-desc">
              <span>Address:</span> <span>{teacherData.emergency_contact.address}</span>
            </div>
          </div>

          {teacherData.advisor_info?.total_students && (
            <div className="teacher-info-card card shadow rounded-4 p-4">
              <h3 className="card-title">Advisor Role</h3>
              <div className="info-desc">
                <span>Total Students Advised:</span> <span>{teacherData.advisor_info.total_students}</span>
              </div>
            </div>
          )}

          {teacherData.hod_info?.department_id && (
            <div className="teacher-info-card card shadow rounded-4 p-4">
              <h3 className="card-title">Head of Department Role</h3>
              <div className="info-desc">
                <span>Department ID:</span> <span>{teacherData.hod_info.department_id}</span>
              </div>
              <div className="info-desc">
                <span>Assigned On:</span> <span>{formatDate(teacherData.hod_info.assigned_on)}</span>
              </div>
              <div className="info-desc">
                <span>Resigned On:</span> <span>{teacherData.hod_info.resigned_on ? formatDate(teacherData.hod_info.resigned_on) : 'Still serving'}</span>
              </div>
            </div>
          )}

          {teacherData.provost_info?.hall_id && (
            <div className="teacher-info-card card shadow rounded-4 p-4">
              <h3 className="card-title">Provost Role</h3>
              <div className="info-desc">
                <span>Hall ID:</span> <span>{teacherData.provost_info.hall_id}</span>
              </div>
              <div className="info-desc">
                <span>Assigned On:</span> <span>{formatDate(teacherData.provost_info.assigned_on)}</span>
              </div>
              <div className="info-desc">
                <span>Resigned On:</span> <span>{teacherData.provost_info.resigned_on ? formatDate(teacherData.provost_info.resigned_on) : 'Still serving'}</span>
              </div>
            </div>
          )}

          <div className="teacher-info-card card shadow rounded-4 p-4">
            <h3 className="card-title">Courses Taught</h3>
            {teacherData.courses_taught?.length > 0 ? (
              <ul className="courses-list">
                {teacherData.courses_taught.map((course, idx) => (
                  <li key={idx} className="course-item">
                    <strong>{course.course_title}</strong> ({course.section_type}) – {course.academic_session}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No courses assigned.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default TeacherInfo;
