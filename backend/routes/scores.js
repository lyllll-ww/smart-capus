/**
 * 成绩管理路由
 */

const express = require('express');
const { query } = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const { studentId, courseId, semester, minScore, maxScore } = req.query;

        let whereConditions = [];
        let params = [];

        if (studentId) {
            whereConditions.push('sc.student_id = ?');
            params.push(parseInt(studentId));
        }
        if (courseId) {
            whereConditions.push('sc.course_id = ?');
            params.push(parseInt(courseId));
        }
        if (semester) {
            whereConditions.push('sc.semester = ?');
            params.push(semester);
        }
        if (minScore) {
            whereConditions.push('sc.score >= ?');
            params.push(parseFloat(minScore));
        }
        if (maxScore) {
            whereConditions.push('sc.score <= ?');
            params.push(parseFloat(maxScore));
        }

        const whereSQL = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const list = await query(
            `SELECT sc.*, 
                    u.name as student_name, s.student_no, s.class_name,
                    c.course_name, c.credits, c.course_code
             FROM scores sc
             JOIN students s ON sc.student_id = s.id
             JOIN users u ON s.user_id = u.id
             JOIN courses c ON sc.course_id = c.id
             ${whereSQL}
             ORDER BY sc.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM scores sc ${whereSQL}`,
            params
        );
        const total = countResult[0]?.total || 0;

        res.json({
            success: true,
            list: list || [],
            total: total || 0,
            page,
            pageSize
        });
    } catch (error) {
        console.error('获取成绩列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { semester } = req.query;

        const students = await query('SELECT * FROM students WHERE id = ?', [studentId]);

        if (!students || students.length === 0) {
            return res.status(404).json({ success: false, message: '学生不存在' });
        }

        let whereSQL = 'WHERE sc.student_id = ?';
        let params = [studentId];

        if (semester) {
            whereSQL += ' AND sc.semester = ?';
            params.push(semester);
        }

        const scores = await query(
            `SELECT sc.*, c.course_name, c.credits, c.course_code, u.name as teacher_name
             FROM scores sc
             JOIN courses c ON sc.course_id = c.id
             LEFT JOIN teachers t ON c.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             ${whereSQL}
             ORDER BY sc.semester DESC, c.course_name`,
            params
        );

        const stats = {
            totalCredits: 0,
            totalCourses: scores.length,
            averageScore: 0,
            maxScore: 0,
            minScore: 0,
            gpa: 0
        };

        if (scores && scores.length > 0) {
            const scoreValues = scores.filter(s => s.score !== null).map(s => s.score);
            
            stats.averageScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
            stats.maxScore = Math.max(...scoreValues);
            stats.minScore = Math.min(...scoreValues);
            
            scores.forEach(s => {
                if (s.score !== null) {
                    stats.totalCredits += parseFloat(s.credit || 0);
                }
            });

            stats.gpa = (stats.averageScore / 10) - 5;
            stats.gpa = Math.max(0, Math.min(4, stats.gpa)).toFixed(2);
        }

        res.json({
            success: true,
            data: {
                student: students[0],
                scores: scores || [],
                stats
            }
        });
    } catch (error) {
        console.error('获取学生成绩错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { student_id, course_id, score, semester, semester_year, remarks } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({ success: false, message: '学生和课程不能为空' });
        }

        const students = await query('SELECT id FROM students WHERE id = ?', [student_id]);
        if (!students || students.length === 0) {
            return res.status(400).json({ success: false, message: '学生不存在' });
        }

        const courses = await query('SELECT id, course_name FROM courses WHERE id = ?', [course_id]);
        if (!courses || courses.length === 0) {
            return res.status(400).json({ success: false, message: '课程不存在' });
        }

        const existing = await query(
            'SELECT id FROM scores WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        let result;
        if (existing && existing.length > 0) {
            await query(
                `UPDATE scores SET score = ?, semester = ?, semester_year = ?, remarks = ?
                 WHERE student_id = ? AND course_id = ?`,
                [score, semester, semester_year, remarks, student_id, course_id]
            );
            result = existing[0].id;
        } else {
            const insertResult = await query(
                `INSERT INTO scores (student_id, course_id, score, semester, semester_year, remarks) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [student_id, course_id, score, semester, semester_year, remarks]
            );
            result = insertResult.lastInsertRowid || insertResult[0]?.id;
        }

        const newScore = await query(
            `SELECT sc.*, u.name as student_name, s.student_no, c.course_name
             FROM scores sc
             JOIN students s ON sc.student_id = s.id
             JOIN users u ON s.user_id = u.id
             JOIN courses c ON sc.course_id = c.id
             WHERE sc.id = ?`,
            [result]
        );

        res.json({
            success: true,
            message: existing.length > 0 ? '成绩更新成功' : '成绩录入成功',
            data: { score: newScore[0] }
        });
    } catch (error) {
        console.error('录入成绩错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/batch', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { course_id, semester } = req.body;
        const scores = req.body.scores || [];

        if (!course_id || scores.length === 0) {
            return res.status(400).json({ success: false, message: '请提供课程ID和成绩数据' });
        }

        const courses = await query('SELECT id, course_name FROM courses WHERE id = ?', [course_id]);
        if (!courses || courses.length === 0) {
            return res.status(400).json({ success: false, message: '课程不存在' });
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (const item of scores) {
            try {
                if (!item.student_id) {
                    failCount++;
                    errors.push({ student_id: item.student_id, error: '学生ID缺失' });
                    continue;
                }

                const existing = await query(
                    'SELECT id FROM scores WHERE student_id = ? AND course_id = ?',
                    [item.student_id, course_id]
                );

                if (existing && existing.length > 0) {
                    await query(
                        `UPDATE scores SET score = ?, semester = ?, remarks = ?
                         WHERE student_id = ? AND course_id = ?`,
                        [item.score, semester || item.semester, item.remarks, item.student_id, course_id]
                    );
                } else {
                    await query(
                        `INSERT INTO scores (student_id, course_id, score, semester, semester_year, remarks) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [item.student_id, course_id, item.score, semester || item.semester, item.semester_year || 2024, item.remarks]
                    );
                }
                successCount++;
            } catch (e) {
                failCount++;
                errors.push({ student_id: item.student_id, error: e.message });
            }
        }

        res.json({
            success: true,
            message: `批量录入完成：成功 ${successCount} 条，失败 ${failCount} 条`,
            data: { successCount, failCount, errors }
        });
    } catch (error) {
        console.error('批量录入成绩错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        const { courseId, semester } = req.query;

        let whereSQL = '';
        let params = [];

        if (courseId) {
            whereSQL += ' WHERE course_id = ?';
            params.push(parseInt(courseId));
        }
        if (semester) {
            whereSQL += whereSQL ? ' AND semester = ?' : ' WHERE semester = ?';
            params.push(semester);
        }

        const overall = await query(
            `SELECT 
                COUNT(*) as total_records,
                AVG(score) as avg_score,
                MAX(score) as max_score,
                MIN(score) as min_score,
                SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellent,
                SUM(CASE WHEN score >= 80 AND score < 90 THEN 1 ELSE 0 END) as good,
                SUM(CASE WHEN score >= 70 AND score < 80 THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN score >= 60 AND score < 70 THEN 1 ELSE 0 END) as pass,
                SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as fail
             FROM scores ${whereSQL}`,
            params
        );

        const total = overall?.[0]?.total_records || 0;
        const o = overall?.[0] || {};
        const distribution = {
            excellent: total > 0 ? ((o.excellent || 0) / total * 100).toFixed(1) : 0,
            good: total > 0 ? ((o.good || 0) / total * 100).toFixed(1) : 0,
            medium: total > 0 ? ((o.medium || 0) / total * 100).toFixed(1) : 0,
            pass: total > 0 ? ((o.pass || 0) / total * 100).toFixed(1) : 0,
            fail: total > 0 ? ((o.fail || 0) / total * 100).toFixed(1) : 0,
            passRate: total > 0 ? (((o.excellent + o.good + o.medium + o.pass) / total) * 100).toFixed(1) : 0
        };

        res.json({
            success: true,
            data: {
                overall: o,
                distribution,
                total
            }
        });
    } catch (error) {
        console.error('成绩统计错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT id FROM scores WHERE id = ?', [id]);

        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '成绩记录不存在' });
        }

        await query('DELETE FROM scores WHERE id = ?', [id]);

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除成绩错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

module.exports = router;
