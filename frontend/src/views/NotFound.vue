<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>页面不存在</h1>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
/**
 * 404页面组件
 * 当路由匹配不到时显示
 */

import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .content {
    text-align: center;
    color: #fff;
    
    .error-code {
      font-size: 120px;
      font-weight: bold;
      text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 32px;
    }
    
    .el-button {
      padding: 20px 40px;
      font-size: 16px;
    }
  }
}
</style>
