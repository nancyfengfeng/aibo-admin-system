<template>
  <div>
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
            <icon-font name="iconfont icon-shezhi" :url="iconUrl" size="24" class="mr-2"/>
          </template>小程序设置
        </t-breadcrumb-item>
      </t-breadcrumb>
    </div>

    <el-row :gutter="20">
      <el-col :span="18">
        <!--    轮播图设置-->
        <el-card class="mt-5">
          <div class="flex justify-between">
            <h1 class="text-2xl font-bold text-slate-900">小程序轮播图设置</h1>
            <el-upload
                v-model:file-list="fileList"
                :http-request="customUpload"
                multiple
                accept="image/*"
            >
              <el-button type="success" :icon="Plus">
                上传轮播图
              </el-button>
            </el-upload>
          </div>
          <!--      显示图片-->
          <div class="grid grid-cols-2 gap-4 mt-5" v-if="bannerList.length > 0">
            <el-card shadow="hover" v-for="img in bannerList" :key="img._id">
              <template #header>
                <div class="flex justify-between">
                  <el-switch
                      v-model="img.enabled"
                      class="mb-2"
                      active-text="展示"
                      inactive-text="不展示"
                      @change="handleChangeBannerEnabled(img)"
                  />
                  <el-button type="danger" :icon="Delete" circle @click="handleDeleteBanner(img)"/>
                </div>
              </template>
              <img
                  :src="img.signedUrl"
                  style="width: 100%"
              />
            </el-card>
          </div>
          <div v-else class="text-center mt-10 text-gray-400 text-lg">
            🖼️ 暂无轮播图，快去上传吧
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <!--    热门搜索词设置-->
        <el-card class="mt-5">
          <h1 class="text-2xl font-bold text-slate-900">小程序热门搜索词设置</h1>
          <div class="mt-5">
            <div v-for="item in searchPopularList" :key="item._id" class="mb-5 flex justify-between">
              <el-tag :disable-transitions="false" class="ml-4" closable type="info" @close="handleDeleteSearchPopular(item)">
                {{ item.name }}
              </el-tag>
              <el-switch v-model="item.enabled"
                         :active-action-icon="Select"
                         :inactive-action-icon="CloseBold"
                         @change="handleChangeSearchPopular(item)"
              />
            </div>
            <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="newSearchPopular"
                class="w-20"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
                maxlength="10"
                show-word-limit
                type="text"
            />
            <el-button v-else class="button-new-tag" @click="showInput">
              + 添加新搜索词
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref, onMounted, inject, nextTick} from 'vue'
import {createBanner, deleteBanner, fetchBanners, updateBannerEnabled} from "../../common/SettingPage/bannerService.js";
import { app } from '@/utils/cloudbase'
import {Delete, Plus,Select,CloseBold} from '@element-plus/icons-vue'
import {ElMessage} from "element-plus";
import {
  createSearchPopular,
  deleteSearchPopular,
  fetchSearchPopularList, updateSearchPopular
} from "../../common/SettingPage/searchPopularService.js";

const iconUrl = inject('iconUrl')

const bannerList = ref([])
const fileList = ref([])

const searchPopularList = ref([])

const newSearchPopular = ref('')
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
  if (!newSearchPopular.value.trim()) {
    inputVisible.value = false
    newSearchPopular.value = ''
    return
  }

  // 开启 loading
  const loading = ElLoading.service({
    text: '添加中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const data = {
      name:newSearchPopular.value.trim(),
      enabled:true
    }
    const searchPopularRes = await createSearchPopular(data)

    // ✅ 成功：追加到列表里
    if (searchPopularRes.success) {
      ElMessage.success('添加分类成功')

      // 这里接口返回的字段要对应上（_id 必须正确）
      searchPopularList.value.push({
        _id: searchPopularRes.data.id,
        name: newSearchPopular.value.trim(),
        enabled: true  // 👈 加上这个！否则标签 type 会异常
      })
    } else {
      ElMessage.error('添加失败：' + (searchPopularRes.msg || '未知错误'))
    }
  } catch (error) {
    console.error('添加分类异常：', error)
    ElMessage.error('网络异常，添加失败')
  } finally {
    // 无论成功失败都关闭
    inputVisible.value = false
    newSearchPopular.value = ''
    loading.close()
  }
}


