<template>
  <t-layout class="admin-layout">
    <!-- 侧边栏 -->
    <t-aside
        class="sidebar"
        :style="{ width: isCollapsed ? '64px' : '232px' }"
    >
      <div class="logo">
        <span v-if="!isCollapsed">AIBO 管理后台</span>
        <span v-else>AIBO</span>
      </div>

      <t-menu
          :value="activeMenu"
          @change="handleMenuChange"
          :collapsed="isCollapsed"
      >
        <t-menu-item
            v-for="item in menuList"
            :key="item.path"
            :value="item.path"
        >
          <template #icon>
            <t-icon :name="item.icon" />
          </template>
          {{ item.title }}
        </t-menu-item>
      </t-menu>
    </t-aside>

    <!-- 右侧内容 -->
    <t-layout>
      <t-header class="header">
        <div class="header-left">
          <t-icon
              :name="isCollapsed ? 'chevron-right' : 'chevron-left'"
              size="20"
              @click="isCollapsed = !isCollapsed"
              class="fold-btn"
          />
          <t-breadcrumb :items="[{ name: '首页' }]" />
        </div>

        <!-- 用户名 + 退出按钮（带加载） -->
        <div class="header-right">
          <span class="username">{{ username }}</span>
          <t-button
              variant="text"
              size="small"
              @click="handleLogout"
              :loading="logoutLoading"
              class="logout-btn"
          >
            退出登录
          </t-button>
        </div>
      </t-header>

      <t-content class="content">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/views/common/useLogin'
import { useMenu } from '@/views/common/useMenu'

const router = useRouter()
const { logout, getNickname } = useLogin()
const { menuList, activeMenu, handleMenuChange } = useMenu()

const username = ref('')
const isCollapsed = ref(false)

// 退出登录加载状态 ✅ 新加
const logoutLoading = ref(false)

// 获取用户名
onMounted(() => {
  username.value = getNickname()
})

// 退出登录（带加载 + 防重复点击）
const handleLogout = async () => {
  if (logoutLoading.value) return // 防止重复点击

  try {
    logoutLoading.value = true // 开启加载
    await logout()
    router.push('/login')
  } finally {
    logoutLoading.value = false // 关闭加载
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  overflow: hidden;

  .sidebar {
    background: #fff;
    border-right: 1px solid #e5e6eb;
    transition: width 0.3s ease;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: var(--td-brand-color);
    }
  }

  .header {
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e5e6eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .fold-btn {
      cursor: pointer;
    }
  }

  .content {
    padding: 24px;
    background: #f5f7fa;
    overflow: auto;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .username {
      font-size: 14px;
      color: #333;
    }
  }
}
</style>