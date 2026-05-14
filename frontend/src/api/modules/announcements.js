/**
 * 公告管理相关API
 */

import { get, post, put, del } from './index'

/**
 * 获取公告列表
 * @param {object} params - 查询参数 { page, pageSize, keyword, category, isTop }
 */
export const getAnnouncementList = (params) => get('/announcements', params)

/**
 * 获取首页公告（置顶+最新）
 */
export const getHomeAnnouncements = () => get('/announcements/home')

/**
 * 获取公告详情
 * @param {number} id - 公告ID
 */
export const getAnnouncementDetail = (id) => get(`/announcements/${id}`)

/**
 * 发布公告
 * @param {object} data - 公告信息
 */
export const addAnnouncement = (data) => post('/announcements', data)

/**
 * 更新公告
 * @param {number} id - 公告ID
 * @param {object} data - 更新的数据
 */
export const updateAnnouncement = (id, data) => put(`/announcements/${id}`, data)

/**
 * 删除公告
 * @param {number} id - 公告ID
 */
export const deleteAnnouncement = (id) => del(`/announcements/${id}`)

/**
 * 获取分类列表
 */
export const getCategoryList = () => get('/announcements/meta/categories')
