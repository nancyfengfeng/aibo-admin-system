import { createRouter, createWebHistory } from 'vue-router'
import { isMobile } from '@/utils/device'
import { auth } from '@/utils/cloudbase'

const routes = [
    // PC 页面
    {
        path: '/',
        component: () => import('@/views/pc/Home.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', component: () => import('@/views/pc/pages/HomePage.vue') },
            { path: 'customer', component: () => import('@/views/pc/pages/CustomerPage.vue') },
            { path: 'product', component: () => import('@/views/pc/pages/ProductPage.vue') },
            { path: 'category&tag', component: () => import('@/views/pc/pages/CategoryTagPage.vue') },
            { path: 'stock', component: () => import('@/views/pc/pages/StockManagePage.vue') },
            { path: 'order', component: () => import('@/views/pc/pages/OrderPage.vue') },
            { path: 'order-pdf', component: () => import('@/views/pc/pages/OrderPDFPage.vue') },
            { path: 'setting', component: () => import('@/views/pc/pages/SettingPage.vue') },
        ]
    },
    { path: '/login', component: () => import('@/views/pc/PcLogin.vue') },

    // 移动端页面
    {
        path: '/mobile',
        component: () => import('@/views/mobile/Home.vue'),
        meta: { requiresAuth: true },
        children: [
            {path: '',component:()=>import('@/views/mobile/pages/HomePage.vue')},
            {path: 'order',component:()=>import('@/views/mobile/pages/OrderPage.vue')},
            {path: 'customer',component:()=>import('@/views/mobile/pages/CustomerPage.vue')}
        ]
    },
    { path: '/mobile/login', component: () => import('@/views/mobile/MobileLogin.vue') }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const isLogin = !!auth.currentUser

    // ======================================
    // 强制调试模式（加这个最关键）
    // 只要路径是 /mobile 开头，就强制认为是移动端
    // ======================================
    const manuallyAccessMobile = to.path.startsWith('/mobile')

    // 强制移动端调试
    const forceQuery = to.query.force === 'true'
    let forceMemory = sessionStorage.getItem('forceMobile') === 'true'

    if (forceQuery) {
        forceMemory = true
        sessionStorage.setItem('forceMobile', 'true')
    }

    // ======================================
    // 最终判断：手动输入 > 强制记忆 > 设备判断
    // ======================================
    const mobile = manuallyAccessMobile || forceMemory || isMobile()

    // ======================================
    // 1. 需要登录但未登录 → 跳对应登录页
    // ======================================
    if (to.meta.requiresAuth && !isLogin) {
        return next(mobile ? '/mobile/login' : '/login')
    }

    // ======================================
    // 2. 已登录访问登录页 → 跳首页
    // ======================================
    if (isLogin && (to.path === '/login' || to.path === '/mobile/login')) {
        return next(mobile ? '/mobile' : '/')
    }

    // ======================================
    // 3. 放行：手动访问 /mobile 不拦截！
    // ======================================
    if (manuallyAccessMobile) {
        return next()
    }

    // ======================================
    // 4. 手机访问 PC → 自动跳转移动端
    // ======================================
    if (mobile && !to.path.startsWith('/mobile')) {
        return next('/mobile')
    }

    // ======================================
    // 5. PC 访问移动端 → 自动跳转 PC
    // ======================================
    if (!mobile && to.path.startsWith('/mobile')) {
        return next('/')
    }

    next()
})

export default router