/**
 * 批量添加成绩测试数据
 * 为所有学生生成成绩
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// 生成随机成绩 (60-100分，服从正态分布)
function randomScore() {
    // 生成0-40的随机数，然后加上60，得到60-100
    let score = 60 + Math.random() * 40;
    // 稍微偏向高分
    score = score - Math.pow(Math.random(), 2) * 10;
    return Math.round(score * 10) / 10;
}

// 根据成绩计算等级
function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

async function addScores() {
    console.log('========================================');
    console.log('    智慧校园系统 - 批量添加成绩数据');
    console.log('========================================\n');

    // 获取所有学生
    const students = db.prepare('SELECT id FROM students').all();
    console.log(`共有 ${students.length} 名学生`);

    // 获取所有课程
    const courses = db.prepare('SELECT id, credits FROM courses').all();
    console.log(`共有 ${courses.length} 门课程\n`);

    // 获取当前成绩数量
    const currentScores = db.prepare('SELECT COUNT(*) as count FROM scores').get().count;
    console.log(`当前已有 ${currentScores} 条成绩记录`);

    // 插入成绩
    const insert = db.prepare(`
        INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let addedCount = 0;
    const semester = '春季';
    const semesterYear = 2024;

    // 为每个学生分配3-5门课程的成绩
    for (const student of students) {
        // 随机选择3-5门课程
        const numCourses = 3 + Math.floor(Math.random() * 3);
        const selectedCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, numCourses);

        for (const course of selectedCourses) {
            const score = randomScore();
            const grade = getGrade(score);

            try {
                // 检查是否已有该成绩
                const exist = db.prepare(
                    'SELECT id FROM scores WHERE student_id = ? AND course_id = ?'
                ).get(student.id, course.id);

                if (!exist) {
                    db.prepare(
                        'INSERT INTO scores (student_id, course_id, semester, semester_year, score, grade) VALUES (?, ?, ?, ?, ?, ?)'
                    ).run(student.id, course.id, semester, semesterYear, score, grade);
                    addedCount++;
                }
            } catch (error) {
                if (!error.message.includes('UNIQUE')) {
                    console.error(`添加成绩失败:`, error.message);
                }
            }
        }
    }

    console.log(`\n✅ 本次新增 ${addedCount} 条成绩记录`);

    // 统计
    const stats = db.prepare(`
        SELECT
            COUNT(*) as total_scores,
            AVG(score) as avg_score,
            MAX(score) as max_score,
            MIN(score) as min_score,
            COUNT(DISTINCT student_id) as students_with_scores,
            COUNT(DISTINCT course_id) as courses_with_scores
        FROM scores WHERE score IS NOT NULL
    `).get();

    console.log('\n========================================');
    console.log('    成绩统计');
    console.log('========================================');
    console.log(`成绩记录总数: ${stats.total_scores}`);
    console.log(`参与学生数: ${stats.students_with_scores}`);
    console.log(`涉及课程数: ${stats.courses_with_scores}`);
    console.log(`平均成绩: ${stats.avg_score?.toFixed(2) || 0}`);
    console.log(`最高成绩: ${stats.max_score || 0}`);
    console.log(`最低成绩: ${stats.min_score || 0}`);
    console.log('========================================\n');

    db.close();
}

addScores();
