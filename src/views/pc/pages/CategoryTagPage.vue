<template>
  <div>
    <t-breadcrumb>
      <t-breadcrumb-item to="/">
        <template #icon>
          <icon-font name="iconfont icon-shouye" :url="iconUrl" size="24" class="mr-2"/>
        </template>
        首页
      </t-breadcrumb-item>
      <t-breadcrumb-item to="/product">
        <template #icon>
          <icon-font name="iconfont icon-shangpinku" :url="iconUrl" size="24" class="mr-2"/>
        </template>全部商品
      </t-breadcrumb-item>

      <t-breadcrumb-item :disabled="true">
        <template #icon>
          <icon-font name="iconfont icon-fenlei" :url="iconUrl" size="24" class="mr-2"/>
        </template>分类 & 标签
      </t-breadcrumb-item>
    </t-breadcrumb>
<!--    左右分列：左侧分类、右侧标签-->
    <el-row :gutter="30">
      <el-col :span="8">
        <div class="bg-white rounded-md p-4 mt-5">
          <h3 class="text-lg font-semibold text-slate-900 mb-5">全部商品分类</h3>
          <div>
            <div v-for="item in categories" :key="item._id" class="mb-5 flex justify-between">
              <el-tag :disable-transitions="false" class="ml-4">
                {{ item.name }}
              </el-tag>
              <el-button text size="small" @click="handleUpdateCategory(item)">修改名称</el-button>
            </div>
            <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="newCategory"
                class="w-20"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
                maxlength="4"
                show-word-limit
                type="text"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
              + 添加新分类
            </el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="bg-white rounded-md p-4 mt-5">
          <div class="flex justify-between">
            <h3 class="text-lg font-semibold text-slate-900 mb-5">全部商品标签</h3>
            <el-button @click="openTagDialog()">新增商品标签</el-button>
          </div>
          <div>
            <el-card v-for="tag in tags" :key="tag._id" class="mb-5">
              <div class="flex justify-between items-center">
                <div class="text-lg">
                  {{tag.name}}
                </div>
                <el-button text size="small" @click="openTagDialog(tag)">修改标签设置</el-button>
              </div>

              <el-divider />
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span>当前排序：</span>
                  <el-radio-group v-model="tag.sortOrder">
                    <el-radio-button
                        v-for="n in 10"
                        :key="n"
                        :label="n"
                        :disabled="n !== tag.sortOrder"
                    />
                  </el-radio-group>
                </div>
                <div>
                  <span class="text-slate-400">排序值越小，小程序展示优先级越高</span>
                </div>
              </div>
              <div class="flex mt-5">
                背景色：
                <el-tag :type="tag.color">{{tag.name}}</el-tag>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog
        v-model="TagDialogVisible"
        :title="isAdd ? '新增标签' : '编辑标签'"
        :close-on-click-modal="false"
        width="600px"
    >
      <!-- 这里放你的表单：名称、排序 -->
      <el-form label-width="100px">
        <el-form-item label="标签名称">
          <el-input
              v-model="tagForm.name"
              placeholder="请输入标签名称"
              maxlength="4"
              show-word-limit
              type="text"
          />
          <div class="text-xs text-slate-400 mt-1">
            建议不超过 4 个汉字，展示更美观
          </div>
        </el-form-item>
        <el-form-item label="排序值">
          <!-- 数字越小越靠前 -->
          <el-radio-group v-model="tagForm.sortOrder">
            <el-radio-button
                v-for="num in sortOrderOptions"
                :key="num.number"
                :label="num.number"
                :disabled="num.disabled"
            />
          </el-radio-group>

          <div class="text-xs text-slate-400 mt-2">
            数字越小，展示越靠前 | 灰色为已占用
          </div>
        </el-form-item>
        <el-form-item label="背景色">
          <el-radio-group v-model="tagForm.color" class="flex flex-wrap gap-3">
            <el-radio
                v-for="color in colorOptions"
                :key="color"
                :label="color"
                class="cursor-pointer"
            >
              <el-tag :type="color" class="w-16 h-8 flex items-center justify-center">
                {{tagForm.name }}
              </el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="TagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTagSave">
          {{ isAdd ? '确认新增' : '保存修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, inject,nextTick, computed} from 'vue'
import {addCategory, fetchCategoryList, updateCategory} from "../../common/ProductPage/categoryService.js";
import {addTag, fetchTagList, updateTag} from "../../common/ProductPage/tagService.js";
import {ElMessage} from "element-plus";

const iconUrl = inject('iconUrl')

// 定义数据
const categories = ref([])
const tags = ref([])

onMounted(async () => {
  // 开启加载动画
  const loading = ElLoading.service({
    text: '加载数据中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    // 并行请求，同时加载
    const [categoryList, tagList] = await Promise.all([
      fetchCategoryList(),
      fetchTagList()
    ])

    // 同步赋值
    categories.value = categoryList
    tags.value = tagList
  }catch (error) {
    console.error('数据加载失败：', error)
    ElMessage.error('数据加载失败，请刷新重试')
  } finally {
    // 无论成功失败，都关闭 loading
    loading.close()
  }
})

// 分类
const newCategory = ref('')
const inputVisible = ref(false)
const InputRef = ref()

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

const handleInputConfirm = async () => {
  // 空值判断
  if (!newCategory.value.trim()) {
    inputVisible.value = false
    newCategory.value = ''
    return
  }

  // 开启 loading
  const loading = ElLoading.service({
    text: '添加中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const data = {
      name:newCategory.value.trim(),
      enabled:true
    }
    const categoryRes = await addCategory(data)

    // ✅ 成功：追加到列表里
    if (categoryRes.success) {
      ElMessage.success('添加分类成功')

      // 这里接口返回的字段要对应上（_id 必须正确）
      categories.value.push({
        _id: categoryRes.data.id,
        name: newCategory.value.trim(),
        enabled: true  // 👈 加上这个！否则标签 type 会异常
      })
    } else {
      ElMessage.error('添加失败：' + (categoryRes.msg || '未知错误'))
    }
  } catch (error) {
    console.error('添加分类异常：', error)
    ElMessage.error('网络异常，添加失败')
  } finally {
    // 无论成功失败都关闭
    inputVisible.value = false
    newCategory.value = ''
    loading.close()
  }
}

const handleUpdateCategory = async (item) => {
  const categoryId = item._id
  const oldName = item.name

  // 弹出输入框
  ElMessageBox.prompt('请输入新的分类名称', `修改：${oldName}`, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /^.{1,4}$/,  // 不能为空
    inputErrorMessage: '分类名称不能为空，且最多输入 4 个字'
  }).then(async ({ value }) => {
    const loading = ElLoading.service({
      text: '更新中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
      // 调用更新接口
      const updateRes = await updateCategory(categoryId, value)

      if (updateRes.success) {
        ElMessage.success('更新成功')

        // 找到对应项并更新名称（页面实时刷新）
        const target = categories.value.find(c => c._id === categoryId)
        if (target) {
          target.name = value
        }
      } else {
        ElMessage.error('更新失败：' + (updateRes.msg || '未知错误'))
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('更新异常，请重试')
    } finally {
      loading.close() // 必须关闭 loading
    }
  }).catch(() => {
    // 用户取消
    ElMessage.info('已取消修改')
  })
}

// 标签
// 弹框显示隐藏
const TagDialogVisible = ref(false)
// 是否是新增：true = 新增，false = 编辑
const isAdd = ref(true)
// 表单数据
const tagForm = ref({
  name: '',
  sortOrder: '',
  color: "primary" // 默认值
})
// 背景色选项
const colorOptions = ["primary","success","info","warning","danger",]

// 生成 1-10 的排序按钮，并自动禁用已占用的数字（核心代码）
const sortOrderOptions = computed(() => {
  // 已被占用的排序号（排除当前编辑自己的）
  const usedNumbers = tags.value
      .filter(item => item._id !== tagForm.value._id)
      .map(item => item.sortOrder)

  // 生成 1~10
  const list = []
  for (let i = 1; i <= 10; i++) {
    list.push({
      number: i,
      disabled: usedNumbers.includes(i) // 已占用则禁用
    })
  }
  return list
})

// 打开弹框（新增 / 编辑）
const openTagDialog = (item = null) => {
  isAdd.value = !item
  TagDialogVisible.value = true

  if (item) {
    tagForm.value = { ...item }
  } else {
    tagForm.value = { name: '', sortOrder: '' }
  }
}

// 排序函数
const sortTags = () => {
  tags.value.sort((a, b) => a.sortOrder - b.sortOrder)
}

// 提交保存标签
const handleTagSave = async () => {
  const tagId = tagForm.value._id
  const data = {
    name: tagForm.value.name,
    sortOrder: tagForm.value.sortOrder,
    color: tagForm.value.color,
    enabled: true,
  }
  const loading = ElLoading.service({ text: '保存中...' })

  try {
    if (isAdd.value) {
      // 新增
      const res = await addTag(data)
      if (res.success) {
        ElMessage.success('新增成功')
        tags.value.push({ ...data, _id: res.data.id })
        sortTags() // 调用排序
      } else {
        ElMessage.error("新增失败")
      }
    } else {
      // 编辑
      const res = await updateTag(tagId, data)
      if (res.success) {
        ElMessage.success('修改成功')
        const index = tags.value.findIndex(t => t._id === tagId)
        if (index !== -1) {
          tags.value[index] = { ...tags.value[index], ...data }
          sortTags() // 编辑后也要排序
        }
      } else {
        ElMessage.error("修改失败")
      }
    }
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    loading.close()
    TagDialogVisible.value = false
  }
}


</script>

<style scoped lang="scss">

</style>