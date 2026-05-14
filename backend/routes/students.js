/**
 * 学生管理路由
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

        const { keyword, class: studentClass, grade } = req.query;

        let whereConditions = [];
        let params = [];

        if (keyword) {
            whereConditions.push('(s.student_no LIKE ? OR u.name LIKE ?)');
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (studentClass) {
            whereConditions.push('s.class_name = ?');
            params.push(studentClass);
        }
        if (grade) {
            whereConditions.push('s.enrollment_year = ?');
            params.push(parseInt(grade));
        }

        const whereSQL = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const list = await query(
            `SELECT s.id, s.student_no, s.gender, s.class_name, s.major, s.enrollment_year,
                    u.name, u.email, u.phone, u.avatar
             FROM students s
             LEFT JOIN users u ON s.user_id = u.id
             ${whereSQL}
             ORDER BY s.id DESC
             LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM students s ${whereSQL}`,
            params
        );
        const total = countResult[0]?.total || 0;

        for (const student of list || []) {
            const scoreResult = await query(
                'SELECT COUNT(*) as count, AVG(score) as avg FROM scores WHERE student_id = ?',
                [student.id]
            );
            student.score_count = scoreResult[0]?.count || 0;
            student.avg_score = scoreResult[0]?.avg ? parseFloat(scoreResult[0].avg.toFixed(2)) : null;
        }

        res.json({
            success: true,
            list: list || [],
            total: total || 0,
            page,
            pageSize
        });
    } catch (error) {
        console.error('获取学生列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const students = await query(
            `SELECT s.id, s.student_no, s.gender, s.class_name, s.major, s.enrollment_year,
                    u.name, u.email, u.phone, u.avatar
             FROM students s
             LEFT JOIN users u ON s.user_id = u.id
             WHERE s.id = ?`,
            [id]
        );

        if (!students || students.length === 0) {
            return res.status(404).json({ success: false, message: '学生不存在' });
        }

        const scores = await query(
            `SELECT sc.id, sc.score, sc.exam_type, sc.exam_date, sc.created_at,
                    c.course_code, c.course_name, c.credits, t.name as teacher_name
             FROM scores sc 
             JOIN courses c ON sc.course_id = c.id
             LEFT JOIN teachers t ON c.teacher_id = t.id
             WHERE sc.student_id = ?
             ORDER BY sc.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            data: { student: students[0], scores: scores || [] }
        });
    } catch (error) {
        console.error('获取学生详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { student_no, name, gender, class: studentClass, class_name, major, enrollment_year, phone, email } = req.body;

        if (!student_no) {
            return res.status(400).json({ success: false, message: '学号不能为空' });
        }

        const existing = await query('SELECT id FROM students WHERE student_no = ?', [student_no]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: '该学号已存在' });
        }

        const classValue = class_name || studentClass;

        const username = student_no;
        const defaultPassword = '123456';
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

        const userResult = await query(
            `INSERT INTO users (username, password, name, email, phone, role)
             VALUES (?, ?, ?, ?, ?, 'student')`,
            [username, hashedPassword, name || student_no, email, phone]
        );

        const userId = userResult.lastInsertRowid || userResult[0]?.id;

        const studentResult = await query(
            `INSERT INTO students (user_id, student_no, gender, class_name, major, enrollment_year)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, student_no, gender || '男', classValue, major, enrollment_year]
        );

        const newId = studentResult.lastInsertRowid || studentResult[0]?.id;
        const newStudent = await query(
            `SELECT s.id, s.student_no, s.gender, s.class_name, s.major, s.enrollment_year,
                    u.name, u.email, u.phone
             FROM students s
             LEFT JOIN users u ON s.user_id = u.id
             WHERE s.id = ?`,
            [newId]
        );

        res.status(201).json({
            success: true,
            message: '添加成功',
            data: { student: newStudent[0] }
        });
    } catch (error) {
        console.error('添加学生错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { student_no, name, gender, class: studentClass, class_name, major, enrollment_year, phone, email } = req.body;

        const existing = await query('SELECT * FROM students WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '学生不存在' });
        }

        const student = existing[0];

        if (student_no && student_no !== student.student_no) {
            const conflict = await query('SELECT id FROM students WHERE student_no = ? AND id != ?', [student_no, id]);
            if (conflict && conflict.length > 0) {
                return res.status(400).json({ success: false, message: '该学号已被其他学生使用' });
            }
        }

        const classValue = class_name || studentClass;

        await query(
            `UPDATE students SET 
             student_no = COALESCE(?, student_no),
             gender = COALESCE(?, gender),
             class_name = COALESCE(?, class_name),
             major = COALESCE(?, major),
             enrollment_year = COALESCE(?, enrollment_year)
             WHERE id = ?`,
            [student_no, gender, classValue, major, enrollment_year, id]
        );

        if (name || phone !== undefined || email !== undefined) {
            await query(
                `UPDATE users SET 
                 name = COALESCE(?, name), 
                 phone = COALESCE(?, phone),
                 email = COALESCE(?, email)
                 WHERE id = ?`,
                [name, phone, email, student.user_id]
            );
        }

        const updatedStudent = await query(
            `SELECT s.id, s.student_no, s.gender, s.class_name, s.major, s.enrollment_year,
                    u.name, u.email, u.phone, u.avatar
             FROM students s
             LEFT JOIN users u ON s.user_id = u.id
             WHERE s.id = ?`,
            [id]
        );

        res.json({ success: true, message: '更新成功', data: { student: updatedStudent[0] } });
    } catch (error) {
        console.error('更新学生错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT * FROM students WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '学生不存在' });
        }

        const student = existing[0];

        const scores = await query('SELECT id FROM scores WHERE student_id = ?', [id]);
        if (scores && scores.length > 0) {
            return res.status(400).json({
                success: false,
                message: `该学生有 ${scores.length} 条成绩记录，请先删除成绩`
            });
        }

        await query('DELETE FROM students WHERE id = ?', [id]);
        await query('DELETE FROM users WHERE id = ?', [student.user_id]);

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除学生错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

module.exports = router;
