/**
 * 向数据库添加2023级学生的脚本
 * 需要先确保数据库中已有这些学生用户
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('📦 开始添加2023级学生数据...');

// 2023级学生数据（新增5人，共20人）
const students2023 = [
    // 原有15人已在数据库中，这里添加新增的5人
    { student_no: '2023016', name: '韩志远', gender: '男', class_name: '计算机2023-2班', major: '计算机科学与技术', enrollment_year: 2023, phone: '13900002016', email: 'hanzhiyuan@student.edu' },
    { student_no: '2023017', name: '冯晓红', gender: '女', class_name: '计算机2023-2班', major: '计算机科学与技术', enrollment_year: 2023, phone: '13900002017', email: 'fengxiaohong@student.edu' },
    { student_no: '2023018', name: '何志强', gender: '男', class_name: '软件2023-2班', major: '软件工程', enrollment_year: 2023, phone: '13900002018', email: 'hezhiqiang@student.edu' },
    { student_no: '2023019', name: '姜美玲', gender: '女', class_name: '网络2023-2班', major: '网络工程', enrollment_year: 2023, phone: '13900002019', email: 'jiangmeiling@student.edu' },
    { student_no: '2023020', name: '蒋志鹏', gender: '男', class_name: '计科2023-2班', major: '计算机科学与技术', enrollment_year: 2023, phone: '13900002020', email: 'jiangzhipeng@student.edu' }
];

// 默认密码哈希
const hashedPassword = bcrypt.hashSync('123456', 10);

let addedCount = 0;

for (const student of students2023) {
    // 检查学号是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(student.student_no);
    if (existingUser) {
        console.log(`⚠️ 学号 ${student.student_no} 已存在，跳过`);
        continue;
    }

    try {
        // 1. 创建用户账号
        const userResult = db.prepare(`
            INSERT INTO users (username, password, name, email, phone, role) 
            VALUES (?, ?, ?, ?, ?, 'student')
        `).run(student.student_no, hashedPassword, student.name, student.email, student.phone);

        const userId = userResult.lastInsertRowid;

        // 2. 创建学生扩展信息
        db.prepare(`
            INSERT INTO students (user_id, student_no, class_name, major, enrollment_year) 
            VALUES (?, ?, ?, ?, ?)
        `).run(userId, student.student_no, student.class_name, student.major, student.enrollment_year);

        console.log(`✅ 已添加学生: ${student.name} (${student.student_no})`);
        addedCount++;
    } catch (error) {
        console.error(`❌ 添加学生 ${student.student_no} 失败:`, error.message);
    }
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log(`  ✅ 完成！共添加 ${addedCount} 名学生`);
console.log('═══════════════════════════════════════════');
console.log('');

// 统计各年级学生数量
const stats = db.prepare(`
    SELECT enrollment_year, COUNT(*) as count 
    FROM students 
    GROUP BY enrollment_year 
    ORDER BY enrollment_year
`).all();

console.log('📊 各年级学生统计:');
for (const stat of stats) {
    console.log(`   ${stat.enrollment_year}级: ${stat.count}人`);
}

const total = db.prepare('SELECT COUNT(*) as total FROM students').get();
console.log(`   总计: ${total.total}人`);

db.close();
