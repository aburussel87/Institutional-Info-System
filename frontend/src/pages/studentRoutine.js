import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import { Button } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/routine.css';

const StudentRoutine = () => {
  const [weeklyRoutine, setWeeklyRoutine] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState('');
  const [session, setSession] = useState('');

  const navigate = useNavigate();
  const routineGridRef = useRef(null);

  const formatTimeToMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    const fetchRoutineData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/semesterRoutine`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load routine.');
        }

        const data = await response.json();
        if (data.routine) {
          // Ensure Friday and Saturday are removed from the object if they exist
          const filteredRoutine = { ...data.routine };
          delete filteredRoutine.Friday;
          delete filteredRoutine.Saturday;
          setWeeklyRoutine(filteredRoutine);

          if (data.semester) setSemester(data.semester);
          if (data.academic_session) setSession(data.academic_session);
        } else {
          setError('No routine data available.');
        }
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineData();
  }, [navigate]);

  const handleDownloadPdf = async () => {
    const input = routineGridRef.current;
    if (!input) {
      alert("Routine grid not found for PDF export.");
      return;
    }

    const originalBackground = input.style.backgroundColor;
    const originalPadding = input.style.padding;
    input.style.backgroundColor = '#fff';
    input.style.padding = '10px';

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;

      const headerText = `XYZ University of Engineering & Technology\nSemester: ${semester} | Academic Session: ${session}`;

      pdf.setFontSize(14);
      pdf.text(headerText, pageWidth / 2, 20, { align: 'center' });

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);

      pdf.save(`Routine_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      input.style.backgroundColor = originalBackground;
      input.style.padding = originalPadding;
    }
  };

  // Adjusted daysOfWeek to match the backend's deletion of Friday and Saturday
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const allTimeSlots = new Set();

  Object.values(weeklyRoutine).forEach(dayData => {
    if (typeof dayData === 'object') {
      Object.keys(dayData).forEach(slot => allTimeSlots.add(slot));
    }
  });

  const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
    const [aStart] = a.split(' - ');
    const [bStart] = b.split(' - ');
    return formatTimeToMinutes(aStart) - formatTimeToMinutes(bStart);
  });

  if (loading) {
    return (
      <div className="routine-container d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading routine...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="routine-container alert alert-danger text-center m-4">
        Error: {error}
      </div>
    );
  }

  if (!weeklyRoutine || Object.keys(weeklyRoutine).length === 0) {
    return (
      <div className="routine-container alert alert-info text-center m-4">
        No routine information available.
      </div>
    );
  }

  return (
    <div className="routine-container main-content container-fluid px-4">
      <Header />
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1 className="h4 text-primary">Your Weekly Academic Routine</h1>
        <Button variant="outline-primary" onClick={handleDownloadPdf}>
          Download Routine as PDF <i className="bi bi-file-earmark-arrow-down ms-2"></i>
        </Button>
      </div>

      <div className="routine-grid-section card shadow-sm mb-4">
        <div className="card-body">
          <div className="routine-grid-container" ref={routineGridRef}>
            <div className="routine-grid-header">
              <div className="routine-grid-cell routine-grid-time-label">Time</div>
              {daysOfWeek.map(day => (
                <div key={day} className="routine-grid-cell routine-grid-day-header">
                  {day}
                </div>
              ))}
            </div>
            <div className="routine-grid-body">
              {sortedTimeSlots.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                  <div className="routine-grid-cell routine-grid-time-slot">{timeSlot}</div>
                  {daysOfWeek.map(day => {
                    const classes = weeklyRoutine[day]?.[timeSlot];
                    const isSpecialDay = typeof weeklyRoutine[day] === 'string';

                    return (
                      <div key={`${day}-${timeSlot}`} className="routine-grid-cell routine-grid-class-cell">
                        {isSpecialDay ? (
                          <div className="routine-special-day">{weeklyRoutine[day]}</div>
                        ) : (
                          classes && classes.length > 0 ? (
                            classes.map((cls, idx) => (
                              <div key={idx} className="routine-class-item">
                                <div className="routine-course-id">{cls.course_id}</div>
                                <div className="routine-course-title">{cls.course_title}</div>
                                <div className="routine-room-teacher">
                                  {cls.room_id} | {cls.teacher_name}
                                </div>
                                <div className="routine-section-type">{cls.section_type}</div>
                              </div>
                            ))
                          ) : (
                            <span className="routine-no-class">-</span>
                          )
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRoutine;