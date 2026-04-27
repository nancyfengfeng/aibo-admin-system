<template>
  <div class="p-5">
    <div class="mb-5 flex gap-8">
      <el-card @click="openCustomerDialog">
        <div class="rounded-full bg-amber-500 p-4 text-center">
          <el-icon size="50" color="white"><Avatar /></el-icon>
        </div>
        <div class="text-lg mt-2 font-bold text-center">
          创建新客户
        </div>
      </el-card>
      <el-card @click="openOrderInvoiceDialog">
        <div class="rounded-full bg-cyan-600 p-4 text-center">
          <el-icon size="50" color="white"><Shop /></el-icon>
        </div>
        <div class="text-lg mt-2 font-bold text-center">
          创建新发票
        </div>
      </el-card>
    </div>
<!--    订单管理-->
    <el-card>
      <div class="flex items-center gap-5">
        <h1 class="text-lg font-bold">订单快速处理</h1>
        <span class="text-sm text-slate-500">只显示前 3 条数据</span>
        <el-button link type="primary" @click="goTo('/mobile/order')">查看全部订单</el-button>
      </div>
      <el-row :gutter="20" class="mt-5">
        <el-col :span="8" v-for="item in status" :key="item.title">
          <el-card shadow="never">
            <div class="flex justify-between">
              <el-badge :value="item.value" :offset="[15, 5]" :show-zero="false">
                <div class="flex items-center gap-3">
                  <div :class="['p-2 rounded-lg', item.bg]">
                    <icon-font :name="`iconfont ${item.icon}`" :url="iconUrl" size="24" :class="item.color"/>
                  </div>
                  <h1 class="text-base font-bold">{{item.title}}</h1>
                </div>
              </el-badge>
              <el-button link type="primary" @click="onClickOrder(item.status)">查看更多</el-button>
            </div>
            <el-divider />
            <OrderInfo
                :status="item.status"
                :statusList="status"
                @open-drawer="openDrawer"
            />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
<!--    客户管理-->
    <el-card  class="mt-5">
      <div class="flex gap-5 items-center">
        <h1 class="text-lg font-bold">客户预览</h1>
        <span class="text-sm text-slate-500">只显示前 10 条数据</span>
        <el-button link type="primary" @click="goTo('/mobile/customer')">查看更多</el-button>
      </div>
      <el-row :gutter="20" class="mt-5">
<!--        客户表格-->
        <el-col :span="16">
          <CustomerTable
              ref="customerTableRef"
              :regionList="regionList"
          />
        </el-col>
<!--        快速操作-->
        <el-col :span="8">
          <div class=" ">
            <!--    按照编号搜索客户-->
            <div>
              <div class="flex justify-between mb-2">
                <div class="text-base font-bold">搜索</div>
              </div>
              <t-search
                  v-model="customerCodeSearch"
                  placeholder="输入客户编号后几位"
                  @submit="handleSearch"
                  @clear="refreshCustomerData"
              />
            </div>
            <el-divider />
            <div>
              <div class="flex justify-between mb-2">
                <div class="text-base font-bold">筛选</div>
                <el-button :icon="Refresh" circle type="success" @click="refreshCustomerData"/>
              </div>
              <t-cell arrow title="选择地区"
                      :note="regionList.find(item => item.value === regionState.region.join(' '))?.label"
                      @click="regionState.show = true"
              />

              <t-cell arrow title="选择等级"
                      :note="vipList.find(item => item.value === vipState.vip.join(' '))?.label"
                      @click="vipState.show = true"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <t-popup v-model="regionState.show" placement="bottom">
      <t-picker
          v-model="regionState.region"
          :columns="regionList"
          @confirm="onConfirm"
          @cancel="onCancel"
      >
        <template #option="item">{{ item.label }}</template>
      </t-picker>
    </t-popup>
    <t-popup v-model="vipState.show" placement="bottom">
      <t-picker
          v-model="vipState.vip"
          :columns="vipList"
          @confirm="onConfirm"
          @cancel="onCancel"
      >
        <template #option="item">{{ item.label }}</template>
      </t-picker>
    </t-popup>
    <OrderDrawer
        ref="orderDrawerRef"
        :statusList="status"
        @refresh="handleRefresh"
    />
    <!-- 添加客户弹窗 -->
    <AddCustomer
        ref="addCustomerRef"
        :form="customerForm"
        :mode="dialogMode"
        :vipList="vipList"
        :regionList="regionList"
        :openMap="openMap"
        :hasCoordinates="hasCoordinates"
        @submit="handleSubmit"
    />
    <OrderInvoiceGenerator
        ref="orderInvoiceGeneratorRef"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, reactive, inject,computed} from 'vue'
