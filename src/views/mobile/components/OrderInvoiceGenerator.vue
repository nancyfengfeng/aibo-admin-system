<template>
  <div>
    <el-dialog v-model="visible" :close-on-click-modal="false" title="创建新发票" width="1000">
      <div class="flex justify-between items-center">
        <div class="text-base text-red-500 font-bold">注意：临时订单发票不会自动保存到数据库</div>
        <div class="p-4">
          <t-checkbox
              v-model="isTempInvoice"
              icon="rectangle"
              label="临时订单发票"
              :block="false"
          />
        </div>
      </div>
<!--      订单信息-->
      <el-descriptions :column="2" border size="large">
        <el-descriptions-item label="客户名称">
          <el-autocomplete
              v-model="customerInfo.name"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入客户名称"
              @select="handleSelect"
              clearable
          />
        </el-descriptions-item>
        <el-descriptions-item label="客户编号">
          <el-input :disabled="!isTempInvoice" v-model="customerInfo.inviteCode"/>
        </el-descriptions-item>
        <el-descriptions-item label="客户电话">
          <el-input :disabled="!isTempInvoice" v-model="customerInfo.phone"/>
        </el-descriptions-item>
        <el-descriptions-item label="客户地区">
          <el-select v-model="customerInfo.region" style="width:100%" clearable :disabled="!isTempInvoice">
            <el-option v-for="item in regionList" :key="item.value"
                       :label="item.label" :value="item.value"
            />
          </el-select>
        </el-descriptions-item>
      </el-descriptions>
<!--      订单项信息-->
      <div class="mt-4 flex justify-between items-center">
        <h1 class="text-lg font-bold">订单详情</h1>
      </div>
      <el-divider/>
      <div>
        <div class="flex gap-2">
          <div class="w-10"></div>
          <div class="w-52 text-center text-lg font-bold">商品编号</div>
          <div class="w-52 text-center text-lg font-bold">数量</div>
          <div class="w-52 text-center text-lg font-bold">商品原价</div>
          <div class="w-52 text-center text-lg font-bold">商品单价</div>
          <div class="w-52 text-center text-lg font-bold">商品小价</div>
        </div>
        <div class="flex gap-2 mt-2" v-for="(item,index) in productList" :key="index" >
          <div class="w-10">{{index}}</div>
          <div class="w-52 text-center"></div>
          <div class="w-52 text-center"></div>
          <div class="w-52 text-center"></div>
          <div class="w-52 text-center"></div>
          <div class="w-52 text-center"></div>
        </div>
        <div class="flex gap-2 mt-2">
          <div class="w-10">{{productList.length+1}}</div>
          <div class="w-52 text-center">
<!--            <el-autocomplete -->
<!--                 v-model="productPopup.skuCode"-->
<!--                 :fetch-suggestions="querySearchSku"-->
<!--                 placeholder="请输入商品SKU编码"-->
<!--                 style="width: 300px"-->
<!--                 @select="handleSelectProduct"-->
<!--            >-->
<!--              <template #default="{ item }">-->
<!--                <div class="flex gap-3">-->
<!--                  <span>{{ item.skuCode }}</span>-->
<!--                  <span class="text-gray-500">{{ item.productName }}</span>-->
<!--                </div>-->
<!--              </template>-->
<!--            </el-autocomplete>-->
            <t-search
                v-model="productPopup.skuCode"
                :result-list="productResultList"
                @change="onRemoteSearchProduct"
                @select="handleSelectProduct"
                placeholder="请输入SKU"
                style="width: 400px"
            />
          </div>
        </div>
      </div>
    </el-dialog>
    <t-popup v-model="productPickerVisible" placement="bottom" :closeOnOverlayClick="false">
      <div class="p-5 mb-20">
        <div class="flex items-center h-14">
          <t-button size="large" variant="text" @click="handleCancelPopup">取消</t-button>
          <div class="flex-1 text-center font-bold text-2xl">确认商品 SKU </div>
          <t-button size="large" variant="text" theme="primary">确定</t-button>
        </div>
        <div class="px-12">
          <div class="flex items-center gap-20">
            <div>
              <div class="flex gap-2 mt-5 items-center">
                <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                  SKU编号：
                </h2>
                <div>{{productPopup.skuCode}}</div>
              </div>
              <div class="flex gap-2 mt-5 items-center">
                <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                  商品名称：
                </h2>
                <div>{{productPopup.name}}</div>
              </div>
              <div class="flex gap-2 mt-5 items-center">
                <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                  规格：
                </h2>
                <div>{{ productPopup.attributes?.quantity }} 个/箱（包）</div>
              </div>
            </div>
            <div class="flex gap-2 mt-5 items-center">
              <el-image :src="productPopup.imageUrl" style="width: 150px; height: 150px"></el-image>
            </div>
          </div>
          <el-divider/>
          <div class="flex gap-20">
            <div class="flex gap-2 items-center">
              <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                原价：
              </h2>
              <el-input
                  size="large"
                  v-model="productPopup.price"
                  style="width: 250px"
                  :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/₡\s?|,/g, '')"
              />
            </div>
            <div class="flex gap-2 items-center">
              <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                单价：
              </h2>
              <el-input
                  size="large"
                  v-model="productPopup.vip_price"
                  style="width: 250px"
                  :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/₡\s?|,/g, '')"
              />
            </div>
          </div>
          <div class="flex gap-20 mt-5">
            <div class="flex gap-2 items-center">
              <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                数量：
              </h2>
              <el-input-number v-model="productPopup.quantity" size="large" min="1" style="width: 250px"/>
            </div>
            <div class="flex gap-2 items-center">
              <h2 class="text-slate-500 text-2xl w-32" style="text-align: justify; text-align-last: justify; letter-spacing: 0;">
                小价：
              </h2>
              <h1 class="text-2xl text-red-500 font-bold">
                ₡ {{
                  (Number(productPopup.quantity || 0) * Number(productPopup.vip_price || 0))
                      .toLocaleString()
                }}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </t-popup>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, reactive} from 'vue'
