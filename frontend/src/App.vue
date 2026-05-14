<template>
  <!-- 根组件 - 应用外壳 -->
  <div id="app">
    <!-- 使用Vue Router的视图组件渲染匹配的路由组件 -->
    <router-view />
  </div>
</template>

<script setup>
/**
 * 根组件
 * 应用的最顶层组件，负责渲染路由视图
 */

// 无需额外逻辑，路由视图会处理页面渲染
</script>

<style>
/* 全局样式已移至 assets/styles/global.scss */
</style>
