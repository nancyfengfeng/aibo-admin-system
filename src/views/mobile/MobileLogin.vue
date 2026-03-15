<template>
  <div class="mobile-login">
    <div class="login-box">
      <h2>AIBO 管理后台</h2>
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button @click="login" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/views/common/useLogin'

const router = useRouter()
const { login: handleLogin, loading } = useLogin()

const username = ref('')
const password = ref('')

const login = async () => {
  const success = await handleLogin(username.value, password.value)
  if (success) {
    router.push('/mobile')
  }
}
</script>

<style scoped>
.mobile-login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}
.login-box {
  width: 100%;
  max-width: 400px;
}
input {
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
}
button {
  width: 100%;
  padding: 14px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  margin-top: 10px;
}
</style>