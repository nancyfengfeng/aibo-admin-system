<template>
  <div>
    <!-- 面包屑 -->
    <div class="mb-6">
      <t-breadcrumb>
        <t-breadcrumb-item to="/">
          <template #icon>
            <icon-font name="iconfont icon-shouye" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          首页
        </t-breadcrumb-item>
        <t-breadcrumb-item :disabled="true">
          <template #icon>
            <icon-font name="iconfont icon-dingdan" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          全部订单
        </t-breadcrumb-item>
      </t-breadcrumb>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div v-for="item in stats" :key="item.title">
        <el-tooltip effect="dark" :content="`点击筛选 ${item.title}`" placement="top">
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
               @click="getOrderStatusList(item.status)">
            <div class="flex items-center">
              <div :class="['p-2 rounded-lg', item.bg]">
                <icon-font :name="`iconfont ${item.icon}`" :url="iconUrl" size="24" :class="item.color"/>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-slate-600">{{ item.title }}</p>
                <p class="text-2xl font-bold text-slate-900">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="flex justify-between">
      <!-- 批量操作按钮 -->
      <div class="mb-4 flex gap-3">
        <el-button type="warning" @click="batchUpdate(1)" :disabled="selectedOrders.length === 0">
          批量已备货
        </el-button>
        <el-button type="danger" @click="batchUpdate(2)" :disabled="selectedOrders.length === 0">
          批量已发货
        </el-button>
        <el-button type="success" @click="batchUpdate(3)" :disabled="selectedOrders.length === 0">
          批量已收款
        </el-button>
      </div>
      <div>
        <el-button
            @click="goToPdfPage"
            :disabled="selectedOrders.length === 0"
        >
          导出出货清单
        </el-button>
      </div>
    </div>

    <!-- 订单表格 -->
    <OrderTable
        :order-list="orderList"
        @update-status="openUpdateDialog"
        @selection-change="handleSelectionChange"
    />

    <!-- 分页 -->
    <div class="flex-center mt-5">
      <el-pagination
          :page-size="currentPageSize"
          v-model:current-page="currentPageNum"
          background
          layout="prev, pager, next"
          :total="OrderTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 状态更新弹窗（单个 + 批量通用） -->
    <el-dialog v-model="updateDialogVisible" :title="dialogTitle" width="500px">
      <el-form label-width="100px">
        <el-form-item label="操作时间">
          <el-date-picker
              v-model="updateForm.operateTime"
              type="date"
              placeholder="请选择操作日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支付方式" v-if="updateForm.status === 3">
          <el-select v-model="updateForm.payType" placeholder="请选择支付方式">
            <el-option label="银行转账" value="1" />
            <el-option label="现金" value="2" />
            <el-option label="SINPE" value="3" />
            <el-option label="刷卡" value="4" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdate">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, inject,nextTick } from 'vue'
import { useRouter } from "vue-router"
import {fetchAllOrders, fetchOrderCount, updateOrderStatus} from "../../common/OrderPage/orderService.js"
import OrderTable from "../components/OrderTable.vue"
import {useOrderPdfStore} from "../../../stores/orderPdfStore.js";

const router = useRouter()
const iconUrl = inject('iconUrl')

const currentPageSize = ref(10)
const currentPageNum = ref(1)
const OrderTotal = ref(0)
const orderList = ref([])
const selectedOrders = ref([])

// 弹窗
const updateDialogVisible = ref(false)
const dialogTitle = ref('')
const updateForm = ref({
  orderIds: [],
  status: '',
  operateTime: '',
  payType: ''
})

// 统计面板
const stats = ref([
  { title: '待备货', value: 0, bg: 'bg-blue-100', color: 'text-blue-600', icon: 'icon-shouhuojilu', status: '1' },
  { title: '待发货', value: 0, bg: 'bg-yellow-100', color: 'text-yellow-600', icon: 'icon-yunshuzhong', status: '2' },
  { title: '待付款', value: 0, bg: 'bg-orange-100', color: 'text-orange-600', icon: 'icon-daifukuan', status: '3' },
  { title: '已完成', value: 0, bg: 'bg-green-100', color: 'text-green-600', icon: 'icon-yiwancheng', status: '4' },
  { title: '全部', value: 0, bg: 'bg-stone-100', color: 'text-stone-600', icon: 'icon-zongdingdan' },
])

