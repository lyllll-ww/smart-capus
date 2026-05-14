/**
 * 用户认证路由
 * 处理用户登录、注册、密码修改等操作
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { query, usePostgres } = require('../config/database');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 用户登录接口
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        const users = await query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        const user = users[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        });

        const { password: _, ...userInfo } = user;

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: userInfo
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

/**
 * 用户注册接口
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, role = 'student', email, phone } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({
                success: false,
                message: '用户名、密码和姓名不能为空'
            });
        }

        const existingUsers = await query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const result = await query(
            `INSERT INTO users (username, password, name, role, email, phone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, name, role, email || null, phone || null]
        );

        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                user: {
                    id: usePostgres ? result[0]?.id : result.lastInsertRowid,
                    username,
                    name,
                    role
                }
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

/**
 * 获取当前登录用户信息
 * GET /api/auth/user
 */
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const users = await query(
            'SELECT id, username, name, role, email, phone, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            data: {
                user: users[0]
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

/**
 * 修改密码接口
 * PUT /api/auth/password
 */
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '请提供旧密码和新密码'
            });
        }

        const users = await query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const isOldPasswordValid = bcrypt.compareSync(oldPassword, users[0].password);
        
        if (!isOldPasswordValid) {
            return res.status(400).json({
                success: false,
                message: '旧密码错误'
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: '密码修改成功'
        });
    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

module.exports = router;