import {useRouter} from "vue-router";
import {Popup as TPopup} from "tdesign-mobile-vue";
import {Search as TSearch} from "tdesign-mobile-vue";
import {Refresh,Avatar,Shop} from '@element-plus/icons-vue'
import {fetchOrderCount} from "../../common/OrderPage/orderService.js";
import CustomerTable from '../components/CustomerTable.vue'
import OrderInfo from "../components/OrderInfo.vue";
import OrderDrawer from "../components/OrderDrawer.vue"
import AddCustomer from "../../../components/AddCustomer.vue";
import {createCustomerDetail, updateCustomerDetail} from "../../common/CustomerPage/customerService.js";
import OrderInvoiceGenerator from "../components/OrderInvoiceGenerator.vue";

const iconUrl = inject('iconUrl')
const router = useRouter()

const customerTableRef = ref(null)

const customerCodeSearch = ref('')

const orderDrawerRef = ref(null)

const orderInvoiceGeneratorRef = ref(null)


const regionState = reactive({
  show:false,
  region:[]
})

const vipState = reactive({
  show:false,
  vip:[]
})

const status = ref([
  { title: '待备货', value: 0, bg: 'bg-blue-100', color: 'text-blue-600', icon: 'icon-shouhuojilu', status: '1' },
  { title: '待发货', value: 0, bg: 'bg-yellow-100', color: 'text-yellow-600', icon: 'icon-yunshuzhong', status: '2' },
  { title: '待付款', value: 0, bg: 'bg-orange-100', color: 'text-orange-600', icon: 'icon-daifukuan', status: '3' },
])

const regionList = ref([
  { value: '1', label: 'San José' },
  { value: '2', label: 'Alajuela' },
  { value: '3', label: 'Cartago' },
  { value: '4', label: 'Heredia' },
  { value: '5', label: 'Guanacaste' },
  { value: '6', label: 'Puntarenas' },
  { value: '7', label: 'Limón' },
])

// VIP与地区列表
const vipList = ref([
  { key: '1', label: 'VIP-1', color:'info'},
  { key: '2', label: 'VIP-2', color:'primary'},
  { key: '3', label: 'VIP-3', color:'success'},
  { key: '4', label: 'VIP-4', color:'warning'},
  { key: '5', label: 'VIP-5', color:'danger'},
])

const onClickOrder = (status) => {
  console.log(status)
}

const goTo = (url)=>{
  router.push(url)
}

const openDrawer = (item) => {
  orderDrawerRef.value.openDrawer(item)
}

const onCancel = () =>{
  regionState.show = false
  vipState.show = false
}

const onConfirm = () => {
  const data = {}
  if (regionState.region.length > 0) {
    data.region = regionState.region.join(' ')
  }
  if (vipState.vip.length > 0) {
    data.vip = vipState.vip.join(' ')
  }
  customerTableRef.value.onFilterGetCustomers(data)
  onCancel()
}

const refreshCustomerData = ()=>{
  regionState.region=[]
  vipState.vip=[]
  customerTableRef.value.onFilterGetCustomers()
}

