import { createRouter, createWebHistory } from 'vue-router'

// 引入你的页面组件 (注意检查路径是否和你的项目一致)
import DemoPage from '../pages/demo/DemoPage.vue'
import ListPage from '../pages/admin/ListPage.vue'
import LoginPage from '../pages/admin/LoginPage.vue'
// 👇 🌟 新增：引入应用管理页面
import AppManage from '../pages/admin/AppManage.vue' 

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/demo', // 前台演示页（任何人都能进）
      name: 'Demo',
      component: DemoPage
    },
    {
      path: '/login', // 登录页
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/admin', // 管控后台主页 (短链列表)
      name: 'Admin',
      component: ListPage,
      meta: { requiresAuth: true } 
    },
    // 👇 🌟 新增：OpenAPI 应用管理页的路由
    {
      path: '/admin/apps', 
      name: 'AppManage',
      component: AppManage,
      // 同样贴上需要身份验证的标签，被下方的保安死死守住！
      meta: { requiresAuth: true } 
    },
    {
      path: '/',
      redirect: '/demo'
    }
  ]
})

// 🌟 核心魔法：全局前置路由守卫（前端保安）
router.beforeEach((to, from, next) => {
  // 1. 看看你要去的页面，是不是贴了“需要身份验证”的标签？
  if (to.meta.requiresAuth) {
    // 2. 去浏览器的本地保险箱 (localStorage) 找找有没有刚才存的 token
    const token = localStorage.getItem('token')
    
    if (token) {
      // 3. 有 token，出示证件成功，放行！
      next() 
    } else {
      // 4. 没 token，想白嫖？踢回登录页！
      next('/login') 
    }
  } else {
    // 不需要验证的页面（比如 /demo 和 /login），直接放行
    next() 
  }
})

export default router