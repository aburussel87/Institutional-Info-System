import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Spinner, Alert, Table, Accordion } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/advisor.css';

const AdvisorStd = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [groupedStudents, setGroupedStudents] = useState({});
  const [registrationData, setRegistrationData] = useState({
    offeredCourses: [],
    approved: [],
    pending: [],
    failed: [],
    missed: [],
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/advisor/get`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          const studentsArray = Array.isArray(data.students) ? data.students : [];
          const grouped = studentsArray.reduce((acc, student) => {
            const semester = student.current_semester;
            if (!acc[semester]) {
              acc[semester] = [];
            }
            acc[semester].push(student);
            return acc;
          }, {});
          setGroupedStudents(grouped);
        } else {
          setError('Failed to load students. Please try again later.');
          setGroupedStudents({});
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Network error: Could not fetch students.');
        setGroupedStudents({});
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const fetchRegistrationDetails = async (studentId) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/advisor/registration/${studentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setRegistrationData({
          offeredCourses: Array.isArray(data.courses) ? data.courses : [],
          approved: Array.isArray(data.approved) ? data.approved : [],
          pending: Array.isArray(data.pending) ? data.pending : [],
          failed: Array.isArray(data.failed) ? data.failed : [],
          missed: Array.isArray(data.missed) ? data.missed : [],
        });
      } else {
        setModalError('Failed to load registration details.');
        setRegistrationData({ offeredCourses: [], approved: [], pending: [], failed: [], missed: [] });
      }
    } catch (err) {
      console.error('Error fetching registration details:', err);
      setModalError('Network error: Could not fetch registration details.');
      setRegistrationData({ offeredCourses: [], approved: [], pending: [], failed: [], missed: [] });
    } finally {
      setModalLoading(false);
    }
  };

  const handleShowModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    fetchRegistrationDetails(student.student_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setRegistrationData({ offeredCourses: [], approved: [], pending: [], failed: [], missed: [] });
    setModalError(null);
  };

const handleApproveCourse = async (studentId, courseId) => {
  const pendingCourse = registrationData.pending.find(
    (c) => c.course_id === courseId
  );
  if (!pendingCourse) {
    setModalError('Pending course data not found.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/advisor/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        student_id: studentId,
        course_id: courseId,
        academic_session: pendingCourse.academic_session
      })
    });

    const data = await res.json();
    if (data.success) {
      fetchRegistrationDetails(studentId);
    } else {
      setModalError(data.error || 'Failed to approve course.');
    }
  } catch (err) {
    console.error('Error approving course:', err);
    setModalError('Network error: Could not approve course.');
  }
};


  const getCourseStatus = (course, type) => {
    const courseId = course.course_id || course.c_id;
    const isApproved = registrationData.approved.find(c => c.course_id === courseId);
    const isPending = registrationData.pending.some(c => c.course_id === courseId);
    const hasFailedPrerequisite = type === 'offered' && course.c_did && registrationData.failed.some(f => f.course_id === course.c_did);

    if (hasFailedPrerequisite) {
      return { status: 'Not Eligible' };
    } else if (isApproved) {
      return { status: 'Approved'};
    } else if (isPending) {
      return { status: 'Pending'};
    } else {
      return { status: 'Not Enrolled'};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="advisor-page-container">
      <Header />
      <div className="advisor-content-wrapper container py-4">
        <h2 className="advisor-page-title text-center mb-4">Advised Students</h2>

        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading student data...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {!loading && !error && Object.keys(groupedStudents).length === 0 && (
          <Alert variant="info" className="text-center">
            No advised students found for the current session.
          </Alert>
        )}

        {!loading && !error && Object.keys(groupedStudents).length > 0 && (
          <Accordion defaultActiveKey={Object.keys(groupedStudents)[0]} className="advisor-accordion">
            {Object.keys(groupedStudents).sort((a, b) => parseInt(a) - parseInt(b)).map((semester) => (
              <Accordion.Item eventKey={semester} key={semester} className="advisor-accordion-item">
                <Accordion.Header className="advisor-accordion-header">
                  Semester {semester} ({groupedStudents[semester].length} Students)
                </Accordion.Header>
                <Accordion.Body className="advisor-accordion-body">
                  <div className="advisor-student-list">
                    {groupedStudents[semester].map((student) => (
                      <Card
                        key={student.student_id}
                        className="advisor-student-card"
                        onClick={() => handleShowModal(student)}
                      >
                        <Card.Body className="advisor-student-card-body">
                          <div className="advisor-student-info">
                            <h5 className="advisor-student-name">{student.username}</h5>
                            <p className="advisor-student-mobile">Mobile: {student.phone || 'N/A'}</p>
                            <p className="advisor-student-semester">Semester: {student.current_semester}</p>
                          </div>
                          <Button variant="outline-primary" size="sm" className="advisor-view-details-btn">
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="advisor-details-modal">
          <Modal.Header closeButton className="advisor-modal-header">
            <Modal.Title className="advisor-modal-title">Student Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="advisor-modal-body">
            {selectedStudent && (
              <>
                <div className="advisor-modal-student-info row">
                  <div className="col-md-4 text-center">
                    <img
                      src={`${API_BASE_URL}/user/photo/${selectedStudent.student_id}`}
                      alt={`${selectedStudent.username || 'student'}`}
                      className="advisor-student-photo img-fluid rounded-circle mb-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedStudent.username}&background=007bff&color=fff&bold=true&size=128`;
                      }}
                    />
                    <h4 className="advisor-modal-username">{selectedStudent.username}</h4>
                    <p className="advisor-modal-id">ID: {selectedStudent.student_id}</p>
                  </div>
                  <div className="col-md-8">
                    <Table bordered hover size="sm" className="advisor-info-table">
                      <tbody>
                        <tr><td><strong>Email:</strong></td><td>{selectedStudent.email || 'N/A'}</td></tr>
                        <tr><td><strong>Phone:</strong></td><td>{selectedStudent.phone || 'N/A'}</td></tr>
                        <tr><td><strong>Gender:</strong></td><td>{selectedStudent.gender || 'N/A'}</td></tr>
                        <tr><td><strong>Date of Birth:</strong></td><td>{formatDate(selectedStudent.dob)}</td></tr>
                        <tr><td><strong>Hall ID:</strong></td><td>{selectedStudent.hall_id || 'N/A'}</td></tr>
                        <tr><td><strong>Current Semester:</strong></td><td>{selectedStudent.current_semester || 'N/A'}</td></tr>
                        <tr><td><strong>Academic Session:</strong></td><td>{selectedStudent.academic_session || 'N/A'}</td></tr>
                        <tr><td><strong>CGPA:</strong></td><td>{selectedStudent.cgpa !== null ? selectedStudent.cgpa.toFixed(2) : 'N/A'}</td></tr>
                        <tr><td><strong>Total Credit:</strong></td><td>{selectedStudent.total_credit || 'N/A'}</td></tr>
                        <tr><td><strong>Emergency Contact:</strong></td><td>{selectedStudent.emergency_name || 'N/A'} ({selectedStudent.emergency_mobile || 'N/A'})</td></tr>
                        <tr><td><strong>Emergency Address:</strong></td><td>{selectedStudent.emergency_address || 'N/A'}</td></tr>
                      </tbody>
                    </Table>
                  </div>
                </div>

                <hr className="my-4 advisor-divider" />

                {modalLoading ? (
                  <div className="text-center my-3">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2">Loading registration data...</p>
                  </div>
                ) : modalError ? (
                  <Alert variant="danger" className="text-center">{modalError}</Alert>
                ) : (
                  <>
                    <h5 className="advisor-enrollment-title mb-3">Courses Offered for Current Semester</h5>
                    {registrationData.offeredCourses.length > 0 ? (
                      <Table striped bordered hover responsive size="sm" className="advisor-enrollment-table mb-5">
                        <thead>
                          <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Credit</th>
                            <th>Prerequisite</th>
                            <th>Offered By</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrationData.offeredCourses.map((course, index) => {
                            const { status} = getCourseStatus(course, 'offered');
                            return (
                              <tr key={index}>
                                <td>{course.c_id}</td>
                                <td>{course.c_title}</td>
                                <td>{course.credit}</td>
                                <td>{course.c_did || 'N/A'}</td>
                                <td>{course.c_by}</td>
                                <td>
                                  <span className={`status-${status.toLowerCase().replace(' ', '-')}`}>
                                    {status}
                                  </span>
                                </td>
                                <td>
                                  {status === 'Pending' && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleApproveCourse(selectedStudent.student_id, course.c_id)}
                                      className="approve-btn"
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {(status === 'Approved' || status === 'Not Eligible' || status === 'Not Enrolled') && 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info" className="text-center mb-5">
                        No courses offered for the current semester.
                      </Alert>
                    )}

                    <h5 className="advisor-enrollment-title mb-3">Failed Courses (Re-registration)</h5>
                    {registrationData.failed.length > 0 ? (
                      <Table striped bordered hover responsive size="sm" className="advisor-enrollment-table mb-5">
                        <thead>
                          <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Credit</th>
                            <th>Offered By</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrationData.failed.map((course, index) => {
                            const { status } = getCourseStatus(course, 'failed');
                            return (
                              <tr key={index}>
                                <td>{course.course_id}</td>
                                <td>{course.title}</td>
                                <td>{course.credit_hours}</td>
                                <td>{course.offered_by}</td>
                                <td>
                                  <span className={`status-${status.toLowerCase().replace(' ', '-')}`}>
                                    {status}
                                  </span>
                                </td>
                                <td>
                                  {status === 'Pending' && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleApproveCourse(selectedStudent.student_id, course.course_id)}
                                      className="approve-btn"
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {(status === 'Approved' || status === 'Not Enrolled') && 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info" className="text-center mb-5">
                        No failed courses for re-registration.
                      </Alert>
                    )}

                    <h5 className="advisor-enrollment-title mb-3">Eligible Missed Courses</h5>
                    {registrationData.missed.length > 0 ? (
                      <Table striped bordered hover responsive size="sm" className="advisor-enrollment-table mb-3">
                        <thead>
                          <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Credit</th>
                            <th>Offered By</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrationData.missed.map((course, index) => {
                            const { status } = getCourseStatus(course, 'missed');
                            return (
                              <tr key={index}>
                                <td>{course.course_id}</td>
                                <td>{course.title}</td>
                                <td>{course.credits}</td>
                                <td>{course.offered_by}</td>
                                <td>
                                  <span className={`status-${status.toLowerCase().replace(' ', '-')}`}>
                                    {status}
                                  </span>
                                </td>
                                <td>
                                  {status === 'Pending' && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleApproveCourse(selectedStudent.student_id, course.course_id)}
                                      className="approve-btn"
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {(status === 'Approved' || status === 'Not Enrolled') && 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info" className="text-center mb-3">
                        No eligible missed courses.
                      </Alert>
                    )}
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="advisor-modal-footer">
            <Button variant="secondary" onClick={handleCloseModal} className="advisor-close-btn">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AdvisorStd;
