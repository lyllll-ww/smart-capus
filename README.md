# 智慧校园系统 (Smart Campus System)

基于 Vue3 + Node.js 的智慧校园管理系统，为学校提供数字化校园管理解决方案。

## 📁 项目结构

```
智慧校园系统/
├── backend/                 # 后端项目 (Node.js + Express)
│   ├── config/             # 数据库配置
│   ├── middleware/         # 中间件（认证、权限）
│   ├── routes/             # API路由
│   ├── server.js           # 服务器入口
│   └── package.json
│
├── frontend/               # 前端项目 (Vue3 + Vite)
│   ├── src/
│   │   ├── api/            # API请求封装
│   │   ├── components/     # 公共组件
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── assets/         # 静态资源
│   │   └── main.js         # 入口文件
│   ├── package.json
│   └── vite.config.js
│
├── database.sql            # 数据库初始化脚本
├── SPEC.md                 # 项目规范文档
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- MySQL >= 8.0
- npm 或 yarn

### 1. 数据库配置

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 执行数据库初始化脚本
source database.sql

# 3. 创建.env配置文件
cd backend
cp .env.example .env
# 编辑.env，修改数据库密码等配置
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 或生产模式启动
npm start
```

后端服务启动后运行在 http://localhost:3000

### 3. 启动前端服务

```bash
# 新开一个终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 或构建生产版本
npm run build
```

前端服务启动后运行在 http://localhost:5173

### 4. 访问系统

打开浏览器访问 http://localhost:5173

**默认账号：**
- 用户名：admin
- 密码：admin123

## 📚 功能模块

| 模块 | 功能说明 | 权限 |
|------|----------|------|
| 首页仪表盘 | 系统数据统计、最新公告、快捷入口 | 全部 |
| 学生管理 | 学生信息的增删改查 | 管理员/教师 |
| 教师管理 | 教师信息的增删改查 | 管理员 |
| 课程管理 | 课程信息的增删改查、分配教师 | 管理员/教师 |
| 成绩管理 | 成绩录入、查询、统计报表 | 管理员/教师 |
| 公告管理 | 公告发布、编辑、置顶、删除 | 管理员/教师 |
| 个人中心 | 个人信息查看、密码修改 | 全部 |

## 🔧 技术栈

### 后端

- **运行环境**: Node.js
- **Web框架**: Express.js
- **数据库**: MySQL 8.0
- **ORM**: mysql2
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **参数验证**: express-validator

### 前端

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **图表**: ECharts

## 📝 API 接口

基础路径: `/api`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/user | 获取用户信息 |
| GET | /api/students | 学生列表 |
| POST | /api/students | 添加学生 |
| PUT | /api/students/:id | 更新学生 |
| DELETE | /api/students/:id | 删除学生 |
| GET | /api/teachers | 教师列表 |
| POST | /api/teachers | 添加教师 |
| GET | /api/courses | 课程列表 |
| POST | /api/courses | 添加课程 |
| GET | /api/scores | 成绩列表 |
| POST | /api/scores | 录入成绩 |
| GET | /api/scores/statistics | 成绩统计 |
| GET | /api/announcements | 公告列表 |
| POST | /api/announcements | 发布公告 |
| GET | /api/statistics | 系统统计 |

## 🔐 数据库表结构

- **users** - 用户表
- **students** - 学生表
- **teachers** - 教师表
- **courses** - 课程表
- **scores** - 成绩表
- **announcements** - 公告表
- **course_selections** - 选课表

详见 `database.sql` 文件。

## 📄 代码规范

- 后端代码使用 CommonJS 模块化规范
- 前端代码使用 ES6+ 语法
- 所有代码包含中文注释
- API 使用 RESTful 设计规范
- 使用预处理语句防止 SQL 注入

## 🎯 开发说明

### 添加新功能

1. 在 `SPEC.md` 中添加功能说明
2. 创建数据库表（如需要）
3. 在后端添加路由和控制器
4. 在前端添加 API 接口封装
5. 创建前端页面组件
6. 配置路由
7. 更新文档

### 权限控制

用户角色分为三级：
- `admin` - 系统管理员，拥有全部权限
- `teacher` - 教师，可管理课程和成绩
- `student` - 学生，仅可查看

## 📜 许可证

MIT License

## 👨‍💻 作者

Campus Team

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
