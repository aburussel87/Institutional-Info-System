import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import styles from '../styles/add_exam_page.module.css';

const AddExam = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showUploadMarksModal, setShowUploadMarksModal] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [examToUploadMarks, setExamToUploadMarks] = useState(null);
  const [examToViewStudents, setExamToViewStudents] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    exam_id: null,
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
  const [scheduledExams, setScheduledExams] = useState([]);

  const teacherId = 2020111597;

  const fetchCoursesAndExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/teacherCourses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setCourses(data.courses || []);
        setScheduledExams(data.scheduledExams || []);
        setMessage(null);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to load data.' });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage({ type: 'danger', text: 'Network error: Could not fetch courses and exams.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndExams();
  }, []);

  const openAddExamModal = (course) => {
    setSelectedCourse(course);
    setIsUpdating(false);
    setFormData({
      exam_id: null,
      title: course.course_title,
      exam_type: 'CT1',
      total_marks: '',
      date_of_exam: '',
      semester: course.semester,
      academic_session: course.session,
      section: course.section_type
    });
    setShowExamModal(true);
    setMessage(null);
  };

  const openUpdateExamModal = (exam) => {
    setSelectedCourse({
      course_id: exam.course_id,
      course_title: exam.title,
      semester: exam.semester,
      session: exam.academic_session,
      section_type: exam.section
    });
    setIsUpdating(true);
    setFormData({
      exam_id: exam.exam_id,
      title: exam.title,
      exam_type: exam.exam_type,
      total_marks: exam.total_marks,
      date_of_exam: exam.date_of_exam ? new Date(exam.date_of_exam).toISOString().slice(0, 16) : '',
      semester: exam.semester,
      academic_session: exam.academic_session,
      section: exam.section
    });
    setShowExamModal(true);
    setMessage(null);
  };

  const openDeleteConfirmModal = (exam) => {
    setExamToDelete(exam);
    setShowDeleteConfirmModal(true);
    setMessage(null);
  };

  const openUploadMarksModal = (exam) => {
    setExamToUploadMarks(exam);
    setShowUploadMarksModal(true);
    setCsvFile(null);
    setMessage(null);
  };

  const openEnrolledStudentsModal = async (exam) => {
    setExamToViewStudents(exam);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/add_exam/get_enrolled_students/${exam.exam_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledStudents(data.students);
        setShowEnrolledStudentsModal(true);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to fetch enrolled students.' });
      }
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setMessage({ type: 'danger', text: 'Network error: Could not fetch enrolled students.' });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleAddOrUpdateSubmit = async () => {
    const payload = {
      course_id: selectedCourse.course_id,
      teacher_id: teacherId,
      ...formData,
    };

    try {
      const token = localStorage.getItem('token');
      const route = isUpdating ? `${API_BASE_URL}/add_exam/update_exam` : `${API_BASE_URL}/add_exam`;
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(route, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Exam ${isUpdating ? 'updated' : 'added'} successfully!` });
        await fetchCoursesAndExams();
        setTimeout(() => setShowExamModal(false), 1500);
      } else {
        setMessage({ type: 'danger', text: data.message || `Error ${isUpdating ? 'updating' : 'adding'} exam.` });
      }
    } catch (err) {
      console.error(`Error ${isUpdating ? 'updating' : 'adding'} exam:`, err);
      setMessage({ type: 'danger', text: `Network error: Could not ${isUpdating ? 'update' : 'add'} exam.` });
    }
  };

  const handleDeleteExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/add_exam/delete_exam/${examToDelete.exam_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Exam deleted successfully!' });
        alert("Exam has been deleted successfully!");
        await fetchCoursesAndExams();
        setTimeout(() => setShowDeleteConfirmModal(false), 1500);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Error deleting exam.' });
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setMessage({ type: 'danger', text: 'Network error: Could not delete exam.' });
    }
  };

  const handleUploadMarks = async () => {
    if (!csvFile) {
      setMessage({ type: 'warning', text: 'Please select a CSV file to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('exam_id', examToUploadMarks.exam_id);
    formData.append('course_id', examToUploadMarks.course_id);
    formData.append('teacher_id', teacherId);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/add_exam/upload_marks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Marks uploaded successfully!' });
        setTimeout(() => setShowUploadMarksModal(false), 1500);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Error uploading marks.' });
      }
    } catch (err) {
      console.error('Error uploading marks:', err);
      setMessage({ type: 'danger', text: 'Network error: Could not upload marks.' });
    }
  };

  const formatExamDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isExamPast = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const formatStudentIds = (students) => {
  const rows = [];
  for (let i = 0; i < students.length; i += 5) {
    const row = students
      .slice(i, i + 4)
      .map(s => `${s.student_id}-${s.mark}`)
      .join(' | ');
    rows.push(row);
  }
  return rows;
};


  return (
    <div className={styles['addexam-container']}>
      <Header />
      <div className={styles['addexam-content']}>
        <h2 className={styles['addexam-title']}>📚 Your Courses</h2>
        <p className={styles['addexam-instruction']}>Click on a course card to add an exam.</p>
        {loading ? (
          <div className={styles['addexam-spinner']}>
            <Spinner animation="border" className={styles['custom-spinner']} />
          </div>
        ) : (
          <div className={styles['addexam-card-grid']}>
            {courses.map((course) => (
              <Card
                key={course.course_id}
                className={styles['addexam-card']}
                onClick={() => openAddExamModal(course)}
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

        <h2 className={styles['scheduled-exams-title']}>🗓️ Scheduled Exams</h2>
        {loading ? (
          <div className={styles['addexam-spinner']}>
            <Spinner animation="border" className={styles['custom-spinner']} />
          </div>
        ) : scheduledExams && scheduledExams.length > 0 ? (
          <div className={styles['scheduled-exams-list']}>
            {scheduledExams.map((exam) => (
              <Card key={exam.exam_id} className={styles['scheduled-exam-card']}>
                <Card.Body className={styles['scheduled-exam-card-body']}>
                  <div>
                    <Card.Title className={styles['exam-card-title']}>{exam.title} ({exam.exam_type})</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Course: {exam.course_id} | {exam.section}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>Marks:</strong> {exam.total_marks}
                      <br />
                      <strong>Date & Time:</strong> {formatExamDate(exam.date_of_exam)}
                      <br />
                      <strong>Semester:</strong> {exam.semester} | {exam.academic_session}
                    </Card.Text>
                  </div>
                  <div className={styles['exam-actions-right']}>
                    {isExamPast(exam.date_of_exam) ? (
                      <>
                        <Button variant="info" onClick={() => openUploadMarksModal(exam)} className={styles['action-button']}>
                          Add Marks
                        </Button>
                        <Button variant="primary" onClick={() => openEnrolledStudentsModal(exam)} className={styles['action-button']}>
                          View Students
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => openUpdateExamModal(exam)} className={styles['action-button']}>
                          Update
                        </Button>
                        <Button variant="danger" onClick={() => openDeleteConfirmModal(exam)} className={styles['action-button']}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <p className={styles['no-exams-message']}>You have no recent scheduled exams.</p>
        )}
      </div>

      <Modal show={showExamModal} onHide={() => setShowExamModal(false)} centered className={styles['custom-modal']}>
        <Modal.Header closeButton className={styles['modal-header-custom']}>
          <Modal.Title>{isUpdating ? `Update Exam for ${selectedCourse?.course_title}` : `Add Exam for ${selectedCourse?.course_title}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles['modal-body-custom']}>
          {message && <Alert variant={message.type} className={styles['custom-alert']}>{message.text}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Exam Title</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Midterm"
                className={styles['form-control-custom']}
                readOnly={isUpdating}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exam Type</Form.Label>
              <Form.Select
                name="exam_type"
                value={formData.exam_type}
                onChange={handleChange}
                className={styles['form-select-custom']}
                disabled={isUpdating}
              >
                <option>CT1</option>
                <option>CT2</option>
                <option>CT3</option>
                <option>CT4</option>
                <option>Quiz</option>
              </Form.Select>
            </Form.Group>

            {false && <Form.Group className="mb-3">
              <Form.Label>Semester</Form.Label>
              <Form.Control
                name="semester"
                value={formData.semester}
                className={styles['form-control-custom']}
                readOnly={isUpdating}
              />
            </Form.Group>}

            {false && <Form.Group className="mb-3">
              <Form.Label>Academic Session</Form.Label>
              <Form.Control
                name="academic_session"
                value={formData.academic_session}
                className={styles['form-control-custom']}
                readOnly={isUpdating}
              />
            </Form.Group>}

            {false && <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                name="section"
                value={formData.section}
                className={styles['form-control-custom']}
                readOnly={isUpdating}
              />
            </Form.Group>}

            <Form.Group className="mb-3">
              <Form.Label>Total Marks</Form.Label>
              <Form.Control
                type="number"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleChange}
                className={styles['form-control-custom']}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date_of_exam"
                value={formData.date_of_exam}
                onChange={handleChange}
                className={styles['form-control-custom']}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles['modal-footer-custom']}>
          <Button variant="secondary" onClick={() => setShowExamModal(false)} className={styles['modal-button-secondary']}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddOrUpdateSubmit} className={styles['modal-button-primary']}>
            {isUpdating ? 'Update Exam' : 'Add Exam'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered className={styles['custom-modal']}>
        <Modal.Header closeButton className={styles['modal-header-custom-danger']}>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles['modal-body-custom']}>
          {message && <Alert variant={message.type} className={styles['custom-alert']}>{message.text}</Alert>}
          <p>Are you sure you want to delete the exam: <strong>{examToDelete?.title} ({examToDelete?.exam_type})</strong>?</p>
        </Modal.Body>
        <Modal.Footer className={styles['modal-footer-custom']}>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)} className={styles['modal-button-secondary']}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteExam} className={styles['modal-button-danger']}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUploadMarksModal} onHide={() => setShowUploadMarksModal(false)} centered className={styles['custom-modal']}>
        <Modal.Header closeButton className={styles['modal-header-custom']}>
          <Modal.Title>Upload Marks for {examToUploadMarks?.title} ({examToUploadMarks?.exam_type})</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles['modal-body-custom']}>
          {message && <Alert variant={message.type} className={styles['custom-alert']}>{message.text}</Alert>}
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload CSV File</Form.Label>
              <Form.Control type="file" accept=".csv" onChange={handleFileChange} className={styles['form-control-custom']} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles['modal-footer-custom']}>
          <Button variant="secondary" onClick={() => setShowUploadMarksModal(false)} className={styles['modal-button-secondary']}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadMarks} disabled={!csvFile} className={styles['modal-button-primary']}>
            Upload Marks
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEnrolledStudentsModal} onHide={() => setShowEnrolledStudentsModal(false)} centered className={styles['custom-modal']}>
        <Modal.Header closeButton className={styles['modal-header-custom']}>
          <Modal.Title>Enrolled Students for {examToViewStudents?.title} ({examToViewStudents?.exam_type})</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles['modal-body-custom']}>
          {message && <Alert variant={message.type} className={styles['custom-alert']}>{message.text}</Alert>}
          {enrolledStudents.length > 0 ? (
            <div className={styles['student-id-list']}>
              {formatStudentIds(enrolledStudents).map((row, index) => (
                <p key={index} className={styles['student-id-row']}>{row}</p>
              ))}
            </div>
          ) : (
            <p>No enrolled students found for this exam.</p>
          )}
        </Modal.Body>
        <Modal.Footer className={styles['modal-footer-custom']}>
          <Button variant="secondary" onClick={() => setShowEnrolledStudentsModal(false)} className={styles['modal-button-secondary']}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddExam;