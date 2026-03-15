import { createRouter, createWebHistory } from 'vue-router'
import { isMobile } from '@/utils/device'
import { auth } from '@/utils/cloudbase'

const routes = [
    // 电脑端
    {
        path: '/',
        component: () => import('@/views/pc/Home.vue'),
        meta: { requiresAuth: true },
        children: [
            // 👇 内容组件，会渲染到 t-content 里
            { path: '', component: () => import('@/views/pc/pages/HomePage.vue') },
            { path: 'customer', component: () => import('@/views/pc/pages/CustomerPage.vue') },
            { path: 'product', component: () => import('@/views/pc/pages/ProductPage.vue') },
        ]
    },
    {
        path: '/login',
        component: () => import('@/views/pc/PcLogin.vue')
    },

    // 手机端
    {
        path: '/mobile',
        component: () => import('@/views/mobile/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/mobile/login',
        component: () => import('@/views/mobile/MobileLogin.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isLogin = !!auth.currentUser
    const mobile = isMobile()

    if (to.meta.requiresAuth && !isLogin) {
        return next(mobile ? '/mobile/login' : '/login')
    }

    if (isLogin && (to.path === '/login' || to.path === '/mobile/login')) {
        return next(mobile ? '/mobile' : '/')
    }

    if (mobile && !to.path.startsWith('/mobile')) {
        return next('/mobile')
    }

    if (!mobile && to.path.startsWith('/mobile')) {
        return next('/')
    }

    next()
})

export default router