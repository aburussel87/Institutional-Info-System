CREATE TYPE AdminStatus AS ENUM ('Current', 'Retired');
CREATE TYPE Gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE ExamType AS ENUM ('Term', 'Quiz','CT1','CT2','CT3','CT4');
CREATE TYPE AttendanceStatus AS ENUM ('Present', 'Absent', 'Late', 'Excused');
CREATE TYPE RoomType AS ENUM ('Classroom', 'Laboratory', 'Auditorium', 'Office');
CREATE TYPE FeeStatus AS ENUM ('Paid', 'Unpaid', 'Partial');
CREATE TYPE Semester AS ENUM ('L1T1', 'L1T2', 'L2T1', 'L2T2', 'L3T1', 'L3T2', 'L4T1', 'L4T2');
CREATE TYPE AssignmentType AS ENUM ('Permanent', 'Temporary');
CREATE TYPE UserRole AS ENUM ('Student', 'Teacher', 'Admin');



CREATE TABLE "User" (
  user_id INT PRIMARY KEY,
  username VARCHAR(30) UNIQUE,
  password_hash VARCHAR(60),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(13) UNIQUE,
  dob DATE,
  gender Gender,
  role UserRole,
  date_joined TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  login_attempts INT DEFAULT 0,
  two_fa_enabled BOOLEAN DEFAULT FALSE
);
ALTER TABLE "User" ADD COLUMN photo BYTEA;

CREATE TABLE Admin (
  admin_id INT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  assigned_date TIMESTAMP,
  status AdminStatus,
  CONSTRAINT fk_admin_user FOREIGN KEY(user_id) REFERENCES "User"(user_id)
);

