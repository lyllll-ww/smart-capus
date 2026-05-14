/**
 * 公告管理路由
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

        const { keyword, type, isPinned } = req.query;

        let whereConditions = [];
        let params = [];

        if (keyword) {
            whereConditions.push('(title LIKE ? OR content LIKE ?)');
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (type) {
            whereConditions.push('type = ?');
            params.push(type);
        }
        if (isPinned !== undefined && isPinned !== '') {
            whereConditions.push('is_pinned = ?');
            params.push(parseInt(isPinned));
        }

        const whereSQL = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const list = await query(
            `SELECT id, title, content, author_id, type, priority, is_pinned, views, created_at, updated_at 
             FROM announcements 
             ${whereSQL}
             ORDER BY is_pinned DESC, created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM announcements ${whereSQL}`,
            params
        );
        const total = countResult[0]?.total || 0;

        const statsResult = await query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_pinned = 1 THEN 1 ELSE 0 END) as pinned_count,
                SUM(views) as total_views
             FROM announcements`
        );

        res.json({
            success: true,
            list: list || [],
            total: total,
            page,
            pageSize,
            stats: statsResult[0] || {}
        });
    } catch (error) {
        console.error('获取公告列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/home', authMiddleware, async (req, res) => {
    try {
        const pinnedAnnouncements = await query(
            `SELECT id, title, content, author_id, type, priority, is_pinned, views, created_at, updated_at 
             FROM announcements 
             WHERE is_pinned = 1 
             ORDER BY created_at DESC LIMIT 5`
        );

        const pinnedIds = pinnedAnnouncements && pinnedAnnouncements.length > 0 
            ? pinnedAnnouncements.map(a => a.id) 
            : [];
        
        let recentAnnouncements;
        if (pinnedIds.length > 0) {
            recentAnnouncements = await query(
                `SELECT id, title, content, author_id, type, priority, is_pinned, views, created_at, updated_at 
                 FROM announcements 
                 WHERE id NOT IN (${pinnedIds.join(',')})
                 ORDER BY created_at DESC LIMIT 10`
            );
        } else {
            recentAnnouncements = await query(
                `SELECT id, title, content, author_id, type, priority, is_pinned, views, created_at, updated_at 
                 FROM announcements 
                 ORDER BY created_at DESC LIMIT 10`
            );
        }

        res.json({
            success: true,
            list: [...(pinnedAnnouncements || []), ...(recentAnnouncements || [])],
            pinned: pinnedAnnouncements || [],
            recent: recentAnnouncements || []
        });
    } catch (error) {
        console.error('获取首页公告错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const announcements = await query(
            'SELECT * FROM announcements WHERE id = ?',
            [id]
        );

        if (!announcements || announcements.length === 0) {
            return res.status(404).json({ success: false, message: '公告不存在' });
        }

        await query('UPDATE announcements SET views = views + 1 WHERE id = ?', [id]);

        const announcement = { ...announcements[0], views: announcements[0].views + 1 };

        res.json({
            success: true,
            data: { announcement }
        });
    } catch (error) {
        console.error('获取公告详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { title, content, type, priority, is_pinned } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: '公告标题不能为空' });
        }

        const result = await query(
            `INSERT INTO announcements (title, content, author_id, type, priority, is_pinned) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, content, req.user.id, type || 'notice', priority || 'normal', is_pinned ? 1 : 0]
        );

        const newId = result.lastInsertRowid || result[0]?.id;
        const newAnnouncement = await query('SELECT * FROM announcements WHERE id = ?', [newId]);

        res.status(201).json({
            success: true,
            message: '发布成功',
            data: { announcement: newAnnouncement[0] }
        });
    } catch (error) {
        console.error('发布公告错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const existing = await query('SELECT * FROM announcements WHERE id = ?', [id]);

        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '公告不存在' });
        }

        const allowedFields = ['title', 'content', 'type', 'priority', 'is_pinned'];
        const updateFields = [];
        const params = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                let value = updates[field];
                if (field === 'is_pinned') {
                    value = value ? 1 : 0;
                }
                params.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: '没有需要更新的字段' });
        }

        params.push(id);
        await query(`UPDATE announcements SET ${updateFields.join(', ')} WHERE id = ?`, params);

        const updatedAnnouncement = await query('SELECT * FROM announcements WHERE id = ?', [id]);

        res.json({
            success: true,
            message: '更新成功',
            data: { announcement: updatedAnnouncement[0] }
        });
    } catch (error) {
        console.error('更新公告错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query('SELECT id FROM announcements WHERE id = ?', [id]);

        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: '公告不存在' });
        }

        await query('DELETE FROM announcements WHERE id = ?', [id]);

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除公告错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

router.get('/meta/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await query(
            "SELECT DISTINCT type FROM announcements WHERE type IS NOT NULL AND type != '' ORDER BY type"
        );

        res.json({
            success: true,
            data: { categories: (categories || []).map(c => c.type) }
        });
    } catch (error) {
        console.error('获取分类列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
    }
});

module.exports = router;
