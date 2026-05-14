/**
 * 用户认证相关API
 */

import { get, post, put } from './index'

/**
 * 用户登录
 * @param {object} data - 登录信息 { username, password }
 */
export const login = (data) => post('/auth/login', data)

/**
 * 用户注册
 * @param {object} data - 注册信息 { username, password, name, role, email, phone }
 */
export const register = (data) => post('/auth/register', data)

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => get('/auth/user')

/**
 * 修改密码
 * @param {object} data - { oldPassword, newPassword }
 */
export const changePassword = (data) => put('/auth/password', data)
