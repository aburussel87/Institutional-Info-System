import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Spinner, Alert, Table, Accordion } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/provost_page.css';

const DEPARTMENT_NAMES = {
  1: 'Computer Science & Engineering',
  2: 'Electrical & Electronic Engineering',
  3: 'Civil Engineering',
  4: 'Mechanical Engineering',
  5: 'Chemical Engineering',
  6: 'Industrial & Production Engineering',
  7: 'Materials Science & Engineering',
  8: 'Naval Architecture & Marine Engineering',
  9: 'Urban & Regional Planning',
  10: 'Architecture',
  11: 'Physics',
  12: 'Chemistry',
};

const ProvostStd = () => {
  const [students, setStudents] = useState([]);
  const [categorizedStudents, setCategorizedStudents] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/getstudentbyProvost`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        } else {
          setError('Failed to load students. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Network error: Could not fetch students.');
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const categories = {};
 
    const semesterOrder = [
      'L1T1', 'L1T2', 'L2T1', 'L2T2',
      'L3T1', 'L3T2', 'L4T1', 'L4T2'
    ];

    students.forEach(student => {
      const semester = student.semsester || 'Unknown Semester'; 
      const departmentName = DEPARTMENT_NAMES[student.department_id] || `Dept ID: ${student.department_id}`;

      if (!categories[semester]) {
        categories[semester] = {};
      }
      if (!categories[semester][departmentName]) {
        categories[semester][departmentName] = [];
      }
      categories[semester][departmentName].push(student);
    });

    const sortedCategories = {};
    semesterOrder.forEach(sem => {
      if (categories[sem]) {
        sortedCategories[sem] = categories[sem];
      }
    });
    Object.keys(categories).sort().forEach(sem => {
        if (!sortedCategories[sem]) {
            sortedCategories[sem] = categories[sem];
        }
    });

    setCategorizedStudents(sortedCategories);
  }, [students]);

  const fetchStudentHallDetails = async (studentId) => {
    setIsLoadingDetails(true);
    setError(null);
    setStudentInfo(null);
    setRoommates([]);
    setShowDetailsModal(true);

    try {
      const res = await fetch(`${API_BASE_URL}/getStudenthalldetails/${studentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();

      if (data.success && data.info && data.info.student) {
        const info = data.info;
        setStudentInfo({
          student_id: info.student.student_id,
          student_name: info.student.student_name,
          is_resident: info.student.is_resident,
          hall_id: info.student.hall ? info.student.hall.hall_id : null,
          hall_name: info.student.hall ? info.student.hall.hall_name : 'N/A',
          hall_location: info.student.hall ? info.student.hall.hall_location : 'N/A',
          room_number: info.student.room_number
        });
        setRoommates(info.roommates || []);
      } else if (data.success && (!data.info || !data.info.student)) {
        setError('No hall details available for this student.');
        setStudentInfo(null);
        setRoommates([]);
      } else {
        setError(data.error || 'Failed to fetch hall details.');
      }
    } catch (err) {
      console.error('Error fetching hall details:', err);
      setError('Network error: Could not fetch hall details.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setStudentInfo(null);
    setRoommates([]);
    setError(null);
  };

  return (
    <div className="provost-container-overall">
      <Header />
      <div className="provost-main-content">
        <h2 className="provost-section-title">Students in Your Hall</h2>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        <div className="categorized-students-section">
          {Object.keys(categorizedStudents).length > 0 ? (
            <Accordion defaultActiveKey="0" alwaysOpen>
              {Object.entries(categorizedStudents).map(([semester, departments], semIndex) => (
                <Accordion.Item eventKey={semIndex.toString()} key={semester} className="semester-accordion-item">
                  <Accordion.Header className="semester-accordion-header">
                    Semester: {semester}
                  </Accordion.Header>
                  <Accordion.Body className="semester-accordion-body">
                    <Accordion defaultActiveKey="0" alwaysOpen> {/* Nested accordion for departments */}
                      {Object.entries(departments).map(([departmentName, deptStudents], deptIndex) => (
                        <Accordion.Item eventKey={deptIndex.toString()} key={departmentName} className="department-accordion-item">
                          <Accordion.Header className="department-accordion-header">
                            Department: {departmentName} ({deptStudents.length})
                          </Accordion.Header>
                          <Accordion.Body className="department-accordion-body">
                            <div className="provost-card-grid">
                              {deptStudents.map(student => (
                                <Card
                                  key={student.student_id}
                                  className="provost-student-card"
                                  onClick={() => fetchStudentHallDetails(student.student_id)}
                                >
                                  <Card.Body>
                                    <img
                                      src={`${API_BASE_URL}/user/photo/${student.student_id}`}
                                      alt="User"
                                      className="rounded-circle shadow-sm"
                                      style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid white' }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${student.student_name}&background=007bff&color=fff&bold=true&size=128`;
                                      }}
                                    />
                                    <Card.Title className="provost-card-title">{student.student_name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">ID: {student.student_id}</Card.Subtitle>
                                  </Card.Body>
                                </Card>
                              ))}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          ) : (
            <p className="no-students-message">No students found in your hall.</p>
          )}
        </div>
      </div>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg" centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">Student Hall Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {isLoadingDetails ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Fetching details...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : studentInfo ? (
            <>
              <div className="student-details-section mb-4 p-3 rounded shadow-sm">
                <h4 className="details-section-title">
                  <i className="fas fa-user-circle me-2"></i> {studentInfo.student_name} ({studentInfo.student_id})
                </h4>
                <p><strong>Hall:</strong> {studentInfo.hall_name} ({studentInfo.hall_location})</p>
                <p><strong>Room Number:</strong> {studentInfo.room_number || 'N/A'}</p>
                <p><strong>Resident:</strong> {studentInfo.is_resident ? 'Yes' : 'No'}</p>
              </div>

              <h4 className="details-section-title mt-4">
                <i className="fas fa-users me-2"></i> Roommates
              </h4>
              {roommates && roommates.length > 0 ? (
                <Table striped bordered hover responsive className="roommate-table">
                  <thead className="table-header-custom">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Resident</th>
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
                </Table>
              ) : (
                <p className="text-muted text-center py-3">No roommates found for this student.</p>
              )}
            </>
          ) : (
            <p className="text-muted text-center py-3">Select a student to view details.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProvostStd;