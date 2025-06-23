import API_BASE_URL from '../config/config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/login.css'
const Login = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(prev => !prev);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!username || !password) {
      setMsg('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMsg(`Login failed: ${errorText}`);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setMsg('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Login error:', error);
      setMsg('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100">
      <div className="login-card p-4 rounded-4 shadow-lg">
        <div className="text-center mb-4">
          <img src="/images/logo.png" alt="Finguard Logo" className="logo img-fluid" />
        </div>

        {msg && (
          <div className={`alert ${msg.toLowerCase().includes('success') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {msg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Username or User ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control form-control-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={togglePassword}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-100 btn-lg">Login</button>
        </form>

        <p className="text-center mt-3 signup-text">
          Don’t have an account? <a href="/signup" className="text-info text-decoration-none">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
