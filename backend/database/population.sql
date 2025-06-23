-- insert departments
INSERT INTO Department (name, student) VALUES
  ('CSE', 0),
  ('EEE', 0),
  ('BME', 0),
  ('NCE', 0),
  ('Math', 0),
  ('Physics', 0),
  ('Chemical', 0),
  ('Chemistry', 0),
  ('MME', 0),
  ('Civil', 0),
  ('Mechanical', 0),
  ('Architecture', 0);
	SELECT * FROM department
-- insert halls
INSERT INTO Hall (hall_id, name, capacity, location) VALUES
  (1, 'Suhrawardy Hall', 500, 'Palashi, Dhaka'),
  (2, 'Sher-e-Bangla Hall', 500, 'Palashi, Dhaka'),
  (3, 'Dr. MA Rashid Hall', 500, 'Palashi, Dhaka'),
  (4, 'Ahsanullah Hall', 500, 'Palashi, Dhaka'),
  (5, 'Shadhinata Hall', 500, 'Palashi, Dhaka'),
  (6, 'Titumir Hall', 500, 'Palashi, Dhaka');
	SELECT * FROM hall;
	UPDATE Hall
	SET capacity = 500;

-- insert classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
-- ECE Building Classrooms
('ECE101', 'ECE Building', 50, 'Classroom'),
('ECE102', 'ECE Building', 45, 'Classroom'),
('ECE103', 'ECE Building', 55, 'Classroom'),
('ECE104', 'ECE Building', 60, 'Classroom'),
('ECE105', 'ECE Building', 42, 'Classroom');

-- ME Building Classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('ME101', 'Mechanical Building', 50, 'Classroom'),
('ME102', 'Mechanical Building', 48, 'Classroom'),
('ME103', 'Mechanical Building', 53, 'Classroom'),
('ME104', 'Mechanical Building', 60, 'Classroom'),
('ME105', 'Mechanical Building', 41, 'Classroom');

-- OAB Classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('OAB101', 'Old Academic Building', 46, 'Classroom'),
('OAB102', 'Old Academic Building', 52, 'Classroom'),
('OAB103', 'Old Academic Building', 43, 'Classroom'),
('OAB104', 'Old Academic Building', 59, 'Classroom'),
('OAB105', 'Old Academic Building', 44, 'Classroom');

-- Civil Engineering Classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('CE101', 'Civil Building', 57, 'Classroom'),
('CE102', 'Civil Building', 54, 'Classroom'),
('CE103', 'Civil Building', 49, 'Classroom'),
('CE104', 'Civil Building', 60, 'Classroom'),
('CE105', 'Civil Building', 50, 'Classroom');

-- Chemical Engineering Classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('CHE101', 'Chemical Building', 55, 'Classroom'),
('CHE102', 'Chemical Building', 50, 'Classroom'),
('CHE103', 'Chemical Building', 58, 'Classroom'),
('CHE104', 'Chemical Building', 46, 'Classroom'),
('CHE105', 'Chemical Building', 60, 'Classroom');

-- Architecture Classrooms
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('ARCHI101', 'Architecture Building', 47, 'Classroom'),
('ARCHI102', 'Architecture Building', 56, 'Classroom'),
('ARCHI103', 'Architecture Building', 59, 'Classroom'),
('ARCHI104', 'Architecture Building', 52, 'Classroom'),
('ARCHI105', 'Architecture Building', 50, 'Classroom');

-- Labs
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('ECE-LAB1', 'ECE Building', 40, 'Laboratory'),
('ECE-LAB2', 'ECE Building', 42, 'Laboratory'),
('DSA-LAB', 'Old Academic Building', 45, 'Laboratory'),
('EM-LAB', 'ECE Building', 44, 'Laboratory'),
('MECH-LAB1', 'Mechanical Building', 48, 'Laboratory');
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('CIVIL-LAB1', 'Civil Building', 50, 'Laboratory'),
('CHEM-LAB', 'Chemical Building', 46, 'Laboratory'),
('ARCHI-LAB', 'Architecture Building', 41, 'Laboratory'),
('DSA2-LAB', 'ECE Building', 49, 'Laboratory'),
('MATH-LAB', 'Old Academic Building', 40, 'Laboratory');