import {
  Checkbox as TCheckbox,
  Popup as TPopup,
  Search as TSearch
} from "tdesign-mobile-vue";
import {fetchCustomerByName} from "../../common/CustomerPage/customerService.js";
import {fetchProductBySkuCode} from "../../common/ProductPage/productService.js";



const visible = ref(true)
const setVisible = ()=>{
  visible.value = true
}

// 复选框绑定的数组
const isTempInvoice = ref(true)


// 客户信息相关
const customerInfo = reactive({
  name:'',
  inviteCode:'',
  phone:'',
  region:'',
  _id:'',
  VIPLevel:''
})

const regionList = ref([
  { value: '1', label: 'San José' },
  { value: '2', label: 'Alajuela' },
  { value: '3', label: 'Cartago' },
  { value: '4', label: 'Heredia' },
  { value: '5', label: 'Guanacaste' },
  { value: '6', label: 'Puntarenas' },
  { value: '7', label: 'Limón' },
])

// ====================
// 远程搜索核心方法
// ====================
const querySearchAsync = async (queryString, cb) => {
  // 如果没输入内容，直接返回空
  if (!queryString) {
    cb([])
    return
  }

  try {
    // 调用你的后端接口 🔥
    const list = await fetchCustomerByName(queryString)

    // 后端返回的数据 → 转成 el-autocomplete 需要的格式
    const results = list.map(item => ({
      value: item.storeName,   // 显示在下拉里的文字
      id: item._id,             // 把客户ID也带上
      item: item               // 完整客户信息
    }))

    // 返回给下拉框
    cb(results)
  } catch (err) {
    console.error(err)
    cb([])
  }
}

// ====================
// 选中客户时触发
// ====================
const handleSelect = (selectedItem) => {
  const c = selectedItem.item // 真实客户数据
  console.log(c)
  // 开始赋值 ✅
  customerInfo.name = c.storeName || ''
  customerInfo.inviteCode = c.inviteCode || ''
  customerInfo.phone = c.phone || ''
  customerInfo.region = c.region || ''
  customerInfo._id = c._id || ''
  customerInfo.VIPLevel = c.VIPLevel || ''
}

// 订单详情
const productList = ref([])
const productPickerVisible = ref(false)
const productResultList = ref([])
const productPopup = ref({})

const buildProductPopup = () => {
  productPopup.value = {
    skuCode: '',
    productName: '',
    attributes: {quantity:0},
    price: '',
    vip_price: '',
    images: [],
    quantity: 1,
  }
}

const handleCancelPopup = ()=>{
  buildProductPopup()
  productPickerVisible.value = false
}

// ====================
// 远程搜索方法
// ====================
const querySearchSku = async (queryString, cb) => {
  if (!queryString) {
    cb([])
    return
  }

  const list = await fetchProductBySkuCode(queryString)

  // 🔥 直接返回 item，不要包 { value, raw } 这种结构！
  const results = list.map(item => ({
    ...item,
    value: item.skuCode // 只需要加一个 value 字段即可
  }))

  cb(results)
}

const onRemoteSearchProduct = async (val) => {
  if (!val) {
    productResultList.value = ['ng-008']
    return
  }
  try {
    const res = await fetchProductBySkuCode(val)
    // 给 t-search 用的字符串列表
    productResultList.value = res.map(item => {
      return item.skuCode + ' （' + item.productName + '）'
    })
  } catch (err) {
    productResultList.value = []
  }
}

// ====================
// 选中后自动填充到 productPopup
// ====================
const handleSelectProduct = (item) => {
  let vipKey = 'vip1' // 默认 vip1

  if (customerInfo?.VIPLevel) {
    // 拼接成 vip1, vip2...
    vipKey = 'vip' + customerInfo.VIPLevel
  }
  productPopup.value = {
    skuCode: item.skuCode,
    name: item.productName,
    productId: item.productId,
    attributes: item.attributes,
    price: item.price,
    vip_price: item.vip_price?.[0]?.[vipKey] || 0,
    imageUrl: item.imageUrl,
    quantity: 1
  }
  productPickerVisible.value = true
}

defineExpose({
  setVisible
})

onMounted(() => {
  buildProductPopup()
})
</script>

<style scoped lang="scss">

</style>