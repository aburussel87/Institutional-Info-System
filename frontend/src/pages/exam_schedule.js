import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import Header from './header';
import API_BASE_URL from '../config/config';
import '../styles/exam_schedule.css';

const StudentRoutine = () => {
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/student/exams`) // Adjust endpoint as needed
      .then((res) => res.json())
      .then((data) => {
        setExamList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch exams:', err);
        setLoading(false);
      });
  }, []);

  const openModal = (exam) => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExam(null);
  };

  return (
    <div className="examRoutineContainer">
      <Header />
      <h2 className="examRoutineHeading">📘 Exam Routine</h2>
      {loading ? (
        <div className="examRoutineLoading">
          <Spinner animation="border" variant="primary" />
          <p>Loading exams...</p>
        </div>
      ) : examList.length === 0 ? (
        <p className="examRoutineEmpty">No exams found.</p>
      ) : (
        <ul className="examRoutineList">
          {examList.map((exam) => (
            <li
              key={exam.exam_id}
              className="examRoutineItem"
              onClick={() => openModal(exam)}
            >
              <div className="examRoutineItemTop">
                <span className="examCourseId">{exam.course_id}</span>
                <span className="examDate">
                  {new Date(exam.date_of_exam).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>📄 Exam Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExam && (
            <div className="examRoutineDetailBox">
              <p><strong>Exam ID:</strong> {selectedExam.exam_id}</p>
              <p><strong>Course:</strong> {selectedExam.course_id}</p>
              <p><strong>Title:</strong> {selectedExam.title}</p>
              <p><strong>Type:</strong> {selectedExam.exam_type}</p>
              <p><strong>Total Marks:</strong> {selectedExam.total_marks}</p>
              <p><strong>Date:</strong> {new Date(selectedExam.date_of_exam).toLocaleString()}</p>
              <p><strong>Semester:</strong> {selectedExam.semester}</p>
              <p><strong>Session:</strong> {selectedExam.academic_session}</p>
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

export default StudentRoutine;
