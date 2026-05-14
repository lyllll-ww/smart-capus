/**
 * 完整的数据库初始化脚本
 * 创建所有必要的表并插入正确分布的学生数据
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');
const dataDir = path.join(__dirname, '..', 'data');

// 确保data目录存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 删除旧数据库
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️ 已删除旧数据库');
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 默认密码哈希
const hashedPassword = bcrypt.hashSync('admin123', 10);

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  📦 智慧校园系统数据库初始化');
console.log('═══════════════════════════════════════════');
console.log('');

// 创建表
console.log('📋 创建数据表...');

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

db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

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

console.log('✅ 数据表创建完成');

// 创建管理员
console.log('');
console.log('👤 创建管理员账号...');
db.prepare(`
    INSERT INTO users (username, password, name, email, role)
    VALUES (?, ?, ?, ?, ?)
`).run('admin', hashedPassword, '系统管理员', 'admin@school.edu', 'admin');
console.log('✅ 管理员: admin / admin123');

// 创建教师
console.log('');
console.log('👨‍🏫 创建教师账号...');
db.prepare(`INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)`).run('teacher1', hashedPassword, '张老师', 'teacher1@school.edu', 'teacher');
db.prepare(`INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)`).run('teacher2', hashedPassword, '李老师', 'teacher2@school.edu', 'teacher');
db.prepare(`INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)`).run('teacher3', hashedPassword, '王老师', 'teacher3@school.edu', 'teacher');

db.prepare(`INSERT INTO teachers (user_id, teacher_no, department, title, specialty) VALUES (?, ?, ?, ?, ?)`).run(2, 'T001', '计算机学院', '教授', '数据结构与算法');
db.prepare(`INSERT INTO teachers (user_id, teacher_no, department, title, specialty) VALUES (?, ?, ?, ?, ?)`).run(3, 'T002', '数学学院', '副教授', '高等数学');
db.prepare(`INSERT INTO teachers (user_id, teacher_no, department, title, specialty) VALUES (?, ?, ?, ?, ?)`).run(4, 'T003', '软件学院', '讲师', '软件工程');
console.log('✅ 教师账号: teacher1, teacher2, teacher3 / admin123');

// 创建课程
console.log('');
console.log('📚 创建课程...');
db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('CS101', '数据结构与算法', 1, 4.0, '春季', 2024, '本课程主要讲授数据结构的基本概念和常用算法。', 60);
db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('CS102', '操作系统', 2, 3.5, '春季', 2024, '介绍操作系统的原理、设计和实现。', 55);
db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('CS201', '计算机网络', 1, 3.0, '春季', 2024, '讲解计算机网络体系结构和协议。', 60);
db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('SE101', '软件工程导论', 3, 3.0, '春季', 2024, '软件工程基本概念和方法论。', 50);
db.prepare(`INSERT INTO courses (course_code, course_name, teacher_id, credits, semester, semester_year, description, max_students) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('MATH101', '高等数学', 2, 5.0, '春季', 2024, '大学数学基础课程。', 100);
console.log('✅ 课程创建完成');

// 学生数据 - 按年级分布
console.log('');
console.log('🎓 创建学生账号...');

const students = {
    // 2024级 20人
    2024: [
        { no: '2024001', name: '张伟', class: '计算机2024-1班', major: '计算机科学与技术' },
        { no: '2024002', name: '李娜', class: '计算机2024-1班', major: '计算机科学与技术' },
        { no: '2024003', name: '王浩', class: '计算机2024-2班', major: '计算机科学与技术' },
        { no: '2024004', name: '刘芳', class: '计算机2024-2班', major: '计算机科学与技术' },
        { no: '2024005', name: '陈明', class: '软件2024-1班', major: '软件工程' },
        { no: '2024006', name: '杨丽', class: '软件2024-1班', major: '软件工程' },
        { no: '2024007', name: '赵强', class: '软件2024-2班', major: '软件工程' },
        { no: '2024008', name: '黄敏', class: '软件2024-2班', major: '软件工程' },
        { no: '2024009', name: '周杰', class: '网络2024-1班', major: '网络工程' },
        { no: '2024010', name: '吴婷', class: '网络2024-1班', major: '网络工程' },
        { no: '2024011', name: '徐磊', class: '计科2024-1班', major: '计算机科学与技术' },
        { no: '2024012', name: '孙悦', class: '计科2024-1班', major: '计算机科学与技术' },
        { no: '2024013', name: '马超', class: '大数据2024-1班', major: '数据科学与大数据技术' },
        { no: '2024014', name: '胡静', class: '大数据2024-1班', major: '数据科学与大数据技术' },
        { no: '2024015', name: '朱刚', class: '人工智能2024-1班', major: '人工智能' },
        { no: '2024016', name: '林梅', class: '人工智能2024-1班', major: '人工智能' },
        { no: '2024017', name: '高峰', class: '信息安全2024-1班', major: '信息安全' },
        { no: '2024018', name: '夏雪', class: '信息安全2024-1班', major: '信息安全' },
        { no: '2024019', name: '邓军', class: '物联网2024-1班', major: '物联网工程' },
        { no: '2024020', name: '罗娟', class: '物联网2024-1班', major: '物联网工程' }
    ],
    // 2023级 20人
    2023: [
        { no: '2023001', name: '刘洋', class: '计算机2023-1班', major: '计算机科学与技术' },
        { no: '2023002', name: '陈秀英', class: '计算机2023-1班', major: '计算机科学与技术' },
        { no: '2023003', name: '杨帆', class: '软件2023-1班', major: '软件工程' },
        { no: '2023004', name: '黄莉', class: '软件2023-1班', major: '软件工程' },
        { no: '2023005', name: '周志远', class: '网络2023-1班', major: '网络工程' },
        { no: '2023006', name: '吴小燕', class: '网络2023-1班', major: '网络工程' },
        { no: '2023007', name: '徐建国', class: '计科2023-1班', major: '计算机科学与技术' },
        { no: '2023008', name: '孙晓丽', class: '计科2023-1班', major: '计算机科学与技术' },
        { no: '2023009', name: '马晓东', class: '大数据2023-1班', major: '数据科学与大数据技术' },
        { no: '2023010', name: '胡晓梅', class: '大数据2023-1班', major: '数据科学与大数据技术' },
        { no: '2023011', name: '朱志明', class: '人工智能2023-1班', major: '人工智能' },
        { no: '2023012', name: '林晓红', class: '人工智能2023-1班', major: '人工智能' },
        { no: '2023013', name: '高峰', class: '信息安全2023-1班', major: '信息安全' },
        { no: '2023014', name: '夏雨', class: '信息安全2023-1班', major: '信息安全' },
        { no: '2023015', name: '邓小刚', class: '物联网2023-1班', major: '物联网工程' },
        { no: '2023016', name: '韩志远', class: '计算机2023-2班', major: '计算机科学与技术' },
        { no: '2023017', name: '冯晓红', class: '计算机2023-2班', major: '计算机科学与技术' },
        { no: '2023018', name: '何志强', class: '软件2023-2班', major: '软件工程' },
        { no: '2023019', name: '姜美玲', class: '网络2023-2班', major: '网络工程' },
        { no: '2023020', name: '蒋志鹏', class: '计科2023-2班', major: '计算机科学与技术' }
    ],
    // 2022级 10人
    2022: [
        { no: '2022001', name: '罗晓华', class: '计算机2022-1班', major: '计算机科学与技术' },
        { no: '2022002', name: '刘志强', class: '计算机2022-1班', major: '计算机科学与技术' },
        { no: '2022003', name: '陈美玲', class: '软件2022-1班', major: '软件工程' },
        { no: '2022004', name: '杨志刚', class: '软件2022-1班', major: '软件工程' },
        { no: '2022005', name: '赵晓燕', class: '网络2022-1班', major: '网络工程' },
        { no: '2022006', name: '黄志鹏', class: '网络2022-1班', major: '网络工程' },
        { no: '2022007', name: '周美红', class: '计科2022-1班', major: '计算机科学与技术' },
        { no: '2022008', name: '吴志强', class: '计科2022-1班', major: '计算机科学与技术' },
        { no: '2022009', name: '徐晓梅', class: '大数据2022-1班', major: '数据科学与大数据技术' },
        { no: '2022010', name: '孙志远', class: '大数据2022-1班', major: '数据科学与大数据技术' }
    ],
    // 2021级 5人
    2021: [
        { no: '2021001', name: '马晓丽', class: '计算机2021-1班', major: '计算机科学与技术' },
        { no: '2021002', name: '胡志明', class: '计算机2021-1班', major: '计算机科学与技术' },
        { no: '2021003', name: '朱美红', class: '软件2021-1班', major: '软件工程' },
        { no: '2021004', name: '林志强', class: '软件2021-1班', major: '软件工程' },
        { no: '2021005', name: '高晓燕', class: '网络2021-1班', major: '网络工程' }
    ]
};

let studentCount = 0;
const password2024 = bcrypt.hashSync('student123', 10);

for (const [grade, list] of Object.entries(students)) {
    for (const s of list) {
        // 创建用户
        db.prepare(`
            INSERT INTO users (username, password, name, email, role)
            VALUES (?, ?, ?, ?, 'student')
        `).run(s.no, password2024, s.name, `${s.no.toLowerCase()}@student.edu`);
        
        // 创建学生扩展信息
        db.prepare(`
            INSERT INTO students (user_id, student_no, class_name, major, enrollment_year)
            VALUES (?, ?, ?, ?, ?)
        `).run(studentCount + 5, s.no, s.class, s.major, parseInt(grade));
        
        studentCount++;
    }
}

console.log('✅ 学生账号创建完成');

// 创建公告
console.log('');
console.log('📢 创建公告...');
db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run(
    '2024年春季学期开学通知',
    '各位老师、同学：\n\n新学期将于2024年3月1日正式开学，请大家做好准备。\n\n1. 请于2月28日前完成注册\n2. 课程表可在教务系统查询\n3. 如有疑问请联系教务处',
    1, 'notice', 'normal', 1
);
db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run(
    '关于举办校园科技文化节的通知',
    '为丰富校园文化生活，提升学生综合素质，学校将于4月举办第十届校园科技文化节。届时将有各类科技竞赛、讲座和展览活动，欢迎广大师生积极参与。',
    1, 'activity', 'normal', 0
);
db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run(
    '图书馆开放时间调整公告',
    '为更好地服务师生，图书馆自3月1日起调整开放时间为：\n周一至周五：8:00-22:00\n周六周日：9:00-21:00\n\n请各位读者合理安排时间。',
    1, 'notice', 'normal', 0
);
db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run(
    '关于开展2024年度教学质量评估的通知',
    '各学院、各位老师：\n\n为全面提升学校教学质量，现开展2024年度教学质量评估工作。请各位老师于5月15日前完成自评报告，学院将于5月底前完成评审。具体评估指标和操作流程详见教务系统。',
    1, 'notice', 'normal', 0
);
db.prepare(`INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) VALUES (?, ?, ?, ?, ?, ?)`).run(
    '关于举办计算机程序设计大赛的通知',
    '为激发学生学习编程的兴趣，培养创新精神和团队协作能力，学校决定举办第十五届计算机程序设计大赛。\n\n报名时间：4月1日至4月20日\n比赛时间：5月8日\n参赛对象：全校本科生\n奖项设置：一等奖3名，二等奖10名，三等奖20名\n\n欢迎广大同学踊跃报名参赛！',
    1, 'activity', 'normal', 1
);
console.log('✅ 公告创建完成');

// 创建成绩数据
console.log('');
console.log('📊 创建成绩数据...');
const scoreStudents = db.prepare('SELECT id FROM students WHERE enrollment_year = 2024 LIMIT 5').all();
const courses = db.prepare('SELECT id FROM courses').all();

for (const student of scoreStudents) {
    for (const course of courses) {
        const score = Math.floor(Math.random() * 30) + 70; // 70-100分
        let grade = 'D';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        
        db.prepare(`
            INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(student.id, course.id, '春季', 2024, score, grade);
    }
}
console.log('✅ 成绩数据创建完成');

// 创建学期和院系
db.prepare(`INSERT INTO semesters (semester, year, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?)`).run('春季', 2024, '2024-02-26', '2024-07-05', 1);
db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('计算机学院', 'CS', '负责计算机科学与技术相关专业的教学和研究');
db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('软件学院', 'SE', '负责软件工程相关专业的教学和研究');
db.prepare(`INSERT INTO departments (name, code, description) VALUES (?, ?, ?)`).run('数学学院', 'MATH', '负责数学相关专业的教学和研究');

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  ✅ 数据库初始化完成！');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('📂 数据库文件:', dbPath);
console.log('');
console.log('📊 学生统计:');
const stats = db.prepare('SELECT enrollment_year, COUNT(*) as count FROM students GROUP BY enrollment_year ORDER BY enrollment_year DESC').all();
for (const s of stats) {
    console.log(`   ${s.enrollment_year}级: ${s.count}人`);
}
console.log(`   总计: ${studentCount}人`);
console.log('');
console.log('🔐 默认账号:');
console.log('   管理员: admin / admin123');
console.log('   教师: teacher1 / admin123');
console.log('   学生: 学号 / student123');
console.log('');

db.close();
