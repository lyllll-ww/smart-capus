/**
 * 系统统计相关API
 */

import { get } from './index'

/**
 * 获取系统统计数据
 * 包括学生、教师、课程、成绩总数及各种分布信息
 * 使用公开接口，无需登录
 */
export const getStatistics = () => get('/public/stats')
