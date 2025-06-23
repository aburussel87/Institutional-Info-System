import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS
import Header from '../pages/header';
import API_BASE_URL from '../config/config';
import { Bar } from 'react-chartjs-2';
import '../styles/dashboard.css'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// Sample hardcoded login data for chart
const sampleLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const sampleData = [5, 12, 8, 6, 9, 3, 7];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [routine, setRoutine] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();

  // Fetch dashboard data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          alert('Failed to load dashboard: ' + (error.error || 'Unknown error'));
          setTimeout(() => navigate('/login'), 1000);
          return;
        }

        const data = await response.json();
        setUser(data.user);

        const today = new Date();
        const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = today.toLocaleDateString('en-GB'); // dd/mm/yyyy
        setCurrentDate(`${weekday}, ${formattedDate}`);

        setRoutine(data.routine?.[weekday] || ["No classes scheduled."]);
      } catch (err) {
        setMsg(err.message || 'Unknown error');
        setTimeout(() => navigate('/login'), 1000);
      }
    })();
  }, [navigate]);


  // Chart data and options
  const chartData = {
    labels: sampleLabels,
    datasets: [{
      label: 'Student Logins',
      data: sampleData,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(201, 203, 207, 0.6)'
      ],
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      borderRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="main-content container mt-4">
      <Header />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4">Welcome to the Dashboard{user ? `, ${user.user_id || ''}` : ''}</h1>
      </div>
      {msg && (
        <div className="alert alert-warning text-center">
          {msg}
        </div>
      )}

      <div className="row">
        <div className="row equal-height">
  <div id="routine" className="col-md-6 col-lg-6 mb-4">
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Today's Routine</h5>
        <p className="card-text">{currentDate}</p>
        <ul className="list-group" id="routineList">
          {routine.map((item, idx) => (
            <li key={idx} className="list-group-item">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>

  <div id="calendar" className="col-md-6 col-lg-6 mb-4">
    <div className="card shadow-sm equal-height">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">Calendar</h5>
        <div className="flex-grow-1">
          <Calendar />
        </div>
      </div>
    </div>
  </div>
</div>


      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Login Activity (Last 7 Days)</h5>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
