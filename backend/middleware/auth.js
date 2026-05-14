/**
 * 认证中间件
 * 负责验证用户身份和权限控制
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * 验证JWT Token中间件
 * 检查请求头中的Authorization字段，验证token有效性
 */
const authMiddleware = (req, res, next) => {
    try {
        // 从请求头获取Token，格式: Bearer <token>
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '未提供认证令牌，请先登录'
            });
        }

        // 提取Token
        const token = authHeader.split(' ')[1];

        // 验证Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 将用户信息挂载到请求对象上，供后续处理函数使用
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '登录已过期，请重新登录'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '无效的认证令牌'
            });
        }
        return res.status(500).json({
            success: false,
            message: '认证失败'
        });
    }
};

/**
 * 角色权限验证中间件工厂
 * @param {...string} roles - 允许访问的角色列表
 * @returns {Function} 中间件函数
 * 
 * 使用示例:
 * router.get('/admin', authMiddleware, roleMiddleware('admin'), handler)
 */
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        // 首先确保用户已经通过身份验证
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '请先登录'
            });
        }

        // 检查用户角色是否在允许列表中
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: '您没有权限执行此操作'
            });
        }

        next();
    };
};

/**
 * 生成JWT Token
 * @param {Object} payload - Token载荷，包含用户信息
 * @returns {string} 生成的JWT Token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'  // 默认7天过期
    });
};

module.exports = {
    authMiddleware,
    roleMiddleware,
    generateToken
};
