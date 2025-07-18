import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './teacher_header';
import API_BASE_URL from '../config/config';
import '../styles/addNotice.css'

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
const AddNotification = () => {
    const navigate = useNavigate();

    const SEMESTERS = ["L1T1", "L1T2", "L2T1", "L2T2", "L3T1", "L3T2", "L4T1", "L4T2"];

    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uid, setUid] = useState(null);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [pdf, setPdf] = useState(null);

    const [recipient, setRecipient] = useState('');
    const [recipientValue, setRecipientValue] = useState('');
    const [dept, setDept] = useState('');
    const [sem, setSem] = useState('');
    const [studentsFiltered, setStudentsFiltered] = useState([]);

    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in!');
            navigate('/login');
            return;
        }

        setLoading(true);
        fetch(`${API_BASE_URL}/notification/get_context`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) throw new Error('Failed to fetch context');
                setContext(data.notification.get_teacher_context || {});
                setUid(data.uid);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        let deptIds = [];

        if (context.hallstudent) {
            deptIds = [...new Set(context.hallstudent.map(s => s.department_id))];
        } else if (context.advisingstudent) {
            deptIds = [...new Set(context.advisingstudent.map(s => s.department_id))];
        }

        const deptList = deptIds
            .map(id => ({ id, name: DEPARTMENT_NAMES[id] || `Department ${id}` }))
            .sort((a, b) => a.name.localeCompare(b.name));

        setDepartments(deptList);
    }, [context]);


    useEffect(() => {
        if (!recipient || recipient !== 'student_id' || !sem) {
            setStudentsFiltered([]);
            return;
        }

        const getSource = () => {
            if (recipient === 'student_id') {
                if (context.deptstudent) return 'deptstudent';
                if (context.hallstudent && dept) return 'hallstudent';
                if (context.advisingstudent && dept) return 'advisingstudent';
            }
            if (recipient === 'teacher_id') return 'teacher';
            if (recipient === 'course_id') {
                if (recipientValue === 'deptcourse') return 'deptcourse';
                return 'course';
            }
            return '';
        };

        const source = getSource();
        let filtered = [];

        if (source === 'hallstudent') {
            filtered = (context.hallstudent || []).filter(s =>
                String(s.department_id) === String(dept) &&
                String(s.current_semester).toUpperCase() === String(sem).toUpperCase()
            );
        } else if (source === 'deptstudent') {
            filtered = (context.deptstudent || []).filter(s =>
                String(s.current_semester).toUpperCase() === String(sem).toUpperCase()
            );
        } else {
            filtered = (context.advisingstudent || []).filter(s =>
                String(s.department_id) === String(dept) &&
                String(s.current_semester).toUpperCase() === String(sem).toUpperCase()
            );
        }

        setStudentsFiltered(filtered);
    }, [recipient, dept, sem, recipientValue, context]);

    const handleSubmit = async e => {
        e.preventDefault();

        if (!title || !message) {
            setError('Title & Message are required');
            return;
        }

        const payload = {
            title,
            message,
            pdf,
            student_id: null,
            teacher_id: null,
            department_id: null,
            semester_id: null,
            course_id: null,
            hall_id: null,
            created_by: uid,
        };
        if (recipient === 'student_id') {
            if (recipientValue) {
                payload.student_id = recipientValue;
            } else {
                if(context.deptstudent){
                    payload.department_id = context.deptstudent[0].department_id;
                }else if(context.hallstudent){
                    payload.hall_id = context.hallstudent[0].hall_id;
                }
                if(dept){
                    payload.department_id = dept;
                }
                if(sem){
                    payload.semester_id = sem;
                }
            }
        }
        else if (recipient === 'teacher_id' && recipientValue) {
            payload.teacher_id = recipientValue;
        } else if (recipient === 'dept_course_id' && recipientValue) {
            payload.course_id = recipientValue;
        } else if (recipient === 'course_id' && recipientValue) {
            payload.course_id = recipientValue;
        } else if (!isNaN(recipient)) {
            if (context.hallstudent?.some(h => String(h.hall_id) === String(recipient))) {
                payload.hall_id = recipient;
            } else if (context.deptstudent?.some(d => String(d.department_id) === String(recipient))) {
                payload.department_id = recipient;
            }
        } else if (dept) {
            payload.department_id = dept;
        }



        setLoading(true);
        setError(null);
        setSuccess(null);

        fetch(`${API_BASE_URL}/notification/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) throw new Error(data.message || 'Failed to create notification');
                setSuccess(data.message || 'Notification sent');
                setTitle('');
                setMessage('');
                setPdf(null);
                setRecipient('');
                setRecipientValue('');
                setDept('');
                setSem('');
                setStudentsFiltered([]);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };


    const handleFileChange = e => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            setPdf(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            setPdf(base64);
        };
        reader.readAsDataURL(file);
    };

    const renderRecipients = () => {
        const isHOD = context.deptstudent || context.deptcourse || context.teacher;
        const isAdvisor = context.advisingstudent;
        const isProvost = context.hallstudent;

        return (
            <>
                <option value="">Select Recipient Type</option>
                {isHOD && <option value={context.deptstudent[0].department_id}>My Department {'(Dept. ID:' + context.deptstudent[0].department_id + ')'}</option>}
                {isHOD && <option value="student_id">Dept Student</option>}
                {isHOD && <option value="teacher_id">Dept Teacher</option>}
                {isHOD && <option value="dept_course_id">Dept Course</option>}
                {isAdvisor && <option value="student_id">Advising Student</option>}
                {isProvost && <option value="student_id">Hall Student</option>}
                {isProvost && <option value={context.hallstudent[0].hall_id}>My hall {'(Hall ID:' + context.hallstudent[0].hall_id + ')'}</option>}
                {context.course && <option value="course_id">My Course</option>}
            </>
        );
    };

    const renderRecipientValues = () => {
        if (!recipient) return null;

        if (recipient === 'student_id') {
            const isDeptStudent = context.deptstudent && recipient === 'student_id';
            const showDeptDropdown = !isDeptStudent;

            return (
                <>
                    {showDeptDropdown && (
                        <select
                            value={dept}
                            onChange={e => {
                                setDept(e.target.value);
                                setSem('');
                                setRecipientValue('');
                                setStudentsFiltered([]);
                            }}
                            className="form-select mt-2"
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}

                        </select>
                    )}

                    <select
                        value={sem}
                        onChange={e => setSem(e.target.value)}
                        className="form-select mt-2"
                    >
                        <option value="">Select Semester</option>
                        {SEMESTERS.map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    {sem && (
                        <>
                            {studentsFiltered.length > 0 ? (
                                <select
                                    value={recipientValue}
                                    onChange={e => setRecipientValue(e.target.value)}
                                    className="form-select mt-2"
                                >
                                    <option value="">Select Student</option>
                                    {studentsFiltered.map(s => (
                                        <option key={s.student_id} value={s.student_id}>
                                            {s.student_name + ' (' + s.student_id + ')'}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="mt-2 text-danger">No students found</div>
                            )}
                        </>
                    )}
                </>
            );
        }

        if (recipient === 'teacher_id') {
            const teachers = context.teacher || [];
            return (
                <select
                    className="form-select mt-2"
                    value={recipientValue}
                    onChange={e => setRecipientValue(e.target.value)}
                >
                    <option value="">Select</option>
                    {teachers.map(t => (
                        <option key={t.teacher_id} value={t.teacher_id}>
                            {t.teacher_name + ' (' + t.teacher_id + ')'}
                        </option>
                    ))}
                </select>
            );
        }

        if (recipient === 'course_id') {
            const courses = context.course;

            return (
                <select
                    className="form-select mt-2"
                    value={recipientValue}
                    onChange={e => setRecipientValue(e.target.value)}
                >
                    <option value="">Select</option>
                    {courses.map(c => (
                        <option key={c.course_id} value={c.course_id}>
                            {c.course_id}
                        </option>
                    ))}
                </select>
            );
        }
        if (recipient === 'dept_course_id') {
            const courses = context.deptcourse;

            return (
                <select
                    className="form-select mt-2"
                    value={recipientValue}
                    onChange={e => setRecipientValue(e.target.value)}
                >
                    <option value="">Select</option>
                    {courses.map(c => (
                        <option key={c.course_id} value={c.course_id}>
                            {c.course_id + '(' + c.semester + ')'}
                        </option>
                    ))}
                </select>
            );
        }
    };

    return (
        <div className="add-notice-container min-h-screen bg-light flex flex-col">
            <Header />
            <div className="container flex-grow d-flex justify-content-center align-items-center py-4">
                <div className="bg-white p-4 shadow rounded w-100" style={{ maxWidth: 600 }}>
                    <h3 className="text-center mb-3">Send Notice</h3>

                    {loading && <div className="alert alert-info">Loading…</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="d-grid gap-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />

                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                        />

                        <input
                            type="file"
                            className="form-control"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />

                        <select
                            className="form-select"
                            value={recipient}
                            onChange={e => {
                                setRecipient(e.target.value);
                                setRecipientValue('');
                                setDept('');
                                setSem('');
                                setStudentsFiltered([]);
                            }}
                        >
                            {renderRecipients()}
                        </select>

                        {renderRecipientValues()}

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Sending…' : 'Send Notification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNotification;
