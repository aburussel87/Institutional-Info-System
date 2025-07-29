import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './admin_header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/admin_dash.css';

const EveryInfo = () => {
    const navigate = useNavigate();
    const [totalStudents, setTotalStudents] = useState(0);
    const [advisorSummary, setAdvisorSummary] = useState([]);
    const [hallSummary, setHallSummary] = useState([]);
    const [departmentSummary, setDepartmentSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/dashboard/admin`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setTotalStudents(data.totalStudents || 0);
                    setAdvisorSummary(data.advisorSummary || []);
                    setHallSummary(data.hallSummary || []);
                    setDepartmentSummary(data.departmentSummary || []);
                } else {
                    throw new Error(data.error || 'Failed to fetch dashboard data.');
                }

            } catch (err) {
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="dashboard-container loading-state">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container error-state">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <Header />
            <div className="dashboard-container">
                <h1 className="dashboard-title">Admin Dashboard Overview</h1>

                <div className="dashboard-card total-students-card mb-4 p-4 text-center">
                    <h2 className="card-title">Total Enrolled Students</h2>
                    <p className="total-students-count">{totalStudents}</p>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-lg-6 col-md-12">
                        <div className="dashboard-card summary-card">
                            <h3 className="card-title">Advisor Summary</h3>
                            <div className="table-responsive">
                                <table className="table table-hover summary-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Advisor Name</th>
                                            <th>Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {advisorSummary.length > 0 ? (
                                            advisorSummary.map((advisor) => (
                                                <tr key={advisor.advisor_id}>
                                                    <td>{advisor.advisor_id}</td>
                                                    <td>{advisor.advisor_name}</td>
                                                    <td>{advisor.advising_students}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center">No advisor data available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12">
                        <div className="dashboard-card summary-card">
                            <h3 className="card-title">Hall-wise Student Summary</h3>
                            <div className="table-responsive">
                                <table className="table table-hover summary-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Hall Name</th>
                                            <th>Total Students</th>
                                            <th>Provost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hallSummary.length > 0 ? (
                                            hallSummary.map((hall) => (
                                                <tr key={hall.hall_id}>
                                                    <td>{hall.hall_id}</td>
                                                    <td>{hall.hall_name}</td>
                                                    <td>{hall.total_students}</td>
                                                    <td>{hall.provost_name || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No hall data available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-12">
                        <div className="dashboard-card summary-card">
                            <h3 className="card-title">Department-wise Student Summary</h3>
                            <div className="table-responsive">
                                <table className="table table-hover summary-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Department Name</th>
                                            <th>Total Students</th>
                                            <th>HOD Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departmentSummary.length > 0 ? (
                                            departmentSummary.map((dept) => (
                                                <tr key={dept.department_id}>
                                                    <td>{dept.department_id}</td>
                                                    <td>{dept.department_name}</td>
                                                    <td>{dept.total_students}</td>
                                                    <td>{dept.hod_name || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No department data available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EveryInfo;