<template>
  <el-container class="layout-container">
    <!-- 左侧导航栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <!-- Logo区域 -->
      <div class="logo">
        <el-icon :size="28" color="#409EFF"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">智慧校园</span>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="menu"
      >
        <!-- 动态生成菜单项 -->
        <el-menu-item 
          v-for="item in filteredMenuItems" 
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <!-- 折叠按钮 -->
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            :size="24"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <!-- 右侧功能区 -->
        <div class="header-right">
          <!-- 消息通知 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="header-icon" @click="goToAnnouncements">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>

          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userInfo?.name || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="main">
        <!-- 路由视图 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/**
 * 布局组件
 * 应用的主框架，包含侧边栏、顶栏和内容区
 */

import { ref, computed, onMounted, markRaw, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  School,
  Fold,
  Expand,
  Bell,
  User,
  UserFilled,
  ArrowDown,
  SwitchButton,
  Odometer,
  Briefcase,
  Reading,
  DocumentChecked
} from '@element-plus/icons-vue'
import { getAnnouncementList } from '@/api/modules/announcements'

// 获取路由实例
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 当前用户信息
const userInfo = ref(null)

/**
 * 未读公告数量状态
 * 用于在顶部导航栏的铃铛图标上显示未读公告数
 */
const unreadCount = ref(0)

/**
 * 加载并计算未读公告数量
 * 
 * 业务逻辑说明：
 * 1. 从API获取公告列表（最多100条）
 * 2. 仅统计最近7天内发布的公告（视为有效提醒周期）
 * 3. 排除已在本地标记为已读的公告
 * 4. 将最终计数显示在铃铛图标上
 * 
 * @returns {Promise<void>}
 */
const loadUnreadCount = async () => {
  try {
    // 调用API获取公告列表
    const res = await getAnnouncementList({ page: 1, pageSize: 100 })
    // 兼容不同的响应数据结构格式
    const list = res.list || res || []
    
    if (list.length > 0) {
      // 从本地存储获取已读公告ID列表
      const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
      // 计算7天前的时间戳（用于过滤有效公告）
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      
      // 过滤未读公告：创建时间在7天内 且 未被标记为已读
      unreadCount.value = list.filter(item => {
        const isRecent = new Date(item.created_at).getTime() > oneWeekAgo
        const isNotRead = !readIds.includes(item.id)
        return isRecent && isNotRead
      }).length
    } else {
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('获取公告数量失败:', error)
  }
}

/**
 * 标记指定公告为已读
 * 
 * 功能说明：
 * 1. 将公告ID存入本地存储的已读列表
 * 2. 避免重复标记（已在列表中则跳过）
 * 3. 标记成功后自动刷新未读计数
 * 
 * @param {number|string} announcementId - 要标记为已读的公告ID
 */
const markAsRead = (announcementId) => {
  // 获取当前已读列表
  const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
  // 仅当该公告未被标记为已读时进行处理
  if (!readIds.includes(announcementId)) {
    // 添加到已读列表
    readIds.push(announcementId)
    // 更新本地存储
    localStorage.setItem('readAnnouncements', JSON.stringify(readIds))
    // 刷新未读计数
    loadUnreadCount()
  }
}

// 暴露方法给子组件（使用 provide/inject 模式）
defineExpose({ markAsRead })
// 使用 provide 向下传递已读标记方法，供子路由组件使用
provide('markAnnouncementAsRead', markAsRead)

// 跳转到公告管理页面
const goToAnnouncements = () => {
  router.push('/announcements')
}

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 菜单配置（根据用户角色动态显示）
const menuItems = [
  { path: '/dashboard', title: '首页', icon: markRaw(Odometer), roles: ['admin', 'teacher', 'student'] },
  { path: '/students', title: '学生管理', icon: markRaw(User), roles: ['admin', 'teacher'] },
  { path: '/teachers', title: '教师管理', icon: markRaw(Briefcase), roles: ['admin'] },
  { path: '/courses', title: '课程管理', icon: markRaw(Reading), roles: ['admin', 'teacher'] },
  { path: '/scores', title: '成绩管理', icon: markRaw(DocumentChecked), roles: ['admin', 'teacher'] },
  { path: '/announcements', title: '公告管理', icon: markRaw(Bell), roles: ['admin', 'teacher'] },
  { path: '/profile', title: '个人中心', icon: markRaw(UserFilled), roles: ['admin', 'teacher', 'student'] }
]

// 根据用户角色过滤菜单
const filteredMenuItems = computed(() => {
  const role = userInfo.value?.role || 'student'
  return menuItems.filter(item => item.roles.includes(role))
})

/**
 * 处理用户菜单命令
 * @param {string} command - 命令标识
 */
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      // 确认退出登录
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 跳转到登录页
        router.push('/login')
      }).catch(() => {})
      break
  }
}

/**
 * 组件初始化钩子
 * 
 * 初始化任务：
 * 1. 从 localStorage 恢复用户登录信息
 * 2. 加载顶部导航栏的未读公告数量
 * 3. 启动定时器，每60秒自动刷新未读数量（保持数据最新）
 */
onMounted(() => {
  // 从本地存储获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      // 解析用户JSON数据
      userInfo.value = JSON.parse(storedUserInfo)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  
  // 首次加载时获取未读公告数量
  loadUnreadCount()
  
  // 设置定时器：每60秒自动刷新一次未读数量
  // 确保用户长时间停留在页面时，数量也能保持最新
  setInterval(loadUnreadCount, 60000)
})
</script>

<style scoped lang="scss">
/* 布局容器 */
.layout-container {
  height: 100vh;
}

/* 侧边栏样式 */
.aside {
  background: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

/* Logo区域 */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #263445;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #3d4a5c;

  .logo-text {
    white-space: nowrap;
  }
}

/* 菜单样式 */
.menu {
  border-right: none;
  background: #304156;

  :deep(.el-menu-item) {
    color: #bfcbd9;
    
    &:hover, &.is-active {
      background: #263445;
      color: #409eff;
    }
  }
}

/* 顶部导航栏 */
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  .collapse-btn {
    cursor: pointer;
    color: #606266;
    
    &:hover {
      color: #409eff;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;

  .header-icon {
    cursor: pointer;
    padding: 8px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;

    &:hover {
      background: #f5f7fa;
    }

    .username {
      font-size: 14px;
      color: #606266;
    }
  }
}

/* 主内容区 */
.main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
