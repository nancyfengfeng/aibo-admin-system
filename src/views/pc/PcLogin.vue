<template>
  <div class="pc-login">
    <div class="login-box">
      <h2>AIBO 管理后台</h2>
      <div class="input-item">
        <input v-model="username" placeholder="请输入用户名" />
      </div>
      <div class="input-item">
        <input v-model="password" type="password" placeholder="请输入密码" />
      </div>
      <button class="login-btn" @click="login" :disabled="loading">
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
    router.push('/')
  }
}
</script>

<style scoped>
.pc-login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.input-item {
  margin: 15px 0;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.login-btn {
  width: 100%;
  padding: 12px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>