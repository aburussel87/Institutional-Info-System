import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas, Button, Badge, Form, Modal } from 'react-bootstrap';
import '../styles/header.css';
import API_BASE_URL from '../config/config';

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const bellRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/notify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sortedNotifications = (data.notifications || []).sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          );
          setNotifications(sortedNotifications);
        } else {
          console.error('Failed to fetch notifications:', data.error);
        }
      })
      .catch(err => console.error('Notification fetch error:', err));
  }, []);

  const getGroupedNotifications = (notifsToGroup) => {
    const grouped = {};
    notifsToGroup.forEach(notif => {
      const date = new Date(notif.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notif);
    });
    return grouped;
  };

  const getNotificationCategory = (notif) => {
    if (notif.student_id || notif.teacher_id) return `For You`;
    if (notif.department_id) return `Department`;
    if (notif.course_id) return `${notif.course_id}`;
    if (notif.hall_id) return `Hall ${notif.hall_id}`;
    if (notif.semester_id) return `Semester ${notif.semester_id}`;
    return 'System';
  };


  const handleDownloadPdf = (pdfData, filename = "notification.pdf") => {
    if (!pdfData || !pdfData.data) {
      alert("No PDF data available.");
      return;
    }

    try {
      const byteArray = new Uint8Array(pdfData.data);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to process PDF:", err);
      alert("Failed to download PDF: Invalid data.");
    }
  };
  const handleNotificationItemClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailPopup(true);
    setShowNotifications(false);
  };

  const handleCloseDetailPopup = () => {
    setShowDetailPopup(false);
    setSelectedNotification(null);
  };

  const handleResetPassword = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please login first.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/password/reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Password reset email sent! Please check your email.');
        localStorage.setItem('resetToken', data.token);
        window.location.href = '/login';
      } else {
        alert(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      alert('Network error. Please try again.');
    }
  };

  const notificationsToDisplay = showAllNotifications ? notifications : notifications.slice(0, 10);
  const groupedNotifications = getGroupedNotifications(notificationsToDisplay);

  return (
    <header className="app-header d-flex align-items-center justify-content-between px-3 py-2">
      <Button className="app-hamburger-btn border-0 bg-transparent me-2" onClick={toggleSidebar}>
        ☰
      </Button>

      <Offcanvas show={showSidebar} onHide={toggleSidebar} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <a className="btn btn-outline-primary w-100 mb-2" href="/dashboard">Dashboard</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/student">Personal Information</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/studentRoutine">My routine</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/courseOutline">Course Outlines</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/registration">Registration</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/gradesheet">Gradesheet</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/studentFee">Student Fee</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/exam_schedule">Exam Details</a>
          <Button
            className="btn btn-outline-primary w-100 mb-2"
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>

          <a className="btn btn-outline-danger w-100 mb-2" href="/login">Logout</a>
        </Offcanvas.Body>
      </Offcanvas>

      <div className="app-header-logo me-3">
        <img src="/images/logo.png" alt="Institution Logo" />
      </div>

      <div className="app-header-info flex-grow-1 text-center text-md-start">
        <div className="app-institution-name fw-bold">Institutional Information System</div>
        <div className="app-institution-location small">Dublagari, Sherpur, Bogura, Bangladesh</div>
      </div>

      <div className="d-flex align-items-center gap-3 position-relative">
        <div className="position-relative" id="appNotificationContainer">
          <i
            ref={bellRef}
            className="fas fa-bell fs-4 app-notification-bell"
            onClick={toggleNotifications}
          ></i>
          <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
            {notifications.length}
          </Badge>

          {showNotifications && (
            <div
              ref={popupRef}
              id="appNotificationPopup"
              className="position-absolute bg-white shadow rounded p-3 border"
            >
              <div className="fw-bold mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                <span>Notifications</span>
                {notifications.length > 10 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                    className="p-0 text-decoration-none"
                  >
                    {showAllNotifications ? 'Hide' : 'See All'}
                  </Button>
                )}
              </div>
              <div id="appNotificationList">
                {Object.keys(groupedNotifications).length > 0 ? (
                  Object.keys(groupedNotifications).map(date => (
                    <div key={date} className="mb-3">
                      <h6 className="app-notification-date-heading">{date}</h6>
                      {groupedNotifications[date].map((notif, idx) => (
                        <div
                          key={notif.notification_id || idx}
                          className="p-2 mb-2 bg-light rounded shadow-sm app-notification-item"
                          onClick={() => handleNotificationItemClick(notif)}
                        >
                          <span className="app-notification-category">{getNotificationCategory(notif)}</span>
                          <span className="app-notification-separator">: </span>
                          <span className="app-notification-title">{notif.title}</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="small text-muted p-2">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="app-header-search d-none d-md-block">
          <Form.Control type="text" placeholder="Search..." />
        </div>
      </div>

      {selectedNotification && (
        <Modal show={showDetailPopup} onHide={handleCloseDetailPopup} centered size="lg">
          <Modal.Header closeButton className="app-notification-detail-header">
            <Modal.Title className="app-notification-detail-title">
              <span className="app-notification-category-detail">{getNotificationCategory(selectedNotification)}</span>
              <span className="app-notification-separator-detail">: </span>
              {selectedNotification.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="app-notification-detail-body">
            <p className="app-notification-detail-message">{selectedNotification.message}</p>
            {selectedNotification.student_id && (
              <p><strong>Student ID:</strong> {selectedNotification.student_id}</p>
            )}
            {selectedNotification.teacher_id && (
              <p><strong>Teacher ID:</strong> {selectedNotification.teacher_id}</p>
            )}
            {selectedNotification.department_id && (
              <p><strong>Department ID:</strong> {selectedNotification.department_id}</p>
            )}
            {selectedNotification.course_id && (
              <p><strong>Course ID:</strong> {selectedNotification.course_id}</p>
            )}
            {selectedNotification.hall_id && (
              <p><strong>Hall ID:</strong> {selectedNotification.hall_id}</p>
            )}
            {selectedNotification.semester_id && (
              <p><strong>Semester ID:</strong> {selectedNotification.semester_id}</p>
            )}

            <p><strong>Created By:</strong> {selectedNotification.created_by}</p>
            <p><strong>Created At:</strong> {new Date(selectedNotification.created_at).toLocaleString()}</p>

            {selectedNotification.pdf && (
              <p>
                <strong>PDF:</strong>{' '}
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => handleDownloadPdf(selectedNotification.pdf)}
                >
                  Download PDF
                </Button>
              </p>
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailPopup}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </header>
  );
};

export default Header;