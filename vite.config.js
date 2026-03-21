import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css:{
    preprocessorOptions: {
      scss:{
        additionalData:'@use "@/assets/styles/element.scss" as *;',
      },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        TDesignResolver({ library: 'vue-next' }),
        ElementPlusResolver(),
      ],
    }),
    Components({
      resolvers: [
        TDesignResolver({ library: 'vue-next' }),
        ElementPlusResolver({
          importStyle: 'sass' // 👈 必须写 sass
        })
      ],
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AIBO 管理后台',
        short_name: 'Aibo',
        theme_color: '#ffffff',
        icons: [{ src: '/icon.png', sizes: '256x256', type: 'image/png' }]
      }
    })
  ],
  base: import.meta.env.MODE === 'production'
      ? '/aibo-admin-system/'
      : '/'
})