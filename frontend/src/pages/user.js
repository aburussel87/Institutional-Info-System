import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/user.css';

const UserDetails = () => {
    const [user, setUser] = useState(null);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in!');
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ required_uid: userId })
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert('Failed to fetch user info: ' + (error.error || 'Unknown error'));
                    return;
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setMsg(err.message || 'Unknown error');
            }
        })();
    }, [navigate, userId]);

    if (msg) {
        return (
            <>
                <Header />
                <div className="container mt-4 alert alert-danger">{msg}</div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <div className="container mt-4 text-center">Loading user details...</div>
            </>
        );
    }

    const { user_table, role_table, emergency_contact } = user;

    return (
        <>
            <Header />
            <div className="main-content container mt-5">
                <div className="glass-card p-4 rounded-4 shadow-lg">
                    <div className="row align-items-center">
                        {/* Image */}
                        <div className="col-md-4 text-center mb-4 mb-md-0">
                            <h5 className="mb-3 fw-bold border-bottom pb-2">User Information</h5>
                            <img
                                src={`${API_BASE_URL}/user/photo/${user_table.user_id}`}
                                alt="User"
                                className="rounded-circle shadow-sm"
                                style={{ width: '180px', height: '180px', objectFit: 'cover', border: '4px solid white' }}
                            />
                            <h4 className="mt-3 mb-1 fw-semibold">{user_table.username}</h4>
                            <span className="badge bg-primary fs-6">{user_table.role}</span>
                        </div>


                        {/* Info */}
                        
                        <div className="col-md-8">
                            <div className="row mb-2">
                                <div className="col-sm-4 fw-semibold">User ID:</div>
                                <div className="col-sm-8">{user_table.user_id}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-sm-4 fw-semibold">Email:</div>
                                <div className="col-sm-8">{user_table.email}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-sm-4 fw-semibold">Phone:</div>
                                <div className="col-sm-8">{user_table.phone}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-sm-4 fw-semibold">Gender:</div>
                                <div className="col-sm-8">{user_table.gender}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-sm-4 fw-semibold">Date of Birth:</div>
                                <div className="col-sm-8">{new Date(user_table.dob).toLocaleDateString()}</div>
                            </div>

                            {/* Role-specific info */}
                            <h5 className="mt-4 fw-bold border-bottom pb-2">{user_table.role} Details</h5>
                            {user_table.role === 'Student' && (
                                <>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Department ID:</div><div className="col-sm-8">{role_table.department_id}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Academic Session:</div><div className="col-sm-8">{role_table.academic_session}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Current Semester:</div><div className="col-sm-8">{role_table.current_semester}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Hall ID:</div><div className="col-sm-8">{role_table.hall_id}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Advisor ID:</div><div className="col-sm-8">{role_table.advisor_id}</div></div>
                                </>
                            )}
                            {user_table.role === 'Teacher' && (
                                <>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Department ID:</div><div className="col-sm-8">{role_table.department_id}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Hire Date:</div><div className="col-sm-8">{new Date(role_table.hire_date).toLocaleDateString()}</div></div>
                                    <div className="row mb-2"><div className="col-sm-4 fw-semibold">Designation:</div><div className="col-sm-8">{role_table.designation}</div></div>
                                </>
                            )}
                            <h5 className="mt-4 fw-bold border-bottom pb-2">Emergency Contact</h5>
                            {emergency_contact && emergency_contact.length > 0 ? (
                                emergency_contact.map((contact, index) => (
                                    <div key={index}>
                                        <div className="row mb-2">
                                            <div className="col-sm-4 fw-semibold">Name:</div>
                                            <div className="col-sm-8">{contact.name}</div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-sm-4 fw-semibold">Phone:</div>
                                            <div className="col-sm-8">{contact.mobile}</div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-sm-4 fw-semibold">Address:</div>
                                            <div className="col-sm-8">{contact.address}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted">No emergency contact found.</div>
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserDetails;
