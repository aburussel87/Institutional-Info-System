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
