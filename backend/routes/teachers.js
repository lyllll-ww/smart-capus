/**
 * 教师管理路由
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

        const { keyword, department, title } = req.query;

        let whereConditions = [];
        let params = [];

        if (keyword) {
            whereConditions.push('(t.teacher_no LIKE ? OR u.name LIKE ?)');
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (department) {
            whereConditions.push('t.department = ?');
            params.push(department);
        }
        if (title) {
            whereConditions.push('t.title = ?');
            params.push(title);
        }

        const whereSQL = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const list = await query(
            `SELECT t.id, t.teacher_no, t.gender, t.department, t.title, t.specialty, 
                    u.name, u.email, u.phone, u.avatar
             FROM teachers t
             LEFT JOIN users u ON t.user_id = u.id
             ${whereSQL} 
             ORDER BY t.id DESC 
             LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        const totalResult = await query(
            `SELECT COUNT(*) as total FROM teachers t LEFT JOIN users u ON t.user_id = u.id ${whereSQL}`,
            params
        );
        const total = totalResult[0]?.total || 0;

        for (const teacher of list || []) {
            const courseCountResult = await query(
                'SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?',
                [teacher.id]
            );
            teacher.course_count = courseCountResult[0]?.count || 0;
        }

        res.json({
            success: true,
            list: list || [],
            total: total,
            page,
            pageSize
        });
    } catch (error) {
        console.error('获取教师列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const teachers = await query(
            `SELECT t.id, t.teacher_no, t.gender, t.department, t.title, t.specialty,
                    u.name, u.email, u.phone, u.avatar
             FROM teachers t
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.id = ?`,
            [id]
        );

        if (!teachers || teachers.length === 0) {
            return res.status(404).json({ success: false, message: '教师不存在' });
        }

        const courses = await query(
            'SELECT * FROM courses WHERE teacher_id = ? ORDER BY semester_year DESC, semester DESC',
            [id]
        );

        const statsResult = await query(
            `SELECT 
                COUNT(DISTINCT sc.student_id) as student_count,
                AVG(sc.score) as avg_score
             FROM scores sc
             JOIN courses c ON sc.course_id = c.id
             WHERE c.teacher_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                teacher: teachers[0],
                courses: courses || [],
                stats: statsResult[0] || {}
            }
        });
    } catch (error) {
        console.error('获取教师详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { teacher_no, name, gender, department, title, specialty, email, phone } = req.body;

        if (!teacher_no) {
            return res.status(400).json({ success: false, message: '工号不能为空' });
        }

        const existing = await query('SELECT id FROM teachers WHERE teacher_no = ?', [teacher_no]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: '该工号已存在' });
        }

        const username = teacher_no;
        const defaultPassword = '123456';
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

        const userResult = await query(
            `INSERT INTO users (username, password, name, email, phone, role) 
             VALUES (?, ?, ?, ?, ?, 'teacher')`,
            [username, hashedPassword, name || teacher_no, email, phone]
        );

        const userId = userResult.lastInsertRowid || userResult[0]?.id;

        const teacherResult = await query(
            `INSERT INTO teachers (user_id, teacher_no, gender, department, title, specialty) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, teacher_no, gender || '男', department, title, specialty]
        );

        const newId = teacherResult.lastInsertRowid || teacherResult[0]?.id;
        const newTeacher = await query(
            `SELECT t.id, t.teacher_no, t.gender, t.department, t.title, t.specialty,
                    u.name, u.email, u.phone, u.avatar
             FROM teachers t
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.id = ?`,
            [newId]
        );

        newTeacher[0].course_count = 0;

        res.status(201).json({
            success: true,
            message: '添加成功',
            data: { teacher: newTeacher[0] }
        });
    } catch (error) {
        console.error('添加教师错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_no, name, gender, department, title, specialty, email, phone } = req.body;

        const existing = await query('SELECT * FROM teachers WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '教师不存在' });
        }

        const teacher = existing[0];

        if (teacher_no && teacher_no !== teacher.teacher_no) {
            const conflict = await query('SELECT id FROM teachers WHERE teacher_no = ? AND id != ?', [teacher_no, id]);
            if (conflict && conflict.length > 0) {
                return res.status(400).json({ success: false, message: '该工号已被其他教师使用' });
            }
        }

        await query(
            `UPDATE teachers SET 
             teacher_no = COALESCE(?, teacher_no),
             gender = COALESCE(?, gender), 
             department = COALESCE(?, department), 
             title = COALESCE(?, title), 
             specialty = COALESCE(?, specialty)
             WHERE id = ?`,
            [teacher_no, gender, department, title, specialty, id]
        );

        if (name || email !== undefined || phone !== undefined) {
            await query(
                `UPDATE users SET 
                 name = COALESCE(?, name), 
                 email = COALESCE(?, email),
                 phone = COALESCE(?, phone)
                 WHERE id = ?`,
                [name, email, phone, teacher.user_id]
            );
        }

        const updatedTeacher = await query(
            `SELECT t.id, t.teacher_no, t.gender, t.department, t.title, t.specialty,
                    u.name, u.email, u.phone, u.avatar
             FROM teachers t
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.id = ?`,
            [id]
        );

        const courseCountResult = await query(
            'SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?',
            [id]
        );
        updatedTeacher[0].course_count = courseCountResult[0]?.count || 0;

        res.json({ success: true, message: '更新成功', data: { teacher: updatedTeacher[0] } });
    } catch (error) {
        console.error('更新教师错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT * FROM teachers WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '教师不存在' });
        }

        const courses = await query('SELECT id FROM courses WHERE teacher_id = ?', [id]);
        if (courses && courses.length > 0) {
            return res.status(400).json({
                success: false,
                message: `该教师仍有 ${courses.length} 门课程在授，无法删除`
            });
        }

        const teacher = existing[0];
        
        await query('DELETE FROM teachers WHERE id = ?', [id]);
        await query('DELETE FROM users WHERE id = ?', [teacher.user_id]);

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除教师错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/meta/departments', authMiddleware, async (req, res) => {
    try {
        const departments = await query(
            'SELECT DISTINCT department FROM teachers WHERE department IS NOT NULL AND department != ? ORDER BY department',
            ['']
        );

        res.json({
            success: true,
            data: { departments: (departments || []).map(d => d.department) }
        });
    } catch (error) {
        console.error('获取院系列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/meta/titles', authMiddleware, async (req, res) => {
    try {
        const titles = await query(
            'SELECT DISTINCT title FROM teachers WHERE title IS NOT NULL AND title != ? ORDER BY title',
            ['']
        );

        res.json({
            success: true,
            data: { titles: (titles || []).map(t => t.title) }
        });
    } catch (error) {
        console.error('获取职称列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

module.exports = router;
