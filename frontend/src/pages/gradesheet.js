import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; 
import Header from '../pages/header';
import '../styles/gradesheet.css'
import API_BASE_URL from '../config/config';

export default function Gradesheet() {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null); 
    const [selectedTerm, setSelectedTerm] = useState("");
    const [msg, setMsg] = useState("");
    const [semester, setSemester] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in!");
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/gradesheet`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert("Failed to load gradesheet: " + (error.error || "Unknown error"));
                    setTimeout(() => navigate("/login"), 1000);
                    return;
                }

                const data = await response.json();
                setStudent(data.result);
                setSemester(data.result.current_semester);

            } catch (err) {
                setMsg(err.message || "Unknown error");
                setTimeout(() => navigate("/login"), 1000);
            }
        })();
    }, [navigate]);

    if (!student) {
        return (
            <main className="container mt-4">
                <Header />
                <p>Loading gradesheet...</p>
            </main>
        );
    }

    const courses = selectedTerm ? student.grades[selectedTerm] || [] : [];

    let termGPA = 0;
    let totalCredit = 0;

    if (courses.length > 0) {
        totalCredit = courses.reduce((sum, c) => sum + c.credit, 0);
        termGPA = courses.reduce((sum, c) => sum + c.credit * c.gpa, 0) / totalCredit;
    }

    let totalCreditsTillNow = 0;
    let weightedSum = 0;
    student.levelTerms.forEach((term) => {
        (student.grades[term] || []).forEach((c) => {
            totalCreditsTillNow += c.credit;
            weightedSum += c.credit * c.gpa;
        });
    });
    const totalCGPA = weightedSum / totalCreditsTillNow;

    return (
        <main className="gradesheet container mt-4">
            <Header />
            <div>
                {msg && <p className="text-danger">{msg}</p>}
                {/* rest of UI */}
            </div>
            <div className="mb-4">
                <label htmlFor="levelTermSelect" className="form-label fw-bold">
                    Select Level-Term:
                </label>
                <select
                    id="levelTermSelect"
                    className="form-select"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                >
                    <option value="" disabled>
                        Choose a Level-Term
                    </option>
                    {student.levelTerms.map((term) => (
                        <option key={term} value={term}>
                            {term}
                        </option>
                    ))}
                </select>
            </div>

            {selectedTerm && (
                <section id="gradesheet" style={{ marginTop: "3rem" }}>
                    <div className="text-center mb-4">
                        <h3>Institutional Information System</h3>
                        <p>
                            <strong>Student ID:</strong> {student.id}
                        </p>
                        <p>
                            <strong>Name:</strong> {student.name}
                        </p>
                        <p>
                            <strong>Selected Level-Term:</strong> {selectedTerm}
                        </p>
                    </div>

                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Course ID</th>
                                <th>Course Title</th>
                                <th>Total Credit</th>
                                <th>GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, index) => (
                                <tr key={course.courseId}>
                                    <td>{index + 1}</td>
                                    <td>{course.courseId}</td>
                                    <td>{course.title}</td>
                                    <td>{course.credit}</td>
                                    <td>{course.gpa.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mb-3">
                        <strong>Term GPA:</strong> {termGPA.toFixed(2)}
                    </div>

                    <hr />

                    <div>
                        <strong>Total Credit Hours Completed:</strong> {totalCreditsTillNow.toFixed(1)}
                        <br />
                        <strong>Current Semester:</strong> {semester} <br />
                        <strong>Total CGPA:</strong> {totalCGPA.toFixed(2)}
                    </div>
                </section>
            )}
        </main>
    );
}
