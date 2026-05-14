/**
 * API 请求模块
 * 封装axios，提供统一的请求拦截和响应处理
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例，配置基础URL和超时时间
const service = axios.create({
    baseURL: '/api',  // 实际请求会被代理到 http://localhost:3000/api
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器 - 统一添加Token等认证信息
service.interceptors.request.use(
    config => {
        // 从localStorage获取Token
        const token = localStorage.getItem('token')
        
        // 如果有Token，添加到请求头
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        return config
    },
    error => {
        // 请求错误处理
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一处理响应和错误
service.interceptors.response.use(
    response => {
        // 业务逻辑判断
        const res = response.data
        
        if (res.success === false) {
            // 业务错误提示
            ElMessage.error(res.message || '操作失败')
            return Promise.reject(new Error(res.message))
        }
        
        // 如果响应包含 data 字段且没有 list/total，直接返回 data
        // 否则返回完整的响应（包含 list/total 的分页数据）
        if (res.data && !res.list && !res.total) {
            return res.data
        }
        
        // 返回分页数据格式
        return {
            list: res.list || [],
            total: res.total || 0,
            page: res.page || 1,
            pageSize: res.pageSize || 10
        }
    },
    error => {
        // HTTP错误处理
        if (error.response) {
            const { status, data } = error.response
            
            switch (status) {
                case 401:
                    // Token过期或无效，跳转登录页
                    ElMessage.error('登录已过期，请重新登录')
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('没有权限执行此操作')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误，请稍后重试')
                    break
                default:
                    ElMessage.error(data.message || '请求失败')
            }
        } else if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络连接')
        } else {
            ElMessage.error('网络错误，请检查网络连接')
        }
        
        return Promise.reject(error)
    }
)

/**
 * 封装GET请求
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const get = (url, params = {}) => {
    return service.get(url, { params })
}

/**
 * 封装POST请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @returns {Promise}
 */
export const post = (url, data = {}) => {
    return service.post(url, data)
}

/**
 * 封装PUT请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @returns {Promise}
 */
export const put = (url, data = {}) => {
    return service.put(url, data)
}

/**
 * 封装DELETE请求
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const del = (url, params = {}) => {
    return service.delete(url, { params })
}

// 导出service实例供直接调用
export default service
