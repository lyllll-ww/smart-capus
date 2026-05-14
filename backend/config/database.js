/**
 * 数据库配置文件
 * 支持 PostgreSQL (生产环境) 和 SQLite (开发环境)
 */

const path = require('path');

// 判断环境：使用 PostgreSQL 还是 SQLite
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

// PostgreSQL 配置
let db = null;
let query = null;

if (usePostgres) {
    const { Pool } = require('pg');
    
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    
    // PostgreSQL 查询函数
    query = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params)
                .then(result => {
                    // 处理不同类型的 SQL 语句
                    const sqlUpper = sql.trim().toUpperCase();
                    if (sqlUpper.startsWith('SELECT')) {
                        resolve(result.rows);
                    } else {
                        resolve({
                            lastInsertRowid: result.rows[0]?.id,
                            rowCount: result.rowCount
                        });
                    }
                })
                .catch(reject);
        });
    };
    
    // 测试连接
    const testConnection = async () => {
        try {
            const client = await db.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('✅ PostgreSQL 数据库连接成功');
            return true;
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            return false;
        }
    };
    
    module.exports = {
        db,
        query,
        testConnection,
        usePostgres: true
    };
    
} else {
    // SQLite 配置（开发环境）
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '..', 'data', 'smart_campus.db');
    
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    
    query = (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            const sqlUpper = sql.trim().toUpperCase();
            
            if (sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('PRAGMA')) {
                return params.length > 0 ? stmt.all(...params) : stmt.all();
            } else {
                return params.length > 0 ? stmt.run(...params) : stmt.run();
            }
        } catch (error) {
            console.error('数据库查询错误:', error.message);
            throw error;
        }
    };
    
    const testConnection = () => {
        try {
            db.exec('SELECT 1');
            console.log('✅ SQLite 数据库连接成功');
            return true;
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            return false;
        }
    };
    
    module.exports = {
        db,
        query,
        testConnection,
        usePostgres: false
    };
}
