# 智慧校园系统 - Render 部署指南

## 部署架构

```
┌─────────────────┐     ┌──────────────────────────┐
│   Vercel (前端)  │ --> │   Render (后端 API)       │
│   免费托管       │     │   Web Service (Node.js)  │
└─────────────────┘     └───────────┬──────────────┘
                                    │
                        ┌───────────┴──────────────┐
                        │   Render (PostgreSQL)    │
                        │   免费数据库              │
                        └──────────────────────────┘
```

## 部署步骤

### 1. 准备代码

确保代码已更新（已支持 PostgreSQL）：
- ✅ `backend/config/database.js` - 支持 PostgreSQL/SQLite 双环境
- ✅ `backend/routes/*.js` - 异步查询支持
- ✅ `backend/package.json` - 添加 pg 依赖

### 2. 创建 GitHub 仓库

```bash
cd f:/桌面/智慧校园系统
git init
git add .
git commit -m "准备部署到 Render"
git branch -M main
git remote add origin https://github.com/你的用户名/smart-campus.git
git push -u origin main
```

### 3. 部署后端 (Render)

1. 访问 [render.com](https://render.com) 并登录
2. 点击 **New +** → **PostgreSQL**
3. 配置数据库：
   - Name: `smart-campus-db`
   - Region: Singapore (或离你最近的)
   - Plan: Free
4. 创建后，点击 **Connect** 复制 `DATABASE_URL`

5. 点击 **New +** → **Web Service**
6. 连接 GitHub 仓库 `smart-campus`
7. 配置服务：
   - Name: `smart-campus-api`
   - Region: Singapore
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

8. 添加环境变量：
   - `DATABASE_URL`: 粘贴刚才复制的 PostgreSQL 连接字符串
   - `JWT_SECRET`: 点击 Generate 生成随机值
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

9. 点击 **Create Web Service**

10. 等待部署完成，访问 `https://smart-campus-api.onrender.com/api/health` 检查

### 4. 初始化数据库

1. 在 Render Dashboard 进入 PostgreSQL 数据库
2. 点击 **Shell** 打开命令行
3. 复制 `backend/render-init.sql` 内容并执行

### 5. 部署前端 (Vercel)

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **Add New** → **Project**
3. 导入 GitHub 仓库
4. 配置：
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 添加环境变量：
   - `VITE_API_URL`: `https://smart-campus-api.onrender.com`

6. 点击 **Deploy**

### 6. 配置自定义域名（可选）

**Vercel 前端：**
1. 进入 Vercel 项目 → Settings → Domains
2. 添加你的域名并配置 DNS

**Render 后端：**
1. 进入 Web Service → Settings → Custom Domains
2. 添加你的域名

## 部署后检查清单

- [ ] 后端健康检查: `https://你的域名/api/health`
- [ ] 前端首页正常访问
- [ ] 登录功能正常 (admin/admin123)
- [ ] 学生列表显示
- [ ] 教师列表显示
- [ ] 公告列表显示

## 常见问题

### Q: 部署后数据库连接失败
A: 检查 Render PostgreSQL 的 `DATABASE_URL` 是否正确配置到后端环境变量

### Q: 前端 API 请求失败
A: 检查前端 `VITE_API_URL` 是否指向正确的后端地址

### Q: CORS 错误
A: 后端已配置允许 Vercel 域名，如使用其他域名需在 `server.js` 中添加

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## 技术支持

如有问题，请检查：
1. Render 日志中的错误信息
2. 浏览器控制台的网络请求
3. 数据库是否已正确初始化
