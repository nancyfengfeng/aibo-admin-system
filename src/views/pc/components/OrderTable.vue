<template>
  <div>
    <el-table
        :data="orderList"
        border
        @selection-change="emit('selection-change', $event)"
    >
      <el-table-column type="selection" width="55" fixed="left"/>
      <el-table-column type="expand" fixed="left">
        <template #default="props">
          <div class="px-5 pt-5 w-[80%]">
            <!-- 订单状态步骤条 -->
            <el-steps
                :active="getStepActive(props.row.order_status)"
                direction="horizontal"
                align-center
                :finish-status="props.row.order_status === '5' ? 'error' : 'success'"
            >
              <el-step
                  title="待备货"
                  :description="formatTime(props.row.createdAt)"
              />
              <el-step
                  title="已备货"
                  :description="formatTime(props.row.shipping_time)"
              />
              <el-step
                  title="已发货"
                  :description="formatTime(props.row.receive_time)"
              />
              <el-step
                  title="已收款"
                  :description="formatTime(props.row.pay_time)"
              />
              <el-step
                  title="已完成"
                  :description="formatTime(props.row.updatedAt)"
              />
            </el-steps>

            <!-- 单独显示取消状态 -->
            <div
                v-if="props.row.order_status === '5'"
                class="mt-2 text-red-500 text-sm font-bold"
            >
              订单状态：已取消
            </div>
          </div>
          <div class="p-5 w-[80%]">
            <el-table :data="props.row.items" border>
              <el-table-column label="商品名称" prop="product.name" width="300"/>
              <el-table-column label="SKU 编号" prop="sku.skuCode"/>
              <el-table-column label="规格" prop="sku.attributes.quantity"/>
              <el-table-column label="数量" prop="quantity"/>
              <el-table-column label="单价">
                <template #default="scope">₡ {{ scope.row.price }}</template>
              </el-table-column>
              <el-table-column label="小计">
                <template #default="scope">₡ {{ scope.row.sub_total }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="订单号" prop="order_no"/>
      <el-table-column label="客户店铺名" prop="customerName"/>
      <el-table-column label="客户编号" prop="customerCode"/>
      <el-table-column label="商品数量" prop="totalQuantity"/>
      <el-table-column label="订单金额">
        <template #default="scope">₡ {{ scope.row.actual_amount }}</template>
      </el-table-column>

      <el-table-column label="订单状态">
        <template #default="scope">
          <div class="inline-flex px-2 py-1 text-xs font-semibold text-white rounded-full"
               :class="orderStatusColor[scope.row.order_status]">
            {{ orderStatusMap[scope.row.order_status] }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="创建日期">
        <template #default="scope">
          {{ new Date(scope.row.createdAt).toLocaleDateString() }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <template v-for="btn in orderStatusButtons" :key="btn.status">
            <el-button
                link
                :type="btn.type"
                :disabled="scope.row.order_status !== btn.disabledCheck"
                @click="emit('update-status', scope.row, btn.status)"
            >
              {{ btn.label }}
            </el-button>
          </template>
          <el-button link type="primary">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  orderList: { type: Array, default: () => [] }
})

const emit = defineEmits(['update-status', 'selection-change'])

const orderStatusButtons = [
  { label: '已备货', status: 1, type: 'warning', disabledCheck: '1' },
  { label: '已发货', status: 2, type: 'danger', disabledCheck: '2' },
  { label: '已收款', status: 3, type: 'success', disabledCheck: '3' },
]

const orderStatusMap = {
  '1': '待备货',
  '2': '待发货',
  '3': '待付款',
  '4': '已完成',
  '5': '已取消'
}

const orderStatusColor = {
  '1': 'bg-blue-500',
  '2': 'bg-yellow-500',
  '3': 'bg-orange-500',
  '4': 'bg-green-500',
  '5': 'bg-gray-500'
}

// 步骤条对应状态
const getStepActive = (status) => {
  const map = {
    '1': 0,   // 待备货
    '2': 1,   // 已备货
    '3': 2,   // 已发货
    '4': 4,   // 已完成
    '5': 4    // 已取消（走到最后一步显示红色）
  }
  return map[status] || 0
}

// 时间格式化（防 null/undefined）
const formatTime = (time) => {
  if (!time) return '暂无时间'
  return new Date(time).toLocaleString()
}
</script>

<style scoped lang="scss">
</style>