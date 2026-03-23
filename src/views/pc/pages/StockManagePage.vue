<template>
  <div>
    <t-breadcrumb>
      <t-breadcrumb-item to="/">
        <template #icon>
          <icon-font name="iconfont icon-shouye" :url="iconUrl" size="24" class="mr-2"/>
        </template>
        首页
      </t-breadcrumb-item>
      <t-breadcrumb-item to="/product">
        <template #icon>
          <icon-font name="iconfont icon-shangpinku" :url="iconUrl" size="24" class="mr-2"/>
        </template>全部商品
      </t-breadcrumb-item>

      <t-breadcrumb-item :disabled="true">
        <template #icon>
          <icon-font name="iconfont icon-cangku_kucunxiangqing" :url="iconUrl" size="24" class="mr-2"/>
        </template>库存管理
      </t-breadcrumb-item>
    </t-breadcrumb>
  </div>
</template>

<script setup>
import {ref, onMounted, inject} from 'vue'

const iconUrl = inject('iconUrl')

onMounted(() => {

})
</script>

<style scoped lang="scss">

</style>