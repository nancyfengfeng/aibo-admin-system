import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'

import 'tdesign-vue-next/es/style/index.css';
import './main.css'
import '@/assets/theme.css'

const app = createApp(App)

app.use(router)

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