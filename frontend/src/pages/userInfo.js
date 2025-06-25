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
        console.log('Fetched users:', data.users);
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

        <div className="row">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                onClick={() => handleRowClick(user.user_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="glass-card p-3 h-100 d-flex flex-column justify-content-between">
                  <img
                    src={`${API_BASE_URL}/user/photo/${user.user_id}`}
                    alt="User"
                    className="rounded-circle shadow-sm"
                    style={{ width: '180px', height: '180px', objectFit: 'cover', border: '4px solid white' }}
                  />
                  <h5>User ID: {user.user_id}</h5>
                  <p><strong>Username:</strong> {user.username || 'N/A'}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">No users found.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );

};

export default UserInfo;
