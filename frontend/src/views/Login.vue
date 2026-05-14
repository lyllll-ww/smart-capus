<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录表单卡片 -->
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#409EFF"><School /></el-icon>
        <h1>智慧校园系统</h1>
        <p>Smart Campus Management System</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>默认账号: admin / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 登录页面组件
 * 提供用户身份验证功能
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/modules/auth'

// 获取路由实例
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref(null)

// 登录状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录提交
 */
const handleLogin = async () => {
  // 表单验证
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    // 调用登录接口
    const res = await login(loginForm)
    
    // 保存Token和用户信息到本地存储
    // 响应拦截器已经提取了data，现在res就是 { token, user }
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.user))

    ElMessage.success('登录成功')

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
/* 登录容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆圈 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    &.circle-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      right: -100px;
    }
    
    &.circle-2 {
      width: 300px;
      height: 300px;
      bottom: -50px;
      left: -50px;
    }
    
    &.circle-3 {
      width: 200px;
      height: 200px;
      top: 50%;
      left: 10%;
      opacity: 0.5;
    }
  }
}

/* 登录卡片 */
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 24px;
    color: #303133;
    margin: 16px 0 8px;
  }

  p {
    font-size: 12px;
    color: #909399;
  }
}

/* 登录表单 */
.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

/* 登录底部 */
.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
}
</style>
