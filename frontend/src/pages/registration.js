import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../pages/header";
import API_BASE_URL from "../config/config";
import '../styles/registration.css';

export default function CourseRegistration() {
    const navigate = useNavigate();
    const [outlines, setOutlines] = useState([]);
    const [msg, setMsg] = useState("");
    const [info, setInfo] = useState(null);
    const [semester, setSemester] = useState("Loading...");
    const [selectedCourses, setSelectedCourses] = useState({});
    const [approvedBy, setApprovedBy] = useState({});
    const [pendingCourses, setPendingCourses] = useState([]);
    const [approvedCourses, setApprovedCourses] = useState([]);

    useEffect(() => {
        let token = localStorage.getItem("token");
        if (!token) {
            setMsg("You are not logged in!");
            setInfo(null);
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setSemester(decoded.semester || "Unknown Semester");
        } catch (e) {
            setMsg("Invalid token. Please log in again.");
            setInfo(null);
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        const fetchOutlines = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/registration`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const error = await response.json();
                    setMsg("Failed to load courses: " + (error.error || "Unknown error"));
                    setInfo(null);
                    setTimeout(() => navigate("/login"), 1000);
                    return;
                }

                const data = await response.json();
                if (!data.success) {
                    //setMsg(data.msg || "Failed to load courses");
                    setInfo(data.msg);
                    return;
                }

                setOutlines(data.courses || []);
                setPendingCourses(data.pending || []);
                setApprovedCourses(data.approved || []);

                const approvedMap = {};
                (data.approved || []).forEach(c => {
                    approvedMap[c.course_id] = c.approved_by;
                });
                setApprovedBy(approvedMap);

                if ((data.courses && data.courses.length === 0) && (data.pending && data.pending.length === 0) && (data.approved && data.approved.length === 0)) {
                    setInfo("No courses available for registration at this time.");
                    setMsg("");
                } else if (data.pending && data.pending.length > 0) {
                    setInfo("You have the following courses pending approval.");
                    setMsg("");
                } else {
                    setInfo(null);
                    setMsg("");
                }

            } catch (err) {
                setMsg(err.message || "Unknown error");
                setInfo(null);
                setTimeout(() => navigate("/login"), 1000);
            }
        };

        fetchOutlines();
    }, [navigate]);

    const handleSelectCourse = (courseId, isChecked) => {
        setSelectedCourses(prev => ({
            ...prev,
            [courseId]: isChecked,
        }));
    };

    const handleApprovedByChange = (courseId, value) => {
        setApprovedBy(prev => ({
            ...prev,
            [courseId]: value,
        }));
    };

    const handleSubmitRegistration = async () => {
        setMsg("Submitting registration...");
        setInfo(null); // Clear info message when submitting
        let token = localStorage.getItem("token");
        if (!token) {
            setMsg("Authentication error. Please log in again.");
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        const registrationData = outlines.filter(c => selectedCourses[c.c_id])
            .map(c => ({
                course_id: c.c_id,
                approved_by: approvedBy[c.c_id] || "",
                title: c.c_title,
            }));

        if (registrationData.length === 0) {
            setMsg("Please select at least one course to submit.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/registration/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courses: registrationData }),
            });

            if (!response.ok) {
                const error = await response.json();
                setMsg("Submission failed: " + (error.error || "Unknown error"));
                return;
            }

            const result = await response.json();
            setMsg(result.message || "Registration submitted successfully!");
            setSelectedCourses({});
            setApprovedBy({});
            const fetchUpdatedOutlines = async () => {
                try {
                    const updatedResponse = await fetch(`${API_BASE_URL}/registration`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const updatedData = await updatedResponse.json();
                    if (updatedData.success) {
                        setOutlines(updatedData.courses || []);
                        setPendingCourses(updatedData.pending || []);
                        setApprovedCourses(updatedData.approved || []);
                        const updatedApprovedMap = {};
                        (updatedData.approved || []).forEach(c => {
                            updatedApprovedMap[c.course_id] = c.approved_by;
                        });
                        setApprovedBy(updatedApprovedMap);
                        if (updatedData.pending && updatedData.pending.length > 0) {
                            setInfo("You have the following courses pending approval.");
                        } else {
                            setInfo(null);
                        }
                    } else {
                        setInfo(updatedData.msg || "Failed to refresh course list after submission.");
                    }
                } catch (err) {
                    setInfo("Failed to refresh course list after submission: " + err.message);
                }
            };
            fetchUpdatedOutlines();

        } catch (err) {
            setMsg("Network error during submission: " + (err.message || "Unknown error"));
        }
    };

    const isPending = (courseId) => {
        return pendingCourses.some(c => c.course_id === courseId);
    };

    const isApproved = (courseId) => {
        return approvedCourses.some(c => c.course_id === courseId);
    };

    // if (!outlines.length && !msg.includes("Loading") && !info) {
    //     return (
    //         <main className="course-reg-container">
    //             <Header />
    //         </main>
    //     );
    // }

    return (
        <main className="course-reg-container">
            <Header />

            <div className="course-reg-header-section">
                <h3 className="course-reg-main-title">Institutional Information System</h3>
                <h4 className="course-reg-sub-title">Course Registration - {semester}</h4>
            </div>

            {info && (
                <div className="course-reg-info-box">
                    <p className="course-reg-info-text">{info}</p>
                </div>
            )}

            {msg && (
                <div className="course-reg-message-box">
                    {msg}
                </div>
            )}

            <div className="course-reg-table-wrapper">
                <table className="course-reg-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Course ID</th>
                            <th>Course Title</th>
                            <th>Credit Hours</th>
                            <th>Prerequisite</th>
                            <th>Offered By</th>
                            <th>Status</th>
                            <th>Approved By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {outlines.map((course, index) => {
                            const pending = isPending(course.c_id);
                            const approved = isApproved(course.c_id);

                            return (
                                <tr key={course.c_id}>
                                    <td>{index + 1}</td>
                                    <td>{course.c_id}</td>
                                    <td>{course.c_title}</td>
                                    <td>{course.credit}</td>
                                    <td>{course.c_did ? course.c_did : "N/A"}</td>
                                    <td>{course.c_by}</td>
                                    <td>
                                        {pending ? (
                                            <span className="course-reg-status-pending">Pending</span>
                                        ) : approved ? (
                                            <span className="course-reg-status-approved">Approved</span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                className="course-reg-checkbox"
                                                checked={!!selectedCourses[course.c_id]}
                                                onChange={(e) => handleSelectCourse(course.c_id, e.target.checked)}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="course-reg-input-approved-by"
                                            value={approvedBy[course.c_id] || ""}
                                            onChange={(e) => handleApprovedByChange(course.c_id, e.target.value)}
                                            placeholder="Approver's Name/ID"
                                            disabled={pending || approved}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="course-reg-actions">
                <button className="course-reg-action-button course-reg-submit-button" onClick={handleSubmitRegistration}>
                    Submit Registration
                </button>
            </div>
        </main>
    );
}
