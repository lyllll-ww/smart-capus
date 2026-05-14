/**
 * 智慧校园系统 - 服务器入口文件
 * 基于Express构建的RESTful API服务
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入数据库配置
const dbConfig = require('./config/database');
const { testConnection, query, usePostgres } = dbConfig;

// 导入路由模块
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const scoreRoutes = require('./routes/scores');
const announcementRoutes = require('./routes/announcements');

// 创建Express应用实例
const app = express();

// 获取允许的 CORS 源
const getCorsOrigins = () => {
    const origins = [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:3000', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ];
    // 生产环境添加前端域名
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }
    return origins;
};

// CORS跨域资源共享 - 允许前端应用访问API
app.use(cors({
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// 请求体解析中间件 - 解析JSON格式的请求体
app.use(express.json({ limit: '10mb' }));

// 解析URL编码格式的请求体
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件 - 打印所有请求信息
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// API路由配置
// ============================================

// 根路径 - 返回API信息
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '智慧校园系统 API 服务',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            teachers: '/api/teachers',
            courses: '/api/courses',
            scores: '/api/scores',
            announcements: '/api/announcements',
            statistics: '/api/statistics'
        }
    });
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 公开统计接口（无需登录）
app.get('/api/public/stats', async (req, res) => {
    try {
        // 获取各项统计数据
        const studentCount = await query('SELECT COUNT(*) as count FROM students');
        const teacherCount = await query('SELECT COUNT(*) as count FROM teachers');
        const courseCount = await query('SELECT COUNT(*) as count FROM courses');
        const avgScore = await query('SELECT AVG(score) as avg FROM scores WHERE score IS NOT NULL');

        // 获取年级分布
        const gradeDistribution = await query(`
            SELECT enrollment_year as grade, COUNT(*) as count 
            FROM students 
            WHERE enrollment_year IS NOT NULL 
            GROUP BY enrollment_year 
            ORDER BY grade DESC
        `);

        // 获取成绩分布（按分数段统计）
        const scoreDistribution = await query(`
            SELECT 
                CASE 
                    WHEN score >= 90 THEN '90-100'
                    WHEN score >= 80 THEN '80-89'
                    WHEN score >= 70 THEN '70-79'
                    WHEN score >= 60 THEN '60-69'
                    ELSE '0-59'
                END as range,
                COUNT(*) as count
            FROM scores
            WHERE score IS NOT NULL
            GROUP BY range
            ORDER BY range DESC
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    students: studentCount?.[0]?.count || 0,
                    teachers: teacherCount?.[0]?.count || 0,
                    courses: courseCount?.[0]?.count || 0,
                    averageScore: avgScore?.[0]?.avg ? parseFloat(avgScore[0].avg.toFixed(2)) : 0
                },
                gradeDistribution: gradeDistribution || [],
                scoreDistribution: scoreDistribution || []
            }
        });
    } catch (error) {
        console.error('公开统计接口错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// 挂载各模块路由
app.use('/api/auth', authRoutes);              // 认证路由
app.use('/api/students', studentRoutes);      // 学生管理路由
app.use('/api/teachers', teacherRoutes);       // 教师管理路由
app.use('/api/courses', courseRoutes);         // 课程管理路由
app.use('/api/scores', scoreRoutes);           // 成绩管理路由
app.use('/api/announcements', announcementRoutes);  // 公告管理路由

// 统计接口 - 获取系统总体数据
app.get('/api/statistics', require('./middleware/auth').authMiddleware, async (req, res) => {
    try {
        // 获取各项统计数据
        const studentCount = await query('SELECT COUNT(*) as count FROM students');
        const teacherCount = await query('SELECT COUNT(*) as count FROM teachers');
        const courseCount = await query('SELECT COUNT(*) as count FROM courses');
        const scoreCount = await query('SELECT COUNT(*) as count FROM scores');
        const announcementCount = await query('SELECT COUNT(*) as count FROM announcements');
        
        // 获取平均成绩
        const avgScore = await query('SELECT AVG(score) as avg FROM scores WHERE score IS NOT NULL');

        // 获取最近一周的成绩录入情况
        let recentScores;
        if (usePostgres) {
            recentScores = await query(`
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM scores 
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `);
        } else {
            recentScores = await query(`
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM scores 
                WHERE created_at >= DATE('now', '-7 days')
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `);
        }

        // 获取年级分布
        const gradeDistribution = await query(`
            SELECT enrollment_year as grade, COUNT(*) as count 
            FROM students 
            WHERE enrollment_year IS NOT NULL 
            GROUP BY enrollment_year 
            ORDER BY grade DESC
        `);

        // 获取成绩分布（按分数段统计）
        const scoreDistribution = await query(`
            SELECT 
                CASE 
                    WHEN score >= 90 THEN '90-100'
                    WHEN score >= 80 THEN '80-89'
                    WHEN score >= 70 THEN '70-79'
                    WHEN score >= 60 THEN '60-69'
                    ELSE '0-59'
                END as range,
                COUNT(*) as count
            FROM scores
            WHERE score IS NOT NULL
            GROUP BY range
            ORDER BY range DESC
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    students: studentCount?.[0]?.count || 0,
                    teachers: teacherCount?.[0]?.count || 0,
                    courses: courseCount?.[0]?.count || 0,
                    scores: scoreCount?.[0]?.count || 0,
                    announcements: announcementCount?.[0]?.count || 0,
                    averageScore: avgScore?.[0]?.avg ? parseFloat(avgScore[0].avg.toFixed(2)) : 0
                },
                recentScores: recentScores || [],
                gradeDistribution: gradeDistribution || [],
                scoreDistribution: scoreDistribution || []
            }
        });
    } catch (error) {
        console.error('统计接口错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// ============================================
// 错误处理中间件
// ============================================

// 404处理 - 处理未匹配的路由
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API路径 ${req.path} 不存在`
    });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    
    // 根据环境决定是否返回详细错误信息
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(err.status || 500).json({
        success: false,
        message: isProduction ? '服务器内部错误' : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
});

// ============================================
// 启动服务器
// ============================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 测试数据库连接
        let dbConnected;
        if (usePostgres) {
            dbConnected = await testConnection();
        } else {
            dbConnected = testConnection();
        }
        
        if (!dbConnected) {
            console.error('无法连接到数据库，请检查数据库配置');
            if (!usePostgres) {
                console.log('提示: 请运行 node scripts/init-sqlite.js 初始化数据库');
            }
        }

        // 启动HTTP服务器
        app.listen(PORT, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════════════╗');
            console.log('║         智慧校园系统 - API 服务已启动             ║');
            console.log('╠══════════════════════════════════════════════════╣');
            console.log(`║  📍 服务地址: http://localhost:${PORT}               ║`);
            console.log(`║  📍 环境模式: ${process.env.NODE_ENV || 'development'}                ║`);
            console.log(`║  📊 数据库:   ${usePostgres ? 'PostgreSQL (生产)' : 'SQLite (开发)'}              ║`);
            console.log('║  📝 API文档: http://localhost:' + PORT + '/            ║');
            console.log('╠══════════════════════════════════════════════════╣');
            console.log('║  🔗 路由列表:                                     ║');
            console.log('║     POST   /api/auth/login    - 用户登录          ║');
            console.log('║     POST   /api/auth/register - 用户注册          ║');
            console.log('║     GET    /api/students      - 学生列表          ║');
            console.log('║     GET    /api/teachers      - 教师列表          ║');
            console.log('║     GET    /api/courses       - 课程列表          ║');
            console.log('║     GET    /api/scores        - 成绩列表          ║');
            console.log('║     GET    /api/announcements - 公告列表          ║');
            console.log('║     GET    /api/statistics   - 数据统计          ║');
            console.log('╚══════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

// 启动服务
startServer();

// 优雅关闭处理
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

module.exports = app;
