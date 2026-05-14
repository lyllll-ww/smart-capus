/**
 * 批量修复路由文件以适配SQLite数据库
 * 自动替换 async/await 为同步调用
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'routes');
const files = ['students.js', 'teachers.js', 'courses.js', 'scores.js', 'announcements.js'];

console.log('开始修复路由文件...\n');

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 文件不存在: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. 移除 async 关键字（从路由函数声明中）
    content = content.replace(/async\s*\(/g, '(');
    
    // 2. 移除 await 关键字
    content = content.replace(/await\s+/g, '');
    
    // 3. 将 result.insertId 改为 result.lastInsertRowid
    content = content.replace(/result\.insertId/g, 'result.lastInsertRowid');
    
    // 4. 将 if (xxx.length === 0) 改为 if (!xxx || xxx.length === 0)
    content = content.replace(/if\s*\(\s*(\w+)\.length\s*===\s*0\s*\)/g, (match, varName) => {
        return `if (!${varName} || ${varName}.length === 0)`;
    });
    
    // 5. 将 if (xxx.length > 0) 改为 if (xxx && xxx.length > 0)
    content = content.replace(/if\s*\(\s*(\w+)\.length\s*>\s*0\s*\)/g, (match, varName) => {
        return `if (${varName} && ${varName}.length > 0)`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已修复: ${file}`);
    } else {
        console.log(`⚪ 无需修改: ${file}`);
    }
});

console.log('\n修复完成！请重启后端服务。');