-- Auditoriums
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('AUD1', 'ECE Building', 200, 'Auditorium'),
('AUD2', 'Mechanical Building', 250, 'Auditorium'),
('AUD3', 'Old Academic Building', 300, 'Auditorium');

-- Office Rooms (RoomType = 'Office')
INSERT INTO Room (room_id, building_name, capacity, room_type) VALUES
('ECE-OFF1', 'ECE Building', 4, 'Office'),
('ECE-OFF2', 'ECE Building', 3, 'Office'),
('ME-OFF1', 'Mechanical Building', 4, 'Office'),
('ME-OFF2', 'Mechanical Building', 5, 'Office'),
('OAB-OFF1', 'Old Academic Building', 4, 'Office'),
('CIVIL-OFF1', 'Civil Building', 3, 'Office'),
('CHE-OFF1', 'Chemical Building', 4, 'Office'),
('ARCHI-OFF1', 'Architecture Building', 3, 'Office'),
('ADMIN-OFF1', 'Administrative Building', 6, 'Office'),
('ADMIN-OFF2', 'Administrative Building', 5, 'Office');

SELECT * FROM room


-- insert course
-- Auto-generated courses insert statements --

INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1101', 'Introduction to Programming', 4, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1102', 'Programming Lab', 1.5, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1103', 'Discrete Mathematics', 3, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1104', 'Discrete Math Lab', 1.5, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1105', 'Data Structures', 4, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1106', 'Data Structures Lab', 1.5, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1107', 'Algorithms', 4, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1108', 'Algorithms Lab', 1.5, 'L1T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1109', 'Introduction to Programming', 4, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1100', 'Programming Lab', 1.5, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1111', 'Discrete Mathematics', 3, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1112', 'Discrete Math Lab', 1.5, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1113', 'Data Structures', 4, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1114', 'Data Structures Lab', 1.5, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1115', 'Algorithms', 4, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE1116', 'Algorithms Lab', 1.5, 'L1T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2117', 'Introduction to Programming', 4, 'L2T1', 1, 1, 'CSE1117', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2118', 'Programming Lab', 1.5, 'L2T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2119', 'Discrete Mathematics', 3, 'L2T1', 1, 1, 'CSE1119', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2110', 'Discrete Math Lab', 1.5, 'L2T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2121', 'Data Structures', 4, 'L2T1', 1, 1, 'CSE1121', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2122', 'Data Structures Lab', 1.5, 'L2T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2123', 'Algorithms', 4, 'L2T1', 1, 1, 'CSE1123', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2124', 'Algorithms Lab', 1.5, 'L2T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2125', 'Introduction to Programming', 4, 'L2T2', 1, 1, 'CSE1225', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2126', 'Programming Lab', 1.5, 'L2T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2127', 'Discrete Mathematics', 3, 'L2T2', 1, 1, 'CSE1227', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2128', 'Discrete Math Lab', 1.5, 'L2T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2129', 'Data Structures', 4, 'L2T2', 1, 1, 'CSE1229', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2120', 'Data Structures Lab', 1.5, 'L2T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2131', 'Algorithms', 4, 'L2T2', 1, 1, 'CSE1231', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE2132', 'Algorithms Lab', 1.5, 'L2T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3133', 'Introduction to Programming', 4, 'L3T1', 1, 1, 'CSE2133', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3134', 'Programming Lab', 1.5, 'L3T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3135', 'Discrete Mathematics', 3, 'L3T1', 1, 1, 'CSE2135', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3136', 'Discrete Math Lab', 1.5, 'L3T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3137', 'Data Structures', 4, 'L3T1', 1, 1, 'CSE2137', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3138', 'Data Structures Lab', 1.5, 'L3T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3139', 'Algorithms', 4, 'L3T1', 1, 1, 'CSE2139', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3130', 'Algorithms Lab', 1.5, 'L3T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3141', 'Introduction to Programming', 4, 'L3T2', 1, 1, 'CSE2241', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3142', 'Programming Lab', 1.5, 'L3T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3143', 'Discrete Mathematics', 3, 'L3T2', 1, 1, 'CSE2243', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3144', 'Discrete Math Lab', 1.5, 'L3T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3145', 'Data Structures', 4, 'L3T2', 1, 1, 'CSE2245', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3146', 'Data Structures Lab', 1.5, 'L3T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3147', 'Algorithms', 4, 'L3T2', 1, 1, 'CSE2247', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE3148', 'Algorithms Lab', 1.5, 'L3T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4149', 'Introduction to Programming', 4, 'L4T1', 1, 1, 'CSE3149', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4140', 'Programming Lab', 1.5, 'L4T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4151', 'Discrete Mathematics', 3, 'L4T1', 1, 1, 'CSE3151', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4152', 'Discrete Math Lab', 1.5, 'L4T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4153', 'Data Structures', 4, 'L4T1', 1, 1, 'CSE3153', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4154', 'Data Structures Lab', 1.5, 'L4T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4155', 'Algorithms', 4, 'L4T1', 1, 1, 'CSE3155', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4156', 'Algorithms Lab', 1.5, 'L4T1', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4157', 'Introduction to Programming', 4, 'L4T2', 1, 1, 'CSE3257', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4158', 'Programming Lab', 1.5, 'L4T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4159', 'Discrete Mathematics', 3, 'L4T2', 1, 1, 'CSE3259', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4150', 'Discrete Math Lab', 1.5, 'L4T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4161', 'Data Structures', 4, 'L4T2', 1, 1, 'CSE3261', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4162', 'Data Structures Lab', 1.5, 'L4T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4163', 'Algorithms', 4, 'L4T2', 1, 1, 'CSE3263', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CSE4164', 'Algorithms Lab', 1.5, 'L4T2', 1, 1, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1101', 'Basic Circuits', 3, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1102', 'Circuits Lab', 1.5, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1103', 'Signals and Systems', 3, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1104', 'Signals Lab', 1.5, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1105', 'Electronics I', 3, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1106', 'Electronics Lab', 1.5, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1107', 'Power Systems', 3, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1108', 'Power Lab', 1.5, 'L1T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1109', 'Basic Circuits', 3, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1100', 'Circuits Lab', 1.5, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1111', 'Signals and Systems', 3, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1112', 'Signals Lab', 1.5, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1113', 'Electronics I', 3, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1114', 'Electronics Lab', 1.5, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1115', 'Power Systems', 3, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE1116', 'Power Lab', 1.5, 'L1T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2117', 'Basic Circuits', 3, 'L2T1', 2, 2, 'EEE1117', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2118', 'Circuits Lab', 1.5, 'L2T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2119', 'Signals and Systems', 3, 'L2T1', 2, 2, 'EEE1119', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2110', 'Signals Lab', 1.5, 'L2T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2121', 'Electronics I', 3, 'L2T1', 2, 2, 'EEE1121', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2122', 'Electronics Lab', 1.5, 'L2T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2123', 'Power Systems', 3, 'L2T1', 2, 2, 'EEE1123', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2124', 'Power Lab', 1.5, 'L2T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2125', 'Basic Circuits', 3, 'L2T2', 2, 2, 'EEE1225', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2126', 'Circuits Lab', 1.5, 'L2T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2127', 'Signals and Systems', 3, 'L2T2', 2, 2, 'EEE1227', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2128', 'Signals Lab', 1.5, 'L2T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2129', 'Electronics I', 3, 'L2T2', 2, 2, 'EEE1229', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2120', 'Electronics Lab', 1.5, 'L2T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2131', 'Power Systems', 3, 'L2T2', 2, 2, 'EEE1231', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE2132', 'Power Lab', 1.5, 'L2T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3133', 'Basic Circuits', 3, 'L3T1', 2, 2, 'EEE2133', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3134', 'Circuits Lab', 1.5, 'L3T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3135', 'Signals and Systems', 3, 'L3T1', 2, 2, 'EEE2135', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3136', 'Signals Lab', 1.5, 'L3T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3137', 'Electronics I', 3, 'L3T1', 2, 2, 'EEE2137', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3138', 'Electronics Lab', 1.5, 'L3T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3139', 'Power Systems', 3, 'L3T1', 2, 2, 'EEE2139', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3130', 'Power Lab', 1.5, 'L3T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3141', 'Basic Circuits', 3, 'L3T2', 2, 2, 'EEE2241', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3142', 'Circuits Lab', 1.5, 'L3T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3143', 'Signals and Systems', 3, 'L3T2', 2, 2, 'EEE2243', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3144', 'Signals Lab', 1.5, 'L3T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3145', 'Electronics I', 3, 'L3T2', 2, 2, 'EEE2245', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3146', 'Electronics Lab', 1.5, 'L3T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3147', 'Power Systems', 3, 'L3T2', 2, 2, 'EEE2247', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE3148', 'Power Lab', 1.5, 'L3T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4149', 'Basic Circuits', 3, 'L4T1', 2, 2, 'EEE3149', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4140', 'Circuits Lab', 1.5, 'L4T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4151', 'Signals and Systems', 3, 'L4T1', 2, 2, 'EEE3151', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4152', 'Signals Lab', 1.5, 'L4T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4153', 'Electronics I', 3, 'L4T1', 2, 2, 'EEE3153', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4154', 'Electronics Lab', 1.5, 'L4T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4155', 'Power Systems', 3, 'L4T1', 2, 2, 'EEE3155', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4156', 'Power Lab', 1.5, 'L4T1', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4157', 'Basic Circuits', 3, 'L4T2', 2, 2, 'EEE3257', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4158', 'Circuits Lab', 1.5, 'L4T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4159', 'Signals and Systems', 3, 'L4T2', 2, 2, 'EEE3259', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4150', 'Signals Lab', 1.5, 'L4T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4161', 'Electronics I', 3, 'L4T2', 2, 2, 'EEE3261', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4162', 'Electronics Lab', 1.5, 'L4T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4163', 'Power Systems', 3, 'L4T2', 2, 2, 'EEE3263', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('EEE4164', 'Power Lab', 1.5, 'L4T2', 2, 2, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1101', 'Calculus I', 4, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1102', 'Calculus Lab', 1.5, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1103', 'Linear Algebra', 3, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1104', 'Linear Algebra Lab', 1.5, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1105', 'Probability Theory', 4, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1106', 'Probability Lab', 1.5, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1107', 'Statistics', 3, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1108', 'Statistics Lab', 1.5, 'L1T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1109', 'Calculus I', 4, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1100', 'Calculus Lab', 1.5, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1111', 'Linear Algebra', 3, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1112', 'Linear Algebra Lab', 1.5, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1113', 'Probability Theory', 4, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1114', 'Probability Lab', 1.5, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1115', 'Statistics', 3, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH1116', 'Statistics Lab', 1.5, 'L1T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2117', 'Calculus I', 4, 'L2T1', 5, 5, 'MATH1117', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2118', 'Calculus Lab', 1.5, 'L2T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2119', 'Linear Algebra', 3, 'L2T1', 5, 5, 'MATH1119', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2110', 'Linear Algebra Lab', 1.5, 'L2T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2121', 'Probability Theory', 4, 'L2T1', 5, 5, 'MATH1121', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2122', 'Probability Lab', 1.5, 'L2T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2123', 'Statistics', 3, 'L2T1', 5, 5, 'MATH1123', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2124', 'Statistics Lab', 1.5, 'L2T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2125', 'Calculus I', 4, 'L2T2', 5, 5, 'MATH1225', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2126', 'Calculus Lab', 1.5, 'L2T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2127', 'Linear Algebra', 3, 'L2T2', 5, 5, 'MATH1227', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2128', 'Linear Algebra Lab', 1.5, 'L2T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2129', 'Probability Theory', 4, 'L2T2', 5, 5, 'MATH1229', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2120', 'Probability Lab', 1.5, 'L2T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2131', 'Statistics', 3, 'L2T2', 5, 5, 'MATH1231', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH2132', 'Statistics Lab', 1.5, 'L2T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3133', 'Calculus I', 4, 'L3T1', 5, 5, 'MATH2133', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3134', 'Calculus Lab', 1.5, 'L3T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3135', 'Linear Algebra', 3, 'L3T1', 5, 5, 'MATH2135', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3136', 'Linear Algebra Lab', 1.5, 'L3T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3137', 'Probability Theory', 4, 'L3T1', 5, 5, 'MATH2137', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3138', 'Probability Lab', 1.5, 'L3T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3139', 'Statistics', 3, 'L3T1', 5, 5, 'MATH2139', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3130', 'Statistics Lab', 1.5, 'L3T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3141', 'Calculus I', 4, 'L3T2', 5, 5, 'MATH2241', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3142', 'Calculus Lab', 1.5, 'L3T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3143', 'Linear Algebra', 3, 'L3T2', 5, 5, 'MATH2243', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3144', 'Linear Algebra Lab', 1.5, 'L3T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3145', 'Probability Theory', 4, 'L3T2', 5, 5, 'MATH2245', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3146', 'Probability Lab', 1.5, 'L3T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3147', 'Statistics', 3, 'L3T2', 5, 5, 'MATH2247', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH3148', 'Statistics Lab', 1.5, 'L3T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4149', 'Calculus I', 4, 'L4T1', 5, 5, 'MATH3149', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4140', 'Calculus Lab', 1.5, 'L4T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4151', 'Linear Algebra', 3, 'L4T1', 5, 5, 'MATH3151', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4152', 'Linear Algebra Lab', 1.5, 'L4T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4153', 'Probability Theory', 4, 'L4T1', 5, 5, 'MATH3153', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4154', 'Probability Lab', 1.5, 'L4T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4155', 'Statistics', 3, 'L4T1', 5, 5, 'MATH3155', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4156', 'Statistics Lab', 1.5, 'L4T1', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4157', 'Calculus I', 4, 'L4T2', 5, 5, 'MATH3257', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4158', 'Calculus Lab', 1.5, 'L4T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4159', 'Linear Algebra', 3, 'L4T2', 5, 5, 'MATH3259', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4150', 'Linear Algebra Lab', 1.5, 'L4T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4161', 'Probability Theory', 4, 'L4T2', 5, 5, 'MATH3261', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4162', 'Probability Lab', 1.5, 'L4T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4163', 'Statistics', 3, 'L4T2', 5, 5, 'MATH3263', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('MATH4164', 'Statistics Lab', 1.5, 'L4T2', 5, 5, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1101', 'Physics I', 4, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1102', 'Physics Lab', 1.5, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1103', 'Mechanics', 3, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1104', 'Mechanics Lab', 1.5, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1105', 'Electromagnetism', 4, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1106', 'EM Lab', 1.5, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1107', 'Quantum Mechanics', 4, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1108', 'Quantum Lab', 1.5, 'L1T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1109', 'Physics I', 4, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1100', 'Physics Lab', 1.5, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1111', 'Mechanics', 3, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1112', 'Mechanics Lab', 1.5, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1113', 'Electromagnetism', 4, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1114', 'EM Lab', 1.5, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1115', 'Quantum Mechanics', 4, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY1116', 'Quantum Lab', 1.5, 'L1T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2117', 'Physics I', 4, 'L2T1', 6, 6, 'PHY1117', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2118', 'Physics Lab', 1.5, 'L2T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2119', 'Mechanics', 3, 'L2T1', 6, 6, 'PHY1119', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2110', 'Mechanics Lab', 1.5, 'L2T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2121', 'Electromagnetism', 4, 'L2T1', 6, 6, 'PHY1121', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2122', 'EM Lab', 1.5, 'L2T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2123', 'Quantum Mechanics', 4, 'L2T1', 6, 6, 'PHY1123', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2124', 'Quantum Lab', 1.5, 'L2T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2125', 'Physics I', 4, 'L2T2', 6, 6, 'PHY1225', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2126', 'Physics Lab', 1.5, 'L2T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2127', 'Mechanics', 3, 'L2T2', 6, 6, 'PHY1227', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2128', 'Mechanics Lab', 1.5, 'L2T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2129', 'Electromagnetism', 4, 'L2T2', 6, 6, 'PHY1229', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2120', 'EM Lab', 1.5, 'L2T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2131', 'Quantum Mechanics', 4, 'L2T2', 6, 6, 'PHY1231', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY2132', 'Quantum Lab', 1.5, 'L2T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3133', 'Physics I', 4, 'L3T1', 6, 6, 'PHY2133', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3134', 'Physics Lab', 1.5, 'L3T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3135', 'Mechanics', 3, 'L3T1', 6, 6, 'PHY2135', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3136', 'Mechanics Lab', 1.5, 'L3T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3137', 'Electromagnetism', 4, 'L3T1', 6, 6, 'PHY2137', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3138', 'EM Lab', 1.5, 'L3T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3139', 'Quantum Mechanics', 4, 'L3T1', 6, 6, 'PHY2139', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3130', 'Quantum Lab', 1.5, 'L3T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3141', 'Physics I', 4, 'L3T2', 6, 6, 'PHY2241', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3142', 'Physics Lab', 1.5, 'L3T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3143', 'Mechanics', 3, 'L3T2', 6, 6, 'PHY2243', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3144', 'Mechanics Lab', 1.5, 'L3T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3145', 'Electromagnetism', 4, 'L3T2', 6, 6, 'PHY2245', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3146', 'EM Lab', 1.5, 'L3T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3147', 'Quantum Mechanics', 4, 'L3T2', 6, 6, 'PHY2247', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY3148', 'Quantum Lab', 1.5, 'L3T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4149', 'Physics I', 4, 'L4T1', 6, 6, 'PHY3149', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4140', 'Physics Lab', 1.5, 'L4T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4151', 'Mechanics', 3, 'L4T1', 6, 6, 'PHY3151', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4152', 'Mechanics Lab', 1.5, 'L4T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4153', 'Electromagnetism', 4, 'L4T1', 6, 6, 'PHY3153', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4154', 'EM Lab', 1.5, 'L4T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4155', 'Quantum Mechanics', 4, 'L4T1', 6, 6, 'PHY3155', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4156', 'Quantum Lab', 1.5, 'L4T1', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4157', 'Physics I', 4, 'L4T2', 6, 6, 'PHY3257', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4158', 'Physics Lab', 1.5, 'L4T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4159', 'Mechanics', 3, 'L4T2', 6, 6, 'PHY3259', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4150', 'Mechanics Lab', 1.5, 'L4T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4161', 'Electromagnetism', 4, 'L4T2', 6, 6, 'PHY3261', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4162', 'EM Lab', 1.5, 'L4T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4163', 'Quantum Mechanics', 4, 'L4T2', 6, 6, 'PHY3263', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('PHY4164', 'Quantum Lab', 1.5, 'L4T2', 6, 6, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1101', 'Structural Analysis', 3, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1102', 'Structural Lab', 1.5, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1103', 'Concrete Technology', 3, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1104', 'Concrete Lab', 1.5, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1105', 'Soil Mechanics', 3, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1106', 'Soil Lab', 1.5, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1107', 'Hydraulics', 3, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1108', 'Hydraulics Lab', 1.5, 'L1T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1109', 'Structural Analysis', 3, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1100', 'Structural Lab', 1.5, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1111', 'Concrete Technology', 3, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1112', 'Concrete Lab', 1.5, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1113', 'Soil Mechanics', 3, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1114', 'Soil Lab', 1.5, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1115', 'Hydraulics', 3, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE1116', 'Hydraulics Lab', 1.5, 'L1T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2117', 'Structural Analysis', 3, 'L2T1', 10, 10, 'CE1117', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2118', 'Structural Lab', 1.5, 'L2T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2119', 'Concrete Technology', 3, 'L2T1', 10, 10, 'CE1119', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2110', 'Concrete Lab', 1.5, 'L2T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2121', 'Soil Mechanics', 3, 'L2T1', 10, 10, 'CE1121', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2122', 'Soil Lab', 1.5, 'L2T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2123', 'Hydraulics', 3, 'L2T1', 10, 10, 'CE1123', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2124', 'Hydraulics Lab', 1.5, 'L2T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2125', 'Structural Analysis', 3, 'L2T2', 10, 10, 'CE1225', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2126', 'Structural Lab', 1.5, 'L2T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2127', 'Concrete Technology', 3, 'L2T2', 10, 10, 'CE1227', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2128', 'Concrete Lab', 1.5, 'L2T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2129', 'Soil Mechanics', 3, 'L2T2', 10, 10, 'CE1229', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2120', 'Soil Lab', 1.5, 'L2T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2131', 'Hydraulics', 3, 'L2T2', 10, 10, 'CE1231', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE2132', 'Hydraulics Lab', 1.5, 'L2T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3133', 'Structural Analysis', 3, 'L3T1', 10, 10, 'CE2133', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3134', 'Structural Lab', 1.5, 'L3T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3135', 'Concrete Technology', 3, 'L3T1', 10, 10, 'CE2135', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3136', 'Concrete Lab', 1.5, 'L3T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3137', 'Soil Mechanics', 3, 'L3T1', 10, 10, 'CE2137', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3138', 'Soil Lab', 1.5, 'L3T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3139', 'Hydraulics', 3, 'L3T1', 10, 10, 'CE2139', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3130', 'Hydraulics Lab', 1.5, 'L3T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3141', 'Structural Analysis', 3, 'L3T2', 10, 10, 'CE2241', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3142', 'Structural Lab', 1.5, 'L3T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3143', 'Concrete Technology', 3, 'L3T2', 10, 10, 'CE2243', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3144', 'Concrete Lab', 1.5, 'L3T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3145', 'Soil Mechanics', 3, 'L3T2', 10, 10, 'CE2245', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3146', 'Soil Lab', 1.5, 'L3T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3147', 'Hydraulics', 3, 'L3T2', 10, 10, 'CE2247', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE3148', 'Hydraulics Lab', 1.5, 'L3T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4149', 'Structural Analysis', 3, 'L4T1', 10, 10, 'CE3149', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4140', 'Structural Lab', 1.5, 'L4T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4151', 'Concrete Technology', 3, 'L4T1', 10, 10, 'CE3151', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4152', 'Concrete Lab', 1.5, 'L4T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4153', 'Soil Mechanics', 3, 'L4T1', 10, 10, 'CE3153', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4154', 'Soil Lab', 1.5, 'L4T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4155', 'Hydraulics', 3, 'L4T1', 10, 10, 'CE3155', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4156', 'Hydraulics Lab', 1.5, 'L4T1', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4157', 'Structural Analysis', 3, 'L4T2', 10, 10, 'CE3257', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4158', 'Structural Lab', 1.5, 'L4T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4159', 'Concrete Technology', 3, 'L4T2', 10, 10, 'CE3259', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4150', 'Concrete Lab', 1.5, 'L4T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4161', 'Soil Mechanics', 3, 'L4T2', 10, 10, 'CE3261', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4162', 'Soil Lab', 1.5, 'L4T2', 10, 10, NULL, TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4163', 'Hydraulics', 3, 'L4T2', 10, 10, 'CE3263', TRUE);
INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) VALUES ('CE4164', 'Hydraulics Lab', 1.5, 'L4T2', 10, 10, NULL, TRUE);

SELECT * FROM course


-- students
SELECT * FROM student
SELECT * FROM "User" WHERE role = 'Teacher';
