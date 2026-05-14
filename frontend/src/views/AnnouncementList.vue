<template>
  <div class="announcement-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>公告管理</h2>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="标题/内容" 
            clearable 
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select 
            v-model="searchForm.category" 
            placeholder="选择分类" 
            clearable 
            @change="handleSearch"
          >
            <el-option label="通知" value="通知" />
            <el-option label="新闻" value="新闻" />
            <el-option label="活动" value="活动" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 发布公告
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="card-container">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <el-tag v-if="row.is_pinned" type="danger" size="small" effect="dark">置顶</el-tag>
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="分类" width="80">
          <template #default="{ row }">
            <el-tag>{{ row.type || '通知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="发布人" width="100">
          <template #default="{ row }">
            {{ row.author_name || row.author || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="80" align="center" />
        <el-table-column prop="created_at" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button type="success" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="分类" prop="type">
          <el-select v-model="formData.type" placeholder="选择分类">
            <el-option label="通知" value="notice" />
            <el-option label="新闻" value="news" />
            <el-option label="活动" value="activity" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布人" prop="author">
          <el-input v-model="formData.author" placeholder="请输入发布人姓名" />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="formData.is_pinned" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="formData.content" 
            type="textarea" 
            :rows="8" 
            placeholder="请输入公告内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="viewData.title"
      width="700px"
    >
      <div class="announcement-detail">
        <div class="detail-meta">
          <span>发布人：{{ viewData.author }}</span>
          <span>分类：{{ viewData.type || '通知' }}</span>
          <span>浏览：{{ viewData.views }} 次</span>
          <span>时间：{{ formatDate(viewData.created_at) }}</span>
        </div>
        <el-divider />
        <div class="detail-content">{{ viewData.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 公告管理列表页面
 * 提供公告的发布、查看、编辑功能
 */

import { ref, reactive, onMounted, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAnnouncementList, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  getAnnouncementDetail
} from '@/api/modules/announcements'
import { Search, Plus, View, Edit, Delete } from '@element-plus/icons-vue'

/**
 * 从父组件（Layout）注入公告已读标记方法
 * 使用 provide/inject 模式实现跨组件通信
 */
const markAnnouncementAsRead = inject('markAnnouncementAsRead')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: ''
})

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('发布公告')
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  content: '',
  author: '',
  type: 'notice',
  is_pinned: false
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// 查看对话框
const viewDialogVisible = ref(false)
const viewData = reactive({
  title: '',
  content: '',
  author: '',
  type: '',
  views: 0,
  created_at: ''
})

/**
 * 格式化日期显示为相对时间（实时显示）
 * 
 * 功能说明：
 * 将 ISO 格式的日期字符串转换为相对时间格式显示
 * 实现实时更新的效果
 * 
 * @param {string} dateStr - ISO 格式的日期字符串
 * @returns {string} 相对时间字符串，如 "刚刚"、"5分钟前"、"2小时前"、"3天前"
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

/**
 * 加载公告列表数据
 * 
 * 功能说明：
 * 1. 根据当前分页和搜索条件从服务器获取公告列表
 * 2. 更新表格数据和分页信息
 * 3. 处理加载状态和错误情况
 * 
 * API参数：
 * - page: 当前页码
 * - pageSize: 每页条数
 * - keyword: 搜索关键词（标题/内容）
 * - category: 分类筛选
 */
const loadData = async () => {
  // 开始加载，显示 loading 状态
  loading.value = true
  try {
    // 调用公告列表 API
    const res = await getAnnouncementList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      category: searchForm.category
    })
    // 更新表格数据
    tableData.value = res.list
    // 更新分页总数
    pagination.total = res.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    // 无论成功失败，都要关闭 loading 状态
    loading.value = false
  }
}

/**
 * 处理搜索操作
 * 
 * 功能说明：
 * 1. 重置页码为第1页（新搜索应从第一页开始）
 * 2. 重新加载数据
 */
const handleSearch = () => {
  // 重置页码
  pagination.page = 1
  // 执行搜索
  loadData()
}

/**
 * 重置搜索条件
 * 
 * 功能说明：
 * 1. 清空关键词输入框
 * 2. 清空分类选择
 * 3. 重新加载全部数据
 */
const handleReset = () => {
  // 清空关键词
  searchForm.keyword = ''
  // 清空分类
  searchForm.category = ''
  // 执行搜索（此时条件已清空，等同于显示全部）
  handleSearch()
}

/**
 * 打开发布公告对话框
 * 
 * 功能说明：
 * 1. 设置对话框标题为"发布公告"
 * 2. 自动填充当前登录用户作为发布人
 * 3. 打开对话框让用户填写公告信息
 */
const handleAdd = () => {
  // 设置对话框标题
  dialogTitle.value = '发布公告'
  // 获取当前登录用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  // 自动填充发布人字段
  formData.author = userInfo.name || ''
  // 打开对话框
  dialogVisible.value = true
}

/**
 * 查看公告详情
 * @param {Object} row - 公告行数据
 */
const handleView = async (row) => {
  try {
    // 调用API获取公告详情
    const res = await getAnnouncementDetail(row.id)
    // 将详情数据填充到视图数据对象中
    Object.assign(viewData, res.announcement)
    // 显示详情对话框
    viewDialogVisible.value = true
    // 调用父组件注入的方法标记公告为已读
    // 该方法会更新本地存储中的已读记录并刷新未读计数
    if (markAnnouncementAsRead) {
      markAnnouncementAsRead(row.id)
    }
  } catch (error) {
    console.error('加载公告详情失败:', error)
  }
}

/**
 * 打开编辑公告对话框
 * 
 * 功能说明：
 * 1. 设置对话框标题为"编辑公告"
 * 2. 填充表单数据为当前选中行的数据
 * 3. 打开对话框让用户修改公告信息
 * 
 * @param {Object} row - 当前行的公告数据对象
 */
const handleEdit = (row) => {
  // 设置对话框标题
  dialogTitle.value = '编辑公告'
  // 将行数据填充到表单数据对象中
  Object.keys(formData).forEach(key => {
    // is_pinned 字段需要转换为布尔值
    if (key === 'is_pinned') {
      formData[key] = !!row[key]
    } else {
      formData[key] = row[key]
    }
  })
  // 打开对话框
  dialogVisible.value = true
}

/**
 * 删除公告
 * 
 * 功能说明：
 * 1. 弹出确认对话框，防止误删
 * 2. 确认后调用API删除公告
 * 3. 删除成功后刷新列表数据
 * 
 * @param {Object} row - 要删除的公告行数据
 */
const handleDelete = async (row) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要删除公告 "${row.title}" 吗？`,  // 显示要删除的公告标题
      '提示',
      { type: 'warning' }
    )
    // 调用API删除公告
    await deleteAnnouncement(row.id)
    // 显示成功消息
    ElMessage.success('删除成功')
    // 刷新列表数据
    loadData()
  } catch (error) {
    // 如果用户取消操作，不显示错误
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

/**
 * 提交表单（发布/更新公告）
 * 
 * 功能说明：
 * 1. 先进行表单验证
 * 2. 根据是否有ID判断是新增还是更新
 * 3. 调用对应的API
 * 4. 成功后关闭对话框并刷新列表
 * 
 * 表单验证规则：
 * - title: 必填
 * - category: 必选
 * - content: 必填
 */
const handleSubmit = async () => {
  // 先验证表单，通过才继续
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return  // 验证不通过则不提交

  // 开始提交，显示loading状态
  submitting.value = true
  try {
    if (formData.id) {
      // 存在ID则为更新操作
      await updateAnnouncement(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      // 不存在ID则为新增操作
      await addAnnouncement(formData)
      ElMessage.success('发布成功')
    }
    // 关闭对话框
    dialogVisible.value = false
    // 刷新列表数据
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    // 无论成功失败，都要关闭loading状态
    submitting.value = false
  }
}

/**
 * 对话框关闭时的回调
 * 
 * 功能说明：
 * 1. 重置表单字段到初始状态
 * 2. 重置 is_top 开关（因为 resetFields 不会重置非表单元素）
 */
const handleDialogClose = () => {
  // 重置表单字段
  formRef.value?.resetFields()
  // 重置置顶开关
  formData.is_pinned = false
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.announcement-list {
  .search-form {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .table-toolbar {
    margin-bottom: 16px;
  }

  .card-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
  }

  .title-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .title-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .announcement-detail {
    .detail-meta {
      display: flex;
      gap: 20px;
      color: #909399;
      font-size: 14px;
    }
    
    .detail-content {
      line-height: 1.8;
      color: #303133;
      white-space: pre-wrap;
    }
  }
}
</style>
