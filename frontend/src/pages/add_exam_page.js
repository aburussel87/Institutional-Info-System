import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import '../styles/add_exam_page.css'; // Custom stylish CSS

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
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const teacherId = 2020111597; // Replace with actual session-based ID

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_course_info/${teacherId}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setLoading(false);
      });
  }, []);

  const openModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: '',
      exam_type: 'CT1',
      total_marks: '',
      date_of_exam: '',
      semester: course.semester,
      academic_session: course.academic_session
    });
    setShowModal(true);
    setMessage(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    const payload = {
      course_id: selectedCourse.course_id,
      teacher_id: teacherId,
      ...formData
    };

    fetch(`${API_BASE_URL}/add_exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setMessage({ type: 'success', text: 'Exam added successfully!' });
        setShowModal(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setMessage({ type: 'danger', text: 'Error adding exam.' });
      });
  };

  return (
    <div className="addexam-container">
      <Header />
      <div className="addexam-content">
        <h2 className="addexam-title">📚 Your Courses</h2>
        {loading ? (
          <div className="addexam-spinner"><Spinner animation="border" /></div>
        ) : (
          <div className="addexam-card-grid">
            {courses.map(course => (
              <Card key={course.course_id} className="addexam-card" onClick={() => openModal(course)}>
                <Card.Body>
                  <Card.Title>{course.course_title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{course.course_id}</Card.Subtitle>
                  <Card.Text>
                    Semester: {course.semester}<br />
                    Section: {course.section_type}<br />
                    Session: {course.academic_session}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Exam for {selectedCourse?.course_title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Exam Title</Form.Label>
              <Form.Control name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Midterm" />
            </Form.Group>

            <Form.Group>
              <Form.Label>Exam Type</Form.Label>
              <Form.Select name="exam_type" value={formData.exam_type} onChange={handleChange}>
                <option>CT1</option>
                <option>CT2</option>
                <option>CT3</option>
                <option>CT4</option>
                <option>Quiz</option>
                <option>Term</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Total Marks</Form.Label>
              <Form.Control type="number" name="total_marks" value={formData.total_marks} onChange={handleChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date & Time</Form.Label>
              <Form.Control type="datetime-local" name="date_of_exam" value={formData.date_of_exam} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Exam</Button>
        </Modal.Footer>
      </Modal>

      {message && (
        <Alert className="addexam-alert" variant={message.type}>
          {message.text}
        </Alert>
      )}
    </div>
  );
};

export default AddExam;
