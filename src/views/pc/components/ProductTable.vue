<template>
  <div>
    <el-table :data="productData" :border="true" style="width: 100%" row-key="_id">
      <el-table-column type="expand" fixed="left">
        <template #default="props">
          <div class="p-5">
            <div class="flex gap-2">
              <el-image
                  v-for="(item, index) in props.row.images"
                  :key="index"
                  :src="item.url"
                  style="width: 100px; height: 100px"
              />
            </div>
            <div class="mt-5">
              <el-table :data="props.row.skus" :border="true" style="width: 100%">
                <el-table-column label="编号" prop="skuCode" width="130" fixed="left" />
                <el-table-column label="包装数量" width="160" fixed="left">
                  <template #default="scope">
                    <el-input-number style="width: 130px" v-model="scope.row.attributes.quantity" :min="1" />
                  </template>
                </el-table-column>
                <el-table-column label="状态">
                  <template #default="scope">
                    <el-switch v-model="scope.row.enabled" active-text="上架" inactive-text="下架" inline-prompt/>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="160">
                  <template #default="scope">
                    <el-input-number style="width: 130px" v-model="scope.row.stock" :min="1" />
                  </template>
                </el-table-column>
                <el-table-column label="原价" width="150">
                  <template #default="scope">
                    <el-input
                        v-model="scope.row.price"
                        style="width: 100px"
                        :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/₡\s?|,/g, '')"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="VIP价格">
                  <el-table-column label="VIP-1" width="150"><template #default="scope">
                    <el-input v-model="scope.row.vip_price[0].vip1" style="width: 100px" :formatter="(v) => `₡ ${v}`" :parser="(v) => v.replace(/₡|,/g,'')"/>
                  </template></el-table-column>
                  <el-table-column label="VIP-2" width="150"><template #default="scope">
                    <el-input v-model="scope.row.vip_price[0].vip2" style="width: 100px" :formatter="(v) => `₡ ${v}`" :parser="(v) => v.replace(/₡|,/g,'')"/>
                  </template></el-table-column>
                  <el-table-column label="VIP-3" width="150"><template #default="scope">
                    <el-input v-model="scope.row.vip_price[0].vip3" style="width: 100px" :formatter="(v) => `₡ ${v}`" :parser="(v) => v.replace(/₡|,/g,'')"/>
                  </template></el-table-column>
                  <el-table-column label="VIP-4" width="150"><template #default="scope">
                    <el-input v-model="scope.row.vip_price[0].vip4" style="width: 100px" :formatter="(v) => `₡ ${v}`" :parser="(v) => v.replace(/₡|,/g,'')"/>
                  </template></el-table-column>
                  <el-table-column label="VIP-5" width="150"><template #default="scope">
                    <el-input v-model="scope.row.vip_price[0].vip5" style="width: 100px" :formatter="(v) => `₡ ${v}`" :parser="(v) => v.replace(/₡|,/g,'')"/>
                  </template></el-table-column>
                </el-table-column>
                <el-table-column label="操作" width="60" fixed="right">
                  <template #default="scope">
                    <el-button type="success" circle :icon="Check" @click="handleSaveSku(scope.row)"/>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="name" fixed="left"/>
      <el-table-column label="商品编号" prop="code" width="150"/>
      <el-table-column label="商品分类" prop="category.name" width="100"/>
      <el-table-column label="商品标签" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.tags.color">{{ scope.row.tags.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" width="180" :formatter="formatDate"/>
      <el-table-column label="更新时间" prop="updatedAt" width="180" :formatter="formatDate"/>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex-center mt-5">
      <el-pagination
          :page-size="currentPageSize"
          v-model:current-page="currentPageNum"
          background
          layout="prev, pager, next"
          :total="productTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProducts } from "../../common/ProductPage/productService.js"
import { Check } from '@element-plus/icons-vue'
import {updateSku} from "../../common/ProductPage/skuService.js";

const productData = ref([])
const currentPageSize = ref(10)
const currentPageNum = ref(1)
const productTotal = ref(0)

const emit = defineEmits(['edit'])



const getProductList = async (filter = {}) => {
  const loading = ElLoading.service({
    text: '加载数据中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const data = await getProducts(
      currentPageSize.value,
      currentPageNum.value,
      filter
  )
  productData.value = data.records
  productTotal.value = data.total
  loading.close()
}

defineExpose({
  getProductList
})

onMounted(() => getProductList())

const handleSizeChange = (val) => {
  currentPageSize.value = val
  getProductList()
}

const handleCurrentChange = (val) => {
  currentPageNum.value = val
  getProductList()
}

const handleEdit = (row) => {
  emit('edit', row)
}

const handleSaveSku = async (row) => {
  const loading = ElLoading.service({ text: '保存中...' })
  try {
    const sku = JSON.parse(JSON.stringify(row))
    const skuID = sku._id
    delete sku._id
    const skuRes = await updateSku(skuID, sku)
    if (skuRes.success){
      let message = sku.skuCode + '信息更新成功！'
      ElMessage.success(message)
    }
    else {
      let message = sku.skuCode + '信息更新失败！'
      ElMessage.error(message)
    }
  } catch (err) {
    let message = '操作失败' + err
    ElMessage.error(message)
  } finally {
    loading.close()
  }
}

const formatDate = (row) => {
  // 直接从 row 里拿时间戳，不依赖 column，最稳
  const time = row.createdAt || row.updatedAt

  if (!time) return '-'

  // 强制转数字 + 生成日期
  const date = new Date(Number(time))

  // 防止 Invalid Date
  if (isNaN(date.getTime())) return '-'

  // 返回友好时间
  return date.toLocaleString()
}
</script>

<style scoped lang="scss">
</style>