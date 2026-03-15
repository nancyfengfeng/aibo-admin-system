import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 菜单公共逻辑（电脑 + 手机 通用）
export function useMenu() {
    const router = useRouter()

    // 🔥 菜单配置（只写这一次！）
    const menuList = ref([
        { title: '首页', path: '/', icon: 'home' },
        { title: '商品管理', path: '/product', icon: 'cardmembership' },
        { title: '订单管理', path: '/order', icon: 'cart' },
        { title: '客户管理', path: '/customer', icon: 'user' },
    ])

    // 当前激活菜单
    const activeMenu = ref('/')

    // 菜单跳转
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