import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas, Button, Badge, Form } from 'react-bootstrap';
import '../styles/header.css';
import API_BASE_URL from '../config/config'


const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
          setNotifications(data.notifications || []);
        } else {
          console.error('Failed to fetch notifications:', data.error);
        }
      })
      .catch(err => console.error('Notification fetch error:', err));
  }, []);

  return (
    <header className="main-header d-flex align-items-center justify-content-between px-3 py-2">
    
      <Button className="border-0 bg-transparent me-2 hamburger-btn" onClick={toggleSidebar}>
        ☰
      </Button>

      
      <Offcanvas show={showSidebar} onHide={toggleSidebar} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <a className="btn btn-outline-primary w-100 mb-2" href="/dashboard">Dashboard</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/gradesheet">Gradesheet</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/userInfo">User Info</a>
          <a className="btn btn-outline-primary w-100 mb-2" href="/chat">Edu Bot</a>
          <a className="btn btn-outline-danger w-100" href="/login">Logout</a>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Logo */}
      <div className="header-logo me-3">
        <img src="/images/logo.png" alt="Institution Logo" />
      </div>

      {/* Institution Info */}
      <div className="header-info flex-grow-1 text-center text-md-start">
        <div className="institution-name fw-bold">Institutional Information System</div>
        <div className="institution-location small">Dublagari, Sherpur, Bogura, Bangladesh</div>
      </div>

      {/* Notification + Search */}
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Notification Bell */}
        <div className="position-relative" id="notificationContainer">
          <i
            ref={bellRef}
            className="fas fa-bell fs-4"
            id="notificationBell"
            style={{ cursor: 'pointer' }}
            onClick={toggleNotifications}
          ></i>
          <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
            {notifications.length}
          </Badge>

          {/* Notification Popup */}
          {showNotifications && (
            <div
              ref={popupRef}
              id="notificationPopup"
              className="position-absolute bg-white shadow rounded p-2"
              style={{ top: '30px', right: 0, width: '300px', maxHeight: '200px', overflowY: 'auto', zIndex: 1050, color: 'black' }}
            >
              <div className="fw-bold mb-2">Notifications</div>
              <div id="notificationList">
                {notifications.length > 0 ? (
                  notifications.map((msg, idx) => (
                    <div key={idx} className="small mb-1 border-bottom pb-1">{msg}</div>
                  ))
                ) : (
                  <div className="small text-muted">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="header-search d-none d-md-block">
          <Form.Control type="text" placeholder="Search..." />
        </div>
      </div>
    </header>
  );
};

export default Header;
