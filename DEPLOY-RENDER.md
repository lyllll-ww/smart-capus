# 智慧校园系统 - Render 部署指南

## Render 部署步骤

### 第一步：推送代码到 GitHub

```powershell
cd f:\桌面\智慧校园系统

git init
git add .
git commit -m "智慧校园系统 - 准备部署"
git remote add origin https://github.com/lyllll-ww/smart-capus.git
git push -u origin main
```

### 第二步：在 Render 创建后端

1. 访问 https://render.com 并登录（可用 GitHub 账号）
2. 点击 **Dashboard** → **New** → **PostgreSQL**
3. 创建免费 PostgreSQL 数据库
4. 复制 **Internal Database URL**（备用）

### 第三步：部署后端服务

1. 点击 **Dashboard** → **New** → **Web Service**
2. 连接你的 GitHub 仓库 `smart-capus`
3. 配置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. 添加环境变量：
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = 粘贴第二步的数据库连接字符串
5. 点击 **Create Web Service**

### 第四步：获取后端地址

部署成功后，复制服务 URL，如：`https://smart-campus-backend.onrender.com`

### 第五步：部署前端

1. 点击 **Dashboard** → **New** → **Static Site**
2. 连接同一个 GitHub 仓库
3. 配置：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. 添加环境变量：
   - `VITE_API_BASE_URL` = `https://你的后端地址.onrender.com/api`
5. 点击 **Create Static Site**

### 第六步：初始化数据库

1. 在后端服务页面，点击 **Shell**
2. 执行数据库初始化：

```bash
# 连接 PostgreSQL
psql $DATABASE_URL

# 然后粘贴 database.sql 的内容
```

---

## 常用命令

| 任务 | 操作 |
|------|------|
| 查看日志 | 服务页面 → Logs |
| 重启服务 | 服务页面 → Manual Deploy → Clear build cache & deploy |
| 连接数据库 | PostgreSQL → Connect → Connection string |

---

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

---

## 注意事项

1. **免费额度**：每月 750 小时，网站始终运行不会休眠
2. **冷启动**：首次访问可能需要 30 秒加载（免费套餐正常现象）
3. **数据库**：免费 PostgreSQL 有 1GB 存储空间
4. **自定义域名**：可在服务设置中添加自己的域名
