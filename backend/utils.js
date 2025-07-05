const jwt = require('jsonwebtoken');
require('dotenv').config();


function abbreviateName(fullName) {
  if (!fullName) return '';

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    return parts.map(part => part[0].toUpperCase()).join('');
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}
function generateRoutine(res) {
  let routine = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const row of res.rows) {
    const time = row.start_time.slice(0, 5); 
    const entry = `${row.course_title} - ${time}`;
    if (!routine[row.day_of_week]) {
      routine[row.day_of_week] = [];
    }
    routine[row.day_of_week].push(entry);
  }

  for (const day in routine) {
    if (routine[day].length === 0) {
      if (day === 'Sunday') {
        routine[day] = ['Holiday'];
      } else {
        routine[day] = ['Free Day'];
      }
    }
  }

  return routine;
}


function formatGradeSheet(rows) {
  let result = {
    id: rows[0]?.student_id || null,
    name: "",
    semester: rows[0]?.level_term || "",
    levelTerms: [],
    grades: {}
  };

  for (const row of rows) {
    const levelTerm = mapSemesterCodeToName(row.level_term); 

    if (!result.levelTerms.includes(levelTerm)) {
      result.levelTerms.push(levelTerm);
      result.grades[levelTerm] = [];
    }

    result.grades[levelTerm].push({
      courseId: row.course_id,
      title: row.title,
      credit: parseFloat(row.credit),
      gpa: parseFloat(row.gpa)
    });
  }

  result = {
    id: "2205157",
    name: "Abu Russel",
    current_semester : "Level 2 - Term I",
    levelTerms: ["Level 1 - Term I", "Level 1 - Term II"],
    grades: {
      "Level 1 - Term I": [
        { courseId: "CSE101", title: "Introduction to Computing", credit: 3.0, gpa: 3.75 },
        { courseId: "MAT101", title: "Calculus I", credit: 3.0, gpa: 3.5 },
        { courseId: "PHY101", title: "Physics I", credit: 3.0, gpa: 3.25 },
        { courseId: "CSE102", title: "Structured programming language sessional", credit: 3.0, gpa: 3.75 },
        { courseId: "CSE105", title: "Discrete Mathematcis", credit: 3.0, gpa: 3.5 },
        { courseId: "EEE101", title: "Introduction to EEE", credit: 3.0, gpa: 3.25 }
      ],
      "Level 1 - Term II": [
        { courseId: "CSE102", title: "Data Structures", credit: 3.0, gpa: 3.9 },
        { courseId: "MAT102", title: "Linear Algebra", credit: 3.0, gpa: 3.7 },
        { courseId: "ENG101", title: "English Language", credit: 2.0, gpa: 4.0 },
        { courseId: "CHEM113", title: "Inorganic chemistry", credit: 3.0, gpa: 3.75 }
      ]
    }
  };
  return result;
}


function formatSemesterRoutine(rows) {
  const routine = {};

  rows.forEach(row => {
    const day = row.day_of_week;
    const timeSlot = `${row.start_time} - ${row.end_time}`;
    const abbreviatedTeacher = abbreviateName(row.teacher_name);

    const cell = {
      section_type: row.section_type,
      course_id: row.course_id,
      course_title: row.course_title,
      room_id: row.room_id,
      room_type: row.room_type,
      teacher_name: abbreviatedTeacher,
      academic_session: row.academic_session,
    };

    if (!routine[day]) {
      routine[day] = {};
    }
    if (!routine[day][timeSlot]) {
      routine[day][timeSlot] = [];
    }
    routine[day][timeSlot].push(cell);
  });

  return routine;
}

module.exports = {
  authenticateToken,
  generateRoutine,
  formatGradeSheet,
  formatSemesterRoutine
};

