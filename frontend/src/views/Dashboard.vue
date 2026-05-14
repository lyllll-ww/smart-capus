<template>
  <div class="dashboard">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ userInfo?.name }}！</h1>
      <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6" v-for="stat in statistics" :key="stat.label">
        <div class="stat-card" :style="{ background: stat.color }">
          <el-icon :size="32" class="stat-icon">
            <component :is="stat.icon" />
          </el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作和数据展示 -->
    <el-row :gutter="20" class="content-row">
      <!-- 最新公告 -->
      <el-col :xs="24" :lg="14">
        <div class="card-container announcements-card">
          <div class="card-header">
            <h3>最新公告</h3>
            <el-button type="primary" link @click="$router.push('/announcements')">
              查看更多 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="announcement-list">
            <div 
              v-for="item in announcements" 
              :key="item.id"
              class="announcement-item"
              @click="viewAnnouncement(item)"
            >
              <el-tag v-if="item.is_top" type="danger" size="small" effect="dark">置顶</el-tag>
              <span class="announcement-title">{{ item.title }}</span>
              <span class="announcement-date">{{ formatDate(item.created_at) }}</span>
            </div>
            <el-empty v-if="announcements.length === 0" description="暂无公告" />
          </div>
        </div>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :xs="24" :lg="10">
        <div class="card-container quick-actions">
          <div class="card-header">
            <h3>快捷操作</h3>
          </div>
          <div class="action-grid">
            <div 
              v-for="action in quickActions" 
              :key="action.name"
              class="action-item"
              @click="$router.push(action.path)"
            >
              <el-icon :size="28" :color="action.color">
                <component :is="action.icon" />
              </el-icon>
              <span>{{ action.name }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据图表 -->
    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :lg="12">
        <div class="card-container chart-card">
          <div class="card-header">
            <h3>学生年级分布</h3>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="card-container chart-card">
          <div class="card-header">
            <h3>学生成绩分布</h3>
          </div>
          <div ref="scoreChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 公告详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentAnnouncement?.title"
      width="600px"
    >
      <div class="announcement-content" v-html="currentAnnouncement?.content"></div>
      <template #footer>
        <span class="announcement-meta">
          发布人：{{ currentAnnouncement?.author }} &nbsp;|&nbsp;
          时间：{{ formatDate(currentAnnouncement?.created_at) }} &nbsp;|&nbsp;
          浏览：{{ currentAnnouncement?.views }} 次
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 主页仪表盘组件
 * 展示系统概览、统计数据和快捷入口
 */

import { ref, reactive, onMounted, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { getStatistics } from '@/api/modules/statistics'
import { getHomeAnnouncements, getAnnouncementDetail } from '@/api/modules/announcements'
import * as echarts from 'echarts'
import {
  User,
  Briefcase,
  Reading,
  Bell,
  DocumentChecked,
  DataLine,
  ArrowRight
} from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 当前用户信息
const userInfo = ref(null)

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据 - 使用 markRaw 包装图标组件避免 Vue 警告
const statistics = reactive([
  { label: '学生总数', value: 0, icon: markRaw(User), color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '教师总数', value: 0, icon: markRaw(Briefcase), color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: '课程总数', value: 0, icon: markRaw(Reading), color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: '平均成绩', value: 0, icon: markRaw(DataLine), color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 公告列表
const announcements = ref([])

// 快捷操作配置
const quickActions = computed(() => {
  const role = userInfo.value?.role
  const actions = [
    { name: '查看学生', icon: markRaw(User), path: '/students', color: '#409EFF' },
    { name: '查看课程', icon: markRaw(Reading), path: '/courses', color: '#67C23A' },
    { name: '成绩管理', icon: markRaw(DocumentChecked), path: '/scores', color: '#E6A23C' },
    { name: '公告通知', icon: markRaw(Bell), path: '/announcements', color: '#F56C6C' }
  ]
  
  if (role === 'admin') {
    actions.splice(1, 0, { name: '教师管理', icon: markRaw(Briefcase), path: '/teachers', color: '#909399' })
  }
  
  return actions
})

// 图表引用
const chartRef = ref(null)
const scoreChartRef = ref(null)
let chartInstance = null
let scoreChartInstance = null

// 公告详情对话框
const dialogVisible = ref(false)
const currentAnnouncement = ref(null)

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    
    // 更新统计卡片
    statistics[0].value = res?.overview?.students || 0
    statistics[1].value = res?.overview?.teachers || 0
    statistics[2].value = res?.overview?.courses || 0
    statistics[3].value = res?.overview?.averageScore || 0

    // 渲染图表
    renderChart(res?.gradeDistribution || [])
    renderScoreChart(res?.scoreDistribution || [])
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 加载公告列表
 */
const loadAnnouncements = async () => {
  try {
    const res = await getHomeAnnouncements()
    announcements.value = [...res.pinned, ...res.recent].slice(0, 6)
  } catch (error) {
    console.error('加载公告失败:', error)
  }
}

/**
 * 渲染图表
 */
const renderChart = (data) => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const chartData = data.map(item => ({
    name: item.grade + '级',
    value: item.count
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}人'
      },
      data: chartData,
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
    }]
  }

  chartInstance.setOption(option)
}

/**
 * 渲染成绩分布图表
 */
const renderScoreChart = (data) => {
  if (!scoreChartRef.value) return

  scoreChartInstance = echarts.init(scoreChartRef.value)
  
  // 如果没有数据，显示提示
  if (!data || data.length === 0) {
    scoreChartInstance.setOption({
      title: {
        text: '暂无成绩数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#909399',
          fontSize: 14
        }
      }
    })
    return
  }

  const chartData = data.map(item => ({
    name: item.range + '分',
    value: item.count
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}人'
      },
      data: chartData,
      color: ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399']
    }]
  }

  scoreChartInstance.setOption(option)
}