const formatBannerImages = async (url) => {
  const {data, error} = await app.storage.from().createSignedUrl(url, 3600)
  if (error) {
    console.error(error)
    return
  }
  return data.signedUrl
}

const getBannerList = async () => {
  const list = await fetchBanners()
  // 批量生成签名 URL
  for (const item of list) {
    item.signedUrl = await formatBannerImages(item.image)
  }

  bannerList.value = list
  console.log(bannerList)
}

const handleChangeBannerEnabled = async (img) => {
  const loading = ElLoading.service({ text: '更新中...' })
  try{
    const bannerId = img._id
    const bannerEnabled = img.enabled
    const res = await updateBannerEnabled(bannerId,bannerEnabled)
    if(res.success){
      ElMessage.success("更新数据成功")
    }else {
      ElMessage.error("更新数据失败")
      img.enabled = !bannerEnabled
    }
  }catch(err){
    console.error(err)
    ElMessage.error("无法更新数据，请稍后再试")
  }finally {
    loading.close()
  }
}

const customUpload = async (options) => {
  const file = options.file
  const filePath = `images/${Date.now()}_${file.name}`

  try {
    // 1. 上传文件
    const { data, error } = await app.storage.from().upload(filePath, file)

    if (error) {
      ElMessage.error('上传失败')
      return
    }

    ElMessage.success('上传成功')

    // 2. 用 ID 生成签名URL（必须 await）
    const signedUrl = await formatBannerImages(data.id)

    // 3. 构造轮播图（用 ID）
    const banner = {
      enabled: true,
      image: data.id
    }

    // 4. 保存到数据库
    const res = await createBanner(banner)
    if (res.success) {
      // 把完整数据 push 到列表
      bannerList.value.push({
        ...banner,
        _id:res.data.id,
        signedUrl: signedUrl
      })
      console.log(bannerList.value)
    }

    // ✅ 上传完自动清空
    fileList.value = []
  } catch (err) {
    console.error(err)
    ElMessage.error('上传或保存失败')
  }
}

const handleDeleteBanner = async (img) => {
  const loading = ElLoading.service({ text: '删除中...' })
  try {
    const bannerId = img._id
    const res = await deleteBanner(bannerId)

    if (res.success) {
      ElMessage.success('删除数据成功')

      // 前端删除（完全没问题）
      const index = bannerList.value.findIndex(item => item._id === bannerId)
      if (index !== -1) {
        bannerList.value.splice(index, 1)
      }
    } else {
      ElMessage.error('删除数据失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('删除数据失败')
  } finally {
    loading.close()
  }
}

const handleDeleteSearchPopular = async (item) =>{
  const loading = ElLoading.service({text: '删除中...'})
  try{
    const searchPopularId = item._id
    const searchPopularRes = await deleteSearchPopular(searchPopularId)
    console.log(searchPopularRes)
    if (searchPopularRes.success) {
      ElMessage.success('删除数据成功')
      const index = searchPopularList.value.findIndex(item => item._id === searchPopularId)
      if (index !== -1) {
        searchPopularList.value.splice(index, 1)
      }
    }else {
      ElMessage.error('删除数据失败')
    }
  }catch (err) {
    console.error(err)
    ElMessage.error('删除数据失败')
  } finally {
    loading.close()
  }
}

const handleChangeSearchPopular = async (item) => {
  const loading = ElLoading.service({text: '更新数据中...'})
  try{
    const searchPopularId = item._id
    const searchPopularEnabled = item.enabled
    const searchPopularRes = await updateSearchPopular(searchPopularId,searchPopularEnabled)
    if (searchPopularRes.success) {
      ElMessage.success("更新数据成功")
    }else {
      ElMessage.error("更新数据失败")
      item.enabled = !searchPopularEnabled
    }
  }catch(err){
    console.error(err)
    ElMessage.error("无法更新数据，请稍后再试")
  }finally {
    loading.close()
  }
}

onMounted(async () => {
  const loading = ElLoading.service({text: '加载中...'})
  try {
    await getBannerList()
    searchPopularList.value = await fetchSearchPopularList()
  } catch (error) {
    console.log(error)
    ElMessage.error("无法加载数据，请稍后再试")
  } finally {
    loading.close()
  }

})
</script>

<style scoped lang="scss">

</style>