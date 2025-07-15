import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/add_exam_page.css';

const AddExam = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    exam_type: 'CT1',
    total_marks: '',
    date_of_exam: '',
    semester: '',
    academic_session: '',
    section: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [scheduledExams, setScheduledExams] = useState([]); // Initialize as empty array

  const teacherId = 2020111597; // This might need to come from JWT token in a real app

  useEffect(() => {
    const fetchCoursesAndExams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/teacherCourses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        setCourses(data.courses || []); // Ensure it's an array
        setScheduledExams(data.scheduledExams || []); // Ensure it's an array
      } catch (err) {
        console.error('Error fetching data:', err);
        setMessage({ type: 'danger', text: 'Error fetching courses and exams.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndExams();
  }, []);

  const openModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.course_title,
      exam_type: 'CT1',
      total_marks: '',
      date_of_exam: '',
      semester: course.semester,
      academic_session: course.session,
      section: course.section_type
    });
    setShowModal(true);
    setMessage(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      course_id: selectedCourse.course_id,
      teacher_id: teacherId,
      ...formData,
    };

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/add_exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Exam added successfully!' });
        // After successful addition, refetch exams to update the list
        const updatedRes = await fetch(`${API_BASE_URL}/teacherCourses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedData = await updatedRes.json();
        setScheduledExams(updatedData.scheduledExams || []);
        
        setTimeout(() => setShowModal(false), 2000);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Error adding exam.' });
      }
    } catch (err) {
      console.error('Error adding exam:', err);
      setMessage({ type: 'danger', text: 'Error adding exam.' });
    }
  };

  const formatExamDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="addexam-container">
      <Header />
      <div className="addexam-content">
        <h2 className="addexam-title">📚 Your Courses</h2>
        <p className="addexam-instruction">Click on a course card to add an exam.</p>
        {loading ? (
          <div className="addexam-spinner">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="addexam-card-grid">
            {courses.map((course) => (
              <Card
                key={course.course_id}
                className="addexam-card"
                onClick={() => openModal(course)}
              >
                <Card.Body>
                  <Card.Title>{course.course_title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {course.course_id} / Dept ID: {course.department}
                  </Card.Subtitle>
                  <Card.Text>
                    Semester: {course.semester}
                    <br />
                    Section: {course.section_type}
                    <br />
                    Session: {course.session}
                    <br />
                    Total Enrolled Students: {course.total}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        <h2 className="scheduled-exams-title mt-5">🗓️ Scheduled Exams</h2>
        {loading ? (
          <div className="addexam-spinner">
            <Spinner animation="border" />
          </div>
        ) : scheduledExams && scheduledExams.length > 0 ? (
          <div className="scheduled-exams-list">
            {scheduledExams.map((exam, index) => (
              <Card key={index} className="scheduled-exam-card mb-3">
                <Card.Body>
                  <Card.Title className="exam-card-title">{exam.title} ({exam.exam_type})</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Course: {exam.course_id} | Section: {exam.section}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Marks:</strong> {exam.total_marks}
                    <br />
                    <strong>Date & Time:</strong> {formatExamDate(exam.date_of_exam)}
                    <br />
                    <strong>Semester:</strong> {exam.semester} | <strong>Session:</strong> {exam.academic_session}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p className="no-exams-message">You have no recent scheduled exams.</p>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Exam for {selectedCourse?.course_title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant={message.type}>{message.text}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Exam Title</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Midterm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exam Type</Form.Label>
              <Form.Select
                name="exam_type"
                value={formData.exam_type}
                onChange={handleChange}
              >
                <option>CT1</option>
                <option>CT2</option>
                <option>CT3</option>
                <option>CT4</option>
                <option>Quiz</option>
                <option>Term</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Marks</Form.Label>
              <Form.Control
                type="number"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date_of_exam"
                value={formData.date_of_exam}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Exam
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddExam;