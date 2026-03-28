import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IconFont } from 'tdesign-icons-vue-next';
import 'tdesign-vue-next/es/style/index.css';
import './main.css'
import '@/assets/theme.css'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.component('IconFont', IconFont)
// 全局提供
app.provide('iconUrl', 'https://at.alicdn.com/t/c/font_5139612_q8orndu1w2e.css')

app.mount('#app')

// 全局自动修复 cloud:// 云开发图片地址
document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
        document.querySelectorAll('img').forEach(img => {
            if (img.src.startsWith('cloud://')) {
                img.src = img.src.replace(
                    'cloud://lowcode-8gmeoby856cc69bf.6c6f-lowcode-8gmeoby856cc69bf-1300677802',
                    'https://6c6f-lowcode-8gmeoby856cc69bf-1300677802.tcloudbaseapp.com'
                )
            }
        })
    }, 500)
})