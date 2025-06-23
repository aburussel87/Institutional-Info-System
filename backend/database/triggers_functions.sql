-- See all triggers assigned per table
SELECT
    event_object_table AS table_name,
    trigger_name,
    action_timing,
    event_manipulation
FROM
    information_schema.triggers
ORDER BY
    table_name, trigger_name;



-- Auto insertion into role_table
-- Drop the existing trigger
DROP TRIGGER IF EXISTS insert_user_role ON "User";
DROP FUNCTION IF EXISTS insert_into_role_table();
CREATE OR REPLACE FUNCTION insert_into_role_table()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'Student' THEN
        INSERT INTO student (student_id) VALUES (NEW.user_id)
        ON CONFLICT (student_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_user_role
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION insert_into_role_table();





-- insert teacher from user
CREATE OR REPLACE FUNCTION insert_user_to_teacher(p_user_id INT)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;


SELECT insert_user_to_teacher(2020111597);
SELECT teacher_id, u.username
FROM teacher, "User" u 
WHERE u.user_id = teacher_id;

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT user_id FROM "User" WHERE role = 'Teacher'
    LOOP
        PERFORM insert_user_to_teacher(rec.user_id);
    END LOOP;
END;
$$;



-- Random Advisor
CREATE OR REPLACE FUNCTION insert_random_advisors()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;
SELECT insert_random_advisors();


-- auto update total student under any advisor
DROP TRIGGER IF EXISTS trg_increment_advisor_count ON student;
DROP FUNCTION IF EXISTS increment_advisor_student_count();

CREATE OR REPLACE FUNCTION increment_advisor_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.advisor_id IS NOT NULL THEN
    UPDATE Advisor
    SET total_student = total_student + 1
    WHERE teacher_id = NEW.advisor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_advisor_count
AFTER UPDATE ON Student
FOR EACH ROW
EXECUTE FUNCTION increment_advisor_student_count();


-- populate student table
DROP FUNCTION IF EXISTS update_students_from_users();
CREATE OR REPLACE FUNCTION update_students_from_users()
RETURNS void AS $$
DECLARE
    u RECORD;
    dept_code INT;
    session_prefix TEXT;
    acad_session TEXT;
    sems Semester[] := ARRAY[
        'L1T1'::Semester, 'L1T2'::Semester, 'L2T1'::Semester,
        'L2T2'::Semester, 'L3T1'::Semester, 'L3T2'::Semester,
        'L4T1'::Semester, 'L4T2'::Semester
    ];
    rand_sem Semester;
    rand_hall INT;
    rand_advisor INT;
BEGIN
    FOR u IN 
        SELECT student_id FROM Student
    LOOP
        dept_code := CAST(SUBSTRING(u.student_id::TEXT FROM 3 FOR 2) AS INT);

        session_prefix := SUBSTRING(u.student_id::TEXT FROM 1 FOR 2);
        acad_session := '20' || session_prefix || '-' || LPAD((CAST(session_prefix AS INT) + 1)::TEXT, 2, '0');

        rand_sem := sems[FLOOR(RANDOM() * array_length(sems,1) + 1)];
        SELECT hall_id INTO rand_hall FROM Hall ORDER BY random() LIMIT 1;
        SELECT teacher_id INTO rand_advisor FROM Advisor ORDER BY random() LIMIT 1;

        UPDATE Student
        SET 
            department_id = dept_code,
            academic_session = acad_session,
            current_semester = rand_sem,
            hall_id = rand_hall,
            advisor_id = rand_advisor
        WHERE student_id = u.student_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
SELECT update_students_from_users();


SELECT * FROM "User"