const handleSearch = () =>{
  const data = {
    customerNo:customerCodeSearch.value
  }
  customerTableRef.value.onFilterGetCustomers(data)
}

const handleRefresh = () => {
  window.location.reload()
}

// 函数生成默认表单
const createCustomerForm = () => ({
  VIPLevel: '',
  inviteCode: '',
  region: '',
  remark: '',
  status: '',
  storeLocation: { address: '', geopoint: { coordinates: [0,0] } },
  storeName: '',
  wechatOpenId: [],
  phone: '',
  _id: ''
})

const customerForm = reactive(createCustomerForm())
const addCustomerRef = ref()
const dialogMode = ref('add') // add | edit

const openCustomerDialog = (row = null) => {
  dialogMode.value = row?._id ? 'edit' : 'add'
  Object.assign(customerForm, createCustomerForm(), row || {})
  addCustomerRef.value.openDialog()
}

const buildCustomerDetail = (formData) => {
  // 初始化空对象
  const customerDetail = {}

  // 必传字段（一定放入）
  customerDetail.VIPLevel = formData.VIPLevel
  customerDetail.region = formData.region
  customerDetail.status = '1'
  customerDetail.storeName = formData.storeName

  // 可选字段（安全判断，不会报错）
  if (formData.inviteCode && formData.inviteCode.trim() !== '') {
    const code = formData.inviteCode.trim()
    // 判断：不是空的，且不等于 "AIBO-"
    if (code !== 'AIBO-') {
      customerDetail.inviteCode = code
    }
  }
  if (formData.phone && formData.phone.toString().trim() !== '') {
    customerDetail.phone = formData.phone.toString().trim()
  }
  if (formData.remark && formData.remark.trim() !== '') {
    customerDetail.remark = formData.remark
  }

  // 坐标处理
  const coords = formData.storeLocation?.geopoint?.coordinates || []
  const [lng, lat] = coords

  const isValid =
      !isNaN(Number(lng)) &&
      !isNaN(Number(lat)) &&
      !(Number(lng) === 0 && Number(lat) === 0)

  if (isValid) {
    customerDetail.storeLocation = {
      address: formData.storeName,
      geopoint: {
        coordinates: [Number(lng), Number(lat)],
        type: 'Point'
      }
    }
  }


  // 返回构造好的最终对象
  return customerDetail
}

// 提交表单
const handleSubmit = async (dataFromChild) => {
  const customerDetail = buildCustomerDetail(dataFromChild)
  const customerId = dataFromChild._id
  dataFromChild.status = '1'

  if (customerId) {
    // 编辑
    const res = await updateCustomerDetail(customerId, customerDetail)
    if (res.success) {
      const idx = customerList.value.findIndex(i => i._id === customerId)
      if (idx !== -1) customerList.value[idx] = dataFromChild
    }
  } else {
    // 新增
    const res = await createCustomerDetail(customerDetail)
    if (res.success) customerList.value.push(dataFromChild)
  }
}

// 打开地图
const openMap = (storeLocation) => {
  if (!storeLocation?.geopoint?.coordinates) return
  const [lng, lat] = storeLocation.geopoint.coordinates
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  window.open(url, '_blank')
}

const hasCoordinates = (storeLocation) => {
  const coords = storeLocation?.geopoint?.coordinates;

  return (
      Array.isArray(coords) &&
      coords.length >= 2 &&
      coords[0] != null &&
      coords[1] != null &&
      // 关键：排除 0,0
      coords[0] !== 0 &&
      coords[1] !== 0
  );
};

const openOrderInvoiceDialog =() =>{
  orderInvoiceGeneratorRef.value.setVisible()
}

onMounted(async () => {
  const results = await Promise.all(
      status.value.map(item => fetchOrderCount(item.status))
  )

  results.forEach((count, idx) => {
    status.value[idx].value = count
  })
})


</script>

<style scoped lang="scss">

</style>