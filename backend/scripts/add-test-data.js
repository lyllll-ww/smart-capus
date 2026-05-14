/**
 * 批量添加测试数据
 * 50个学生 + 10个老师
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const departments = ['计算机科学系', '数学系', '物理系', '外语系', '体育系'];
const titles = ['教授', '副教授', '讲师', '助教', '高级讲师'];
const majors = ['计算机科学与技术', '软件工程', '数学与应用数学', '物理学', '英语'];
const classes = ['1班', '2班', '3班', '4班', '5班'];
const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
    return randomItem(surnames) + randomItem(givenNames);
}

function generatePhone() {
    return '138' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

async function addStudents() {
    console.log('开始添加50个学生...');
    const insertUser = db.prepare(`
        INSERT INTO users (username, password, name, email, phone, role, avatar) 
        VALUES (?, ?, ?, ?, ?, 'student', '/uploads/default-avatar.png')
    `);
    
    const insertStudent = db.prepare(`
        INSERT INTO students (user_id, student_no, class_name, major, enrollment_year)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    console.log(`当前已有 ${existingCount} 名学生`);
    
    const startYear = 2024;
    const addedStudents = [];
    
    for (let i = 1; i <= 50; i++) {
        const studentNo = `2024${String(i).padStart(4, '0')}`;
        const username = `student${studentNo}`;
        const password = '123456';
        const name = generateName();
        const email = `${username}@school.edu`;
        const phone = generatePhone();
        const className = `${startYear}级${randomItem(majors)}${randomItem(classes)}`;
        const major = randomItem(majors);
        
        // 加密密码
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        try {
            const userResult = insertUser.run(username, hashedPassword, name, email, phone);
            const userId = userResult.lastInsertRowid;
            
            insertStudent.run(userId, studentNo, className, major, startYear);
            addedStudents.push({ studentNo, name, major, className });
            
            if (i % 10 === 0) {
                console.log(`已添加 ${i} 名学生...`);
            }
        } catch (error) {
            if (error.message.includes('UNIQUE')) {
                console.log(`学生 ${studentNo} 已存在，跳过`);
            } else {
                console.error(`添加学生 ${studentNo} 失败:`, error.message);
            }
        }
    }
    
    console.log(`✅ 学生添加完成，共添加 ${addedStudents.length} 名`);
    return addedStudents;
}

async function addTeachers() {
    console.log('\n开始添加10个老师...');
    const insertUser = db.prepare(`
        INSERT INTO users (username, password, name, email, phone, role, avatar) 
        VALUES (?, ?, ?, ?, ?, 'teacher', '/uploads/default-avatar.png')
    `);
    
    const insertTeacher = db.prepare(`
        INSERT INTO teachers (user_id, teacher_no, department, title, specialty)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get().count;
    console.log(`当前已有 ${existingCount} 名教师`);
    
    const addedTeachers = [];
    
    for (let i = 1; i <= 10; i++) {
        const teacherNo = `T${String(i).padStart(4, '0')}`;
        const username = `teacher${teacherNo}`;
        const password = '123456';
        const name = generateName();
        const email = `${username}@school.edu`;
        const phone = generatePhone();
        const department = randomItem(departments);
        const title = randomItem(titles);
        const specialty = randomItem(majors);
        
        // 加密密码
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        try {
            const userResult = insertUser.run(username, hashedPassword, name, email, phone);
            const userId = userResult.lastInsertRowid;
            
            insertTeacher.run(userId, teacherNo, department, title, specialty);
            addedTeachers.push({ teacherNo, name, department, title });
            
            console.log(`已添加教师: ${name} (${teacherNo})`);
        } catch (error) {
            if (error.message.includes('UNIQUE')) {
                console.log(`教师 ${teacherNo} 已存在，跳过`);
            } else {
                console.error(`添加教师 ${teacherNo} 失败:`, error.message);
            }
        }
    }
    
    console.log(`✅ 教师添加完成，共添加 ${addedTeachers.length} 名`);
    return addedTeachers;
}

async function main() {
    console.log('========================================');
    console.log('    智慧校园系统 - 批量添加测试数据');
    console.log('========================================\n');
    
    try {
        await addStudents();
        await addTeachers();
        
        // 输出统计
        const stats = {
            students: db.prepare('SELECT COUNT(*) as count FROM students').get().count,
            teachers: db.prepare('SELECT COUNT(*) as count FROM teachers').get().count,
            users: db.prepare('SELECT COUNT(*) as count FROM users').get().count
        };
        
        console.log('\n========================================');
        console.log('    数据统计');
        console.log('========================================');
        console.log(`用户总数: ${stats.users}`);
        console.log(`学生总数: ${stats.students}`);
        console.log(`教师总数: ${stats.teachers}`);
        console.log('\n新账号密码统一为: 123456');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('批量添加数据失败:', error);
    } finally {
        db.close();
    }
}

main();
