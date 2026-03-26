<template>
  <div>
    <t-breadcrumb>
      <t-breadcrumb-item to="/">
        <template #icon>
          <icon-font name="iconfont icon-shouye" :url="iconUrl" size="24" class="mr-2"/>
        </template>
        首页
      </t-breadcrumb-item>
      <t-breadcrumb-item :disabled="true">
        <template #icon>
          <icon-font name="iconfont icon-shangpinku" :url="iconUrl" size="24" class="mr-2"/>
        </template>全部商品
      </t-breadcrumb-item>
    </t-breadcrumb>

    <div class="flex justify-between mt-5 ">
      <div class="flex items-center">
        <div class="text-base">全部商品</div>
        <t-tooltip :content="tooltipContext">
          <icon-font name="iconfont icon-info" :url="iconUrl" size="24"/>
        </t-tooltip>
      </div>
      <div class="flex justify-end gap-2">
        <t-button variant="outline" @click="goTo('/stock')" disabled>
          <template #icon>
            <icon-font name="iconfont icon-cangku_kucunxiangqing" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          添加库存
        </t-button>
        <t-button variant="outline" @click="goTo('/category&tag')">
          <template #icon>
            <icon-font name="iconfont icon-fenlei" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          管理分类&标签
        </t-button>
        <t-button theme="primary" @click="openDialog()">
          <template #icon><add-icon /></template>
          新增商品
        </t-button>
      </div>
    </div>
    <t-divider />

    <div class="flex justify-between">
      <div class="flex gap-2">
        <t-input placeholder="输入要搜索的商品名称" clearable v-model="searchName" :style="{ width: '250px' }">
          <template #suffixIcon>
            <search-icon :style="{ cursor: 'pointer' }" />
          </template>
        </t-input>
        <t-input placeholder="输入商品编号，如 NG-081" clearable v-model="searchCode" :style="{ width: '250px' }">
          <template #suffixIcon>
            <search-icon :style="{ cursor: 'pointer' }" />
          </template>
        </t-input>
        <el-button type="primary" :icon="Search" class="ml-2" @click="handleSearch">Search</el-button>
      </div>
      <div>
        <t-select
            :style="{ width: '250px' }"
            v-model="selectedCategory"
            placeholder="请选择商品分类"
            clearable
            label="商品分类："
            @change="handleCategoryChange"
        >
          <t-option
              v-for="item in categoryList"
              :key="item._id"
              :value="item._id"
              :label="item.name"
          />
        </t-select>
      </div>
<!--      <div>-->
<!--        <t-dropdown :options="dropdownOptions" trigger="click" @click="clickHandlerDropdown">-->
<!--          <t-button theme="default" shape="square" :style="{ width: '100px' }">-->
<!--            操作-->
<!--            <template #suffix> <t-icon name="chevron-down" size="16" /></template>-->
<!--          </t-button>-->
<!--        </t-dropdown>-->
<!--      </div>-->
    </div>

    <div class="mt-5">
      <ProductTable @edit="openDialog" ref="productTableRef" @update="handlePageUpdate"/>
    </div>

    <AddProduct
        v-model:visible="dialogVisible"
        :form-data="formData"
        @success="handleSuccess"
        :categories = "categoryList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, h,computed } from 'vue'
import { inject } from 'vue'
import { AddIcon, SearchIcon, Edit2Icon, BrowseIcon, Delete1Icon } from 'tdesign-icons-vue-next';
import {getCategoryList} from "../../common/ProductPage/categoryService.js";
import ProductTable from "../components/ProductTable.vue";
import AddProduct from "../components/AddProduct.vue";
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

// 初始化路由
const router = useRouter()

const iconUrl = inject('iconUrl')

const tooltipContext = ref('')

const handlePageUpdate = (page) => {
  const { currentPageNum, currentPageSize, total } = page

  const start = (currentPageNum - 1) * currentPageSize + 1
  const end = Math.min(currentPageNum * currentPageSize, total)

  tooltipContext.value =
      `显示 ${start}-${end} 条，共 ${total} 条`
}

const searchName = ref('')
const searchCode = ref('')
const categoryList = ref([])
const selectedCategory = ref(null)

const dropdownOptions = [
  { content: '编辑', value: 1, prefixIcon: () => h(Edit2Icon) },
  { content: '删除', value: 3, prefixIcon: () => h(Delete1Icon) },
]

onMounted(async () => {
  categoryList.value = await getCategoryList()
  searchName.value = ""
  searchCode.value = ""
})

// 弹窗
const dialogVisible = ref(false)
const formData = ref({})

const openDialog = (row = null) => {
  dialogVisible.value = true

  // 新增：清空内容，但不替换对象
  if (!row) {
    formData.value._id = ''
    formData.value.name = ''
    formData.value.code = ''
    formData.value.category = { _id: '' }
    formData.value.images = []
    formData.value.skus = []
    formData.value.tags = { _id: '' }
    return
  }

  // 编辑：逐个赋值，不替换整个对象
  formData.value._id = row._id || ''
  formData.value.name = row.name || ''
  formData.value.code = row.code || ''
  formData.value.category = row.category || { _id: '' }
  formData.value.images = row.images || []
  formData.value.skus = row.skus || []
  formData.value.tags = row.tags || { _id: '' }
}

const handleSuccess = () => {
  console.log('刷新列表')
  // 在这里调用表格的刷新方法
}

const goTo = (url)=>{
  router.push(url)
}


// 搜索
const productTableRef = ref(null)

const handleSearch = () => {
  const searchFilter = { useWordSearch: true }

  const name = searchName.value?.trim()
  if (name) searchFilter.name = name

  const code = searchCode.value?.trim()
  if (code) searchFilter.code = code

  if (selectedCategory.value) {
    searchFilter.categoryId = selectedCategory.value
  }

  productTableRef.value.getProductList(searchFilter)
}

// 分类切换 → 立即筛选
const handleCategoryChange = () => {
  const filter = {}
  if (selectedCategory.value) {
    filter.categoryId = selectedCategory.value
  }
  productTableRef.value.getProductList(filter)
}
</script>

<style scoped lang="scss">
</style>