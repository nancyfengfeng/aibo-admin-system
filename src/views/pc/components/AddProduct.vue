<template>
  <el-dialog
      v-model="visibleLocal"
      :title="formData?._id ? '编辑商品' : '新增商品'"
      fullscreen
  >
    <el-form
        label-width="100px"
        ref="productFormRef"
        :rules="productRules"
        :model="formData"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="formData.name" clearable />
      </el-form-item>

      <el-form-item label="商品编号">
        <el-input v-model="formData.code" clearable />
      </el-form-item>

      <el-form-item label="商品分类" prop="category">
        <t-select
            v-model="formData.category._id"
            placeholder="请选择商品分类"
            clearable
        >
          <t-option
              v-for="item in categories"
              :key="item._id"
              :value="item._id"
              :label="item.name"
          />
        </t-select>
      </el-form-item>

      <el-form-item label="商品标签" prop="tags">
        <t-select
            v-model="formData.tags._id"
            placeholder="请选择商品标签"
            clearable
        >
          <t-option
              v-for="item in tagList"
              :key="item._id"
              :value="item._id"
              :label="item.name"
          />
        </t-select>
      </el-form-item>

      <el-form-item label="商品描述">
        <el-input
            v-model="formData.description"
            autosize
            type="textarea"
            placeholder="请输入描述"
        />
      </el-form-item>

      <el-form-item label="商品图片">
        <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :auto-upload="true"
            :http-request="uploadToCloudBase"
            :on-remove="handleRemove"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-divider>商品 SKU 信息</el-divider>
    <div class="flex justify-between mb-5">
      <div class="flex">
        <el-button type="success" @click="chooseSKUVisible=true">选择主要展示的 SKU </el-button>
        <span class="text-red-400 ml-2" style="align-content: end">注意：下方高亮的 SKU 行是小程序中主要展示的 SKU 信息。如果不选择会导致小程序主页无法显示商品价格</span>
      </div>

      <el-button type="danger" @click="skuVisible = true">新增 SKU</el-button>
    </div>

    <el-table :data="formData.skus" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column label="编号" prop="skuCode"/>
      <el-table-column label="包装数量" prop="attributes.quantity"/>
      <el-table-column label="状态">
        <template #default="scope">
          <span>{{scope.row.enabled?"上架":"下架"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock"/>
      <el-table-column label="原价" prop="price">
        <template #default="scope">
          <span>₡ {{ formatPrice(scope.row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="VIP价格">
        <el-table-column label="VIP-1" prop="vip_price[0].vip1">
          <template #default="scope">
            <span>₡ {{ formatPrice(scope.row.vip_price?.[0]?.vip1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP-2" prop="vip_price[0].vip2">
          <template #default="scope">
            <span>₡ {{ formatPrice(scope.row.vip_price?.[0]?.vip2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP-3" prop="vip_price[0].vip3">
          <template #default="scope">
            <span>₡ {{ formatPrice(scope.row.vip_price?.[0]?.vip3) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP-4" prop="vip_price[0].vip4">
          <template #default="scope">
            <span>₡ {{ formatPrice(scope.row.vip_price?.[0]?.vip4) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP-5" prop="vip_price[0].vip5">
          <template #default="scope">
            <span>₡ {{ formatPrice(scope.row.vip_price?.[0]?.vip5) }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleSKUEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleEdit(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="visibleLocal = false">取消</el-button>
      <el-button type="primary" @click="handleSave">
        {{ formData._id ? '保存修改' : '确认新增' }}
      </el-button>
    </template>
  </el-dialog>

  <!-- SKU 弹窗 -->
  <el-dialog v-model="skuVisible" :title="skuForm._id ? '编辑 SKU 信息' : '新增 SKU 信息'" :close-on-click-modal="false" append-to-body>
    <el-form
        label-width="100px"
        :inline="true"
        :model="skuForm"
        label-position="top"
        :rules="skuRules"
        ref="skuFormRef"
    >
      <el-form-item label="sku编号">
        <el-input v-model="skuForm.skuCode" clearable />
      </el-form-item>

      <el-form-item label="包装数量" prop="attributes.quantity">
        <el-input-number v-model="skuForm.attributes.quantity" :min="1">
          <template #suffix><span> 个 </span></template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="库存">
        <el-input-number v-model="skuForm.stock" :min="1">
          <template #suffix><span> 箱 </span></template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="原价" prop="price">
        <el-input
            v-model="skuForm.price"
            style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-switch v-model="skuForm.enabled" active-text="上架" inactive-text="下架"/>
      </el-form-item>

      <el-divider>VIP 价格</el-divider>

      <el-form-item label="VIP-1" prop="vip_price[0].vip1">
        <el-input
            v-model="skuForm.vip_price[0].vip1" style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>
      <el-form-item label="VIP-2" prop="vip_price[0].vip2">
        <el-input
            v-model="skuForm.vip_price[0].vip2" style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>
      <el-form-item label="VIP-3" prop="vip_price[0].vip3">
        <el-input
            v-model="skuForm.vip_price[0].vip3" style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>
      <el-form-item label="VIP-4" prop="vip_price[0].vip4">
        <el-input
            v-model="skuForm.vip_price[0].vip4" style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>
      <el-form-item label="VIP-5" prop="vip_price[0].vip5">
        <el-input
            v-model="skuForm.vip_price[0].vip5" style="width: 170px"
            :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₡\s?|,/g, '')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="skuVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSKUSave">
        {{ skuForm._id ? '保存修改' : '确认新增' }}
      </el-button>
    </template>
  </el-dialog>
  <!-- 选择主展示 SKU 弹窗 -->
  <el-dialog
      v-model="chooseSKUVisible"
      title="选择主展示的 SKU"
      width="700px"
      close-on-click-modal="false"
  >
    <el-table
        :data="formData.skus"
        highlight-current-row
        @current-change="handleCurrentChange"
        row-key="_id"
    >
      <el-table-column label="SKU 编号" prop="skuCode" />
      <el-table-column label="包装数量" prop="attributes.quantity" />
      <el-table-column label="原价" prop="price" />
    </el-table>

    <template #footer>
      <el-button @click="chooseSKUVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmChooseSKU">确认选择</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { getTagList } from '../../common/ProductPage/tagService.js'
import { storage } from '@/utils/cloudbase'
import { Plus } from '@element-plus/icons-vue'
import { updateSku ,addSku} from "../../common/ProductPage/skuService.js"
import {formattedProductData, getProductShownSku, updateProduct, addProduct} from "../../common/ProductPage/productService.js";


const props = defineProps({
  visible: Boolean,
  formData: {
    type: Object,
    default: () => ({
      _id: '',
      name: '',
      description: '',
      code: '',
      category: { _id: '' },
      images: [],
      skus: [],
      tags: { _id: '' },
      createdAt: '',
      updatedAt: ''
    })
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const shownSkuIdMap = ref({}) // key: spuId, value: shownSkuId
// ==========================
// 监听：切换商品 → 重新获取高亮 SKU
// ==========================
// 原来的代码 👉 替换成下面这个
watch(
    () => props.formData._id,
    async (newSpuId) => {
      // ✅ 新增商品：直接 return，不请求接口
      if (!newSpuId) {
        shownSkuIdMap.value = {} // 清空
        return
      }

      // ✅ 编辑商品：才请求接口
      try {
        const shownId = await getProductShownSku(newSpuId)
        const skus = props.formData?.skus || []
        const match = skus.find(sku => sku._id === shownId)
        shownSkuIdMap.value[newSpuId] = match ? match._id : ''
      } catch (err) {
        console.log('获取默认展示SKU失败', err)
      }
    },
    { immediate: true }
)

const visibleLocal = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 标签
const tagList = ref([{ _id: '', name: '' }])
onMounted(async () => {
  tagList.value = await getTagList()
})

// ==========================
// 图片上传
// ==========================
// 加载状态

const fileList = ref([])

const uploadToCloudBase = async ({ file }) => {
  const loading = ElLoading.service({ text: '上传图片中...' })
  try {
    // 1. 上传文件
    const { data, error } = await storage.upload(
        `product/${Date.now()}_${file.name}`,
        file
    )
    if (error) throw error

    const fileId = data.id; // cloud://...

    // 2. 直接用官方方法获取单个签名URL
    const { data: signData } = await storage.createSignedUrls([fileId], 3600 * 24 * 7);

    const url = signData?.[0]?.signedUrl || '';

    // 3.  push 标准格式 { fileId, url }
    props.formData.images.push({ fileId, url });

    ElMessage.success('图片上传成功！');
    return fileId;
  } catch (err) {
    console.error('上传失败', err);
    ElMessage.error('上传失败');
  }finally {
    loading.close()
  }
}

const handleRemove = async (file) => {
  const loading = ElLoading.service({ text: '删除图片中...' })
  try {
    // 找到要删除的图片
    const item = props.formData.images.find(it => it.url === file.url);
    if (!item) return;

    // 从列表删除
    props.formData.images = props.formData.images.filter(i => i.url !== file.url);

    // 删除云端
    await storage.remove([item.fileId]);

    ElMessage.success('删除成功！');
  } catch (err) {
    ElMessage.error('删除失败');
  }finally {
    loading.close()
  }
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

const productFormRef = ref(null)

const productRules = ref({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  tags: [
    { required: true, message: '请选择商品标签', trigger: 'change' }
  ]
})


// ==========================
// 商品保存
// ==========================
const handleSave = async () => {
  // 1. 表单校验
  const isValid = await submitForm(productFormRef.value)
  if (!isValid) return

  // 2. 加载动画
  const loading = ElLoading.service({ text: '保存中...' })

  try {
    const spuId = props.formData._id;
    let shownSkuId;

    if (spuId) {
      // 编辑：用商品ID取
      shownSkuId = shownSkuIdMap.value[spuId];
    } else {
      // 新增：直接取选中的SKU ID
      shownSkuId = Object.values(shownSkuIdMap.value)[0];
    }

    // ✅ 统一格式化数据
    const {productData} = await formattedProductData(props.formData, shownSkuId);
    console.log('最终提交 productData', productData);

    // ✅ 统一保存逻辑
    if (spuId) {
      // 编辑
      const updateRes = await updateProduct(spuId, productData);
      if (updateRes.success){
        ElMessage.success('更新商品成功');
        // 成功后关闭弹窗
        emit('success');
        visibleLocal.value = false;
      }
      else {
        ElMessage.error("更新商品失败")
      }
    } else {
      // 新增
       const addRes =await addProduct(productData);
      if (addRes.success){
        ElMessage.success('新增商品成功');
        // 成功后关闭弹窗
        emit('success');
        visibleLocal.value = false;
      }
      else {
        ElMessage.error("新增商品失败")
      }
    }

  } catch (err) {
    console.error('商品保存失败', err);
    ElMessage.error('保存失败');
  } finally {
    // 无论成功失败，都关闭加载
    loading.close();
  }
}

// ==========================
// SKU 相关
// ==========================
const skuVisible = ref(false)
const skuForm = ref({})
const skuFormRef = ref(null)

const resetSkuForm = () => {
  skuForm.value = {
    _id: '',
    skuCode: '',
    attributes: { quantity: 0 },
    enabled: true,
    stock: 0,
    price: 0,
    vip_price: [{
      vip1: 0,
      vip2: 0,
      vip3: 0,
      vip4: 0,
      vip5: 0
    }]
  }
}
resetSkuForm()

// ✅ 数字校验函数
const isNumber = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    callback(new Error('不能为空'))
  } else if (isNaN(Number(value))) {
    callback(new Error('必须是数字'))
  } else {
    callback()
  }
}


// ✅ SKU 表单规则
const skuRules = {
  'attributes.quantity': [
    { required: true, message: '请输入包装数量', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入原价', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  'vip_price[0].vip1': [
    { required: true, message: '请输入VIP-1价格', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  'vip_price[0].vip2': [
    { required: true, message: '请输入VIP-2价格', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  'vip_price[0].vip3': [
    { required: true, message: '请输入VIP-3价格', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  'vip_price[0].vip4': [
    { required: true, message: '请输入VIP-4价格', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ],
  'vip_price[0].vip5': [
    { required: true, message: '请输入VIP-5价格', trigger: 'blur' },
    { validator: isNumber, trigger: 'blur' }
  ]
}

const tableRowClassName = ({ row }) => {
  const spuId = props.formData._id
  // ✅ 编辑：用商品ID取
  // ✅ 新增：直接取 map 里唯一的值
  const targetId = spuId
      ? shownSkuIdMap.value[spuId]
      : Object.values(shownSkuIdMap.value)[0]

  return row._id === targetId ? 'warning-row' : ''
}

const handleSKUEdit = (value) => {
  skuForm.value = JSON.parse(JSON.stringify(value))
  skuVisible.value = true
}


const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
}

const updateFormDataSku = (skuId, sku, isNew = false) => {
  sku._id = skuId
  if (isNew) {
    props.formData.skus = [...props.formData.skus, sku] // 生成新数组，触发视图刷新
    console.log('新增 SKU，已 push:', sku)
  } else {
    const index = props.formData.skus.findIndex(item => item._id === skuId)
    if (index !== -1) {
      const newSkus = [...props.formData.skus]
      newSkus[index] = { ...newSkus[index], ...sku } // 替换对象
      props.formData.skus = newSkus
      console.log('编辑 SKU，索引:', index)
    }
  }
}

// ==========================
// 保存 sku
// ==========================
const handleSKUSave = async () => {
  // 1. 表单校验
  const isValid = await submitForm(skuFormRef.value)
  if (!isValid) return
  const loading = ElLoading.service({ text: '保存中...' })
  try {
    const skuId = skuForm.value._id
    const sku = JSON.parse(JSON.stringify(skuForm.value))



    // ==========================================
    // ✅ 自动判断：新增 / 编辑
    // ==========================================
    if (skuId) {
      delete sku._id
      const skuRes = await updateSku(skuId, sku)
      if (skuRes.success) {
        let message = sku.skuCode+'信息更新成功'
        ElMessage.success(message)
      //   更新formData的数据
        updateFormDataSku(skuId,sku)
      }
      else {
        let message = sku.skuCode+'信息更新失败'
        ElMessage.error(message)
      }
    } else {
      // 新增：没有 _id
      delete sku._id
      const skuRes = await addSku(sku)       // 调用新增接口
      if (skuRes.success) {
        let message = sku.skuCode+'信息新增成功'
        ElMessage.success(message)
        //   更新formData的数据
        updateFormDataSku(skuRes.skuId,sku,true)
      }
      else {
        let message = sku.skuCode+'信息更新失败'
        ElMessage.error(message)
      }

    }
    skuVisible.value = false
  } catch (err) {
    console.error('保存失败', err)
    // ElMessage.error('保存失败')
  }finally {
    loading.close()
  }
}

const chooseSKUVisible = ref(false) // 选择弹窗
const chooseTableRef = ref(null) // 选择表格 ref
const selectedSKURow = ref(null)

const handleCurrentChange = (currentRow, oldCurrentRow) => {
  selectedSKURow.value = currentRow
}

// 确认选择主展示 SKU
const confirmChooseSKU = () => {
  if (!selectedSKURow.value) {
    ElMessage.warning('请选择一个 SKU')
    return
  }

  // 设置为主展示 SKU
  shownSkuIdMap.value[props.formData._id] = selectedSKURow.value._id

  ElMessage.success('已设置主展示 SKU：' + selectedSKURow.value.skuCode)
  chooseSKUVisible.value = false
}

// ==========================
// 价格格式化
// ==========================
const formatPrice = (num) => {
  if (!num && num !== 0) return '0'
  return Number(num).toLocaleString('en-US')
}

// ==========================
// 监听
// ==========================
watch(
    () => props.formData.images,
    (newImages = []) => {
      fileList.value = newImages.map((item, i) => ({
        uid: i,
        url: item.url, // 👈 只改这里！
        name: `商品图片${i + 1}`
      }))
    },
    { immediate: true }
)

watch(
    () => skuVisible.value,
    (val) => {
      if (!val) {
        setTimeout(() => {
          resetSkuForm()       // 重置你的表单数据
          resetForm(skuFormRef.value) // 重置校验状态
        }, 0)
      }
    }
)
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
</style>