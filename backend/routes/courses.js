/**
 * 课程管理路由
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

        const { keyword, semester, teacherId } = req.query;

        let whereConditions = [];
        let params = [];

        if (keyword) {
            whereConditions.push('(c.course_code LIKE ? OR c.course_name LIKE ?)');
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (semester) {
            whereConditions.push('(c.semester = ? OR CONCAT(c.semester_year, c.semester) = ?)');
            params.push(semester, semester);
        }
        if (teacherId) {
            whereConditions.push('c.teacher_id = ?');
            params.push(parseInt(teacherId));
        }

        const whereSQL = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const list = await query(
            `SELECT c.id, c.course_code, c.course_name, c.teacher_id, c.credits,
                    c.semester, c.semester_year, c.description, c.max_students,
                    u.name as teacher_name, t.title as teacher_title,
                    (SELECT COUNT(*) FROM scores s WHERE s.course_id = c.id) as student_count
             FROM courses c
             LEFT JOIN teachers t ON c.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             ${whereSQL}
             ORDER BY c.id DESC 
             LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM courses c ${whereSQL}`,
            params
        );
        const total = countResult[0]?.total || 0;

        res.json({
            success: true,
            list: list || [],
            total: total,
            page,
            pageSize
        });
    } catch (error) {
        console.error('获取课程列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const courses = await query(
            `SELECT c.id, c.course_code, c.course_name, c.teacher_id, c.credits,
                    c.semester, c.semester_year, c.description, c.max_students, c.created_at,
                    u.name as teacher_name, t.title as teacher_title, t.teacher_no
             FROM courses c
             LEFT JOIN teachers t ON c.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (!courses || courses.length === 0) {
            return res.status(404).json({ success: false, message: '课程不存在' });
        }

        const students = await query(
            `SELECT st.id as student_id, st.student_no, u.name as student_name, 
                    s.id as score_id, s.score, s.exam_type, s.exam_date, s.created_at as score_date
             FROM scores s
             JOIN students st ON s.student_id = st.id
             LEFT JOIN users u ON st.user_id = u.id
             WHERE s.course_id = ?
             ORDER BY st.student_no`,
            [id]
        );

        const statsResult = await query(
            `SELECT 
                COUNT(*) as total_students,
                AVG(score) as avg_score,
                MAX(score) as max_score,
                MIN(score) as min_score,
                SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellent_count,
                SUM(CASE WHEN score >= 60 AND score < 90 THEN 1 ELSE 0 END) as pass_count,
                SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as fail_count
             FROM scores WHERE course_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                course: courses[0],
                students: students || [],
                stats: statsResult[0] || {}
            }
        });
    } catch (error) {
        console.error('获取课程详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { course_code, course_name, credits, teacher_id, semester, semester_year, max_students, description } = req.body;

        if (!course_code || !course_name) {
            return res.status(400).json({ success: false, message: '课程编号和名称不能为空' });
        }

        const existing = await query('SELECT id FROM courses WHERE course_code = ?', [course_code]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: '该课程编号已存在' });
        }

        if (teacher_id) {
            const teachers = await query('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
            if (!teachers || teachers.length === 0) {
                return res.status(400).json({ success: false, message: '指定的教师不存在' });
            }
        }

        const result = await query(
            `INSERT INTO courses (course_code, course_name, credits, teacher_id, semester, semester_year, max_students, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [course_code, course_name, credits || 3, teacher_id, semester || '春季', semester_year || new Date().getFullYear(), max_students || 50, description]
        );

        const newId = result.lastInsertRowid || result[0]?.id;
        const newCourse = await query('SELECT * FROM courses WHERE id = ?', [newId]);

        res.status(201).json({
            success: true,
            message: '添加成功',
            data: { course: newCourse[0] }
        });
    } catch (error) {
        console.error('添加课程错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { course_code, course_name, credits, teacher_id, semester, semester_year, max_students, description } = req.body;

        const existing = await query('SELECT id FROM courses WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '课程不存在' });
        }

        if (course_code) {
            const conflict = await query('SELECT id FROM courses WHERE course_code = ? AND id != ?', [course_code, id]);
            if (conflict && conflict.length > 0) {
                return res.status(400).json({ success: false, message: '该课程编号已被其他课程使用' });
            }
        }

        if (teacher_id) {
            const teachers = await query('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
            if (!teachers || teachers.length === 0) {
                return res.status(400).json({ success: false, message: '指定的教师不存在' });
            }
        }

        await query(
            `UPDATE courses SET 
             course_code = COALESCE(?, course_code), 
             course_name = COALESCE(?, course_name), 
             credits = COALESCE(?, credits),
             teacher_id = COALESCE(?, teacher_id), 
             semester = COALESCE(?, semester),
             semester_year = COALESCE(?, semester_year),
             max_students = COALESCE(?, max_students),
             description = COALESCE(?, description)
             WHERE id = ?`,
            [course_code, course_name, credits, teacher_id, semester, semester_year, max_students, description, id]
        );

        const updatedCourse = await query(
            `SELECT c.id, c.course_code, c.course_name, c.credits, c.semester, c.semester_year,
                    c.description, c.max_students, u.name as teacher_name
             FROM courses c
             LEFT JOIN teachers t ON c.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        res.json({ success: true, message: '更新成功', data: { course: updatedCourse[0] } });
    } catch (error) {
        console.error('更新课程错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT id FROM courses WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '课程不存在' });
        }

        const scores = await query('SELECT id FROM scores WHERE course_id = ?', [id]);
        if (scores && scores.length > 0) {
            return res.status(400).json({
                success: false,
                message: `该课程有 ${scores.length} 条成绩记录，请先删除成绩`
            });
        }

        await query('DELETE FROM courses WHERE id = ?', [id]);

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除课程错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/meta/semesters', authMiddleware, async (req, res) => {
    try {
        const semesters = await query(
            'SELECT DISTINCT semester FROM courses WHERE semester IS NOT NULL AND semester != ? ORDER BY semester DESC',
            ['']
        );

        res.json({
            success: true,
            data: { semesters: (semesters || []).map(s => s.semester) }
        });
    } catch (error) {
        console.error('获取学期列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

module.exports = router;
