import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/provost_page.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProvostStd = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Separate state for student info and roommates
  const [studentInfo, setStudentInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);

  // Fetch students once on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/getstudentbyProvost`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.students);
        } else {
          console.error('Failed to load students');
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch hall details and roommates for selected student
  const fetchStudentHallDetails = (studentId) => {
    fetch(`${API_BASE_URL}/getStudenthalldetails/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Hall Details Response:', data);
        setSelectedStudent(studentId);

        if (data.success && data.info.length > 0) {
          const info = data.info;

          // Extract student info from first row
          setStudentInfo({
            student_id: info[0].student_id,
            student_name: info[0].student_name,
            is_resident: info[0].is_resident,
            hall_id: info[0].hall_id,
            hall_name: info[0].hall_name,
            hall_location: info[0].hall_location,
            room_number: info[0].room_number,
          });

          // Extract roommates list
          const mates = info.map(item => ({
            roommate_id: item.roommate_id,
            roommate_name: item.roommate_name,
            roommate_resident: item.roommate_resident,
          }));

          setRoommates(mates);
        } else {
          setStudentInfo(null);
          setRoommates([]);
          console.error('Failed to fetch hall details or no data found');
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="provost-container-light">
      <Header />
      <div className="provost-content-card">
        <h2 className="provost-title">Students in Your Hall</h2>
        <div className="provost-student-list">
          {students.map(student => (
            <div
              key={student.student_id}
              className={`provost-student-item ${selectedStudent === student.student_id ? 'selected' : ''}`}
              onClick={() => fetchStudentHallDetails(student.student_id)}
            >
              <div className="provost-student-info">
                <div><strong>Name:</strong> {student.student_name}</div>
                <div><strong>ID:</strong> {student.student_id}</div>
              </div>
            </div>
          ))}
        </div>

        {studentInfo && (
          <div className="provost-hall-details">
            <h3 className="provost-details-title">Hall & Room Details for {studentInfo.student_name}</h3>
            <p><strong>Hall Name:</strong> {studentInfo.hall_name}</p>
            <p><strong>Hall Location:</strong> {studentInfo.hall_location}</p>
            <p><strong>Room Number:</strong> {studentInfo.room_number}</p>
            <p><strong>Resident Status:</strong> {studentInfo.is_resident ? 'Yes' : 'No'}</p>

            <h4>Roommates</h4>
            {roommates.length > 0 ? (
              <table className="provost-details-table">
                <thead>
                  <tr>
                    <th>Roommate ID</th>
                    <th>Roommate Name</th>
                    <th>Resident Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roommates.map((mate, idx) => (
                    <tr key={idx}>
                      <td>{mate.roommate_id}</td>
                      <td>{mate.roommate_name}</td>
                      <td>{mate.roommate_resident ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No roommates found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvostStd;
``