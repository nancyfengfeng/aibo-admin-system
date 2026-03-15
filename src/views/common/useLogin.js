import { ref } from 'vue'
import { auth } from '@/utils/cloudbase'

export function useLogin() {
    const loading = ref(false)

    // 登录
    const login = async (username, password) => {
        if (!username || !password) {
            alert('请输入账号密码')
            return false
        }

        loading.value = true
        try {
            // 登录
            const loginState = await auth.signIn({
                username: username,
                password: password
            })

            console.log('登录成功 → 用户信息', loginState.user)
            return true

        } catch (err) {
            console.error('登录失败', err)
            alert('登录失败：' + err.message)
            return false
        } finally {
            loading.value = false
        }
    }

    // 退出登录
    const logout = async () => {
        try {
            await auth.signOut()
            location.reload()
        } catch (err) {
            console.error('退出失败', err)
        }
    }

    // ✅【修复】获取当前登录用户
    const getUser = () => {
        return auth.currentUser || null
    }

    // ✅【修复】获取用户名（你最需要的！）
    const getNickname = () => {
        const user = auth.currentUser
        if (!user) return '未登录'
        // 优先显示昵称，没有则显示用户名，都没有则显示UID
        return user.nickname || user.username || user.uid || '管理员'
    }

    // 是否登录
    const isLogin = () => {
        return auth.hasLogin
    }

    return {
        loading,
        login,
        logout,
        getUser,
        getNickname, // ✅ 导出给页面用
        isLogin
    }
}