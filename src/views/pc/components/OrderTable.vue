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
                <template #default="scope">₡ {{ scope.row.price?.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="小计">
                <template #default="scope">₡ {{ scope.row.sub_total?.toLocaleString() }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="订单号" prop="order_no" :align="'center'" width="200" fixed="left"/>
      <el-table-column label="客户编号" prop="customerCode" :align="'center'" width="150" fixed="left"/>
      <el-table-column label="客户店铺名" prop="customerName" :align="'center'" width="200"/>
      <el-table-column label="商品数量" prop="totalQuantity" :align="'center'" width="100"/>
      <el-table-column label="订单金额" :align="'center'" width="150">
        <template #default="scope">₡ {{ scope.row.actual_amount?.toLocaleString() }}</template>
      </el-table-column>

      <el-table-column label="创建日期" :align="'center'" width="100">
        <template #default="scope">
          {{formatTime(scope.row.createdAt)}}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" :align="'center'" fixed="right">
        <el-table-column label="目前状态" :align="'center'" width="100">
          <template #default="scope">
            <div class="inline-flex px-2 py-1 text-xs font-semibold text-white rounded-full"
                 :class="orderStatusColor[scope.row.order_status]">
              {{ orderStatusMap[scope.row.order_status] }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="修改状态" width="200" align="'center'">
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
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作"  fixed="right" width="80" :align="'center'">
        <template #default="scope">
          <el-button type="primary" :icon="View" circle @click="openDialog(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="infoDialogVisible" :close-on-click-modal="false">
      <el-descriptions :column="2" border title="订单基本信息">
        <el-descriptions-item label="订单号">{{orderInf.order_no}}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <div class="inline-flex px-2 py-1 text-xs font-semibold text-white rounded-full"
               :class="orderStatusColor[orderInf.order_status]">
            {{orderStatusMap[orderInf.order_status]}}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="客户店铺名">{{orderInf.customerName}}</el-descriptions-item>
        <el-descriptions-item label="客户编号">{{orderInf.customerCode}}</el-descriptions-item>
        <el-descriptions-item label="订单备注" label-width="100">{{orderInf.remark}}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-5">
        <el-divider>订单详情</el-divider>
        <el-table :data="orderInf.items" border>
          <el-table-column label="商品名称" prop="product.name" width="200"/>
          <el-table-column label="SKU 编号" prop="sku.skuCode"/>
          <el-table-column label="规格" prop="sku.attributes.quantity"/>
          <el-table-column label="数量" prop="quantity"/>
          <el-table-column label="单价">
            <template #default="scope">₡ {{ scope.row.price?.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="小计">
            <template #default="scope">₡ {{ scope.row.sub_total?.toLocaleString() }}</template>

          </el-table-column>
        </el-table>
      </div>
      <div class="mt-5">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="总计" :align="'right'">
            <div class="font-bold text-slate-500">
              ₡ {{ orderInf.total_amount?.toLocaleString() }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="优惠金额" :align="'right'">
            <div class=" font-bold text-red-500">
              - ₡ {{ orderInf.discount_amount?.toLocaleString() }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="实际支付" :align="'right'">
            <div class="text-lg font-bold ">
              ₡ {{ orderInf.actual_amount?.toLocaleString() }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-descriptions :column="3" border title="订单运输信息">
        <el-descriptions-item label="创建时间">
          {{formatTime(orderInf.createdAt)}}
        </el-descriptions-item>
        <el-descriptions-item label="送货时间">
          {{formatTime(orderInf.shipping_time)}}
        </el-descriptions-item>
        <el-descriptions-item label="收货时间">
          {{formatTime(orderInf.receive_time)}}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="3" border title="订单付款信息" class="mt-5">
        <el-descriptions-item label="是否已支付">
          <div class="flex items-center">
            <el-icon v-if="orderInf.pay_status" size="25" color="#67C23A"><CircleCheckFilled /></el-icon>
            <el-icon v-else size="25" color="#d5dfe1"><CircleCloseFilled /></el-icon>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          {{ payTypeOptions[orderInf.pay_type?.[0]] || '暂未支付' }}
        </el-descriptions-item>
        <el-descriptions-item label="付款时间">
          {{formatTime(orderInf.pay_time)}}
        </el-descriptions-item>
      </el-descriptions>
      <div class="flex justify-end my-5">
        <el-button type="primary" @click="updateStatusVisible = true" :disabled="['4','5'].includes(orderInf.order_status)">快速处理订单状态</el-button>
      </div>
      <div class="px-5 pt-5 my-5">
        <!-- 订单状态步骤条 -->
        <el-steps
            :active="getStepActive(orderInf.order_status)"
            direction="horizontal"
            align-center
            :finish-status="orderInf.order_status === '5' ? 'error' : 'success'"
        >
          <el-step
              title="待备货"
              :description="formatTime(orderInf.createdAt)"
          />
          <el-step
              title="已备货"
              :description="formatTime(orderInf.shipping_time)"
          />
          <el-step
              title="已发货"
              :description="formatTime(orderInf.receive_time)"
          />
          <el-step
              title="已收款"
              :description="formatTime(orderInf.pay_time)"
          />
          <el-step
              title="已完成"
              :description="formatTime(orderInf.updatedAt)"
          />
        </el-steps>

        <!-- 单独显示取消状态 -->
        <div
            v-if="orderInf.order_status === '5'"
            class="mt-2 text-red-500 text-sm font-bold"
        >
          订单状态：已取消
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="updateStatusVisible" :close-on-click-modal="false" width="500px" title="快速处理订单状态" draggable>
      <el-form>
        <el-form-item label="目前订单状态">{{orderStatusMap[orderInf.order_status]}}</el-form-item>
        <el-form-item label="选择订单状态">
          <el-select v-model="updateStatus" placeholder="请选择订单状态" @change="handleChangeStatus">
            <el-option
                v-for="item in orderStatusButtons"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="Number(item.value) <= Number(orderInf.order_status)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-divider />
      <el-form ref="updateStatusFormRef" :model ="updateStatusForm" :rules="updateStatusFormRules" label-position="top">
        <el-form-item label="送货时间" prop="shipping_time" v-if="statusFlag[0]">
          <el-date-picker
              v-model="updateStatusForm.shipping_time"
              type="date"
              placeholder="请选择操作日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="收货时间" prop="receive_time" v-if="statusFlag[1]">
          <el-date-picker
              v-model="updateStatusForm.receive_time"
              type="date"
              placeholder="请选择操作日期"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="付款时间" prop="pay_time" v-if="statusFlag[2]">
          <el-date-picker
              v-model="updateStatusForm.pay_time"
              type="date"
              placeholder="请选择操作日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="pay_type" v-if="statusFlag[2]">
          <el-select v-model="updateStatusForm.pay_type" placeholder="请选择支付方式">
            <el-option
                v-for="(label, value) in payTypeOptions"
                :key="value"
                :label="label"
                :value="value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="updateStatusVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitUpateStatus">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,toRaw } from 'vue'
import {  CircleCheckFilled, CircleCloseFilled,View} from '@element-plus/icons-vue'
import {updateOrderStatus} from "../../common/OrderPage/orderService.js";



const props = defineProps({
  orderList: { type: Array, default: () => [] }
})

const emit = defineEmits(['update-status', 'selection-change','update-order-list'])

const infoDialogVisible = ref(false)
const orderInf = ref({})

const updateStatusVisible = ref(false)
const updateStatus = ref('')
const updateStatusForm = ref({
  order_status: '',
  payment_status: '',
  shipping_time: '',
  receive_time: '',
  pay_type: '',
  pay_time:''
})
const updateStatusFormRef = ref(null)

const orderStatusButtons = [
  { label: '已备货', status: 1, type: 'warning', disabledCheck: '1',value: '2' },
  { label: '已发货', status: 2, type: 'danger', disabledCheck: '2' ,value: '3' },
  { label: '已收款', status: 3, type: 'success', disabledCheck: '3',value: '4'  },
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

const payTypeOptions = {
  '1': '银行转账',
  '2': '现金',
  '3': 'SINPE',
  '4': '刷卡'
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

// 表单校验规则
const updateStatusFormRules = ref({
  // 送货时间 —— 必填
  shipping_time: [
    { required: true, message: '请选择送货时间', trigger: 'change' }
  ],
  // 收货时间 —— 必填
  receive_time: [
    { required: true, message: '请选择收货时间', trigger: 'change' }
  ],
  // 付款时间 —— 必填
  pay_time: [
    { required: true, message: '请选择付款时间', trigger: 'change' }
  ],
  // 支付方式 —— 必填
  pay_type: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
})

// 时间格式化（防 null/undefined）
const formatTime = (time) => {
  if (!time) return '暂无时间'
  return new Date(time).toLocaleDateString()
}

const openDialog = (row) => {
  infoDialogVisible.value = true
  orderInf.value = toRaw(row)
}


const statusFlag = ref([false, false, false])

const handleChangeStatus = () => {
  const current = orderInf.value.order_status
  const target = updateStatus.value

  // 状态映射表：一行逻辑搞定所有情况
  const statusMap = {
    '1=>2': [true, false, false],
    '1=>3': [true, true, false],
    '1=>4': [true, true, true],
    '2=>3': [false, true, false],
    '2=>4': [false, true, true],
    '3=>4': [false, false, true],
  }

  // 匹配并赋值，不匹配则重置为全 false
  statusFlag.value = statusMap[`${current}=>${target}`] || [false, false, false]
}


const submitForm = async (formEl) => {
  if (!formEl) return false
  return new Promise((resolve) => {
    formEl.validate((valid, fields) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const handleSubmitUpateStatus = async () => {
  const isValid = await submitForm(updateStatusFormRef.value)
  if (!isValid) return

  const loading = ElLoading.service({ text: '更新中...' })

  try {
    const orderIds = [orderInf.value._id]

    // ✅ 修复所有类型问题：时间转时间戳，pay_type 转数字
    const statusData = {
      order_status: updateStatus.value,
      updatedAt: Date.now(),
      ...(statusFlag.value[0] && { shipping_time: new Date(updateStatusForm.value.shipping_time).getTime() }),
      ...(statusFlag.value[1] && { receive_time: new Date(updateStatusForm.value.receive_time).getTime() }),
      ...(statusFlag.value[2] && {
        pay_time: new Date(updateStatusForm.value.pay_time).getTime(),
        pay_type: [updateStatusForm.value.pay_type], // 转数字
        pay_status: true
      })
    }

    const res = await updateOrderStatus(orderIds, statusData)

    if (res.success) {
      ElMessage.success('更新成功')
      // 1. 更新本地 orderInf
      orderInf.value = {
        ...orderInf.value,
        ...statusData
      }
      // 2. 通知父组件更新列表
      emit('update-order-list', orderInf.value)
      updateStatusVisible.value = false
    } else {
      ElMessage.error('更新失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('更新异常')
  } finally {
    loading.close()
  }
}

</script>

<style scoped lang="scss">
</style>