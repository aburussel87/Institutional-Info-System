import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from './header';
import API_BASE_URL from '../config/config';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import '../styles/dashboard.css'; // Optional for custom styling

const UserInfo =()=> {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
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

  return (
    <>
      <Header />
      <div className="main-content container mt-5">
        <h2 className="mb-4">All Users</h2>
        {msg && <div className="alert alert-danger">{msg}</div>}
        <table className="table table-striped table-bordered shadow-sm">
          <thead className="thead-dark">
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Username</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id}>
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
}

export default UserInfo;