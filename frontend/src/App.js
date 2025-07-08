import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Gradesheet  from './pages/gradesheet';
import UserInfo from './pages/userInfo';
import UserDetails from './pages/user';
import StudentInfo from './pages/student';
import StudentRoutine from './pages/studentRoutine';
import CourseOutline from './pages/courseOutline';
import StudentFee from './pages/studentFee';
import ExamSchedule from './pages/exam_schedule'; 
import TeacherDashboard from './pages/teacher_dash';



import 'bootstrap/dist/css/bootstrap.min.css';


const isAuthenticated = () => !!localStorage.getItem('token');


function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/gradesheet" element={<Gradesheet />} />
        <Route path="/userInfo" element={<UserInfo/>}/>
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/user/:userId" element={<UserDetails />} />
        <Route path='/student' element = {<StudentInfo/>} />
        <Route path='/studentRoutine' element = {<StudentRoutine/>} />
        <Route path='/courseOutline' element = {<CourseOutline/>} />
        <Route path='/studentFee' element = {<StudentFee/>} />
        <Route path='/exam_schedule' element = {<ExamSchedule/>} />
        <Route path='/teacher_dash' element = {<TeacherDashboard/>} />
      </Routes>
    </Router>
  );
}


