import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 菜单公共逻辑（电脑 + 手机 通用）
export function useMenu() {
    const router = useRouter()
    const route = useRoute()

    const menuList = ref([
        { title: '首页', path: '/', icon: 'home', el_icon: 'HomeFilled' },
        { title: '商品管理', path: '/product', icon: 'cardmembership', el_icon: 'GoodsFilled' },
        { title: '订单管理', path: '/order', icon: 'cart', el_icon: 'ShoppingCartFull' },
        { title: '客户管理', path: '/customer', icon: 'user', el_icon: 'UserFilled' },
        { title: '小程序管理', path: '/mini_program', icon: 'logo-miniprogram', el_icon: 'Setting' }
    ])

    // 先给个默认值
    const activeMenu = ref('/')

    // 🔥 修复：等页面挂载后再获取路由
    onMounted(() => {
        activeMenu.value = route.path
    })

    // 监听路由变化（安全写法）
    watch(
        () => route.path,
        (path) => {
            if (path) activeMenu.value = path
        }
    )

    const handleMenuChange = (val) => {
        router.push(val)
        activeMenu.value = val
    }

    return {
        menuList,
        activeMenu,
        handleMenuChange
    }
}