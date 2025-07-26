import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Table, Accordion, Form, Row, Col, Button } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import Header from './teacher_header';
import styles from '../styles/subjectAllocation.module.css';

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

const CURRENT_ACADEMIC_SESSION = '2025-26a';

const AllocateSubject = () => {
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department_id, setDepartmentId] = useState(null);
  const [teachers, setTeachers] = useState(null);
  const [selectedOtherDeptSemester, setSelectedOtherDeptSemester] = useState('All');

  const [courseAllocations, setCourseAllocations] = useState({});
  const [teacherSubjectAllocations, setTeacherSubjectAllocations] = useState({});

  const [allocationMessage, setAllocationMessage] = useState({ type: '', text: '' });

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAllocationMessage({ type: '', text: '' });

      const deptRes = await fetch(`${API_BASE_URL}/department/getData`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const deptData = await deptRes.json();

      if (deptData.success) {
        setDepartmentData(deptData.data);
        if (deptData.data.teachers && deptData.data.teachers.length > 0) {
          const currentDeptId = deptData.data.teachers[0].department_id;
          setDepartmentId(currentDeptId);
          setTeachers(deptData.data.teachers);

          const initialAllocations = {};
          deptData.data.courses.forEach(course => {
            if (course.offered_by === currentDeptId) {
              const lastDigit = parseInt(String(course.course_id).slice(-1));
              const isTheoretical = lastDigit % 2 !== 0;

              initialAllocations[course.course_id] = {
                sections: isTheoretical ? 1 : 6, 
                teachers: isTheoretical ? 1 : 6  
              };
            }
          });
          setCourseAllocations(initialAllocations);
        } else {
          setDepartmentId(null);
          setTeachers([]);
        }
      } else {
        setError('Failed to load department data. Please try again later.');
        setDepartmentData(null);
        setTeachers([]);
      }
      const allocationRes = await fetch(`${API_BASE_URL}/subjectAllocation/get`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const allocationData = await allocationRes.json();

      if (allocationData.success && allocationData.allocations) {
        const processedAllocations = allocationData.allocations.reduce((acc, alloc) => {
          if (!acc[alloc.teacher_id]) {
            acc[alloc.teacher_id] = [];
          }
          acc[alloc.teacher_id].push({ course_id: alloc.course_id, section_type: alloc.section_type });
          return acc;
        }, {});
        setTeacherSubjectAllocations(processedAllocations);
      } else if (allocationData.success === false && allocationData.msg === "No allocations found") {
        setTeacherSubjectAllocations({});
      } else {
        console.warn("Could not fetch subject allocations:", allocationData.error || allocationData.msg);
        setTeacherSubjectAllocations({});
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error: Could not fetch data.');
      setDepartmentData(null);
      setTeachers([]);
      setTeacherSubjectAllocations({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAllocationChange = (courseId, type, value) => {
    setCourseAllocations(prevAllocations => ({
      ...prevAllocations,
      [courseId]: {
        ...prevAllocations[courseId],
        [type]: parseInt(value)
      }
    }));
  };

  const getSectionLetters = (numSections, isSessional) => {
    if (isSessional) {
      const sections = [];
      const baseLetters = ['A', 'B', 'C'];
      for (let i = 0; i < numSections; i++) {
        sections.push(`${baseLetters[Math.floor(i / 2)]}${(i % 2) + 1}`);
      }
      return sections;
    }
    return Array.from({ length: numSections }, (_, i) => String.fromCharCode(65 + i));
  };

  const handleAllocateSubjects = async () => {
    setLoading(true);
    setAllocationMessage({ type: '', text: '' });
    try {
      if (!teachers || teachers.length === 0) {
        setAllocationMessage({ type: 'danger', text: 'No teachers available to allocate subjects.' });
        setLoading(false);
        return;
      }

      const allocationsToSend = [];
      const currentDepartmentCourses = departmentData.courses.filter(course =>
        course.offered_by === department_id
      );

      const sortedTeachers = [...teachers].sort((a, b) => a.username.localeCompare(b.username));

      let globalTeacherPointer = 0;

      for (const course of currentDepartmentCourses) {
        const allocInfo = courseAllocations[course.course_id];
        if (!allocInfo) continue;

        const numSections = allocInfo.sections;
        const numTeachersForCourse = allocInfo.teachers;
        const isSessional = parseInt(String(course.course_id).slice(-1)) % 2 === 0;

        if (numTeachersForCourse === 0 || numSections === 0) continue;

        const sections = getSectionLetters(numSections, isSessional);

        if (numSections === 1 && numTeachersForCourse === 1) {
          const teacher = sortedTeachers[globalTeacherPointer % sortedTeachers.length];
          allocationsToSend.push({
            teacher_id: teacher.teacher_id,
            course_id: course.course_id,
            section_type: 'All',
            academic_session: CURRENT_ACADEMIC_SESSION
          });
          globalTeacherPointer++; 
        }
        else if (numSections === 1 && numTeachersForCourse > 1) {
          for (let i = 0; i < numTeachersForCourse; i++) {
            const teacher = sortedTeachers[globalTeacherPointer % sortedTeachers.length];
            allocationsToSend.push({
              teacher_id: teacher.teacher_id,
              course_id: course.course_id,
              section_type: 'All',
              academic_session: CURRENT_ACADEMIC_SESSION
            });
            globalTeacherPointer++; 
          }
        }
        else if (numSections > 1 && numTeachersForCourse >= numSections) {
          for (let i = 0; i < numSections; i++) {
            const teacher = sortedTeachers[(globalTeacherPointer + i) % sortedTeachers.length];
            const sectionLetter = sections[i];
            allocationsToSend.push({
              teacher_id: teacher.teacher_id,
              course_id: course.course_id,
              section_type: sectionLetter,
              academic_session: CURRENT_ACADEMIC_SESSION
            });
          }
          globalTeacherPointer += numSections; 
        }
        else if (numSections > 1 && numTeachersForCourse < numSections) {
            const teachersForThisCourse = [];
            for(let i = 0; i < numTeachersForCourse; i++) {
                teachersForThisCourse.push(sortedTeachers[(globalTeacherPointer + i) % sortedTeachers.length]);
            }
            globalTeacherPointer += numTeachersForCourse; 
            for (let i = 0; i < numSections; i++) {
                const teacher = teachersForThisCourse[i % teachersForThisCourse.length];
                const sectionLetter = sections[i];
                allocationsToSend.push({
                    teacher_id: teacher.teacher_id,
                    course_id: course.course_id,
                    section_type: sectionLetter,
                    academic_session: CURRENT_ACADEMIC_SESSION
                });
            }
        }
      }

      console.log('Allocations to Send:', allocationsToSend);

      const response = await fetch(`${API_BASE_URL}/subjectAllocation/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ allocations: allocationsToSend })
      });

      const data = await response.json();

      if (data.success) {
        setAllocationMessage({ type: 'success', text: data.msg });
        fetchAllData();
      } else {
        setAllocationMessage({ type: 'danger', text: data.msg || 'Failed to allocate subjects.' });
      }

    } catch (err) {
      console.error('Error during subject allocation:', err);
      setAllocationMessage({ type: 'danger', text: 'Network error: Could not allocate subjects.' });
    } finally {
      setLoading(false);
    }
  };

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

    if (!departmentData || !department_id) {
      return <Alert variant="info" className={styles['custom-alert']}>No department data or ID available.</Alert>;
    }

    const ownDepartmentalCourses = departmentData.courses.filter(course =>
      course.offered_by === department_id && course.offered_for === department_id
    );

    const coursesOfferedToOtherDepartments = departmentData.courses.filter(course =>
      course.offered_by === department_id && course.offered_for !== department_id
    );

    const coursesBySemester = ownDepartmentalCourses.reduce((acc, course) => {
      const semester = course.semester || 'Unspecified Semester';
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(course);
      return acc;
    }, {});

    const sortedSemesters = Object.keys(coursesBySemester).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      return numA - numB;
    });

    return (
      <>
        <h2 className={styles['section-title']}>Courses for {DEPARTMENT_NAMES[department_id]} Students</h2>
        {sortedSemesters.length > 0 || coursesOfferedToOtherDepartments.length > 0 ? (
          <Accordion defaultActiveKey="0" className={styles['custom-accordion']}>
            {sortedSemesters.map((semester, index) => {
              const theoreticalCourses = coursesBySemester[semester].filter(course => {
                const lastDigit = parseInt(String(course.course_id).slice(-1));
                return lastDigit % 2 !== 0;
              }).sort((a, b) => (a.course_id || '').localeCompare(b.course_id || ''));

              const sessionalCourses = coursesBySemester[semester].filter(course => {
                const lastDigit = parseInt(String(course.course_id).slice(-1));
                return lastDigit % 2 === 0 || lastDigit === 0;
              }).sort((a, b) => (a.course_id || '').localeCompare(b.course_id || ''));

              return (
                <Accordion.Item eventKey={String(index)} key={semester} className={styles['accordion-item']}>
                  <Accordion.Header className={styles['accordion-header']}>Semester: {semester} ({theoreticalCourses.length + sessionalCourses.length} Courses)</Accordion.Header>
                  <Accordion.Body className={styles['accordion-body']}>
                    {theoreticalCourses.length > 0 && (
                      <>
                        <h4 className={styles['subsection-title']}>Theoretical Courses</h4>
                        <Table striped bordered hover responsive className={styles['custom-table']}>
                          <thead>
                            <tr>
                              <th>Course ID</th>
                              <th>Course Title</th>
                              <th>Credits</th>
                              <th>Sections</th>
                              <th>Teachers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {theoreticalCourses.map((course) => (
                              <tr key={course.course_id}>
                                <td>{course.course_id}</td>
                                <td>{course.title}</td>
                                <td>{course.credits}</td>
                                <td>
                                  <Form.Control
                                    as="select"
                                    value={courseAllocations[course.course_id]?.sections || 1}
                                    onChange={(e) => handleAllocationChange(course.course_id, 'sections', e.target.value)}
                                    className={styles['select-input']}
                                  >
                                    {[...Array(6).keys()].map(i => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </Form.Control>
                                </td>
                                <td>
                                  <Form.Control
                                    as="select"
                                    value={courseAllocations[course.course_id]?.teachers || 1}
                                    onChange={(e) => handleAllocationChange(course.course_id, 'teachers', e.target.value)}
                                    className={styles['select-input']}
                                  >
                                    {[...Array(teachers ? teachers.length : 1).keys()].map(i => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </Form.Control>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    )}

                    {sessionalCourses.length > 0 && (
                      <>
                        <h4 className={styles['subsection-title']} style={{ marginTop: theoreticalCourses.length > 0 ? '20px' : '0' }}>Sessional Courses</h4>
                        <Table striped bordered hover responsive className={styles['custom-table']}>
                          <thead>
                            <tr>
                              <th>Course ID</th>
                              <th>Course Title</th>
                              <th>Credits</th>
                              <th>Sections</th>
                              <th>Teachers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessionalCourses.map((course) => (
                              <tr key={course.course_id}>
                                <td>{course.course_id}</td>
                                <td>{course.title}</td>
                                <td>{course.credits}</td>
                                <td>
                                  <Form.Control
                                    as="select"
                                    value={courseAllocations[course.course_id]?.sections || 3}
                                    onChange={(e) => handleAllocationChange(course.course_id, 'sections', e.target.value)}
                                    className={styles['select-input']}
                                  >
                                    {[...Array(6).keys()].map(i => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </Form.Control>
                                </td>
                                <td>
                                  <Form.Control
                                    as="select"
                                    value={courseAllocations[course.course_id]?.teachers || 3}
                                    onChange={(e) => handleAllocationChange(course.course_id, 'teachers', e.target.value)}
                                    className={styles['select-input']}
                                  >
                                    {[...Array(teachers ? teachers.length : 3).keys()].map(i => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                  </Form.Control>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    )}

                    {theoreticalCourses.length === 0 && sessionalCourses.length === 0 && (
                      <Alert variant="info" className={styles['custom-alert']}>No courses in this semester.</Alert>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}

            {coursesOfferedToOtherDepartments.length > 0 && (
              <Accordion.Item eventKey="others" className={styles['accordion-item']}>
                <Accordion.Header className={styles['accordion-header']}>Courses Offered to Other Departments ({coursesOfferedToOtherDepartments.length} Courses)</Accordion.Header>
                <Accordion.Body className={styles['accordion-body']}>
                  <Row className="mb-3 justify-content-center">
                    <Col xs={12} md={4}>
                      <Form.Group controlId="selectOtherDeptSemester">
                        <Form.Label>Filter by Semester:</Form.Label>
                        <Form.Control
                          as="select"
                          value={selectedOtherDeptSemester}
                          onChange={(e) => setSelectedOtherDeptSemester(e.target.value)}
                          className={styles['select-input-lg']}
                        >
                          {['All', ...new Set(coursesOfferedToOtherDepartments.map(course => course.semester).filter(Boolean).sort((a,b) => parseInt(a) - parseInt(b)))]
                            .map(semester => (
                            <option key={semester} value={semester}>{semester === 'All' ? 'All Semesters' : `Semester ${semester}`}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>

                  {(() => {
                    const filteredCourses = selectedOtherDeptSemester === 'All'
                      ? coursesOfferedToOtherDepartments
                      : coursesOfferedToOtherDepartments.filter(course => course.semester === selectedOtherDeptSemester);

                    const otherDeptTheoreticalCourses = filteredCourses.filter(course => {
                      const lastDigit = parseInt(String(course.course_id).slice(-1));
                      return lastDigit % 2 !== 0;
                    }).sort((a, b) => (a.course_id || '').localeCompare(b.course_id || ''));

                    const otherDeptSessionalCourses = filteredCourses.filter(course => {
                      const lastDigit = parseInt(String(course.course_id).slice(-1));
                      return lastDigit % 2 === 0 || lastDigit === 0;
                    }).sort((a, b) => (a.course_id || '').localeCompare(b.course_id || ''));

                    return (
                      <>
                        {otherDeptTheoreticalCourses.length > 0 && (
                          <>
                            <h4 className={styles['subsection-title']}>Theoretical Courses</h4>
                            <Table striped bordered hover responsive className={styles['custom-table']}>
                              <thead>
                                <tr>
                                  <th>Course ID</th>
                                  <th>Course Title</th>
                                  <th>Credits</th>
                                  <th>Semester</th>
                                  <th>Offered For</th>
                                  <th>Sections</th>
                                  <th>Teachers</th>
                                </tr>
                              </thead>
                              <tbody>
                                {otherDeptTheoreticalCourses.map((course) => (
                                  <tr key={course.course_id}>
                                    <td>{course.course_id}</td>
                                    <td>{course.title}</td>
                                    <td>{course.credits}</td>
                                    <td>{course.semester}</td>
                                    <td>{DEPARTMENT_NAMES[course.offered_for] || 'Unknown Department'}</td>
                                    <td>
                                      <Form.Control
                                        as="select"
                                        value={courseAllocations[course.course_id]?.sections || 1}
                                        onChange={(e) => handleAllocationChange(course.course_id, 'sections', e.target.value)}
                                        className={styles['select-input']}
                                      >
                                        {[...Array(6).keys()].map(i => (
                                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                      </Form.Control>
                                    </td>
                                    <td>
                                      <Form.Control
                                        as="select"
                                        value={courseAllocations[course.course_id]?.teachers || 1}
                                        onChange={(e) => handleAllocationChange(course.course_id, 'teachers', e.target.value)}
                                        className={styles['select-input']}
                                      >
                                        {[...Array(teachers ? teachers.length : 1).keys()].map(i => (
                                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                      </Form.Control>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </>
                        )}

                        {otherDeptSessionalCourses.length > 0 && (
                          <>
                            <h4 className={styles['subsection-title']} style={{ marginTop: otherDeptTheoreticalCourses.length > 0 ? '20px' : '0' }}>Sessional Courses</h4>
                            <Table striped bordered hover responsive className={styles['custom-table']}>
                              <thead>
                                <tr>
                                  <th>Course ID</th>
                                  <th>Course Title</th>
                                  <th>Credits</th>
                                  <th>Semester</th>
                                  <th>Offered For</th>
                                  <th>Sections</th>
                                  <th>Teachers</th>
                                </tr>
                              </thead>
                              <tbody>
                                {otherDeptSessionalCourses.map((course) => (
                                  <tr key={course.course_id}>
                                    <td>{course.course_id}</td>
                                    <td>{course.title}</td>
                                    <td>{course.credits}</td>
                                    <td>{course.semester}</td>
                                    <td>{DEPARTMENT_NAMES[course.offered_for] || 'Unknown Department'}</td>
                                    <td>
                                      <Form.Control
                                        as="select"
                                        value={courseAllocations[course.course_id]?.sections || 3}
                                        onChange={(e) => handleAllocationChange(course.course_id, 'sections', e.target.value)}
                                        className={styles['select-input']}
                                      >
                                        {[...Array(6).keys()].map(i => (
                                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                      </Form.Control>
                                    </td>
                                    <td>
                                      <Form.Control
                                        as="select"
                                        value={courseAllocations[course.course_id]?.teachers || 3}
                                        onChange={(e) => handleAllocationChange(course.course_id, 'teachers', e.target.value)}
                                        className={styles['select-input']}
                                      >
                                        {[...Array(teachers ? teachers.length : 3).keys()].map(i => (
                                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                      </Form.Control>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </>
                        )}
                        {otherDeptTheoreticalCourses.length === 0 && otherDeptSessionalCourses.length === 0 && (
                          <Alert variant="info" className={styles['custom-alert']}>No courses offered to other departments by this department for the selected semester.</Alert>
                        )}
                      </>
                    );
                  })()}
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
        ) : (
          <Alert variant="info" className={styles['custom-alert']}>No courses available for this department.</Alert>
        )}

        <hr className="my-4"/>

        <div className="d-flex justify-content-center my-4">
          <Button
            variant="success"
            onClick={handleAllocateSubjects}
            disabled={loading || !teachers || teachers.length === 0}
            className={styles['allocate-button']}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Allocate Subjects'}
          </Button>
        </div>

        {allocationMessage.text && (
          <Alert variant={allocationMessage.type} className="mt-3 text-center">
            {allocationMessage.text}
          </Alert>
        )}

        <h2 className={`${styles['section-title']} mt-5`}>Teacher Allocation Summary for {CURRENT_ACADEMIC_SESSION}</h2>
        {teachers && teachers.length > 0 ? (
          <Table striped bordered hover responsive className={styles['custom-table']}>
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Teacher Name</th>
                <th>Allocated Subjects Count</th>
                <th>Allocated Subjects Details</th>
              </tr>
            </thead>
            <tbody>
              {teachers.sort((a, b) => (a.username || '').localeCompare(b.username || '')).map((teacher) => {
                const allocationsForTeacher = teacherSubjectAllocations[teacher.teacher_id] || [];
                const allocatedCount = allocationsForTeacher.length;

                return (
                  <tr key={teacher.teacher_id}>
                    <td>{teacher.teacher_id}</td>
                    <td>{teacher.username}</td>
                    <td>{allocatedCount}</td>
                    <td>
                      {allocatedCount > 0 ? (
                        allocationsForTeacher
                          .map(alloc => `${alloc.course_id} (${alloc.section_type})`)
                          .join(', ')
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info" className={styles['custom-alert']}>No teachers found for this department.</Alert>
        )}
      </>
    );
  };

  return (
    <>
      <Header />
      <div className={`${styles['allocate-subject-container']} container mt-5`}>
        <Card className={`${styles['glassmorphic-card']} shadow-lg`}>
          <Card.Header className={`${styles['card-header-custom']} bg-primary text-white text-center py-3`}>
            <h1>
              {department_id && DEPARTMENT_NAMES[department_id]
                ? `${DEPARTMENT_NAMES[department_id]} - Subject Allocation`
                : 'Subject Allocation Overview'}
            </h1>
          </Card.Header>

          <Card.Body className={styles['card-body-custom']}>
            {renderContent()}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default AllocateSubject;