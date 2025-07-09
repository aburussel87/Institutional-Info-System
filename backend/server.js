require('dotenv').config();
const express = require('express');
const cors = require('cors');


const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const gradeSheetRoutes = require('./routes/gradeSheetRoutes');
const UserInfoRoutes = require('./routes/alluserRoutes');
const UserRoutes = require('./routes/userRoutes');
const userPhotoRoutes = require('./routes/imageRoutes');
const courseInfoRoutes = require('./routes/courseInfoRoutes');
const studentInfoRoutes = require('./routes/studentRoutes');
const SemesterRoutineRoutes = require('./routes/semesterRoutineRoutes');
const EnrolledCourseOutlineRoutes = require('./routes/enrolledCourseOutlineRoutes');
const StudentFeeRoutes = require('./routes/studentFeeRoutes');
const exam_scheduleRoutes = require('./routes/exam_scheduleRoutes');
const teacherInfoRoutes = require('./routes/teacherInfoRoutes');


const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/dashboard',dashboardRoutes);
app.use('/api/notify',notificationRoutes);
app.use('/api/gradesheet',gradeSheetRoutes);
app.use('/api/allUser',UserInfoRoutes);
app.use('/api/user',UserRoutes);
app.use('/api/user', userPhotoRoutes);
app.use('/api/course-details',courseInfoRoutes);
app.use('/api/student-profile',studentInfoRoutes);
app.use('/api/semesterRoutine',SemesterRoutineRoutes);
app.use('/api/courseOutline', EnrolledCourseOutlineRoutes);
app.use('/api/studentFee', StudentFeeRoutes);
app.use('/api/exam_schedule', exam_scheduleRoutes);
app.use('/api/teacher-profile', teacherInfoRoutes);



const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`\n Server running at:`);
  console.log(`   → Local:   http://localhost:${PORT}`);
  console.log(`   → Network: http://${ip}:${PORT}\n`);
});
