/**
 * 课程管理相关API
 */

import { get, post, put, del } from './index'

/**
 * 获取课程列表
 * @param {object} params - 查询参数 { page, pageSize, keyword, semester, teacherId }
 */
export const getCourseList = (params) => get('/courses', params)

/**
 * 获取课程详情
 * @param {number} id - 课程ID
 */
export const getCourseDetail = (id) => get(`/courses/${id}`)

/**
 * 添加课程
 * @param {object} data - 课程信息
 */
export const addCourse = (data) => post('/courses', data)

/**
 * 更新课程信息
 * @param {number} id - 课程ID
 * @param {object} data - 更新的数据
 */
export const updateCourse = (id, data) => put(`/courses/${id}`, data)

/**
 * 删除课程
 * @param {number} id - 课程ID
 */
export const deleteCourse = (id) => del(`/courses/${id}`)

/**
 * 获取学期列表
 */
export const getSemesterList = () => get('/courses/meta/semesters')
