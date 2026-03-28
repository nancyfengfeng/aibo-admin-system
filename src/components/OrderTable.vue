<template>
  <!-- 空数据状态 -->
  <div class="text-center py-12" v-if="orderList.length === 0">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package w-12 h-12 text-slate-400 mx-auto mb-4">
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
      <path d="M12 22V12"></path>
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
      <path d="m7.5 4.27 9 5.15"></path>
    </svg>
    <p class="text-slate-600">暂无订单数据</p>
  </div>

  <!-- 表格 -->
  <table class="w-full" v-else>
    <thead>
    <tr class="border-b border-slate-200">
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">订单号</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">客户店铺名</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">客户编号</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">商品数量</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">订单金额</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">订单状态</th>
      <th class="text-left px-6 py-3 text-sm font-medium text-slate-600">创建日期</th>
      <th
          class="text-left px-6 py-3 text-sm font-medium text-slate-600"
          v-if="showAction"
      >
        操作
      </th>
    </tr>
    </thead>
    <tbody>
    <tr
        v-for="item in orderList"
        :key="item._id"
        class="border-b border-slate-100 hover:bg-slate-50"
    >
      <td class="px-6 py-4 text-sm font-medium text-slate-900 font-mono">
        {{ item.order_no }}
      </td>

      <td class="px-6 py-4 text-sm text-slate-900">
        {{ item.customerName }}
      </td>

      <td class="px-6 py-4 text-sm text-slate-900">
        {{ item.customerCode }}
      </td>

      <td class="px-6 py-4 text-sm text-slate-600">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package w-4 h-4">
            <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
            <path d="M12 22V12"></path>
            <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
            <path d="m7.5 4.27 9 5.15"></path>
          </svg>
          <span class="ml-2">{{ item.totalQuantity }} 件</span>
        </div>
      </td>

      <td class="px-6 py-4 text-sm text-slate-900 font-medium">
        ₡ {{ item.actual_amount?.toLocaleString() }}
      </td>

      <td class="px-6 py-4">
        <div
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            :class="orderStatusColor[item.order_status] || 'bg-purple-500'"
        >
          {{ orderStatusMap[item.order_status] || '未知状态' }}
        </div>
      </td>

      <td class="px-6 py-4 text-sm text-slate-600">
        {{ new Date(item.createdAt).toLocaleDateString() }}
      </td>

      <!-- 操作列：动态显示 -->
      <td class="px-6 py-4" v-if="showAction">
        <button
            @click="window.location.href = '/order/detail/' + item._id"
            class="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye w-4 h-4 mr-1">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          详情
        </button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  // 订单列表数据
  orderList: {
    type: Array,
    default: () => []
  },
  // 是否显示操作列（首页传 false，订单页传 true）
  showAction: {
    type: Boolean,
    default: false
  }
})
// 状态映射
const orderStatusMap = {
  '1': '待备货',
  '2': '待发货',
  '3': '待付款',
  '4': '已完成',
  '5': '已取消'
}

// 状态颜色
const orderStatusColor = {
  '1': 'bg-blue-500',    // 待备货
  '2': 'bg-yellow-500',  // 待发货
  '3': 'bg-orange-500',  // 待付款
  '4': 'bg-green-500',   // 已完成
  '5': 'bg-gray-500'     // 已取消
}
</script>