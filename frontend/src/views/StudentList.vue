<template>
  <div class="student-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>学生管理</h2>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="学号/姓名" 
            clearable 
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="班级">
          <el-input 
            v-model="searchForm.class" 
            placeholder="班级名称" 
            clearable 
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="年级">
          <el-select 
            v-model="searchForm.grade" 
            placeholder="选择年级" 
            clearable 
            @change="handleSearch"
          >
            <el-option label="2024级" :value="2024" />
            <el-option label="2023级" :value="2023" />
            <el-option label="2022级" :value="2022" />
            <el-option label="2021级" :value="2021" />
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
        <el-icon><Plus /></el-icon> 添加学生
      </el-button>
      <el-button type="success" @click="handleImport">
        <el-icon><Upload /></el-icon> 批量导入
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
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">{{ row.gender || '-' }}</template>
        </el-table-column>
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="enrollment_year" label="年级" width="80">
          <template #default="{ row }">{{ row.enrollment_year ? `${row.enrollment_year}级` : '-' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="email" label="邮箱" />
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
        <el-form-item label="学号" prop="student_no">
          <el-input v-model="formData.student_no" placeholder="请输入学号" />
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
        <el-form-item label="班级" prop="class_name">
          <el-input v-model="formData.class_name" placeholder="如：计算机2024-1班" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="formData.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="年级" prop="enrollment_year">
          <el-select v-model="formData.enrollment_year" placeholder="选择年级">
            <el-option label="2024级" :value="2024" />
            <el-option label="2023级" :value="2023" />
            <el-option label="2022级" :value="2022" />
            <el-option label="2021级" :value="2021" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
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
 * 学生管理列表页面
 * 提供学生的增删改查功能
 */

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudentList, addStudent, updateStudent, deleteStudent } from '@/api/modules/students'
import { Search, Plus, Upload, Edit, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  class: '',
  grade: null
})

// 班级列表
const classList = ref([])

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
const dialogTitle = ref('添加学生')
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  student_no: '',
  name: '',
  gender: '',
  class_name: '',
  major: '',
  enrollment_year: null,
  phone: '',
  email: ''
})

// 表单验证规则
const formRules = {
  student_no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  class_name: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  enrollment_year: [{ required: true, message: '请选择年级', trigger: 'change' }]
}

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const res = await getStudentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      class: searchForm.class,
      grade: searchForm.grade
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
  searchForm.class = ''
  searchForm.grade = null
  handleSearch()
}

/**
 * 添加学生
 */
const handleAdd = () => {
  dialogTitle.value = '添加学生'
  dialogVisible.value = true
}

/**
 * 编辑学生
 */
const handleEdit = (row) => {
  dialogTitle.value = '编辑学生'
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = row[key]
  })
  dialogVisible.value = true
}

/**
 * 删除学生
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${row.name}" 吗？删除后该学生的成绩也将一并删除。`,
      '提示',
      { type: 'warning' }
    )
    await deleteStudent(row.id)
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
      // 编辑模式
      await updateStudent(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      // 添加模式
      await addStudent(formData)
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
  Object.keys(formData).forEach(key => {
    if (key === 'gender') {
      formData[key] = ''
    } else if (key === 'enrollment_year') {
      formData[key] = null
    } else if (key === 'id') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
}

/**
 * 批量导入（简化实现）
 */
const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.student-list {
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
