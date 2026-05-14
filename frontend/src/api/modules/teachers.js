/**
 * 教师管理相关API
 */

import { get, post, put, del } from './index'

/**
 * 获取教师列表
 * @param {object} params - 查询参数 { page, pageSize, keyword, department, title }
 */
export const getTeacherList = (params) => get('/teachers', params)

/**
 * 获取教师详情
 * @param {number} id - 教师ID
 */
export const getTeacherDetail = (id) => get(`/teachers/${id}`)

/**
 * 添加教师
 * @param {object} data - 教师信息
 */
export const addTeacher = (data) => post('/teachers', data)

/**
 * 更新教师信息
 * @param {number} id - 教师ID
 * @param {object} data - 更新的数据
 */
export const updateTeacher = (id, data) => put(`/teachers/${id}`, data)

/**
 * 删除教师
 * @param {number} id - 教师ID
 */
export const deleteTeacher = (id) => del(`/teachers/${id}`)

/**
 * 获取院系列表
 */
export const getDepartmentList = () => get('/teachers/meta/departments')
