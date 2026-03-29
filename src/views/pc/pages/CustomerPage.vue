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
            <icon-font name="iconfont icon-kehu" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          全部客户
        </t-breadcrumb-item>
      </t-breadcrumb>
    </div>

    <el-card>
      <!-- 顶部操作 -->
      <div class="flex px-5 pb-5 justify-between items-center">
        <h1 class="text-lg font-bold">全部客户信息</h1>
        <el-button type="danger" @click="openCustomerDialog" :icon="Plus">
          添加客户信息
        </el-button>
      </div>

      <!-- 搜索与筛选 -->
      <div class="flex justify-between bg-white">
        <div class="flex p-5 gap-10">
          <div class="flex items-center">
            <div class="text-sm text-slate-500">客户编号：</div>
            <div>
              <el-input clearable v-model="customerNoSearch" style="width: 250px">
                <template #prepend>AIBO-</template>
              </el-input>
            </div>
          </div>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
        <div class="flex p-5 gap-10 items-center">
          <div class="flex items-center">
            <div class="text-sm text-slate-500">VIP等级：</div>
            <el-select
                style="width: 150px"
                v-model="selectedVip"
                placeholder="请选择VIP等级"
                clearable
                @change="handleSearch"
            >
              <el-option
                  v-for="item in vipList"
                  :key="item.key"
                  :value="item.key"
                  :label="item.label"
              />
            </el-select>
          </div>
          <div class="flex items-center">
            <div class="text-sm text-slate-500">地区：</div>
            <el-select
                style="width: 150px"
                v-model="selectedRegion"
                placeholder="请选择地区"
                clearable
                @change="handleSearch"
            >
              <el-option
                  v-for="item in regionList"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
              />
            </el-select>
          </div>
          <el-button type="success" :icon="Refresh" circle @click="refreshData"/>
        </div>
      </div>

      <!-- 客户表格 -->
      <div class="px-5 bg-white">
        <el-table :data="customerList" border>
          <el-table-column prop="inviteCode" label="客户编号" fixed="left" align="center" />
          <el-table-column prop="storeName" label="客户店铺名" fixed="left" align="center" />

          <!-- 微信号 -->
          <el-table-column label="客户微信识别号">
            <el-table-column
                v-for="(item, index) in 3"
                :key="index"
                :label="'微信' + (index + 1)"
                width="130"
                align="center"
            >
              <template #default="scope">
                <el-tooltip
                    :content="scope.row.wechatOpenId?.[index]"
                    placement="top"
                    :disabled="!scope.row.wechatOpenId?.[index]"
                >
                  <div class="truncate" :class="!scope.row.wechatOpenId?.[index] ? 'text-slate-300' : ''">
                    {{ scope.row.wechatOpenId?.[index] || '尚未绑定微信' }}
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="联系方式" align="center">
            <template #default="scope">
              <el-tooltip
                  effect="dark"
                  :content="scope.row.phone || '无联系方式'"
                  placement="top"
              >
                <span class="text-center" :class="!scope.row.phone? 'text-slate-300' : ''">
                  {{ scope.row.phone || '无联系方式' }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 地区 -->
          <el-table-column label="所在地区" align="center">
            <template #default="scope">
              {{
                regionList.find(item => item.value === scope.row.region)?.label || '—'
              }}
            </template>
          </el-table-column>

          <!-- 地址 + 地图 -->
          <el-table-column label="客户地址" align="center">
            <template #default="scope">
              <div class="flex justify-center">
                <el-button
                    type="text"
                    @click="openMap(scope.row.storeLocation)"
                    :disabled="!hasCoordinates(scope.row.storeLocation)"
                >
                  查看地图
                </el-button>
              </div>
            </template>
          </el-table-column>

          <!-- VIP等级 -->
          <el-table-column label="客户等级" align="center">
            <template #default="scope">
              <el-tag
                  :type="getVip(scope.row.VIPLevel).color"
              >
                {{ getVip(scope.row.VIPLevel).label }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column prop="status" label="客户状态" align="center">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-icon v-if="scope.row.status==='1'" size="25" color="#67C23A"><CircleCheckFilled /></el-icon>
                <el-icon v-else size="25" color="#d5dfe1"><CircleCloseFilled /></el-icon>
              </div>
            </template>
          </el-table-column>

          <!-- 备注 -->
          <el-table-column prop="remark" label="客户备注" align="center">
            <template #default="scope">
              <el-tooltip
                  :content="scope.row.remark || '尚未有任何备注'"
                  placement="top"
              >
                <div class="truncate max-w-[200px]" :class="!scope.row.remark ? 'text-slate-300' : ''">
                  {{ scope.row.remark || '尚未有任何备注' }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" fixed="right" width="80" align="center">
            <template #default="scope">
              <el-button link type="primary" @click="openCustomerDialog(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
    </el-card>

    <!-- 添加/编辑客户弹窗 -->
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { Search, CircleCheckFilled, CircleCloseFilled, Refresh, Plus } from "@element-plus/icons-vue";
import {
  createCustomerDetail,
  fetchAllCustomers,
  updateCustomerDetail
} from "../../common/CustomerPage/customerService.js";
import AddCustomer from "../components/AddCustomer.vue";

const iconUrl = inject('iconUrl')

// 搜索与筛选
const customerNoSearch = ref('')
const selectedVip = ref('')
const selectedRegion = ref('')
const currentPageSize = ref(10)
const currentPageNum = ref(1)
const OrderTotal = ref(0)
const customerList = ref([])

// VIP与地区列表
const vipList = ref([
  { key: '1', label: 'VIP-1', color:'info'},
  { key: '2', label: 'VIP-2', color:'primary'},
  { key: '3', label: 'VIP-3', color:'success'},
  { key: '4', label: 'VIP-4', color:'warning'},
  { key: '5', label: 'VIP-5', color:'danger'},
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

const getVip = (level) => {
  return vipList.value.find(v => v.key === level) || {
    label: '未知等级',
    color: 'info'
  }
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

// 打开弹窗（新增/编辑共用）
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

// 搜索
const handleSearch = async () => {
  const filter = {
    customerNo: customerNoSearch.value,
    region: selectedRegion.value,
    vip: selectedVip.value,
  }
  await getCustomerList(filter)
}

// 刷新
const refreshData = async () => {
  customerNoSearch.value = ''
  selectedVip.value = ''
  selectedRegion.value = ''
  await getCustomerList()
}

// 获取客户列表
const getCustomerList = async (filter={}) => {
  const loading = ElLoading.service({ text: '加载中...' })
  try {
    const res = await fetchAllCustomers(currentPageSize.value, currentPageNum.value, filter)
    console.log(res.result)
    customerList.value = res.result
    OrderTotal.value = res.total
  } catch (err) {
    console.log(err)
  } finally {
    loading.close()
  }
}

// 分页
const handleSizeChange = (val) => { currentPageSize.value = val; getCustomerList() }
const handleCurrentChange = (val) => { currentPageNum.value = val; getCustomerList() }

// 打开地图
const openMap = (storeLocation) => {
  if (!storeLocation?.geopoint?.coordinates) return
  const [lng, lat] = storeLocation.geopoint.coordinates
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  window.open(url, '_blank')
}

onMounted(async () => {
  await getCustomerList()
})
</script>