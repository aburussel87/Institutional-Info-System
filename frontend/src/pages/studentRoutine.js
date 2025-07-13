import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import API_BASE_URL from '../config/config';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/routine.css';
import { jwtDecode } from "jwt-decode";

const StudentRoutine = () => {
  const [weeklyRoutine, setWeeklyRoutine] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState("");
  const [department_id, setDepartmentId] = useState("");


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
    try {
      const decoded = jwtDecode(token);
      setSemester(decoded.semester || "Unknown Semester");
      setDepartmentId(decoded.department_id || "Unknown Department");
    } catch (e) {
      console.warn("Failed to decode token for semester");
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
          const filteredRoutine = { ...data.routine };
          delete filteredRoutine.Friday;
          delete filteredRoutine.Saturday;
          setWeeklyRoutine(filteredRoutine);

          if (data.semester) setSemester(data.semester);
          if (data.department_id) setDepartmentId(data.department_id);
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
  }, [navigate, semester]);

  const handleDownloadPdf = () => {
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    const colWidths = [30, ...Array(5).fill((contentWidth - 30) / 5)];
    const baseRowHeight = 6;

    let yOffset = margin;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Institutional Information System', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 7;
    pdf.text(`Semester: ${semester || '-'} | Department ID: ${department_id || '-'}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

    const drawRow = (values) => {
      let xOffset = margin;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');

      const lineHeights = values.map((text, i) => {
        const wrapped = pdf.splitTextToSize(text, colWidths[i] - 2);
        return wrapped.length;
      });

      const maxLines = Math.max(...lineHeights);
      const rowHeight = baseRowHeight * maxLines;

      if (yOffset + rowHeight > pageHeight - margin) {
        pdf.addPage();
        yOffset = margin + 10;
        drawRow(['Time', ...daysOfWeek]); // redraw header
      }

      values.forEach((text, i) => {
        const wrapped = pdf.splitTextToSize(text, colWidths[i] - 2);
        pdf.rect(xOffset, yOffset, colWidths[i], rowHeight, 'D');
        pdf.text(wrapped, xOffset + 2, yOffset + 4);
        xOffset += colWidths[i];
      });

      yOffset += rowHeight;
    };

    drawRow(['Time', ...daysOfWeek]);

    sortedTimeSlots.forEach(timeSlot => {
      const rowValues = [timeSlot];
      daysOfWeek.forEach(day => {
        const classes = weeklyRoutine[day]?.[timeSlot];
        if (classes && classes.length > 0) {
          const cellContent = classes.map(cls => {
            return `${cls.course_id} (${cls.section_type})\n${cls.course_title}\n${cls.room_id} | ${cls.teacher_name}`;
          }).join('\n---\n');
          rowValues.push(cellContent);
        } else {
          rowValues.push('-');
        }
      });
      drawRow(rowValues);
    });

    pdf.save(`Routine_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
  };





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