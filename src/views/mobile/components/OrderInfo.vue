<template>
  <div v-loading="loading" class="pb-5">
    <div v-if = "orderList.length === 0">
      <span class="text-slate-600">暂无数据</span>
    </div>
    <div v-else>
      <div v-for="item in orderList" :key="item._id" class="bg-slate-50 mb-3 py-3 px-5 rounded-b-md">
        <div class="flex justify-between items-center border-b pb-2 border-slate-200">
          <div>
            <h1 class="font-bold text-lg">{{item.customerName}}</h1>
            <span class="text-sm">({{item.customerCode}})</span>
          </div>
          <el-button type="primary" :icon="View" circle @click="openDrawer(item)"/>
        </div>
        <div class="pt-2 flex justify-between">
          <span class="text-slate-500">订单号：</span>
          <div>
            {{item.order_no}}
          </div>
        </div>
        <div class="pt-2 flex justify-between">
          <span class="text-slate-500">数量：</span>
          <div>
            {{item.totalQuantity}}
          </div>
        </div>
        <div class="pt-2 flex justify-between">
          <span class="text-slate-500">总计：</span>
          <div class ="text-red-400 font-bold text-lg">
            ₡ {{item.actual_amount?.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {ref, onMounted, reactive, toRaw,computed} from 'vue'
import {View} from '@element-plus/icons-vue'

import {fetchAllOrders} from "../../common/OrderPage/orderService.js";

const props = defineProps({
  status: String,
  statusList: Array,
})

const emit = defineEmits(['openDrawer'])

const loading = ref(false)


const orderList = ref([])


const getOrderStatusList = async () => {
  loading.value = true
  try{
    const filter = {status:props.status}
    const res = await fetchAllOrders(3,1,filter)
    orderList.value = res.result
    console.log(orderList.value)
  }catch(error){
    console.log(error)
  }finally {
    loading.value = false
  }
}

const openDrawer = (item) => {
  emit('openDrawer', item)
}


onMounted(async () => {
  await getOrderStatusList()
})

defineExpose({
  getOrderStatusList,
})
</script>

<style scoped lang="scss">

</style>