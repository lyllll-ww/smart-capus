<template>
  <div class="course-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>课程管理</h2>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="课程号/名称" 
            clearable 
            @clear="handleSearch"
          />
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
        <el-icon><Plus /></el-icon> 添加课程
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
        <el-table-column prop="course_code" label="课程号" width="100" />
        <el-table-column prop="course_name" label="课程名称" min-width="150" />
        <el-table-column prop="credits" label="学分" width="60" align="center" />
        <el-table-column prop="teacher_name" label="授课教师" width="100" />
        <el-table-column prop="semester" label="学期" width="80" />
        <el-table-column prop="semester_year" label="年份" width="70" align="center" />
        <el-table-column prop="max_students" label="容量" width="60" align="center" />
        <el-table-column prop="student_count" label="已选" width="60" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.student_count || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
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
          :page-sizes="[10, 20, 50, 100]"
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="课程号" prop="course_code">
          <el-input v-model="formData.course_code" placeholder="如：CS101" />
        </el-form-item>
        <el-form-item label="课程名" prop="course_name">
          <el-input v-model="formData.course_name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学分" prop="credits">
          <el-input-number v-model="formData.credits" :min="0" :max="10" :step="0.5" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher_id">
          <el-select v-model="formData.teacher_id" placeholder="选择教师" filterable clearable>
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.name} - ${teacher.department || teacher.title || ''}`"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="formData.semester" placeholder="选择学期">
            <el-option label="春季" value="春季" />
            <el-option label="秋季" value="秋季" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份" prop="semester_year">
          <el-input-number v-model="formData.semester_year" :min="2020" :max="2030" />
        </el-form-item>
        <el-form-item label="容量" prop="max_students">
          <el-input-number v-model="formData.max_students" :min="1" :max="500" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程简介"
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
  </div>
</template>

<script setup>
/**
 * 课程管理列表页面
 * 提供课程的增删改查功能
 */

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourseList, addCourse, updateCourse, deleteCourse, getSemesterList } from '@/api/modules/courses'
import { getTeacherList } from '@/api/modules/teachers'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

// 学期列表
const semesters = ref([])
// 教师列表
const teachers = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
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
const dialogTitle = ref('添加课程')
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  course_code: '',
  course_name: '',
  credits: 3,
  teacher_id: null,
  semester: '',
  semester_year: new Date().getFullYear(),
  max_students: 50,
  description: ''
})

// 表单验证规则
const formRules = {
  course_code: [{ required: true, message: '请输入课程号', trigger: 'blur' }],
  course_name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credits: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }]
}

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const res = await getCourseList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
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
 * 加载学期列表
 */
const loadSemesters = async () => {
  try {
    const res = await getSemesterList()
    semesters.value = res.semesters
  } catch (error) {
    console.error('加载学期列表失败:', error)
  }
}

/**
 * 加载教师列表
 */
const loadTeachers = async () => {
  try {
    const res = await getTeacherList({ pageSize: 100 })
    teachers.value = res.list
  } catch (error) {
    console.error('加载教师列表失败:', error)
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
  searchForm.keyword = ''
  searchForm.semester = ''
  handleSearch()
}

/**
 * 添加课程
 */
const handleAdd = () => {
  dialogTitle.value = '添加课程'
  dialogVisible.value = true
}

/**
 * 编辑课程
 */
const handleEdit = (row) => {
  dialogTitle.value = '编辑课程'
  Object.keys(formData).forEach(key => {
    formData[key] = row[key]
  })
  dialogVisible.value = true
}

/**
 * 删除课程
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程 "${row.course_name}" 吗？`,
      '提示',
      { type: 'warning' }
    )
    await deleteCourse(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (formData.id) {
      await updateCourse(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await addCourse(formData)
      ElMessage.success('添加成功')
    }
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
  formData.credits = 3
  formData.max_students = 50
  formData.teacher_id = null
  formData.semester_year = new Date().getFullYear()
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  loadSemesters()
  loadTeachers()
})
</script>

<style scoped lang="scss">
.course-list {
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
}
</style>