CREATE TABLE AdminRole (
  admin_id INT,
  role_name VARCHAR(20),
  assigned_on DATE,
  PRIMARY KEY(admin_id, role_name),
  FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE Department (
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  student INT
);

CREATE TABLE Teacher (
  teacher_id INT PRIMARY KEY,
  hire_date DATE,
  designation VARCHAR(30),
  department_id INT NOT NULL,
  CONSTRAINT fk_teacher_department FOREIGN KEY (department_id) REFERENCES Department(department_id),
	CONSTRAINT fk_teacher_user FOREIGN KEY (teacher_id) REFERENCES "User"(user_id)
);

CREATE TABLE Advisor (
  teacher_id INT PRIMARY KEY,
  total_student INT,
  CONSTRAINT fk_advisor_teacher FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
);

CREATE TABLE head_of_department (
  teacher_id INT,
  department_id INT,
  assigned_on DATE,
  resigned_on DATE,
  PRIMARY KEY (teacher_id, department_id),
  CONSTRAINT fk_hod_teacher FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id),
  CONSTRAINT fk_hod_department FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Hall (
  hall_id INT PRIMARY KEY,
  name VARCHAR(50),
  capacity INT,
  location VARCHAR(100)
);

CREATE TABLE Student (
  student_id INT PRIMARY KEY,
  department_id INT,
  academic_session VARCHAR(8),
  current_semester Semester,
  hall_id INT,
  advisor_id INT,
  CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES Department(department_id),
  CONSTRAINT fk_student_hall FOREIGN KEY (hall_id) REFERENCES Hall(hall_id),
  CONSTRAINT fk_student_advisor FOREIGN KEY (advisor_id) REFERENCES Advisor(teacher_id),
	CONSTRAINT fk_student_user FOREIGN KEY (student_id) REFERENCES "User"(user_id)
);

CREATE TABLE GradeSheet (
  student_id INT PRIMARY KEY,
  total_credit FLOAT,
  cgpa FLOAT,
  remark TEXT,
  CONSTRAINT fk_gradesheet_student FOREIGN KEY (student_id) REFERENCES Student(student_id)
);

CREATE TABLE Course (
  course_id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(100),
  credit_hours FLOAT,
  semester Semester,
  offered_by INT NOT NULL,
  department_id INT NOT NULL,
  pre_requisite VARCHAR(10),
  still_offered BOOLEAN,
  CONSTRAINT fk_course_offered_by FOREIGN KEY (offered_by) REFERENCES Department(department_id),
  CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Room (
  room_id VARCHAR(10) PRIMARY KEY,
  building_name VARCHAR(50),
  capacity INT,
  room_type RoomType
);

CREATE TABLE Enrollment (
  student_id INT NOT NULL,
  course_id VARCHAR(10) NOT NULL,
  semester Semester,
  enrolled_on DATE,
  approved_by VARCHAR(10),
  section_type VARCHAR(5),
  PRIMARY KEY (student_id, course_id, semester),
  FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

CREATE TABLE Exam (
  exam_id VARCHAR(10) PRIMARY KEY,
  course_id VARCHAR(10) NOT NULL,
  teacher_id INT,
  title VARCHAR(50),
  exam_type ExamType,
  total_marks INT,
  date_of_exam TIMESTAMP,
  semester Semester,
  academic_session VARCHAR(8),
  FOREIGN KEY (course_id) REFERENCES Course(course_id),
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
);

CREATE TABLE ExamResult (
  result_id VARCHAR(10) PRIMARY KEY,
  exam_id VARCHAR(10) NOT NULL,
  student_id INT,
  marks_obtained INT,
  remarks TEXT,
  FOREIGN KEY (exam_id) REFERENCES Exam(exam_id),
  FOREIGN KEY (student_id) REFERENCES Student(student_id)
);

CREATE TABLE CourseResult (
  student_id INT,
  course_id VARCHAR(10),
  semester Semester,
  final_grade VARCHAR(2),
  grade_point FLOAT,
  PRIMARY KEY (student_id, course_id, semester),
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE Attendance (
  student_id INT NOT NULL,
  course_id VARCHAR(10) NOT NULL,
  date TIMESTAMP,
  status AttendanceStatus,
  UNIQUE (student_id, course_id, date),
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE ClassSchedule (
  schedule_id VARCHAR(10) PRIMARY KEY,
  course_id VARCHAR(10) NOT NULL,
  section_type VARCHAR(5),
  room_id VARCHAR(10),
  day_of_week VARCHAR(10),
  start_time TIME,
  end_time TIME,
  semester Semester,
  academic_session VARCHAR(8),
  FOREIGN KEY (course_id) REFERENCES Course(course_id),
  FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

CREATE TABLE SubjectAllocation (
  teacher_id INT NOT NULL,
  course_id VARCHAR(10) NOT NULL,
  section_type VARCHAR(5),
  academic_session VARCHAR(8),
  PRIMARY KEY (teacher_id, course_id, section_type),
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE HallAssignment (
  student_id INT PRIMARY KEY,
  hall_id INT NOT NULL,
  room_number VARCHAR(10),
  assignment_type AssignmentType,
  assigned_on TIMESTAMP,
  vacated_on TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (hall_id) REFERENCES Hall(hall_id)
);

CREATE TABLE Provost (
  teacher_id INT,
  hall_id INT,
  assigned_on DATE,
  resigned_on DATE,
  PRIMARY KEY(teacher_id, hall_id),
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id),
  FOREIGN KEY (hall_id) REFERENCES Hall(hall_id)
);

CREATE TABLE FeeType (
  fee_type_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(30),
  description TEXT
);

CREATE TABLE StudentFee (
  student_fee_id VARCHAR(10) PRIMARY KEY,
  student_id INT NOT NULL,
  fee_type_id VARCHAR(10),
  amount INT,
  due_date TIMESTAMP,
  status FeeStatus,
  paid_on TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (fee_type_id) REFERENCES FeeType(fee_type_id)
);


CREATE TABLE Notification (
  notification_id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  message TEXT,
  created_by VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_id INT,
  teacher_id INT,
  department_id INT,
  course_id VARCHAR(10),
  hall_id INT,
  semester_id Semester,
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id),
  FOREIGN KEY (department_id) REFERENCES Department(department_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id),
  FOREIGN KEY (hall_id) REFERENCES Hall(hall_id),
  CONSTRAINT check_recipient_not_null CHECK (
    student_id IS NOT NULL OR
    teacher_id IS NOT NULL OR
    department_id IS NOT NULL OR
    course_id IS NOT NULL OR
    hall_id IS NOT NULL OR
    semester_id IS NOT NULL
  )
);

CREATE TABLE Feedback (
  feedback_id VARCHAR(10) PRIMARY KEY,
  student_id INT NOT NULL,
  course_id VARCHAR(10) NOT NULL,
  rating float,
  comments TEXT,
  submitted TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE EmergencyContact (
  emergency_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  name VARCHAR(50),
  mobile VARCHAR(15),
  address VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES "User"(user_id)
);

CREATE TABLE Address (
  address_id VARCHAR(10) PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  country VARCHAR(50),
  city VARCHAR(50),
  street VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES "User"(user_id)
);

CREATE TABLE CourseMaterial (
  material_id SERIAL PRIMARY KEY,
  course_id VARCHAR(10),
  uploaded_by INT,
  file_path TEXT,
  description TEXT,
  upload_date TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES Course(course_id),
  FOREIGN KEY (uploaded_by) REFERENCES Teacher(teacher_id)
);

CREATE TABLE AssignmentSubmission (
  submission_id SERIAL PRIMARY KEY,
  student_id INT,
  course_id VARCHAR(10),
  title VARCHAR(100),
  file_path TEXT,
  submitted_on TIMESTAMP,
  marks INT,
  feedback TEXT,
  FOREIGN KEY (student_id) REFERENCES Student(student_id),
  FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE UserSession (
  session_id SERIAL PRIMARY KEY,
  user_id INT,
  login_time TIMESTAMP,
  logout_time TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES "User"(user_id)
);

CREATE TABLE AuditLog (
  log_id SERIAL PRIMARY KEY,
  user_id INT,
  action TEXT,
  entity TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES "User"(user_id)
);

