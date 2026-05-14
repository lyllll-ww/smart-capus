/**
 * 成绩管理相关API
 */

import { get, post, put, del } from './index'

/**
 * 获取成绩列表
 * @param {object} params - 查询参数
 */
export const getScoreList = (params) => get('/scores', params)

/**
 * 获取学生成绩
 * @param {number} studentId - 学生ID
 * @param {string} semester - 学期（可选）
 */
export const getStudentScores = (studentId, semester) => 
    get(`/scores/student/${studentId}`, { semester })

/**
 * 录入/更新成绩
 * @param {object} data - 成绩信息
 */
export const addScore = (data) => post('/scores', data)

/**
 * 批量录入成绩
 * @param {number} courseId - 课程ID
 * @param {string} semester - 学期
 * @param {array} scores - 成绩数组
 */
export const batchAddScores = (courseId, semester, scores) => 
    post('/scores/batch', { course_id: courseId, semester, scores })

/**
 * 获取成绩统计
 * @param {object} params - 查询参数 { courseId, semester }
 */
export const getScoreStatistics = (params) => get('/scores/statistics', params)

/**
 * 删除成绩记录
 * @param {number} id - 成绩ID
 */
export const deleteScore = (id) => del(`/scores/${id}`)
