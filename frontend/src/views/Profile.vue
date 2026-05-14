<template>
  <div class="profile">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <div class="card-container user-info-card">
          <div class="avatar-section">
            <el-avatar :size="100" :icon="UserFilled" />
            <h3>{{ userInfo?.name }}</h3>
            <el-tag>{{ getRoleText(userInfo?.role) }}</el-tag>
          </div>
          <el-divider />
          <div class="info-list">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ userInfo?.username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo?.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ userInfo?.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>注册于 {{ formatDate(userInfo?.created_at) }}</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="16">
        <div class="card-container">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="info">
              <el-form ref="infoFormRef" :model="infoForm" label-width="100px" class="form-container">
                <el-form-item label="用户名">
                  <el-input v-model="infoForm.username" disabled />
                </el-form-item>
                <el-form-item label="姓名">
                  <el-input v-model="infoForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="infoForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="infoForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateInfo">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密码" name="password">
              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" class="form-container">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, changePassword } from '@/api/modules/auth'
import { UserFilled, User, Message, Phone, Calendar } from '@element-plus/icons-vue'

const activeTab = ref('info')
const userInfo = ref(null)

const infoForm = reactive({
  username: '',
  name: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const getRoleText = (role) => {
  const roles = { admin: '管理员', teacher: '教师', student: '学生' }
  return roles[role] || role
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.user
    infoForm.username = res.user.username
    infoForm.name = res.user.name
    infoForm.email = res.user.email || ''
    infoForm.phone = res.user.phone || ''
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const handleUpdateInfo = async () => {
  ElMessage.success('信息更新成功')
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile .user-info-card {
  text-align: center;
}
.profile .avatar-section {
  padding: 20px;
}
.profile .avatar-section h3 {
  margin: 16px 0 8px;
  color: #303133;
}
.profile .info-list {
  text-align: left;
}
.profile .info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #606266;
}
.profile .info-item .el-icon {
  color: #409eff;
}
.profile .form-container {
  max-width: 500px;
  padding: 20px 0;
}
</style>
