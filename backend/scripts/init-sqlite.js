/**
 * SQLite 数据库初始化脚本
 * 创建所有必要的表并插入初始数据
 */

const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');

// 确保data目录存在
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('📦 正在创建数据库表...');

// 创建用户表（包含管理员、教师、学生）
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT NOT NULL,
        avatar TEXT DEFAULT '/uploads/default-avatar.png',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// 学生扩展信息
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        student_no TEXT UNIQUE NOT NULL,
        class_name TEXT,
        major TEXT,
        enrollment_year INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// 教师扩展信息
db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        teacher_no TEXT UNIQUE NOT NULL,
        department TEXT,
        title TEXT,
        specialty TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// 课程表
db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT UNIQUE NOT NULL,
        course_name TEXT NOT NULL,
        teacher_id INTEGER,
        credits REAL,
        semester TEXT,
        semester_year INTEGER,
        description TEXT,
        max_students INTEGER DEFAULT 50,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
`);

// 成绩表
db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        semester TEXT,
        semester_year INTEGER,
        score REAL,
        grade TEXT,
        rank INTEGER,
        remarks TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
    )
`);

// 公告表
db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER,
        type TEXT DEFAULT 'notice',
        priority TEXT DEFAULT 'normal',
        is_pinned INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
    )
`);

// 学期表
db.exec(`
    CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester TEXT NOT NULL,
        year INTEGER NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_current INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// 院系表
db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// 选课表
db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrollment_date TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'enrolled',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
    )
`);

console.log('👤 正在创建初始账号...');

// 检查并插入管理员（使用明文密码，后面会用到bcrypt）
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('admin123', 10);

const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
    db.prepare(`
        INSERT INTO users (username, password, name, email, role) 
        VALUES (?, ?, ?, ?, ?)
    `).run('admin', hashedPassword, '系统管理员', 'admin@school.edu', 'admin');
    
    console.log('✅ 管理员账号已创建: admin / admin123');
}

// 创建一些测试教师
const teacherExists = db.prepare('SELECT id FROM users WHERE username = ?').get('teacher1');
if (!teacherExists) {
    const insertTeacher = db.prepare(`
        INSERT INTO users (username, password, name, email, role) 
        VALUES (?, ?, ?, ?, ?)
    `);
    insertTeacher.run('teacher1', hashedPassword, '张老师', 'teacher1@school.edu', 'teacher');
    insertTeacher.run('teacher2', hashedPassword, '李老师', 'teacher2@school.edu', 'teacher');
    
    // 教师扩展信息
    db.prepare(`INSERT INTO teachers (user_id, teacher_no, department, title, specialty) VALUES (?, ?, ?, ?, ?)`).run(2, 'T001', '计算机科学系', '教授', '数据结构与算法');
    db.prepare(`INSERT INTO teachers (user_id, teacher_no, department, title, specialty) VALUES (?, ?, ?, ?, ?)`).run(3, 'T002', '数学系', '副教授', '高等数学');
    
    console.log('✅ 教师账号已创建: teacher1, teacher2');
}

// 创建一些测试学生
const studentExists = db.prepare('SELECT id FROM users WHERE username = ?').get('student1');
if (!studentExists) {
    const insertStudent = db.prepare(`
        INSERT INTO users (username, password, name, email, role) 
        VALUES (?, ?, ?, ?, ?)
    `);
    insertStudent.run('student1', hashedPassword, '王小明', 'student1@school.edu', 'student');
    insertStudent.run('student2', hashedPassword, '李小红', 'student2@school.edu', 'student');
    
    // 学生扩展信息
    db.prepare(`INSERT INTO students (user_id, student_no, class_name, major, enrollment_year) VALUES (?, ?, ?, ?, ?)`).run(4, 'S2021001', '计算机21-1班', '计算机科学与技术', 2021);
    db.prepare(`INSERT INTO students (user_id, student_no, class_name, major, enrollment_year) VALUES (?, ?, ?, ?, ?)`).run(5, 'S2021002', '计算机21-2班', '软件工程', 2021);
    
    console.log('✅ 学生账号已创建: student1, student2');
}

// 创建测试课程
const courseExists = db.prepare('SELECT id FROM courses WHERE course_code = ?').get('CS101');
if (!courseExists) {
    db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('CS101', '数据结构', 1, 4.0, '春季', 2024, '本课程讲授数据结构的基本概念、算法分析和常用数据结构的应用。', 60);
    db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('CS102', '计算机网络', 1, 3.0, '春季', 2024, '介绍计算机网络的基本原理、协议和应用。', 50);
    db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('MATH201', '高等数学', 2, 5.0, '春季', 2024, '大学数学基础课程，包括微积分、线性代数等内容。', 80);
    
    console.log('✅ 测试课程已创建');
}

// 创建测试成绩
const scoreExists = db.prepare('SELECT id FROM scores LIMIT 1').get();
if (!scoreExists) {
    db.prepare(`INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)`).run(1, 1, '春季', 2024, 85.5, 'B');
    db.prepare(`INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)`).run(1, 2, '春季', 2024, 92.0, 'A');
    db.prepare(`INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)`).run(1, 3, '春季', 2024, 78.0, 'C');
    db.prepare(`INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)`).run(2, 1, '春季', 2024, 88.0, 'B');
    db.prepare(`INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)`).run(2, 2, '春季', 2024, 95.0, 'A');
    
    console.log('✅ 测试成绩已创建');
}

// 创建测试公告
const announcementExists = db.prepare('SELECT id FROM announcements LIMIT 1').get();
if (!announcementExists) {
    db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run('欢迎使用智慧校园管理系统', '欢迎各位师生使用智慧校园管理系统！本系统提供学生管理、教师管理、课程管理、成绩管理等功能。如有问题请联系管理员。', 1, 'news', 'important', 1);
    db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run('关于期末考试安排的通知', '本学期期末考试将于6月15日开始，请各位同学做好复习准备。具体考试安排请查看教务处通知。', 1, 'notice', 'normal', 0);
    db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run('图书馆暑假开放时间调整', '图书馆暑假期间开放时间调整为9:00-17:00，周末不开放。', 1, 'notice', 'normal', 0);
    
    console.log('✅ 测试公告已创建');
}

// 创建学期
const semesterExists = db.prepare('SELECT id FROM semesters LIMIT 1').get();
if (!semesterExists) {
    db.prepare(`INSERT INTO semesters (semester, year, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?)`).run('春季', 2024, '2024-02-26', '2024-07-05', 1);
    
    console.log('✅ 学期信息已创建');
}

// 创建院系
const deptExists = db.prepare('SELECT id FROM departments LIMIT 1').get();
if (!deptExists) {
    db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('计算机科学系', 'CS', '负责计算机科学与技术相关专业的教学和研究');
    db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('数学系', 'MATH', '负责数学相关专业的教学和研究');
    db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('外国语学院', 'FL', '负责外语相关专业的教学和研究');
    
    console.log('✅ 院系信息已创建');
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  ✅ 数据库初始化完成！');
console.log('═══════════════════════════════════════════');
console.log('📂 数据库文件位置:', dbPath);
console.log('');
console.log('🔐 默认账号:');
console.log('   管理员: admin / admin123');
console.log('   教师: teacher1 / admin123');
console.log('         teacher2 / admin123');
console.log('   学生: student1 / admin123');
console.log('         student2 / admin123');
console.log('');

db.close();
