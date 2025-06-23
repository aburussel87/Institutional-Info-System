import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Gradesheet  from './pages/gradesheet';
import UserInfo from './pages/userInfo';

import 'bootstrap/dist/css/bootstrap.min.css';

// Simple auth check based on token existence
const isAuthenticated = () => !!localStorage.getItem('token');

// Protected route wrapper
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/gradesheet" element={<Gradesheet />} />
        <Route path="/userInfo" element={<UserInfo/>}/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}