// 获取订单列表
const getAllOrderList = async () => {
  const loading = ElLoading.service({ text: '加载中...' })
  try {
    const res = await fetchAllOrders(currentPageSize.value, currentPageNum.value)
    orderList.value = res.result
    OrderTotal.value = res.total
    console.log(orderList.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.close()
  }
}

// 多选事件
const handleSelectionChange = (val) => {
  selectedOrders.value = val
}

// 单个订单更新
const openUpdateDialog = (order, status) => {
  console.log('单个操作：', order, status)

  // 🔥 状态校验（和批量操作一样！）
  const allowStatusMap = {
    1: '1',
    2: '2',
    3: '3'
  }
  const requiredStatus = allowStatusMap[status]

  if (order.order_status !== requiredStatus) {
    const targetItem = stats.value.find(item => item.status === requiredStatus)
    const statusText = targetItem ? targetItem.title : '该状态'
    ElMessage.error(`只能选择【${statusText}】状态的订单！`)
    return
  }

  // 打开弹窗（格式和批量完全一致，orderIds 是数组）
  updateForm.value = {
    orderIds: [order._id], // 包装成数组，通用！
    status,
    operateTime: '',
    payType: ''
  }
  setTitle(status)
  updateDialogVisible.value = true
}

// 批量更新
const batchUpdate = (status) => {
  console.log('点击批量操作，目标状态：', status)
  console.log('选中订单：', selectedOrders.value)

  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择订单')
    return
  }

  // 🔥 关键修复：状态对应关系
  const allowStatusMap = {
    1: '1',   // 已备货 → 只能选 待备货(1)
    2: '2',   // 已发货 → 只能选 已备货(2)
    3: '3'    // 已收款 → 只能选 已发货(3)
  }

  const requiredStatus = allowStatusMap[status]

  // 找文字
  const targetItem = stats.value.find(item => item.status === requiredStatus)
  const statusText = targetItem ? targetItem.title : '该状态'

  // 检查不合格订单
  const invalidOrders = selectedOrders.value.filter(
      order => order.order_status !== requiredStatus
  )


  if (invalidOrders.length > 0) {
    ElMessage.error(`只能选择【${statusText}】状态的订单！`)
    return
  }

  // 全部合格 → 打开弹窗
  const ids = selectedOrders.value.map(i => i._id)
  updateForm.value = {
    orderIds: ids,
    status,
    operateTime: '',
    payType: ''
  }

  setTitle(status)
  updateDialogVisible.value = true
}

const setTitle = (status) => {
  if (status === 1) dialogTitle.value = '已备货'
  if (status === 2) dialogTitle.value = '已发货'
  if (status === 3) dialogTitle.value = '已收款'
}


const confirmUpdate = async () => {
  const form = updateForm.value
  const { orderIds, status, operateTime, payType } = form

  if (!operateTime) {
    ElMessage.warning('请选择操作日期')
    return
  }
  if (status === 3 && !payType) {
    ElMessage.warning('请选择支付方式')
    return
  }

  // 时间转成时间戳
  const timestamp = new Date(operateTime).getTime()

  // 按状态拼装数据
  let statusData = {}
  if (status === 1) {
    // 已备货
    statusData = {
      order_status: '2',
      shipping_time: timestamp
    }
  } else if (status === 2) {
    // 已发货
    statusData = {
      order_status: '3',
      receive_time: timestamp
    }
  } else if (status === 3) {
    // 已收款
    statusData = {order_status: '4',
      pay_status: true,
      pay_type: [payType], // 直接传 "1","2","3","4"
      pay_time: timestamp
    }
  }

  try {
    const res = await updateOrderStatus(orderIds, statusData)
    if (res.success) {
      ElMessage.success('更新成功')
      updateDialogVisible.value = false

      // 👇 👇 👇 这里自动刷新顶部统计数字！
      const promises = stats.value.map(item => fetchOrderCount(item.status))
      const results = await Promise.all(promises)
      results.forEach((count, idx) => {
        stats.value[idx].value = count
      })

      await getAllOrderList()
    } else {
      ElMessage.error('更新失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('接口请求异常')
  }
}

// 筛选状态
const getOrderStatusList = async (status) => {
  const loading = ElLoading.service({ text: '加载中...' })
  try {
    const filter = status ? { status } : {}
    currentPageNum.value = 1
    const res = await fetchAllOrders(currentPageSize.value, 1, filter)
    orderList.value = res.result
  } catch (err) {
    console.error(err)
  } finally {
    loading.close()
  }
}

const handleSizeChange = (val) => {
  currentPageSize.value = val
  getAllOrderList()
}

const handleCurrentChange = (val) => {
  currentPageNum.value = val
  getAllOrderList()
}

// 跳转页面
const goToPdfPage = () => {
  const orderPdfStore = useOrderPdfStore()

  // 直接把数组存进去，不走 URL！
  orderPdfStore.setOrderIds(selectedOrders.value.map(item => item._id))

  // 跳转，什么都不用传！
  router.push('/order-pdf')
}


onMounted(async () => {
  const promises = stats.value.map(item => fetchOrderCount(item.status))
  const results = await Promise.all(promises)
  results.forEach((count, idx) => stats.value[idx].value = count)
  await getAllOrderList()
})
</script>

<style scoped lang="scss">
</style>