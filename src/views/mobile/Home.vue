<template>
  <div>
    <!-- 底部标签栏 -->
    <div class="fixed bottom-5 left-0 right-0 bg-white z-50">
      <t-tab-bar
          :value="activeMenu"
          @change="handleMenuChange"
          shape="round"
          theme="tag"
          :fixed="false"
          :split="false"
      >
        <t-tab-bar-item
            v-for="item in menuList"
            :key="item.path"
            :value="item.path"
        >
          {{ item.label }}
        </t-tab-bar-item>
      </t-tab-bar>
    </div>
<!--    路由-->
    <router-view class="mb-16"/>
  </div>
</template>

<script setup>
import { useMenu } from '@/views/common/useMenu'

const { menuList, activeMenu, handleMenuChange } = useMenu()

</script>