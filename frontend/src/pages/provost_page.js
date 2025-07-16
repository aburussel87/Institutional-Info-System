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
  const [semesterCounts, setSemesterCounts] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [basic_details, setBasicDetails] = useState(null);

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
          setBasicDetails(data.basic_details);
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
    const counts = {};
    const semesterOrder = [
      'L1T1', 'L1T2', 'L2T1', 'L2T2',
      'L3T1', 'L3T2', 'L4T1', 'L4T2'
    ];

    students.forEach(student => {
      const semester = student.semsester || 'Unknown Semester';
      const departmentName = DEPARTMENT_NAMES[student.department_id] || `Dept ID: ${student.department_id}`;
      if (!categories[semester]) {
        categories[semester] = {};
        counts[semester] = 0;
      }
      if (!categories[semester][departmentName]) {
        categories[semester][departmentName] = [];
      }
      categories[semester][departmentName].push(student);
      counts[semester]++;
    });

    const sortedCategories = {};
    const sortedCounts = {};
    semesterOrder.forEach(sem => {
      if (categories[sem]) {
        sortedCategories[sem] = categories[sem];
        sortedCounts[sem] = counts[sem];
      }
    });
    Object.keys(categories).sort().forEach(sem => {
      if (!sortedCategories[sem]) {
        sortedCategories[sem] = categories[sem];
        sortedCounts[sem] = counts[sem];
      }
    });

    setCategorizedStudents(sortedCategories);
    setSemesterCounts(sortedCounts);
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
        <h2 className="provost-section-title text-center my-4">Students in Your Hall</h2>
        {error && <Alert variant="danger" className="mt-3 text-center">{error}</Alert>}

        <div className="provost-hall-info-section mb-5 p-4 rounded shadow-lg bg-light">
          {basic_details && (
            <Card className="provost-hall-info-card border-0">
              <Card.Body className="p-0">
                <Card.Title className="text-center mb-4 text-primary fs-4">
                  <i className="fas fa-university me-2"></i> {basic_details.name} Overview
                </Card.Title>
                <Table responsive striped bordered hover className="mb-0 hall-overview-table">
                  <tbody className="border-top-0">
                    <tr>
                      <td className="fw-bold text-dark">Location:</td>
                      <td>{basic_details.location}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">Capacity:</td>
                      <td>{basic_details.capacity}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">Total Assignments:</td>
                      <td>{basic_details.total_assignments}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">Resident Count:</td>
                      <td><span className="badge bg-success">{basic_details.resident_count}</span></td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-dark">Non-Resident Count:</td>
                      <td><span className="badge bg-info">{basic_details.non_resident_count}</span></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </div>

        <div className="categorized-students-section">
          {Object.keys(categorizedStudents).length > 0 ? (
            <Accordion defaultActiveKey="0" alwaysOpen>
              {Object.entries(categorizedStudents).map(([semester, departments], semIndex) => (
                <Accordion.Item eventKey={semIndex.toString()} key={semester} className="semester-accordion-item mb-3 shadow-sm rounded">
                  <Accordion.Header className="semester-accordion-header bg-primary text-white py-3 px-4 rounded-top">
                    <h4 className="my-0">
                      Semester: {semester} <span className="badge bg-light text-dark ms-2">{semesterCounts[semester]} students</span>
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body className="semester-accordion-body p-3 bg-white rounded-bottom">
                    <Accordion defaultActiveKey="0" alwaysOpen className="nested-department-accordion">
                      {Object.entries(departments).map(([departmentName, deptStudents], deptIndex) => (
                        <Accordion.Item eventKey={deptIndex.toString()} key={departmentName} className="department-accordion-item mb-2 border rounded">
                          <Accordion.Header className="department-accordion-header bg-light py-2 px-3">
                            <h5 className="my-0 text-secondary">Department: {departmentName} (<span className="text-primary">{deptStudents.length}</span> Students)</h5>
                          </Accordion.Header>
                          <Accordion.Body className="department-accordion-body p-3">
                            <div className="provost-card-grid">
                              {deptStudents.map(student => (
                                <Card
                                  key={student.student_id}
                                  className="provost-student-card border-0 shadow-sm transition-all-ease"
                                  onClick={() => fetchStudentHallDetails(student.student_id)}
                                >
                                  <Card.Body className="text-center p-3">
                                    <img
                                      src={`${API_BASE_URL}/user/photo/${student.student_id}`}
                                      alt="User"
                                      className="rounded-circle shadow-sm mb-3 student-avatar"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${student.student_name}&background=007bff&color=fff&bold=true&size=128`;
                                      }}
                                    />
                                    <Card.Title className="provost-card-title h6 mb-1 text-truncate">{student.student_name}</Card.Title>
                                    <Card.Subtitle className="text-muted small">ID: {student.student_id}</Card.Subtitle>
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
            <Alert variant="info" className="text-center my-4">No students found in your hall.</Alert>
          )}
        </div>
      </div>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white modal-header-custom">
          <Modal.Title className="modal-title-custom">Student Hall Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom p-4">
          {isLoadingDetails ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-muted">Fetching details...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">{error}</Alert>
          ) : studentInfo ? (
            <>
              <div className="student-details-section mb-4 p-4 rounded shadow-sm bg-light">
                <h4 className="details-section-title text-primary mb-3">
                  <i className="fas fa-user-circle me-2"></i> {studentInfo.student_name} (<span className="text-secondary">{studentInfo.student_id}</span>)
                </h4>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <p className="mb-0"><strong>Hall:</strong> {studentInfo.hall_name} ({studentInfo.hall_location})</p>
                  </div>
                  <div className="col-md-6 mb-2">
                    <p className="mb-0"><strong>Room Number:</strong> {studentInfo.room_number || 'N/A'}</p>
                  </div>
                  <div className="col-md-12">
                    <p className="mb-0"><strong>Resident:</strong> {studentInfo.is_resident ? <span className="badge bg-success">Yes</span> : <span className="badge bg-danger">No</span>}</p>
                  </div>
                </div>
              </div>

              <h4 className="details-section-title mt-4 mb-3 text-primary">
                <i className="fas fa-users me-2"></i> Roommates
              </h4>
              {roommates && roommates.length > 0 ? (
                <Table striped bordered hover responsive className="roommate-table shadow-sm rounded overflow-hidden">
                  <thead className="bg-secondary text-white">
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
                        <td>{mate.roommate_resident ? <span className="badge bg-success">Yes</span> : <span className="badge bg-danger">No</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="text-center my-3">No roommates found for this student.</Alert>
              )}
            </>
          ) : (
            <Alert variant="secondary" className="text-center my-3">Select a student to view details.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom justify-content-center">
          <Button variant="secondary" onClick={handleCloseDetailsModal} className="px-4 py-2">Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProvostStd;
