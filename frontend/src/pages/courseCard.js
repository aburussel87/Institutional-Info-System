import React from 'react';
import '../styles/courseCard.css'; 

const CourseCards = ({ courses }) => {
  return (
    <div className="course-cards-container">
      {courses.map((course, idx) => (
        <div key={idx} className="glass-card">
          <h5>{course.course_id}: {course.course_title}</h5>
          <p><strong>Offered By:</strong> {course.offered_by}</p>
          <p><strong>Teacher:</strong> {course.teacher_name}</p>
        </div>
      ))}
    </div>
  );
};

export default CourseCards;
