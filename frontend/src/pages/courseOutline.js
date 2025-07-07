import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/header";
import API_BASE_URL from "../config/config";
import "../styles/courseOutline.css";
import jsPDF from 'jspdf';
import { jwtDecode } from "jwt-decode";


export default function CourseOutline() {
    const navigate = useNavigate();
    const [outlines, setOutlines] = useState([]);
    const [msg, setMsg] = useState("");
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [semester, setSemester] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in!");
            setTimeout(() => navigate("/login"), 1000);
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setSemester(decoded.semester || "Unknown Semester");
            console.log(semester);
        } catch (e) {
            console.warn("Failed to decode token for semester");
        }
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/courseOutline`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert("Failed to load outlines: " + (error.error || "Unknown error"));
                    setTimeout(() => navigate("/login"), 1000);
                    return;
                }

                const data = await response.json();
                setOutlines(data.result || []);
            } catch (err) {
                setMsg(err.message || "Unknown error");
                setTimeout(() => navigate("/login"), 1000);
            }
        })();
    }, [navigate, semester]);

    const handleToggleExpand = (courseId) => {
        setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
    };

    const handleExpandAll = () => {
        if (outlines.length > 0) {
            setExpandedCourseId("all");
        }
    };

    const handleContractAll = () => {
        setExpandedCourseId(null);
    };

    const handleDownloadPdf = () => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yOffset = 18; // slightly less top margin
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;

        pdf.setFontSize(16); 
        pdf.setTextColor(44, 62, 80);

        pdf.setFont(undefined, 'bold');
        pdf.text('Institutional Information System', pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 8; 

        pdf.text('Course Outline', pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 8; 

        pdf.text(`Semester: ${semester || "Unknown"}`, pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 6; 

        pdf.setFont(undefined, 'normal');
        yOffset += 5;

        const colWidths = [15, 30, 50, contentWidth - 15 - 30 - 50];
        const rowHeight = 10;

        pdf.setFontSize(8);
        pdf.setTextColor(52, 73, 94);
        pdf.setDrawColor(200);

        let currentX = margin;
        const headerRowHeight = rowHeight;
        const headerTexts = ['No.', 'Course ID', 'Course Title', 'Outline'];
        const headerTextYOffset = headerRowHeight / 2 + 2.5; // slightly less vertical center

        headerTexts.forEach((header, i) => {
            pdf.rect(currentX, yOffset, colWidths[i], headerRowHeight, 'D');
            pdf.text(header, currentX + colWidths[i] / 2, yOffset + headerTextYOffset, { align: 'center' });
            currentX += colWidths[i];
        });

        yOffset += headerRowHeight;

        outlines.forEach((course, index) => {
            const courseNo = (index + 1).toString();
            const courseId = course.course_id;
            const courseTitle = course.title;
            const outlineText = course.outline;

            const splitOutline = pdf.splitTextToSize(outlineText, colWidths[3] - 2);
            const outlineLinesHeight = splitOutline.length * 4;

            const maxContentHeight = Math.max(
                pdf.splitTextToSize(courseNo, colWidths[0] - 2).length * 4,
                pdf.splitTextToSize(courseId, colWidths[1] - 2).length * 4,
                pdf.splitTextToSize(courseTitle, colWidths[2] - 2).length * 4,
                outlineLinesHeight
            );
            const currentRowHeight = Math.max(rowHeight, maxContentHeight + 4);

            if (yOffset + currentRowHeight > pageHeight - margin) {
                pdf.addPage();
                yOffset = 18;

                currentX = margin;
                headerTexts.forEach((header, i) => {
                    pdf.rect(currentX, yOffset, colWidths[i], headerRowHeight, 'D');
                    pdf.text(header, currentX + colWidths[i] / 2, yOffset + headerTextYOffset, { align: 'center' });
                    currentX += colWidths[i];
                });
                yOffset += headerRowHeight;

                pdf.setFontSize(8);
                pdf.setTextColor(52, 73, 94);
            }

            currentX = margin;
            const cellTextYOffset = currentRowHeight / 2 + 2;

            pdf.rect(currentX, yOffset, colWidths[0], currentRowHeight, 'D');
            pdf.text(courseNo, currentX + colWidths[0] / 2, yOffset + cellTextYOffset, { align: 'center' });
            currentX += colWidths[0];

            pdf.rect(currentX, yOffset, colWidths[1], currentRowHeight, 'D');
            const splitCourseId = pdf.splitTextToSize(courseId, colWidths[1] - 2);
            pdf.text(splitCourseId, currentX + colWidths[1] / 2, yOffset + cellTextYOffset - (splitCourseId.length - 1) * 2, { align: 'center' });
            currentX += colWidths[1];

            pdf.rect(currentX, yOffset, colWidths[2], currentRowHeight, 'D');
            const splitCourseTitle = pdf.splitTextToSize(courseTitle, colWidths[2] - 2);
            pdf.text(splitCourseTitle, currentX + colWidths[2] / 2, yOffset + cellTextYOffset - (splitCourseTitle.length - 1) * 2, { align: 'center' });
            currentX += colWidths[2];

            pdf.rect(currentX, yOffset, colWidths[3], currentRowHeight, 'D');
            pdf.text(splitOutline, currentX + 2, yOffset + 4);
            currentX += colWidths[3];

            yOffset += currentRowHeight;
        });

        pdf.save(`Course_Outlines_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Failed to generate PDF.");
    }
};


    if (!outlines.length) {
        return (
            <main className="course-outlines-container">
                <Header />
                <p className="course-outlines-loading">Loading course outlines...</p>
            </main>
        );
    }

    return (
        <main className="course-outlines-container">
            <Header />
            {msg && <p className="course-outlines-error">{msg}</p>}

            <div className="course-outlines-header">
                <h3>Institutional Information System</h3>
                <h4>Course Outline - {semester || "Loading..."}</h4>

            </div>

            <div className="course-actions">
                <button className="action-button download-pdf-button" onClick={handleDownloadPdf}>
                    Download All Outlines (PDF)
                </button>
                <button className="action-button expand-all-button" onClick={handleExpandAll}>
                    Expand All
                </button>
                <button className="action-button contract-all-button" onClick={handleContractAll}>
                    Contract All
                </button>
            </div>

            <div className="course-cards-wrapper">
                {outlines.map((course, index) => (
                    <div
                        key={course.course_id}
                        className={`course-outlines-card ${expandedCourseId === course.course_id || expandedCourseId === "all" ? 'expanded' : ''}`}
                    >
                        <div
                            className="course-outlines-card-header"
                            onClick={() => handleToggleExpand(course.course_id)}
                        >
                            <strong>
                                {index + 1}. {course.title} ({course.course_id})
                            </strong>
                            <span className="expand-icon">
                                {expandedCourseId === course.course_id || expandedCourseId === "all" ? '−' : '+'}
                            </span>
                        </div>
                        {(expandedCourseId === course.course_id || expandedCourseId === "all") && (
                            <div className="course-outlines-card-body">
                                <pre className="course-outlines-outline">
                                    {course.outline}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
