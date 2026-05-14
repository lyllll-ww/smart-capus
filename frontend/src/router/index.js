/**
 * Vue Router 路由配置文件
 * 负责应用的所有路由导航逻辑
 */

import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由懒加载 - 按需导入页面组件，提高首屏加载速度
// 语法: () => import('组件路径')

// 导入布局组件
import Layout from '@/components/Layout.vue'

// 路由懒加载配置
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '用户登录', requiresAuth: false }
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        meta: { requiresAuth: true },
        children: [
            // 首页仪表盘
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { title: '首页', icon: 'Odometer' }
            },
            // 学生管理
            {
                path: 'students',
                name: 'Students',
                component: () => import('@/views/StudentList.vue'),
                meta: { title: '学生管理', icon: 'User', roles: ['admin', 'teacher'] }
            },
            // 教师管理
            {
                path: 'teachers',
                name: 'Teachers',
                component: () => import('@/views/TeacherList.vue'),
                meta: { title: '教师管理', icon: 'Briefcase', roles: ['admin'] }
            },
            // 课程管理
            {
                path: 'courses',
                name: 'Courses',
                component: () => import('@/views/CourseList.vue'),
                meta: { title: '课程管理', icon: 'Reading', roles: ['admin', 'teacher'] }
            },
            // 成绩管理
            {
                path: 'scores',
                name: 'Scores',
                component: () => import('@/views/ScoreList.vue'),
                meta: { title: '成绩管理', icon: 'DocumentChecked', roles: ['admin', 'teacher'] }
            },
            // 公告管理
            {
                path: 'announcements',
                name: 'Announcements',
                component: () => import('@/views/AnnouncementList.vue'),
                meta: { title: '公告管理', icon: 'Bell', roles: ['admin', 'teacher'] }
            },
            // 个人中心
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue'),
                meta: { title: '个人中心', icon: 'UserFilled' }
            }
        ]
    },
    // 404 页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面不存在' }
    }
]

// 创建路由实例
const router = createRouter({
    // 使用HTML5 History模式，URL更美观
    history: createWebHistory(),
    routes
})

// 路由导航守卫 - 权限控制
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title 
        ? `${to.meta.title} - 智慧校园系统` 
        : '智慧校园系统'

    // 从localStorage获取登录状态
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')

    // 如果未登录
    if (!token) {
        // 未登录用户访问登录页，直接放行
        if (to.name === 'Login') {
            next()
            return
        }
        
        // 未登录用户访问其他页面，重定向到登录页
        next({ 
            name: 'Login', 
            query: { redirect: to.fullPath } 
        })
        return
    }

    // 已登录用户访问登录页，重定向到首页
    if (to.name === 'Login') {
        next({ name: 'Dashboard' })
        return
    }

    // 角色权限检查
    if (to.meta.roles && userInfo) {
        try {
            const user = JSON.parse(userInfo)
            const hasPermission = to.meta.roles.includes(user.role)
            
            if (!hasPermission) {
                // 无权限访问，返回首页
                ElMessage.warning('您没有权限访问该页面')
                next({ name: 'Dashboard' })
                return
            }
        } catch (e) {
            // 解析失败，清除登录状态
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            next({ name: 'Login' })
            return
        }
    }

    next()
})

// 路由导航后置守卫 - 可用于页面埋点等
router.afterEach((to, from) => {
    console.log(`路由导航: ${from.path} -> ${to.path}`)
})

export default router
