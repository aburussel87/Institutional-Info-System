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

function format_exam_routine(res) {
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




function mapSemesterCodeToName(code) {
  const map = {
    L1T1: "Level 1 - Term I",
    L1T2: "Level 1 - Term II",
    L2T1: "Level 2 - Term I",
    L2T2: "Level 2 - Term II",
    L3T1: "Level 3 - Term I",
    L3T2: "Level 3 - Term II",
    L4T1: "Level 4 - Term I",
    L4T2: "Level 4 - Term II"
  };
  return map[code] || code;
}

function formatGradeSheet(rows) {
  if (!rows || rows.length === 0) {
    return {};
  }

  const result = {
    id: rows[0].student_id,
    name: rows[0].name,
    current_semester: mapSemesterCodeToName(rows[0].lt),
    levelTerms: [],
    grades: {}
  };

  const seenTerms = new Set();

  for (const row of rows) {
    const levelTerm = mapSemesterCodeToName(row.level_term);

    if (!seenTerms.has(levelTerm)) {
      result.levelTerms.push(levelTerm);
      result.grades[levelTerm] = [];
      seenTerms.add(levelTerm);
    }

    result.grades[levelTerm].push({
      courseId: row.course_id,
      title: row.title,
      credit: parseFloat(row.credit),
      gpa: parseFloat(row.gpa)
    });
  }

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

function formatFee(fees) {
  const result = {
    paid: {},
    unpaid: {}
  };

  for (const fee of fees) {
    const section = fee.status === 'Paid' ? 'paid' : 'unpaid';
    const type = fee.fee_type_name;

    if (!result[section][type]) {
      result[section][type] = [];
    }

    result[section][type].push(fee);
  }

  return result;
}



function parseDateString(dateStr) {
  if (!dateStr) return null;

  if (dateStr instanceof Date) {
    return dateStr;
  }

  if (typeof dateStr !== 'string') {
    throw new TypeError(`Invalid dateStr: expected string or Date, got ${typeof dateStr}`);
  }

  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart || !timePart) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
}


function formatExamData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows.map(row => {
    const {
      student_id,
      exam_id,
      course_id,
      course_title,
      exam_title,
      exam_type,
      total_marks,
      date_of_exam,
      semester,
      academic_session
    } = row;

    return {
      student_id,
      exam_id,
      course_id,
      title: course_title,
      exam_title,
      exam_type,
      total_marks: Number(total_marks),
      date_of_exam: parseDateString(date_of_exam),
      semester,
      academic_session
    };
  });
}



module.exports = {
  authenticateToken,
  generateRoutine,
  formatGradeSheet,
  formatSemesterRoutine,
  formatFee,
  formatExamData
};

