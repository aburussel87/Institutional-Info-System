import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import Header from './header';
import API_BASE_URL from '../config/config';
import '../styles/exam_schedule.css';

const ExamTypes = ['Term', 'Quiz', 'CT1', 'CT2', 'CT3', 'CT4'];

const ExamSchedule = () => {
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You are not logged in!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    const fetchExams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/exam_schedule`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data.error || 'Failed to fetch exams');
        }

        const sorted = [...(data.routine || [])].sort((a, b) => {
          if (a.exam_type < b.exam_type) return -1;
          if (a.exam_type > b.exam_type) return 1;
          return 0;
        });

        setExamList(sorted);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [navigate]);

  const openModal = (exam) => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExam(null);
  };

  const handleExamTypeChange = (event) => {
    setSelectedExamType(event.target.value);
  };

  const filteredExams = selectedExamType
    ? examList.filter((exam) => exam.exam_type === selectedExamType)
    : examList;

  return (
    <div className="examRoutineContainer">
      <Header />
      <h2 className="examRoutineHeading">Exam Routine</h2>

      <div className="examTypeFilter">
        <Form.Select
          aria-label="Filter by exam type"
          value={selectedExamType}
          onChange={handleExamTypeChange}
          className="mb-3"
        >
          <option value="">All Exam Types</option>
          {ExamTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <div className="examRoutineLoading">
          <Spinner animation="border" variant="primary" />
          <p>Loading exams...</p>
        </div>
      ) : filteredExams.length === 0 && selectedExamType !== '' ? (
        <p className="examRoutineEmpty">No {selectedExamType} exams found.</p>
      ) : filteredExams.length === 0 && selectedExamType === '' ? (
        <p className="examRoutineEmpty">No exams found.</p>
      ) : (
        <div className="examRoutineGrid">
          {filteredExams.map((exam) => (
            <div
              key={exam.exam_id}
              className="examRoutineItem"
              onClick={() => openModal(exam)}
            >
              <div className="examRoutineItemTop">
                <span className="examCourseId">{exam.course_id}</span>
              </div>
              <div className="examType">{exam.exam_type}</div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Exam Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExam && (
            <div className="examRoutineDetailBox">
              <p>
                <strong>Exam ID:</strong> {selectedExam.exam_id}
              </p>
              <p>
                <strong>Course:</strong> {selectedExam.course_id}
              </p>
              <p>
                <strong>Title:</strong> {selectedExam.title}
              </p>
              <p>
                <strong>Type:</strong> {selectedExam.exam_type}
              </p>
              <p>
                <strong>Total Marks:</strong> {selectedExam.total_marks}
              </p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(selectedExam.date_of_exam).toLocaleString()}
              </p>
              <p>
                <strong>Semester:</strong> {selectedExam.semester}
              </p>
              <p>
                <strong>Session:</strong> {selectedExam.academic_session}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExamSchedule;