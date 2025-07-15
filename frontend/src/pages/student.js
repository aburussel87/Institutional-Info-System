import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/studentInfo.css'; 

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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatLastLogin = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="student-info-container d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-info-container alert alert-danger text-center m-4" role="alert">
                Error: {error}
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="student-info-container alert alert-info text-center m-4" role="alert">
                No user information available.
            </div>
        );
    }

    return (
        <div className="student-info-container">
            <div className="main-content container-fluid px-4">
                <Header />
                <h2 className="header text-center my-4 text-primary">Student Profile</h2>

                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                                    <img
                                        src={`${API_BASE_URL}/user/photo/${userInfo.user_id}`} 
                                        alt="User"
                                        className="rounded-circle shadow-sm"
                                        style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid white' }}
                                        onError={(e) => { 
                                            e.target.onerror = null;
                                            e.target.src = `https://ui-avatars.com/api/?name=${userInfo.username}&background=007bff&color=fff&bold=true&size=128`;
                                        }}
                                    />

                                    <div>
                                        <h4 className="mb-0 text-dark">
                                            {userInfo.username} <span className="badge bg-secondary ms-2">{userInfo.role}</span>
                                        </h4>
                                        <p className="text-muted mb-1">{userInfo.email}</p>
                                        <p className="text-muted mb-0">
                                            User ID: <strong className="text-primary">{userInfo.user_id}</strong>
                                        </p>
                                    </div>
                                </div>

                                <h5 className="mb-3 text-primary">Personal Details</h5>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Phone: <span>{userInfo.phone || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Date of Birth: <span>{formatDate(userInfo.dob)}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Gender: <span>{userInfo.gender || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Date Joined: <span>{formatDate(userInfo.date_joined)}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Account Status:{' '}
                                        <span className={`badge ${userInfo.is_active ? 'bg-success' : 'bg-danger'}`}>
                                            {userInfo.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Last Login: <span>{formatLastLogin(userInfo.last_login)}</span>
                                    </li>
                                </ul>

                                <h5 className="mb-3 text-primary">Academic Details</h5>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Department ID: <span>{userInfo.department_id || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Academic Session: <span>{userInfo.academic_session || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Current Semester: <span>{userInfo.current_semester || 'N/A'}</span>
                                    </li>
                                </ul>

                                <h5 className="mb-3 text-primary">Hall & Residency</h5>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Hall Name: <span>{userInfo.hall_name || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Room Number: <span>{userInfo.hall_room_number || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Residency Status: <span>{userInfo.hall_residency_status || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Assigned On: <span>{formatDate(userInfo.hall_assigned_on)}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Vacated On: <span>{formatDate(userInfo.hall_vacated_on)}</span>
                                    </li>
                                </ul>

                                <h5 className="mb-3 text-primary">Emergency Contact</h5>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Name: <span>{userInfo.emergency_contact_name || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Mobile: <span>{userInfo.emergency_contact_mobile || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Address: <span>{userInfo.emergency_contact_address || 'N/A'}</span>
                                    </li>
                                </ul>

                                <h5 className="mb-3 text-primary">Advisor Details</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Advisor Name: <span>{userInfo.advisor_name || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Designation: <span>{userInfo.advisor_designation || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Email: <span>{userInfo.advisor_email || 'N/A'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Phone: <span>{userInfo.advisor_phone || 'N/A'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentInfo;