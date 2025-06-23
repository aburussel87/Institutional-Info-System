import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/dashboard.css';

const UserInfo = () => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/allUser`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          alert('Failed to load users: ' + (error.error || 'Unknown error'));
          setTimeout(() => navigate('/login'), 1000);
          return;
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setMsg(err.message || 'Unknown error');
        setTimeout(() => navigate('/login'), 1000);
      }
    })();
  }, [navigate]);

  const handleRowClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const filteredUsers = filterRole === 'All'
    ? users
    : users.filter(user => user.role === filterRole);

  return (
    <>
      <Header />
      <div className="main-content container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>All Users</h2>
          <select className="form-select w-auto" value={filterRole} onChange={handleFilterChange}>
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
            <option value="Provost">Provost</option>
          </select>
        </div>

        {msg && <div className="alert alert-danger">{msg}</div>}

        <table className="table table-striped table-bordered shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.user_id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user.user_id)}>
                  <td>{user.user_id}</td>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserInfo;
