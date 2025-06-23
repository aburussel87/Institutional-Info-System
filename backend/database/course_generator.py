departments = {
    'CSE': 1,
    'EEE': 2,
    'Math': 5,
    'Physics': 6,
    'Civil': 10
}

prefixes = {
    'CSE': 'CSE',
    'EEE': 'EEE',
    'Math': 'MATH',
    'Physics': 'PHY',
    'Civil': 'CE'
}

semesters = ['L1T1', 'L1T2', 'L2T1', 'L2T2', 'L3T1', 'L3T2', 'L4T1', 'L4T2']

course_titles = {
    'CSE': [
        ('Introduction to Programming', 4),
        ('Programming Lab', 1.5),
        ('Discrete Mathematics', 3),
        ('Discrete Math Lab', 1.5),
        ('Data Structures', 4),
        ('Data Structures Lab', 1.5),
        ('Algorithms', 4),
        ('Algorithms Lab', 1.5)
    ],
    'EEE': [
        ('Basic Circuits', 3),
        ('Circuits Lab', 1.5),
        ('Signals and Systems', 3),
        ('Signals Lab', 1.5),
        ('Electronics I', 3),
        ('Electronics Lab', 1.5),
        ('Power Systems', 3),
        ('Power Lab', 1.5)
    ],
    'Math': [
        ('Calculus I', 4),
        ('Calculus Lab', 1.5),
        ('Linear Algebra', 3),
        ('Linear Algebra Lab', 1.5),
        ('Probability Theory', 4),
        ('Probability Lab', 1.5),
        ('Statistics', 3),
        ('Statistics Lab', 1.5)
    ],
    'Physics': [
        ('Physics I', 4),
        ('Physics Lab', 1.5),
        ('Mechanics', 3),
        ('Mechanics Lab', 1.5),
        ('Electromagnetism', 4),
        ('EM Lab', 1.5),
        ('Quantum Mechanics', 4),
        ('Quantum Lab', 1.5)
    ],
    'Civil': [
        ('Structural Analysis', 3),
        ('Structural Lab', 1.5),
        ('Concrete Technology', 3),
        ('Concrete Lab', 1.5),
        ('Soil Mechanics', 3),
        ('Soil Lab', 1.5),
        ('Hydraulics', 3),
        ('Hydraulics Lab', 1.5)
    ]
}

course_counter = {}

with open('courses.txt', 'w') as f:
    f.write("-- Auto-generated courses insert statements --\n\n")

    for dept, dept_id in departments.items():
        prefix = prefixes[dept]
        course_counter[dept] = 100  

        for sem in semesters:
            level = int(sem[1])  
            term = int(sem[-1])  

            for i, (title, credit) in enumerate(course_titles[dept]):
                course_num = course_counter[dept]
                course_counter[dept] += 1

                last_digit = (course_num % 10)
                if 'Lab' in title:
                    if last_digit % 2 != 0:
                        last_digit = (last_digit + 1) % 10
                else:
                    if last_digit % 2 == 0:
                        last_digit = (last_digit + 1) % 10

                course_id = f"{prefix}{level}{course_num // 10}{last_digit}"

                prerequisite = 'NULL'
                if level > 1 and 'Lab' not in title:
                    prev_level = level - 1
                    prereq_course_num = course_num - 100
                    prereq_last_digit = (prereq_course_num % 10)
                    if prereq_last_digit % 2 == 0:
                        prereq_last_digit = (prereq_last_digit + 1) % 10
                    prereq_id = f"{prefix}{prev_level}{term}{prereq_course_num // 10}{prereq_last_digit}"
                    prerequisite = f"'{prereq_id}'"

                still_offered = 'TRUE'

                sql = (f"INSERT INTO Course (course_id, title, credit_hours, semester, offered_by, department_id, pre_requisite, still_offered) "
                       f"VALUES ('{course_id}', '{title}', {credit}, '{sem}', {dept_id}, {dept_id}, {prerequisite}, {still_offered});\n")

                f.write(sql)

print("courses.sql file generated with 320+ insert statements.")