/**
 * 查看公告详情
 */
const viewAnnouncement = async (item) => {
  try {
    const res = await getAnnouncementDetail(item.id)
    currentAnnouncement.value = res.data?.announcement || item
  } catch (error) {
    currentAnnouncement.value = item
  }
  dialogVisible.value = true
}

/**
 * 格式化日期为相对时间（实时显示）
 * 显示格式：刚刚、几分钟前、几小时前、几天前等
 */
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  // 转换为秒
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) {
    return '刚刚'
  }
  
  // 转换为分钟
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  
  // 转换为小时
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }
  
  // 转换为天
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}天前`
  }
  
  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时执行
onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
  }

  // 加载数据
  loadStatistics()
  loadAnnouncements()

  // 监听窗口变化，自动调整图表大小
  window.addEventListener('resize', () => {
    chartInstance?.resize()
    scoreChartInstance?.resize()
  })
})
</script>

<style scoped lang="scss">
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    color: #909399;
  }
}

/* 统计卡片 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .stat-icon {
    opacity: 0.9;
  }
  
  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
    }
    
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

/* 内容区域 */
.content-row {
  margin-bottom: 20px;
}

/* 卡片容器 */
.card-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
    
    h3 {
      font-size: 16px;
      color: #303133;
    }
  }
}

/* 最新公告卡片 */
.announcements-card {
  .announcement-list {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

/* 公告列表 */
.announcement-list {
  .announcement-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px dashed #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background: #f9fafb;
      padding-left: 8px;
    }
    
    .announcement-title {
      flex: 1;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .announcement-date {
      color: #909399;
      font-size: 12px;
    }
  }
}

/* 快捷操作 */
.quick-actions {
  .action-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    align-content: start;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: #ecf5ff;
        transform: translateY(-2px);
      }
      
      span {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

/* 图表容器 */
.chart-card {
  .chart-container {
    height: 300px;
  }
}

/* 公告内容 */
.announcement-content {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.announcement-meta {
  color: #909399;
  font-size: 12px;
}
</style>
