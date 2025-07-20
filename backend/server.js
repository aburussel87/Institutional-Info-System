require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
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
const registrationRoutes = require('./routes/registrationRoutes');
const resetPassRoutes = require('./routes/resetPassRoutes');
const courseinfoRoutes = require('./routes/getcourseRoutes');
const addExamRoutes = require('./routes/add_examRoutes');
const get_students_by_provostRoutes = require('./routes/getstudentbyProvostRoutes');
const get_student_hall_detailsRoutes = require('./routes/studenthalldetailsRoutes');
const add_notificationRoute = require('./routes/add_notificationRoutes');
const add_courseMaterials = require('./routes/add_CourseMaterialRoutes');


const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));



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
app.use('/api/registration', registrationRoutes);
app.use('/api/password', resetPassRoutes);
app.use('/api/teacherCourses', courseinfoRoutes);
app.use('/api/add_exam', addExamRoutes);
app.use('/api/get_course_info', courseinfoRoutes);//change by provat
app.use('/api/getstudentbyProvost', get_students_by_provostRoutes); // Provost's students route
app.use('/api/getStudenthalldetails', get_student_hall_detailsRoutes); // Provost's student hall details route
app.use('/api/notification',add_notificationRoute);
app.use('/api/courseMaterials',add_courseMaterials);




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
