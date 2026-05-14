<template>
  <div class="score-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>成绩管理</h2>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学生">
          <el-input 
            v-model="searchForm.studentKeyword" 
            placeholder="学号/姓名" 
            clearable 
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="选择课程"
            clearable
            filterable
            @change="handleSearch"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="`${course.course_code} - ${course.course_name}`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select 
            v-model="searchForm.semester" 
            placeholder="选择学期" 
            clearable 
            @change="handleSearch"
          >
            <el-option
              v-for="sem in semesters"
              :key="sem"
              :label="sem"
              :value="sem"
            />
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
        <el-icon><Plus /></el-icon> 录入成绩
      </el-button>
      <el-button type="success" @click="showStats = true">
        <el-icon><DataLine /></el-icon> 成绩统计
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
        <el-table-column prop="student_no" label="学号" width="110" />
        <el-table-column prop="student_name" label="学生姓名" width="90" />
        <el-table-column prop="class_name" label="班级" min-width="150" />
        <el-table-column prop="course_code" label="课程号" width="90" />
        <el-table-column prop="course_name" label="课程名称" min-width="150" />
        <el-table-column prop="credits" label="学分" width="60" align="center" />
        <el-table-column prop="semester" label="学期" width="70" />
        <el-table-column prop="semester_year" label="年份" width="70" align="center" />
        <el-table-column prop="score" label="总成绩" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.score)">{{ row.score ?? '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 录入/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="学生" prop="student_id">
          <el-select 
            v-model="formData.student_id" 
            placeholder="选择学生" 
            filterable
            remote
            :remote-method="searchStudents"
            :loading="studentLoading"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="`${student.student_no} - ${student.name}`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course_id">
          <el-select v-model="formData.course_id" placeholder="选择课程" filterable>
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="`${course.course_code} - ${course.course_name}`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="formData.semester" placeholder="选择学期">
            <el-option label="春季" value="春季" />
            <el-option label="秋季" value="秋季" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="formData.semester_year"
            :min="2020"
            :max="2030"
          />
        </el-form-item>
        <el-form-item label="成绩">
          <el-input-number 
            v-model="formData.score" 
            :min="0" 
            :max="100" 
            :precision="1"
            controls-position="right"
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

    <!-- 成绩统计对话框 -->
    <el-dialog
      v-model="showStats"
      title="成绩统计"
      width="700px"
    >
      <el-row :gutter="20" class="stats-overview">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ stats.avg_score }}</div>
            <div class="stat-label">平均成绩</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-value">{{ stats.passRate }}%</div>
            <div class="stat-label">及格率</div>
          </div>
        </el-col>
      </el-row>
      <div ref="statsChartRef" class="stats-chart"></div>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 成绩管理列表页面
 * 提供成绩的录入、查询、统计功能
 */

import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getScoreList, addScore, getScoreStatistics } from '@/api/modules/scores'
import { getCourseList } from '@/api/modules/courses'
import { getStudentList } from '@/api/modules/students'
import * as echarts from 'echarts'
import { Search, Plus, Edit, DataLine } from '@element-plus/icons-vue'

// 课程列表
const courses = ref([])
const semesters = ref(['春季', '秋季'])

// 学生搜索
const studentLoading = ref(false)
const studentOptions = ref([])

// 搜索表单
const searchForm = reactive({
  studentKeyword: '',
  courseId: null,
  semester: ''
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
const dialogTitle = ref('录入成绩')
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  student_id: null,
  course_id: null,
  semester: '',
  semester_year: new Date().getFullYear(),
  score: null
})

// 表单验证规则
const formRules = {
  student_id: [{ required: true, message: '请选择学生', trigger: 'change' }],
  course_id: [{ required: true, message: '请选择课程', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

// 统计相关
const showStats = ref(false)
const statsChartRef = ref(null)
const stats = reactive({
  total: 0,
  avg_score: 0,
  passRate: 0
})

/**
 * 获取成绩标签类型
 */
const getScoreType = (score) => {
  if (score === null || score === undefined) return 'info'
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

/**
 * 搜索学生
 */
const searchStudents = async (query) => {
  if (!query) {
    studentOptions.value = []
    return
  }
  studentLoading.value = true
  try {
    const res = await getStudentList({ keyword: query, pageSize: 20 })
    studentOptions.value = res.list
  } catch (error) {
    console.error('搜索学生失败:', error)
  } finally {
    studentLoading.value = false
  }
}

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const res = await getScoreList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      studentKeyword: searchForm.studentKeyword,
      courseId: searchForm.courseId,
      semester: searchForm.semester
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载课程列表
 */
const loadCourses = async () => {
  try {
    const res = await getCourseList({ pageSize: 100 })
    courses.value = res.list
  } catch (error) {
    console.error('加载课程列表失败:', error)
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.studentKeyword = ''
  searchForm.courseId = null
  searchForm.semester = ''
  handleSearch()
}

/**
 * 录入成绩
 */
const handleAdd = () => {
  dialogTitle.value = '录入成绩'
  dialogVisible.value = true
}

/**
 * 编辑成绩
 */
const handleEdit = (row) => {
  dialogTitle.value = '编辑成绩'
  Object.keys(formData).forEach(key => {
    formData[key] = row[key]
  })
  // 查找学生选项
  studentOptions.value = [{
    id: row.student_id,
    student_no: row.student_no,
    name: row.student_name || row.name
  }]
  dialogVisible.value = true
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await addScore(formData)
    ElMessage.success(formData.id ? '更新成功' : '录入成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 对话框关闭时重置表单
 */
const handleDialogClose = () => {
  formRef.value?.resetFields()
  studentOptions.value = []
  formData.semester_year = new Date().getFullYear()
}

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    const res = await getScoreStatistics({
      courseId: searchForm.courseId,
      semester: searchForm.semester
    })
    stats.total = res.total
    stats.avg_score = res.overall?.avg_score?.toFixed(1) || 0
    stats.passRate = res.distribution?.passRate || 0
    
    // 渲染图表
    await nextTick()
    renderStatsChart(res.distribution)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 渲染统计图表
 */
const renderStatsChart = (distribution) => {
  if (!statsChartRef.value) return

  const chart = echarts.init(statsChartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      label: { show: true, formatter: '{b}: {d}%' },
      data: [
        { value: distribution?.excellent || 0, name: '优秀(90+)' },
        { value: distribution?.good || 0, name: '良好(80-89)' },
        { value: distribution?.medium || 0, name: '中等(70-79)' },
        { value: distribution?.pass || 0, name: '及格(60-69)' },
        { value: distribution?.fail || 0, name: '不及格' }
      ]
    }]
  }
  chart.setOption(option)
}

// 监听统计对话框打开
watch(showStats, (val) => {
  if (val) {
    loadStatistics()
  }
})

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  loadCourses()
})
</script>

<style scoped lang="scss">
.score-list {
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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .stats-overview {
    margin-bottom: 20px;
    
    .stat-item {
      text-align: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #409eff;
      }
      
      .stat-label {
        color: #909399;
        margin-top: 8px;
      }
    }
  }

  .stats-chart {
    height: 300px;
  }
}
</style>
