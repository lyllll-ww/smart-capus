# 智慧校园系统 - 项目规范

## 1. 项目概述

**项目名称**: 智慧校园系统 (Smart Campus System)

**项目类型**: 前后端分离的全栈Web应用

**技术栈**:
- 前端: Vue 3 + Vite + Element Plus
- 后端: Node.js + Express + MySQL
- 数据库: MySQL

**核心功能**: 为学校提供学生管理、教师管理、课程管理、成绩管理、公告通知等数字化校园管理功能。

---

## 2. 系统架构

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐
│   Vue3 前端      │  ◄──────────────►  │   Node.js 后端  │
│   (客户端)       │     JSON API       │   (服务器)       │
└─────────────────┘                    └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │     MySQL       │
                                        │    (数据库)      │
                                        └─────────────────┘
```

---

## 3. 功能模块

### 3.1 用户认证模块
- 用户登录
- 用户注册
- 密码修改
- 退出登录

### 3.2 首页仪表盘
- 系统数据统计
- 最新公告列表
- 快捷操作入口

### 3.3 学生管理
- 学生列表查看
- 添加学生
- 编辑学生信息
- 删除学生

### 3.4 教师管理
- 教师列表查看
- 添加教师
- 编辑教师信息
- 删除教师

### 3.5 课程管理
- 课程列表查看
- 添加课程
- 编辑课程信息
- 分配授课教师

### 3.6 成绩管理
- 成绩录入
- 成绩查询
- 成绩统计

### 3.7 公告管理
- 发布公告
- 查看公告
- 公告置顶

---

## 4. 数据库设计

### 4.1 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码（加密存储）|
| role | ENUM | 角色：admin/student/teacher |
| name | VARCHAR(50) | 真实姓名 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 电话 |
| created_at | DATETIME | 创建时间 |

### 4.2 学生表 (students)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| student_no | VARCHAR(20) | 学号，唯一 |
| name | VARCHAR(50) | 姓名 |
| gender | ENUM | 性别 |
| class | VARCHAR(50) | 班级 |
| major | VARCHAR(100) | 专业 |
| grade | INT | 年级 |
| created_at | DATETIME | 创建时间 |

### 4.3 教师表 (teachers)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| teacher_no | VARCHAR(20) | 工号，唯一 |
| name | VARCHAR(50) | 姓名 |
| gender | ENUM | 性别 |
| department | VARCHAR(100) | 院系 |
| title | VARCHAR(50) | 职称 |
| created_at | DATETIME | 创建时间 |

### 4.4 课程表 (courses)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| course_no | VARCHAR(20) | 课程编号 |
| name | VARCHAR(100) | 课程名称 |
| credit | DECIMAL | 学分 |
| hours | INT | 学时 |
| teacher_id | INT | 授课教师ID |
| semester | VARCHAR(20) | 学期 |
| created_at | DATETIME | 创建时间 |

### 4.5 成绩表 (scores)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| student_id | INT | 学生ID |
| course_id | INT | 课程ID |
| score | DECIMAL | 成绩 |
| semester | VARCHAR(20) | 学期 |
| created_at | DATETIME | 创建时间 |

### 4.6 公告表 (announcements)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 内容 |
| author | VARCHAR(50) | 作者 |
| is_top | BOOLEAN | 是否置顶 |
| created_at | DATETIME | 创建时间 |

---

## 5. API 接口设计

### 认证接口
- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册
- GET /api/auth/user - 获取当前用户信息

### 学生管理接口
- GET /api/students - 获取学生列表
- POST /api/students - 添加学生
- PUT /api/students/:id - 更新学生信息
- DELETE /api/students/:id - 删除学生

### 教师管理接口
- GET /api/teachers - 获取教师列表
- POST /api/teachers - 添加教师
- PUT /api/teachers/:id - 更新教师信息
- DELETE /api/teachers/:id - 删除教师

### 课程管理接口
- GET /api/courses - 获取课程列表
- POST /api/courses - 添加课程
- PUT /api/courses/:id - 更新课程信息
- DELETE /api/courses/:id - 删除课程

### 成绩管理接口
- GET /api/scores - 获取成绩列表
- POST /api/scores - 录入成绩
- PUT /api/scores/:id - 更新成绩
- GET /api/scores/statistics - 成绩统计

### 公告管理接口
- GET /api/announcements - 获取公告列表
- POST /api/announcements - 发布公告
- PUT /api/announcements/:id - 更新公告
- DELETE /api/announcements/:id - 删除公告

### 统计接口
- GET /api/statistics - 获取系统统计数据

---

## 6. 项目目录结构

```
智慧校园系统/
├── backend/                    # 后端项目
│   ├── config/                 # 配置文件
│   │   └── database.js         # 数据库配置
│   ├── models/                 # 数据模型
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Course.js
│   │   ├── Score.js
│   │   └── Announcement.js
│   ├── routes/                 # 路由
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── courses.js
│   │   ├── scores.js
│   │   └── announcements.js
│   ├── middleware/             # 中间件
│   │   └── auth.js
│   ├── server.js               # 服务器入口
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/                # API 请求
│   │   ├── components/         # 公共组件
│   │   ├── views/              # 页面组件
│   │   ├── router/              # 路由配置
│   │   ├── stores/             # 状态管理
│   │   ├── utils/               # 工具函数
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── SPEC.md                     # 项目规范文档
├── README.md                   # 项目说明文档
└── database.sql                # 数据库初始化脚本
```

---

## 7. 验收标准

- [x] 项目结构清晰，代码简洁规范
- [x] 所有代码包含中文注释
- [x] 实现所有功能模块
- [x] API 接口完整可用
- [x] 提供数据库初始化脚本
- [x] 包含完整的运行说明文档
