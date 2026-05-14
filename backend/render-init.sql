-- 智慧校园系统 - PostgreSQL 数据库初始化脚本
-- 用于 Render 部署

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'student', 'teacher')),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255) DEFAULT '/avatar/default.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_no VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10) DEFAULT '男',
    class_name VARCHAR(50),
    major VARCHAR(100),
    enrollment_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_student_no ON students(student_no);
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_year ON students(enrollment_year);

-- 创建教师表
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    teacher_no VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10) DEFAULT '男',
    department VARCHAR(100),
    title VARCHAR(50),
    specialty VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teachers_teacher_no ON teachers(teacher_no);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(100) NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    credits DECIMAL(4,2) DEFAULT 3,
    semester VARCHAR(20),
    semester_year INTEGER,
    description TEXT,
    max_students INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);

-- 创建成绩表
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    semester VARCHAR(20),
    semester_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_course_id ON scores(course_id);
CREATE INDEX IF NOT EXISTS idx_scores_semester ON scores(semester);

-- 创建公告表
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) DEFAULT 'notice',
    priority VARCHAR(20) DEFAULT 'normal',
    is_pinned INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- 初始化管理员账号 (密码: admin123)
INSERT INTO users (username, password, role, name, email, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'admin', '系统管理员', 'admin@campus.edu', '13800138000')
ON CONFLICT (username) DO NOTHING;

-- 初始化测试教师
INSERT INTO teachers (user_id, teacher_no, gender, department, title, specialty)
SELECT u.id, 'T001', '男', '计算机学院', '教授', '人工智能'
FROM users u WHERE u.username = 'T001'
ON CONFLICT (teacher_no) DO NOTHING;

INSERT INTO users (username, password, role, name, department) VALUES
('T001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '刘教授', '计算机学院')
ON CONFLICT (username) DO NOTHING;

INSERT INTO teachers (user_id, teacher_no, gender, department, title, specialty)
SELECT u.id, 'T001', '男', '计算机学院', '教授', '人工智能'
FROM users u WHERE u.username = 'T001'
ON CONFLICT (teacher_no) DO NOTHING;
