import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        TDesignResolver({ library: 'vue-next' }),
        TDesignResolver({ library: 'mobile-vue' }),
        ElementPlusResolver({ importStyle: 'sass' })
      ],
      imports: ['vue', 'vue-router', '@vueuse/core']
    }),
    Components({
      resolvers: [
        TDesignResolver({ library: 'vue-next' }),
        TDesignResolver({ library: 'mobile-vue' }),
        ElementPlusResolver({ importStyle: 'sass' })
      ]
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
  base: '/aibo-admin-system/'
})