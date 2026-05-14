<template>
  <div class="teacher-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>教师管理</h2>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="工号/姓名" 
            clearable 
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="院系">
          <el-select 
            v-model="searchForm.department" 
            placeholder="选择院系" 
            clearable 
            @change="handleSearch"
          >
            <el-option 
              v-for="dept in departments" 
              :key="dept" 
              :label="dept" 
              :value="dept" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-select 
            v-model="searchForm.title" 
            placeholder="选择职称" 
            clearable 
            @change="handleSearch"
          >
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
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
        <el-icon><Plus /></el-icon> 添加教师
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
        <el-table-column prop="teacher_no" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="department" label="院系" />
        <el-table-column prop="title" label="职称" width="100">
          <template #default="{ row }">
            <el-tag :type="getTitleType(row.title)">{{ row.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="course_count" label="课程数" width="80" align="center" />
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
        <el-form-item label="工号" prop="teacher_no">
          <el-input v-model="formData.teacher_no" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="院系" prop="department">
          <el-input v-model="formData.department" placeholder="如：计算机学院" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="formData.title" placeholder="选择职称">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业特长" prop="specialty">
          <el-input v-model="formData.specialty" placeholder="请输入专业特长" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="课程数">
          <el-input :model-value="formData.course_count || 0" disabled>
            <template #append>门</template>
          </el-input>
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
 * 教师管理列表页面
 * 提供教师的增删改查功能
 */

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherList, addTeacher, updateTeacher, deleteTeacher, getDepartmentList } from '@/api/modules/teachers'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

// 院系列表
const departments = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  department: '',
  title: ''
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
const dialogTitle = ref('添加教师')
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  teacher_no: '',
  name: '',
  gender: '男',
  department: '',
  title: '',
  specialty: '',
  phone: '',
  email: '',
  course_count: 0
})

// 表单验证规则
const formRules = {
  teacher_no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }]
}

/**
 * 获取职称标签类型
 */
const getTitleType = (title) => {
  const types = {
    '教授': 'danger',
    '副教授': 'warning',
    '讲师': 'success',
    '助教': 'info'
  }
  return types[title] || 'info'
}

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const res = await getTeacherList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      department: searchForm.department,
      title: searchForm.title
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
 * 加载院系列表
 */
const loadDepartments = async () => {
  try {
    const res = await getDepartmentList()
    departments.value = res.departments
  } catch (error) {
    console.error('加载院系列表失败:', error)
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
  searchForm.department = ''
  searchForm.title = ''
  handleSearch()
}

/**
 * 添加教师
 */
const handleAdd = () => {
  dialogTitle.value = '添加教师'
  dialogVisible.value = true
}

/**
 * 编辑教师
 */
const handleEdit = (row) => {
  dialogTitle.value = '编辑教师'
  Object.keys(formData).forEach(key => {
    formData[key] = row[key]
  })
  dialogVisible.value = true
}

/**
 * 删除教师
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教师 "${row.name}" 吗？`,
      '提示',
      { type: 'warning' }
    )
    await deleteTeacher(row.id)
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
      await updateTeacher(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await addTeacher(formData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
    loadDepartments() // 刷新院系列表
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
  Object.keys(formData).forEach(key => {
    if (key === 'gender') {
      formData[key] = '男'
    } else if (key === 'course_count') {
      formData[key] = 0
    } else {
      formData[key] = ''
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  loadDepartments()
})
</script>

<style scoped lang="scss">
.teacher-list {
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
