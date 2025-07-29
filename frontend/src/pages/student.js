import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/studentInfo.classic.css';

const StudentInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/student-profile`, {
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
          throw new Error(errorData.error || 'Failed to fetch user information.');
        }
        const data = await response.json();
        if (!data.success || !data.Student || data.Student.length === 0) {
          throw new Error('No user information found.');
        }
        setUserInfo(data.Student[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="student-info-page d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-info-page">
        <Header />
        <div className="container pt-4">
          <div className="alert alert-danger classic-alert text-center mt-5 mx-auto">{error}</div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="student-info-page">
        <Header />
        <div className="container pt-4">
          <div className="alert alert-warning classic-alert text-center mt-5 mx-auto">No user information available.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-info-page bg-light min-vh-100">
      <Header />
      <div className="container-xl py-5">
        <h2 className="student-profile-title text-center mb-5 text-primary">Student Profile</h2>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="classic-card shadow bg-white rounded-4 p-md-5 p-3 mx-auto">
              <div className="row gx-4 align-items-center mb-4 pb-4 border-bottom">
                <div className="col-md-auto text-center mb-3 mb-md-0">
                  <img
                    src={`${API_BASE_URL}/user/photo/${userInfo.user_id}`}
                    alt="User"
                    className="classic-avatar shadow-lg border border-2"
                    onError={(e) => { 
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${userInfo.username}&background=3871E0&color=fff&size=128&bold=true`;
                    }}
                  />
                </div>
                <div className="col-md">
                  <div className="mb-2 d-flex flex-wrap align-items-center">
                    <h3 className="mb-0 me-2">{userInfo.username}</h3>
                    <span className="badge bg-secondary fs-6">{userInfo.role}</span>
                  </div>
                  <div className="text-muted mb-2">{userInfo.email}</div>
                  <div className="mb-1 fs-6">
                    <span className="text-primary fw-medium">User ID:</span> <strong>{userInfo.user_id}</strong>
                  </div>
                  <div className="fs-6 mb-1">
                    <span className="text-primary fw-medium">Department:</span> <strong>{userInfo.department_id || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div className="row gx-5 gy-4">
                <div className="col-md-6">
                  <section className="mb-3">
                    <h5 className="classic-section-title text-primary">Personal Details</h5>
                    <ul className="list-group list-group-flush mb-4">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Phone:</span> <span>{userInfo.phone || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Date of Birth:</span> <span>{formatDate(userInfo.dob)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Gender:</span> <span>{userInfo.gender || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Date Joined:</span> <span>{formatDate(userInfo.date_joined)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Account Status:</span>
                        <span className={`badge ${userInfo.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {userInfo.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Last Login:</span> <span>{formatLastLogin(userInfo.last_login)}</span>
                      </li>
                    </ul>
                  </section>
                  <section className="mb-3">
                    <h5 className="classic-section-title text-primary">Hall & Residency</h5>
                    <ul className="list-group list-group-flush mb-4">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Hall Name:</span> <span>{userInfo.hall_name || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Room Number:</span> <span>{userInfo.hall_room_number || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Residency Status:</span> <span>{userInfo.hall_residency_status || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Assigned On:</span> <span>{formatDate(userInfo.hall_assigned_on)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Vacated On:</span> <span>{formatDate(userInfo.hall_vacated_on)}</span>
                      </li>
                    </ul>
                  </section>
                  <section>
                    <h5 className="classic-section-title text-primary">Emergency Contact</h5>
                    <ul className="list-group list-group-flush mb-4">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Name:</span> <span>{userInfo.emergency_contact_name || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Mobile:</span> <span>{userInfo.emergency_contact_mobile || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Address:</span> <span>{userInfo.emergency_contact_address || 'N/A'}</span>
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="col-md-6">
                  <section className="mb-3">
                    <h5 className="classic-section-title text-primary">Academic Details</h5>
                    <ul className="list-group list-group-flush mb-4">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Academic Session:</span> <span>{userInfo.academic_session || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Current Semester:</span> <span>{userInfo.current_semester || 'N/A'}</span>
                      </li>
                    </ul>
                  </section>
                  <section>
                    <h5 className="classic-section-title text-primary">Advisor Details</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Name:</span> <span>{userInfo.advisor_name || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Designation:</span> <span>{userInfo.advisor_designation || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Email:</span> <span>{userInfo.advisor_email || 'N/A'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Phone:</span> <span>{userInfo.advisor_phone || 'N/A'}</span>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 mb-2">
              <button className="btn btn-outline-primary px-4 py-2 rounded-4"
                onClick={() => navigate('/dashboard')}
              >Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;
