import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isMobile } from '@/utils/device'

export function useMenu() {
    const router = useRouter()
    const route = useRoute()

    // 强制判断：当前路径是不是 mobile 开头
    const isInMobileSite = computed(() => {
        return route.path.startsWith('/mobile')
    })

    // ==============================
    // 🔥 手机端只显示：首页、订单、客户
    // 🔥 自动隐藏：商品、设置
    // ==============================
    const menuList = computed(() => {
        const baseMenu = [
            { label: '首页', path: isInMobileSite.value ? '/mobile' : '/', icon: 'home' },
            { label: '订单', path: isInMobileSite.value ? '/mobile/order' : '/order', icon: 'cart' },
            { label: '客户', path: isInMobileSite.value ? '/mobile/customer' : '/customer', icon: 'user' },
        ]

        // PC 端才显示全部菜单（可选）
        if (!isInMobileSite.value) {
            baseMenu.splice(1, 0,
                { label: '商品', path: '/product', icon: 'cardmembership' }
            )
            baseMenu.push({ label: '设置', path: '/setting', icon: 'setting' })
        }

        return baseMenu
    })

    const activeMenu = ref('')

    onMounted(() => {
        activeMenu.value = route.path
    })

    watch(() => route.path, (path) => {
        activeMenu.value = path
    })

    const handleMenuChange = (val) => {
        router.push(val)
    }

    return {
        menuList,
        activeMenu,
        handleMenuChange
    }
}