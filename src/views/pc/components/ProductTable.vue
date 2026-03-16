<template>
  <div>
    <el-table :data="productData" :border="true" style="width: 100%" row-key="_id">
      <el-table-column type="selection" width="55" fixed="left" />
      <el-table-column type="expand" fixed="left">
        <template #default="props">
          <div class="p-5">
<!--            图片-->
            <div class="flex gap-2">
              <el-image
                  v-for="(item, index) in props.row.images"
                  :key="index"
                  :src="item"
                  style="width: 100px; height: 100px; "
              />
            </div>
<!--            sku 表格-->
            <div class="mt-5">
              <el-table :data="props.row.skus" :border="true" style="width: 100%">
                <el-table-column label="编号" prop="skuCode" width="130px" fixed="left">
                </el-table-column>
                <el-table-column label="包装数量" width="160px" fixed="left">
                  <template #default="scope">
                    <el-input-number style="width: 130px"
                                     v-model="scope.row.attributes.quantity" :min="1"
                                     @change="handleChange" />
                  </template>
                </el-table-column>
                <el-table-column label="状态" >
                  <template #default="scope">
                    <el-switch
                        v-model="scope.row.enabled"
                        inline-prompt
                        active-text="上架"
                        inactive-text="下架"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="160px">
                  <template #default="scope">
                    <el-input-number style="width: 130px"
                                     v-model="scope.row.stock" :min="1"
                                     @change="handleChange" />
                  </template>
                </el-table-column>
                <el-table-column label="原价" width="150px">
                  <template #default="scope">
                    <el-input
                        v-model="scope.row.price"
                        style="width: 100px"
                        placeholder="Please input"
                        :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="VIP价格">
                  <el-table-column label="VIP-1" width="150px">
                    <template #default="scope">
                      <el-input
                          v-model="scope.row.vip_price[0].vip1"
                          style="width: 100px"
                          placeholder="Please input"
                          :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="VIP-2" width="150px">
                    <template #default="scope">
                      <el-input
                          v-model="scope.row.vip_price[0].vip2"
                          style="width: 100px"
                          placeholder="Please input"
                          :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="VIP-3" width="150px">
                    <template #default="scope">
                      <el-input
                          v-model="scope.row.vip_price[0].vip3"
                          style="width: 100px"
                          placeholder="Please input"
                          :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="VIP-4" width="150px">
                    <template #default="scope">
                      <el-input
                          v-model="scope.row.vip_price[0].vip4"
                          style="width: 100px"
                          placeholder="Please input"
                          :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="VIP-5" width="150px">
                    <template #default="scope">
                      <el-input
                          v-model="scope.row.vip_price[0].vip5"
                          style="width: 100px"
                          placeholder="Please input"
                          :formatter="(value) => `₡ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                    </template>
                  </el-table-column>
                </el-table-column>
                <el-table-column label="操作" width="60" fixed="right">
                  <template #default="scope">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="保存修改"
                        placement="top"
                    >
                      <el-button type="success" :icon="Check" circle  @click="handleSaveSku(scope.row)"/>
                    </el-tooltip>

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

      <!-- 时间格式化已修复 -->
      <el-table-column label="商品创建时间" prop="createdAt" width="180" :formatter="formatDate"/>
      <el-table-column label="商品更新时间" prop="updatedAt" width="180" :formatter="formatDate"/>

      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ✅ 分页器已修复 -->
    <div class="flex-center mt-5">
      <el-pagination
          :page-size="currentPageSize"
          v-model:current-page="currentPageNum"
          background
          layout="prev, pager, next,"
          :total="productTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import getProducts from "../../common/ProductPage/getProducts.js"
import {Edit,Check} from '@element-plus/icons-vue'

const productData = ref([])
const currentPageSize = ref(10)
const currentPageNum = ref(1)
const productTotal = ref(0)

// 获取数据函数（抽出来，方便切换页调用）
const getProductList = async () => {
  let data = await getProducts(currentPageSize.value, currentPageNum.value)
  productData.value = data.records
  productTotal.value = data.total
}

// 初始化
onMounted(() => {
  getProductList()
})

// 切换每页条数
const handleSizeChange = (val) => {
  currentPageSize.value = val
  getProductList()
}

const handleSaveSku = (row) => {
  console.log(row)
//   TODO:写云函数，保存 sku 数据
}

// 切换页码
const handleCurrentChange = (val) => {
  currentPageNum.value = val
  getProductList()
}

// 时间格式化（已修复，支持 createdAt / updatedAt）
const formatDate = (row) => {
  const time = row.createdAt || row.updatedAt
  if (!time) return "-"

  const date = new Date(time)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

</script>

<style scoped lang="scss">
</style>