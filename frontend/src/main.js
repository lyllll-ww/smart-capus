/**
 * 应用入口文件
 * 创建Vue应用实例并挂载到DOM
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

// 引入全局样式
import './assets/styles/global.scss'

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理实例
const pinia = createPinia()

// 注册Pinia持久化插件
pinia.use(piniaPluginPersistedstate)

// 注册Pinia
app.use(pinia)

// 注册Vue Router
app.use(router)

// 注册Element Plus（中文语言包）
app.use(ElementPlus, { locale: zhCn })

// 注册所有Element Plus图标
// 这样可以在组件中直接使用 <el-icon><xxx /></el-icon>
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载应用到#app元素
app.mount('#app')
