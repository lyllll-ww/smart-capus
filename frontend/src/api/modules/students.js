/**
 * 学生管理相关API
 */

import { get, post, put, del } from './index'

/**
 * 获取学生列表
 * @param {object} params - 查询参数 { page, pageSize, keyword, class, grade }
 */
export const getStudentList = (params) => get('/students', params)

/**
 * 获取学生详情
 * @param {number} id - 学生ID
 */
export const getStudentDetail = (id) => get(`/students/${id}`)

/**
 * 添加学生
 * @param {object} data - 学生信息
 */
export const addStudent = (data) => post('/students', data)

/**
 * 更新学生信息
 * @param {number} id - 学生ID
 * @param {object} data - 更新的数据
 */
export const updateStudent = (id, data) => put(`/students/${id}`, data)

/**
 * 删除学生
 * @param {number} id - 学生ID
 */
export const deleteStudent = (id) => del(`/students/${id}`)

/**
 * 批量导入学生
 * @param {array} students - 学生数组
 */
export const batchImportStudents = (students) => post('/students/batch', { students })
