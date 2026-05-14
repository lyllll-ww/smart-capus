/**
 * API 请求工具模块
 * 基于 axios 封装 HTTP 请求方法
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',  // 使用代理
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据状态码处理
    if (res.code === 200 || res.success) {
      return res.data !== undefined ? res.data : res
    }
    
    // Token 过期
    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
      return Promise.reject(new Error('登录已过期'))
    }
    
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    // 网络错误
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      const status = error.response.status
      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器错误，请稍后重试')
      } else {
        ElMessage.error(error.response.data?.message || '请求失败')
      }
    }
    return Promise.reject(error)
  }
)

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {object} params - 查询参数
 */
export const get = (url, params) => {
  return service.get(url, { params })
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 */
export const post = (url, data) => {
  return service.post(url, data)
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 */
export const put = (url, data) => {
  return service.put(url, data)
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 */
export const del = (url) => {
  return service.delete(url)
}

export default service
