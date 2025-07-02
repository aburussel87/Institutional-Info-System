const jwt = require('jsonwebtoken');
require('dotenv').config();

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
    const time = row.start_time.slice(0, 5); // Example: '09:00'
    const entry = `${row.course_title} - ${time}`;
    if (!routine[row.day_of_week]) {
      routine[row.day_of_week] = [];
    }
    routine[row.day_of_week].push(entry);
  }

  // Fill Free Day or Holiday
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

  // sql is completely fine and functional
  // for now some dumme data are sent
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

module.exports = {
  authenticateToken,
  generateRoutine,
  formatGradeSheet
};

