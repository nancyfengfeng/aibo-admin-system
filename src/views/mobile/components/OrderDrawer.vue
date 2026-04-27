<template>
  <div>
    <el-drawer v-model="drawerVisible" direction="rtl" size="500" title="订单详情"
               :append-to-body="true"
               :before-close="handleCloseDrawer"
    >
      <div class="px-2 content-center items-center">
        <!--        操作按钮-->
        <div class="flex justify-end content-center items-center gap-2">
          设 为 <el-button type="success" size="large" @click="openPicker()">{{btnText}}</el-button>
        </div>
        <!--      订单状态-->
        <div class="flex gap-2 mb-3">
          <div class="text-base text-slate-500 text-justify" style="width: 65px; text-align-last: justify;">订单号</div>
          <span>：</span>
          {{drawerInfo.order_no}}
        </div>
        <div class="flex gap-2 mb-3">
          <div class="text-base text-slate-500 text-justify" style="width: 65px; text-align-last: justify;">
            订单状态
          </div>
          <span>：</span>
          <div class="text-lg text-red-500 font-bold">{{ currentStatusTitle }}</div>
        </div>
        <!--      订单基本信息-->
        <div class="flex gap-2 mb-4">
          <div class="text-base text-slate-500 text-justify" style="width: 65px; text-align-last: justify;">
            客户
          </div>
          <span>：</span>
          {{drawerInfo.customerName}}
          （<div class="font-bold">{{drawerInfo.customerCode}}</div>）
        </div>
        <div class="gap-2 mb-4">
          <div class="flex gap-2">
            <div class="text-base text-slate-500 mb-2 text-justify" style="width: 65px; text-align-last: justify;">备注</div>
            <span>：</span>
          </div>

          {{drawerInfo.remark}}
        </div>
        <el-divider />
        <!--      订单详情-->
        <div>
          <!--          订单标题-->
          <div class="flex gap-7 mt-3 text-slate-500">
            <div style="width: 50px"></div>
            <div style="width: 150px" class="text-center">SKU编号</div>
            <div style="width: 50px" class="text-center">数量</div>
            <div style="width: 100px" class="text-center">单价</div>
            <div style="width: 100px" class="text-center">小计</div>
          </div>
          <!--          订单项-->
          <div class="flex gap-7 mt-3" v-for="(item, index) in drawerInfo.items" :key="index">
            <div style="width: 50px">{{index}}</div>
            <div style="width: 150px" class="text-center">{{item.sku.skuCode}}</div>
            <div style="width: 50px" class="text-center">{{item.quantity}}</div>
            <div style="width: 100px" class="text-center">
              ₡ {{item.price?.toLocaleString() }}
            </div>
            <div style="width: 100px" class="text-center">
              ₡ {{item.sub_total?.toLocaleString() }}
            </div>
          </div>
          <el-divider />
          <div class="flex justify-end gap-2 content-center items-center mb-2">
            <div class="text-slate-500 text-justify" style="width: 100px; text-align-last: justify;">总计：</div>
            <div class="text-right" style="width: 150px">
              ₡ {{drawerInfo.total_amount?.toLocaleString() }}
            </div>
          </div>
          <div class="flex justify-end gap-2 content-center items-center mb-2">
            <div class="text-slate-500 text-justify" style="width: 100px; text-align-last: justify;">优惠金额：</div>
            <div class="text-right text-red-500 font-bold" style="width: 150px" >
              - ₡ {{drawerInfo.discount_amount?.toLocaleString() }}
            </div>
          </div>
          <div class="flex justify-end gap-2 content-center items-center mb-2">
            <div class="text-slate-500 text-justify" style="width: 100px; text-align-last: justify;">实际支付：</div>
            <div class="font-bold text-2xl text-right" style="width: 150px">
              ₡ {{drawerInfo.actual_amount?.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    <t-popup v-model="datePickerVisible" placement="bottom" >
      <div v-if="paymentTypeVisible" class="p-5">
        <el-segmented
            v-model="selectedPaymentType"
            :options="paymentTypeOptions"
            block
            size="large"
        />
      </div>
      <t-date-time-picker
          :mode="['date']"
          :key="pickerKey"
          :value="datePickerValue"
          format="YYYY-MM-DD"
          start="2015-5-5"
          title="选择时间"
          @cancel="onPickerCancel"
          @confirm="onPickerConfirm"
      />
    </t-popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {Popup as TPopup} from "tdesign-mobile-vue";
import {updateOrderStatus} from "../../common/OrderPage/orderService.js";
import {ElMessage} from "element-plus";


const datePickerVisible = ref(false)
const today = new Date().toISOString().split('T')[0]
const datePickerValue = ref(today) // 默认当天
const pickerKey = ref(0)
const paymentTypeVisible = ref(false) // 付款方式选择器 - 显示隐藏
const selectedPaymentType = ref('2') // 选中的付款方式
const props = defineProps({
  statusList: {
    type: Array,
    required: true
  }
})

const drawerVisible = ref(false)
const drawerInfo = ref({})

const currentStatusTitle = computed(() => {
  const orderStatus = drawerInfo.value?.order_status
  if (!orderStatus) return ''

  const target = props.statusList.find(item => item.status === orderStatus)
  return target?.title || ''
})

// 按钮文字
const btnText = computed(() => {
  const orderStatus = drawerInfo.value?.order_status
  if (orderStatus === '1') return '已备货'
  if (orderStatus === '2') return '已发货'
  if (orderStatus === '3') return '已付款'
  return ''
})

// 付款方式选项
const paymentTypeOptions = [
  { label: '银行转账', value: '1' },
  { label: '现金', value: '2' },
  { label: 'SINPE', value: '3' },
  { label: '刷卡', value: '4' },
]

const openDrawer = (item) =>{
  drawerVisible.value = true
  drawerInfo.value={ ...item }
}

const openPicker = () => {
  datePickerVisible.value = true
  if (drawerInfo.value.order_status === '3'){
    paymentTypeVisible.value = true
  }
}

const onPickerCancel = () =>{
  datePickerVisible.value = false
  paymentTypeVisible.value = false
  // 强制重置日期 + 强制刷新组件
  setTimeout(() => {
    datePickerValue.value = today
    selectedPaymentType.value = '2'
    pickerKey.value++ // 强制组件刷新！
  }, 50)
}

const emit = defineEmits(['refresh'])

const buildOrderData = ()=>{
  let orderData = {}
  const status = drawerInfo.value?.order_status
  const timestamp = new Date(datePickerValue.value).getTime()
  if (status === '1'){
    orderData = {
      order_status: '2',
      shipping_time: timestamp
    }
  }else if(status === '2'){
    orderData = {
      order_status: '3',
      receive_time: timestamp
    }
  }else if(status === '3'){
    orderData = {
      order_status: '4',
      pay_status: true,
      pay_type: [selectedPaymentType.value], // 直接传 "1","2","3","4"
      pay_time: timestamp
    }
  }
  return orderData
}

const onPickerConfirm = async () =>{
  const loading = ElLoading.service({ text: '更新中...' })
  try{
    const orderIds = [drawerInfo.value?._id]
    const orderStatus = buildOrderData()
    const res = await updateOrderStatus(orderIds,orderStatus)
    if (res.success) {
      ElMessage.success('更新成功')
      emit('refresh')
    }
    else {
      ElMessage.error('更新失败')
    }
  } catch (err){
    console.log(err)
    ElMessage.error('接口请求异常')
  }finally {
    loading.close()
  }
}

const handleCloseDrawer = () =>{
  drawerVisible.value = false
  drawerInfo.value = {}
  onPickerCancel()
}

defineExpose({
  openDrawer, // 父组件可以直接调用
})
</script>

<style scoped lang="scss">

</style>