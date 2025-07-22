import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Table, Dropdown, Accordion } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import styles from '../styles/HOD_page.module.css';

const DEPARTMENT_NAMES = {
  1: 'Computer Science & Engineering',
  2: 'Electrical & Electronic Engineering',
  3: 'Biomedical Engineering',
  4: 'Nano Materials and Ceramic Engineering',
  5: 'Mathematics',
  6: 'Physics',
  7: 'Chemical Engineering',
  8: 'Chemistry',
  9: 'Materials & Metallurgical Engineering',
  10: 'Civil Engineering',
  11: 'Mechanical Engineering',
  12: 'Architecture',
};

const HODStd = () => {
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('students');
  const [department_id, setDepartmentId] = useState(null);

  useEffect(() => {
  const fetchDepartmentData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/department/getData`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setDepartmentData(data.data);
        if (data.data.teachers && data.data.teachers.length > 0) {
          setDepartmentId(data.data.teachers[0].department_id);
        }
        setError(null);
      } else {
        setError('Failed to load department data. Please try again later.');
        setDepartmentData(null);
      }
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError('Network error: Could not fetch department data.');
      setDepartmentData(null);
    } finally {
      setLoading(false);
    }
  };
  fetchDepartmentData();
}, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles['loading-spinner-container']}>
          <Spinner animation="border" role="status" className={styles['custom-spinner']}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger" className={styles['custom-alert']}>{error}</Alert>;
    }

    if (!departmentData) {
      return <Alert variant="info" className={styles['custom-alert']}>No data available.</Alert>;
    }

    switch (selectedOption) {
      case 'students':
        const studentsByBatch = departmentData.students.reduce((acc, student) => {
          const batch = student.semester || 'Unspecified Semester';
          if (!acc[batch]) {
            acc[batch] = [];
          }
          acc[batch].push(student);
          return acc;
        }, {});

        return (
          <>
            <h2 className={styles['section-title']}>Students by Semester</h2>
            {Object.keys(studentsByBatch).length > 0 ? (
              <Accordion defaultActiveKey="0" className={styles['custom-accordion']}>
                {Object.entries(studentsByBatch).map(([batch, students], index) => (
                  <Accordion.Item eventKey={String(index)} key={batch} className={styles['accordion-item']}>
                    <Accordion.Header className={styles['accordion-header']}>Semester: {batch} ({students.length} Students)</Accordion.Header>
                    <Accordion.Body className={styles['accordion-body']}>
                      <Table striped bordered hover responsive className={styles['custom-table']}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.student_id}>
                              <td>{student.student_id}</td>
                              <td>{student.username}</td>
                              <td>{student.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Alert variant="info" className={styles['custom-alert']}>No student data available.</Alert>
            )}
          </>
        );
      case 'teachers':
        const teachersByDesignation = departmentData.teachers.reduce((acc, teacher) => {
          const designation = teacher.designation || 'Unspecified Designation';
          if (!acc[designation]) {
            acc[designation] = [];
          }
          acc[designation].push(teacher);
          return acc;
        }, {});

        return (
          <>
            <h2 className={styles['section-title']}>Teachers by Designation</h2>
            {Object.keys(teachersByDesignation).length > 0 ? (
              <Accordion defaultActiveKey="0" className={styles['custom-accordion']}>
                {Object.entries(teachersByDesignation).map(([designation, teachers], index) => (
                  <Accordion.Item eventKey={String(index)} key={designation} className={styles['accordion-item']}>
                    <Accordion.Header className={styles['accordion-header']}>Designation: {designation} ({teachers.length} Teachers)</Accordion.Header>
                    <Accordion.Body className={styles['accordion-body']}>
                      <Table striped bordered hover responsive className={styles['custom-table']}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map((teacher) => (
                            <tr key={teacher.teacher_id}>
                              <td>{teacher.teacher_id}</td>
                              <td>{teacher.username}</td>
                              <td>{teacher.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Alert variant="info" className={styles['custom-alert']}>No teacher data available.</Alert>
            )}
          </>
        );
      case 'courses':
        const departmentalCourses = departmentData.courses.filter(course =>
          course.offered_by === department_id && course.offered_for === department_id
        );

        const nonDepartmentalCourses = departmentData.courses.filter(course =>
          course.offered_by !== department_id
        );

        const offeredToOtherDepartments = departmentData.courses.filter(course =>
          course.offered_for !== department_id && course.offered_by === department_id
        );

        const coursesBySemester = departmentalCourses.reduce((acc, course) => {
          const semester = course.semester || 'Unspecified Semester';
          if (!acc[semester]) {
            acc[semester] = [];
          }
          acc[semester].push(course);
          return acc;
        }, {});

        return (
          <>
            <h2 className={styles['section-title']}>Departmental Courses by Semester</h2>
            {Object.keys(coursesBySemester).length > 0 ? (
              <Accordion defaultActiveKey="0" className={styles['custom-accordion']}>
                {Object.entries(coursesBySemester).map(([semester, courses], index) => (
                  <Accordion.Item eventKey={String(index)} key={semester} className={styles['accordion-item']}>
                    <Accordion.Header className={styles['accordion-header']}>Semester: {semester} ({courses.length} Courses)</Accordion.Header>
                    <Accordion.Body className={styles['accordion-body']}>
                      <Table striped bordered hover responsive className={styles['custom-table']}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.course_id}>
                              <td>{course.course_id}</td>
                              <td>{course.title}</td>
                              <td>{course.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Alert variant="info" className={styles['custom-alert']}>No departmental courses available.</Alert>
            )}

            <h2 className={styles['section-title']}>Non-Departmental Courses</h2>
            {nonDepartmentalCourses.length > 0 ? (
              <Table striped bordered hover responsive className={styles['custom-table']}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Offered By</th>
                  </tr>
                </thead>
                <tbody>
                  {nonDepartmentalCourses.map((course) => (
                    <tr key={course.course_id}>
                      <td>{course.course_id}</td>
                      <td>{course.title}</td>
                      <td>{course.credits}</td>
                      <td>{course.semester}</td>
                      <td>{DEPARTMENT_NAMES[course.offered_by] || 'Unknown Department'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info" className={styles['custom-alert']}>No non-departmental courses available.</Alert>
            )}

            <h2 className={styles['section-title']}>Courses Offered to Other Departments</h2>
            {offeredToOtherDepartments.length > 0 ? (
              <Table striped bordered hover responsive className={styles['custom-table']}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Offered For</th>
                  </tr>
                </thead>
                <tbody>
                  {offeredToOtherDepartments.map((course) => (
                    <tr key={course.course_id}>
                      <td>{course.course_id}</td>
                      <td>{course.title}</td>
                      <td>{course.credits}</td>
                      <td>{course.semester}</td>
                      <td>{DEPARTMENT_NAMES[course.offered_for] || 'Unknown Department'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info" className={styles['custom-alert']}>No courses offered to other departments available.</Alert>
            )}
          </>
        );
      default:
        return <Alert variant="warning" className={styles['custom-alert']}>Please select an option from the dropdown.</Alert>;
    }
  };

  return (
    <>
      <Header />
      <div className={`${styles['hod-page-container']} container mt-5`}>
        <Card className={`${styles['glassmorphic-card']} shadow-lg`}>
          <Card.Header className={`${styles['card-header-custom']} bg-primary text-white text-center py-3`}>
  <h1>
    {department_id && DEPARTMENT_NAMES[department_id]
      ? DEPARTMENT_NAMES[department_id]
      : 'Department Overview'}
  </h1>
</Card.Header>

          <Card.Body className={styles['card-body-custom']}>
            <div className={`${styles['dropdown-container']} d-flex justify-content-center mb-4`}>
              <Dropdown onSelect={(eventKey) => setSelectedOption(eventKey)}>
                <Dropdown.Toggle variant="success" id="dropdown-basic" className={styles['dropdown-toggle-custom']}>
                  View {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu className={styles['dropdown-menu-custom']}>
                  <Dropdown.Item eventKey="students" className={styles['dropdown-item-custom']}>Students</Dropdown.Item>
                  <Dropdown.Item eventKey="teachers" className={styles['dropdown-item-custom']}>Teachers</Dropdown.Item>
                  <Dropdown.Item eventKey="courses" className={styles['dropdown-item-custom']}>Courses</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            {renderContent()}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default HODStd;