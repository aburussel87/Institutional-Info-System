
CREATE FUNCTION public.course_not_taken_recent_years(year_diff integer) RETURNS TABLE(course_id character varying, course_title character varying, department_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN 
    RETURN QUERY 
    SELECT c.course_id, c.title, c.offered_by
    FROM course c
    where NOT EXISTS (
        SELECT 1
        FROM enrollment e
        WHERE e.course_id = c.course_id
        AND e.enrolled_on >= CURRENT_DATE - (year_diff * INTERVAL '1 year')
    );
END;
$$;


ALTER FUNCTION public.course_not_taken_recent_years(year_diff integer) OWNER TO system;

--
-- Name: get_all_payments_ordered_by_type(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_all_payments_ordered_by_type(uid integer) RETURNS TABLE(student_fee_id integer, student_id integer, fee_type_id character varying, fee_type_name character varying, amount integer, due_date timestamp without time zone, status public.feestatus, paid_on timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        sf.student_fee_id,
        sf.student_id,
        sf.fee_type_id,
        ft.name AS fee_type_name,
        sf.amount,
        sf.due_date,
        sf.status,
        sf.paid_on
    FROM
        StudentFee sf
    JOIN
        FeeType ft ON sf.fee_type_id = ft.fee_type_id
		WHERE sf.student_id = uid
    ORDER BY
        ft.name, sf.student_fee_id;
END;
$$;


ALTER FUNCTION public.get_all_payments_ordered_by_type(uid integer) OWNER TO system;

--
-- Name: get_class_routine(public.semester, character varying, integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_class_routine(p_semester public.semester, p_academic_session character varying, p_department_id integer) RETURNS TABLE(academic_session character varying, day_of_week character varying, start_time time without time zone, end_time time without time zone, section_type character varying, course_id character varying, course_title character varying, room_id character varying, room_type public.roomtype, teacher_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        cs.academic_session,
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        cs.section_type,
        cs.course_id,
        c.title AS course_title,
        cs.room_id,
        r.room_type,
        u.username AS teacher_name
    FROM ClassSchedule cs
    JOIN Course c
        ON cs.course_id = c.course_id
    JOIN Room r
        ON cs.room_id = r.room_id
    LEFT JOIN SubjectAllocation sa
        ON sa.course_id = cs.course_id
       AND sa.academic_session = cs.academic_session
       AND (sa.section_type = cs.section_type OR sa.section_type = 'All')
    LEFT JOIN Teacher t
        ON sa.teacher_id = t.teacher_id
    LEFT JOIN "User" u
        ON t.teacher_id = u.user_id
    WHERE cs.academic_session = p_academic_session
      AND c.semester = p_semester
      AND c.department_id = p_department_id
      AND (cs.section_type IN ('A', 'A1', 'A2', 'All'))
    ORDER BY cs.day_of_week, cs.start_time;
END;
$$;


ALTER FUNCTION public.get_class_routine(p_semester public.semester, p_academic_session character varying, p_department_id integer) OWNER TO system;

--
-- Name: get_course_by_dept_by_level_term(integer, public.semester); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_course_by_dept_by_level_term(dept_id integer, sem public.semester) RETURNS SETOF public.course
    LANGUAGE plpgsql
    AS $$
BEGIN 
	RETURN query
	SELECT * FROM course
	WHERE department_id = dept_id and semester = sem;
end;
$$;


ALTER FUNCTION public.get_course_by_dept_by_level_term(dept_id integer, sem public.semester) OWNER TO system;

--
-- Name: get_course_from_other_dept(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_course_from_other_dept(dept_id integer) RETURNS SETOF public.course
    LANGUAGE plpgsql
    AS $$
BEGIN 
    RETURN QUERY
    SELECT *
    FROM course
    WHERE department_id = dept_id AND offered_by <> dept_id and still_offered is TRUE;
END;
$$;


ALTER FUNCTION public.get_course_from_other_dept(dept_id integer) OWNER TO system;

--
-- Name: get_exam_routine(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_exam_routine(p_student_id integer) RETURNS TABLE(student_id integer, exam_id character varying, course_id character varying, course_title character varying, exam_title character varying, exam_type public.examtype, total_marks integer, date_of_exam timestamp without time zone, semester public.semester, academic_session character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
      en.student_id,
      e.exam_id,
      e.course_id,
      c.title AS course_title,
      e.title AS exam_title,
      e.exam_type,
      e.total_marks,
      e.date_of_exam,
      e.semester,
      e.academic_session
  FROM 
      Enrollment en
  JOIN 
      Exam e ON en.course_id = e.course_id
  JOIN 
      Course c ON e.course_id = c.course_id
  WHERE 
      en.student_id = p_student_id
  ORDER BY 
      e.date_of_exam ASC;
END;
$$;


ALTER FUNCTION public.get_exam_routine(p_student_id integer) OWNER TO system;

--
-- Name: get_student_course_outlines(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_student_course_outlines(p_student_id integer) RETURNS TABLE(course_id character varying, title character varying, outline text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT c.course_id, c.title, c.outline
  FROM enrollment e
  JOIN course c ON e.course_id = c.course_id
  JOIN student s ON e.student_id = s.student_id
  WHERE e.student_id = p_student_id
    AND c.semester = s.current_semester;
END;
$$;


ALTER FUNCTION public.get_student_course_outlines(p_student_id integer) OWNER TO system;

--
-- Name: get_student_full_info(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_student_full_info(p_student_id integer) RETURNS TABLE(user_id integer, username character varying, email character varying, phone character varying, dob date, gender public.gender, role public.userrole, date_joined timestamp without time zone, is_active boolean, last_login timestamp without time zone, photo bytea, department_id integer, academic_session character varying, current_semester public.semester, hall_id integer, hall_name character varying, hall_room_number character varying, hall_residency_status character varying, hall_assigned_on timestamp without time zone, hall_vacated_on timestamp without time zone, emergency_contact_name character varying, emergency_contact_mobile character varying, emergency_contact_address character varying, advisor_id integer, advisor_total_students integer, advisor_name character varying, advisor_email character varying, advisor_phone character varying, advisor_designation character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.user_id,
    u.username,
    u.email,
    u.phone,
    u.dob,
    u.gender,
    u.role,
    u.date_joined,
    u.is_active,
    u.last_login,
    u.photo,

    s.department_id,
    s.academic_session,
    s.current_semester,

    ha.hall_id,
    h.name AS hall_name,
    ha.room_number,
    CASE
      WHEN ha.resident IS TRUE THEN 'Resident'
      ELSE 'Attached'
    END::varchar AS hall_residency_status,  -- 👈 FIXED

    ha.assigned_on,
    ha.vacated_on,

    ec.name AS emergency_contact_name,
    ec.mobile AS emergency_contact_mobile,
    ec.address AS emergency_contact_address,

    adv.teacher_id AS advisor_id,
    adv.total_student AS advisor_total_students,
    u_adv.username AS advisor_name,
    u_adv.email AS advisor_email,
    u_adv.phone AS advisor_phone,
    t.designation AS advisor_designation

  FROM "User" u
  JOIN Student s ON u.user_id = s.student_id
  LEFT JOIN EmergencyContact ec ON u.user_id = ec.user_id
  LEFT JOIN HallAssignment ha ON s.student_id = ha.student_id
  LEFT JOIN Hall h ON ha.hall_id = h.hall_id
  LEFT JOIN Advisor adv ON s.advisor_id = adv.teacher_id
  LEFT JOIN Teacher t ON adv.teacher_id = t.teacher_id
  LEFT JOIN "User" u_adv ON adv.teacher_id = u_adv.user_id

  WHERE s.student_id = p_student_id;
END;
$$;


ALTER FUNCTION public.get_student_full_info(p_student_id integer) OWNER TO system;

--
-- Name: get_teacher_courses(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_teacher_courses(p_teacher_id integer) RETURNS TABLE(course_id character varying, course_title character varying, section_type character varying, academic_session character varying, credit_hours double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.course_id,
    c.title AS course_title,
    sa.section_type,
    sa.academic_session,
    c.credit_hours
  FROM SubjectAllocation sa
  JOIN Course c ON sa.course_id = c.course_id
  WHERE sa.teacher_id = p_teacher_id;
END;
$$;


ALTER FUNCTION public.get_teacher_courses(p_teacher_id integer) OWNER TO system;

--
-- Name: get_teacher_info(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_teacher_info(p_user_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', u.user_id,
    'username', u.username,
    'email', u.email,
    'phone', u.phone,
    'dob', u.dob,
    'gender', u.gender,
    'date_joined', u.date_joined,
    'last_login', u.last_login,
    'is_active', u.is_active,
    'two_fa_enabled', u.two_fa_enabled,
    'photo', encode(u.photo, 'base64'),

    'emergency_contact', json_build_object(
      'name', ec.name,
      'mobile', ec.mobile,
      'address', ec.address
    ),

    'teacher_info', json_build_object(
      'teacher_id', t.teacher_id,
      'hire_date', t.hire_date,
      'designation', t.designation
    ),

    'department', json_build_object(
      'department_id', d.department_id,
      'name', d.name
    ),

    'advisor_info', json_build_object(
      'total_students', a.total_student
    ),

    'hod_info', json_build_object(
      'department_id', hod.department_id,
      'assigned_on', hod.assigned_on,
      'resigned_on', hod.resigned_on
    ),

    'provost_info', json_build_object(
      'hall_id', p.hall_id,
      'assigned_on', p.assigned_on,
      'resigned_on', p.resigned_on
    ),

    'courses_taught', (
      SELECT json_agg(
        json_build_object(
          'course_id', sa.course_id,
          'course_title', c.title,
          'section_type', sa.section_type,
          'academic_session', sa.academic_session
        )
      )
      FROM SubjectAllocation sa
      JOIN Course c ON sa.course_id = c.course_id
      WHERE sa.teacher_id = t.teacher_id
    )
  )
  INTO result
  FROM "User" u
  JOIN Teacher t ON u.user_id = t.teacher_id
  LEFT JOIN Department d ON t.department_id = d.department_id
  LEFT JOIN Advisor a ON t.teacher_id = a.teacher_id
  LEFT JOIN head_of_department hod ON t.teacher_id = hod.teacher_id
  LEFT JOIN Provost p ON t.teacher_id = p.teacher_id
  LEFT JOIN EmergencyContact ec ON u.user_id = ec.user_id
  WHERE u.user_id = p_user_id;

  RETURN result;
END;
$$;


ALTER FUNCTION public.get_teacher_info(p_user_id integer) OWNER TO system;

--
-- Name: get_teacherinfo(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_teacherinfo(uid integer) RETURNS public.teacher_info
    LANGUAGE plpgsql
    AS $$
DECLARE
    result teacher_info;
BEGIN
    SELECT
        u.username,
        u.email,
				u.phone,
        u.gender,
        u.date_joined,
        u.is_active,
        u.last_login,
        u.login_attempts,
        u.two_fa_enabled,
        u.photo,
				s.department_id,
        s.hire_date,
				s.designation
    INTO result
    FROM "User" u , teacher s 
		WHERE u.user_id = uid and s.teacher_id = uid;
    RETURN result;
END;
$$;


ALTER FUNCTION public.get_teacherinfo(uid integer) OWNER TO system;

--
-- Name: get_user_notifications(integer, public.userrole); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.get_user_notifications(p_uid integer, p_role public.userrole) RETURNS TABLE(notification_id integer, title character varying, message text, created_by character varying, created_at timestamp without time zone, student_id integer, teacher_id integer, department_id integer, course_id character varying, hall_id integer, semester_id public.semester)
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF p_role = 'Student' THEN
    RETURN QUERY
    SELECT n.notification_id, n.title, n.message, n.created_by, n.created_at,
           n.student_id, n.teacher_id, n.department_id, n.course_id, n.hall_id, n.semester_id
    FROM notification n
    WHERE n.student_id = p_uid
       OR n.department_id = (
            SELECT s.department_id FROM student s WHERE s.student_id = p_uid
         )
       OR n.hall_id = (
            SELECT s.hall_id FROM student s WHERE s.student_id = p_uid
         )
       OR n.semester_id = (
            SELECT s.current_semester FROM student s WHERE s.student_id = p_uid
         )
       OR n.course_id IN (
            SELECT e.course_id
            FROM enrollment e
            JOIN student s ON e.student_id = s.student_id
            WHERE e.student_id = p_uid AND e.semester = s.current_semester
         )
    ORDER BY n.created_at DESC;

  ELSIF p_role = 'Teacher' THEN
    RETURN QUERY
    SELECT n.notification_id, n.title, n.message, n.created_by, n.created_at,
           n.student_id, n.teacher_id, n.department_id, n.course_id, n.hall_id, n.semester_id
    FROM notification n
    WHERE n.teacher_id = p_uid
       OR n.department_id = (
            SELECT t.department_id FROM teacher t WHERE t.teacher_id = p_uid
         )
       OR n.course_id IN (
            SELECT sa.course_id
            FROM subjectallocation sa
            WHERE sa.teacher_id = p_uid
         )
    ORDER BY n.created_at DESC;

  ELSIF p_role = 'Admin' THEN
    RETURN QUERY
    SELECT n.notification_id, n.title, n.message, n.created_by, n.created_at,
           n.student_id, n.teacher_id, n.department_id, n.course_id, n.hall_id, n.semester_id
    FROM notification n
    ORDER BY n.created_at DESC;

  ELSE
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
END;
$$;


ALTER FUNCTION public.get_user_notifications(p_uid integer, p_role public.userrole) OWNER TO system;

--
-- Name: increment_advisor_student_count(); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.increment_advisor_student_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.advisor_id IS NOT NULL THEN
    UPDATE Advisor
    SET total_student = total_student + 1
    WHERE teacher_id = NEW.advisor_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.increment_advisor_student_count() OWNER TO system;

--
-- Name: insert_into_role_table(); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.insert_into_role_table() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.role = 'Student' THEN
        INSERT INTO student (student_id) VALUES (NEW.user_id)
        ON CONFLICT (student_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_into_role_table() OWNER TO system;

--
-- Name: insert_random_advisors(); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.insert_random_advisors() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    teacher_ids INT[];
    selected_id INT;
    i INT := 1;
BEGIN

    SELECT ARRAY(
        SELECT teacher_id FROM Teacher
        ORDER BY random()
        LIMIT 24
    ) INTO teacher_ids;

    WHILE i <= array_length(teacher_ids, 1) LOOP
        selected_id := teacher_ids[i];

        INSERT INTO Advisor (teacher_id, total_student)
        VALUES (selected_id, 0)
        ON CONFLICT (teacher_id) DO NOTHING;

        i := i + 1;
    END LOOP;
END;
$$;


ALTER FUNCTION public.insert_random_advisors() OWNER TO system;

--
-- Name: insert_user_to_teacher(integer); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.insert_user_to_teacher(p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    dept_code_text TEXT;
    dept_code INT;
    hire_date DATE;
    designation VARCHAR(30);
    designations TEXT[] := ARRAY['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];
BEGIN

    dept_code_text := substring(p_user_id::TEXT from 5 for 2);
    dept_code := dept_code_text::INT;

    SELECT date_joined INTO hire_date FROM "User" WHERE user_id = p_user_id;
    SELECT designations[ floor(random() * array_length(designations,1) + 1)::INT ] INTO designation;
    INSERT INTO Teacher (teacher_id, hire_date, designation, department_id)
    VALUES (p_user_id, hire_date, designation, dept_code)
    ON CONFLICT (teacher_id) DO NOTHING;  

END;
$$;


ALTER FUNCTION public.insert_user_to_teacher(p_user_id integer) OWNER TO system;

--
-- Name: pay_student_fee(integer, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.pay_student_fee(p_student_fee_id integer, p_date timestamp without time zone DEFAULT NULL::timestamp without time zone) RETURNS TABLE(already_paid boolean, msg text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    is_paid BOOL;
BEGIN
  SELECT (status = 'Paid') INTO is_paid
  FROM StudentFee
  WHERE student_fee_id = p_student_fee_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, format('No StudentFee record found with ID %s', p_student_fee_id);
    RETURN;
  END IF;

  IF is_paid THEN
    RETURN QUERY SELECT TRUE, format('StudentFee ID %s is already marked as Paid', p_student_fee_id);
    RETURN;
  END IF;

  UPDATE StudentFee
  SET
    status = 'Paid',
    paid_on = p_date
  WHERE student_fee_id = p_student_fee_id;

  RETURN QUERY SELECT FALSE, format('StudentFee ID %s updated to Paid', p_student_fee_id);
END;
$$;


ALTER FUNCTION public.pay_student_fee(p_student_fee_id integer, p_date timestamp without time zone) OWNER TO system;

--
-- Name: students_taken_course(character varying); Type: FUNCTION; Schema: public; Owner: system
--

CREATE FUNCTION public.students_taken_course(c_id character varying) RETURNS SETOF public.std
    LANGUAGE plpgsql
    AS $$
BEGIN 
    RETURN QUERY 
    SELECT
        s.student_id,
        u.username,
        d.name 
    FROM
        student s
    JOIN "User" u ON u.user_id = s.student_id
    JOIN Department d ON s.department_id = d.department_id
		JOIN enrollment e on e.student_id = u.user_id
		WHERE e.course_id = c_id and s.current_semester = e.semester;
END;
$$;


ALTER FUNCTION public.students_taken_course(c_id character varying) OWNER TO system;



