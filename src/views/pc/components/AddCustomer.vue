<template>
  <el-dialog
      v-model="dialogVisible"
      :title="mode === 'edit' ? '编辑客户' : '新增客户'"
      :close-on-click-modal="false"
      width="600px"
      @close="handleClose"
  >
    <el-form ref="formRef" :model="localForm" :rules="formRules" label-width="0px">
      <el-descriptions border :column="1">

        <el-descriptions-item label="店铺名">
          <el-form-item prop="storeName" class="no-form-item-space">
            <el-input v-model="localForm.storeName" style="width:100%"/>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户编号">
          <el-form-item prop="inviteCode" class="no-form-item-space">
            <el-input
                v-model="inputInviteCode"
                style="width:100%"
                :disabled="mode === 'edit'"
            >
              <template #prepend>AIBO-</template>
            </el-input>
            <!-- 重复时显示红色提示 -->
            <div v-if="inviteCodeError" class="text-red-500 text-sm mt-1">
              {{ inviteCodeError }}
            </div>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户状态">
          <el-form-item prop="status" class="no-form-item-space">
            <div class="flex items-center justify-center">
              <el-icon v-if="localForm.status==='1'" size="25" color="#67C23A"><CircleCheckFilled /></el-icon>
              <el-icon v-else size="25" color="#d5dfe1"><CircleCloseFilled /></el-icon>
            </div>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户等级">
          <el-form-item prop="VIPLevel" class="no-form-item-space">
            <el-select v-model="localForm.VIPLevel" style="width:100%" clearable>
              <el-option v-for="item in vipList" :key="item.key" :label="item.label" :value="item.key"/>
            </el-select>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="联系电话">
          <el-form-item prop="phone" class="no-form-item-space">
            <el-input v-model="localForm.phone" style="width:100%"/>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户地区">
          <el-form-item prop="region" class="no-form-item-space">
            <el-select v-model="localForm.region" style="width:100%" clearable>
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户坐标">
          <el-form-item class="no-form-item-space">
            <div class="flex">
              <div class="grid grid-cols-1 gap-2">
                <el-input
                    v-model="localForm.storeLocation.geopoint.coordinates[0]"
                    placeholder="请输入经度 (Longitude)"
                >
                  <template #prepend>
                    <div style="width: 100px">
                      经度 (Longitude)
                    </div>
                  </template>
                </el-input>
                <el-input
                    v-model="localForm.storeLocation.geopoint.coordinates[1]"
                    placeholder="请输入纬度 (Latitude)"
                >
                  <template #prepend>
                    <div style="width: 100px">
                      纬度 (Latitude)
                    </div>
                  </template>
                </el-input>
              </div>
              <div class="flex items-center ml-5">
                <el-button
                    type="text"
                    @click="openMap(localForm.storeLocation)"
                    :disabled="!hasCoordinates(localForm.storeLocation)"
                >
                  查看地图
                </el-button>
              </div>
            </div>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="微信号">
          <el-form-item class="no-form-item-space">
            <div class="grid grid-cols-1 gap-1">
              <!-- 循环显示已绑定的微信 openId -->
              <div
                  v-for="item in localForm.wechatOpenId"
                  class="flex"
                  :key="item"
              >
                <el-tag
                    type="info"
                    closable
                    @close="handleDeleteWechat(item)"
                >
                  {{ item }}
                </el-tag>
              </div>

              <!-- 没有绑定任何微信时，才显示“尚未绑定” -->
              <div
                  v-if="!localForm.wechatOpenId || localForm.wechatOpenId.length === 0"
                  class="flex"
              >
                <el-tag type="info">尚未绑定</el-tag>
              </div>
            </div>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="备注">
          <el-form-item class="no-form-item-space">
            <el-input type="textarea" v-model="localForm.remark" autosize></el-input>
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick,onMounted } from 'vue'
import { CircleCheckFilled, CircleCloseFilled} from "@element-plus/icons-vue";
import {fetchInviteCodeList, updateWechatOpenId} from "../../common/CustomerPage/customerService.js";

const props = defineProps({
  form: Object,        // 父组件传来的原始数据
  mode: String,
  vipList: Array,
  regionList: Array,
  openMap: Function,
  hasCoordinates: Function
})

const emit = defineEmits(['submit'])

// 本地表单（不会触发父组件自动校验）
const localForm = reactive({
  VIPLevel: '',
  inviteCode: '',
  region: '',
  remark: '',
  status: '',
  storeLocation: { address: '', geopoint: { coordinates: [0,0] } },
  storeName: '',
  wechatOpenId: [],
  phone:'',
  _id: ''

})

// 输入框绑定
const inputInviteCode = ref('')
// 存储所有已存在的编号列表
const existInviteCodes = ref([])
// 重复提示
const inviteCodeError = ref('')

// 监听表单值 → 同步到输入框（编辑时用）
watch(
    () => localForm.inviteCode,
    (newVal) => {
      inputInviteCode.value = newVal?.replace(/^AIBO-/, '') || ''
    },
    { immediate: true }
)

// 监听输入框 → 自动拼接 AIBO-
watch(inputInviteCode, (val) => {
  localForm.inviteCode = `AIBO-${val || ''}`
  // 输入时立刻校验
  validateInviteCode()
})

// 校验编号是否重复
const validateInviteCode = () => {
  const code = localForm.inviteCode?.trim()

  // 空的不校验
  if (!code || code === 'AIBO-') {
    inviteCodeError.value = ''
    return true
  }

  // 判断是否重复
  if (existInviteCodes.value.includes(code)) {
    inviteCodeError.value = '❌ 客户编号已存在'
    return false
  }

  inviteCodeError.value = ''
  return true
}

const dialogVisible = ref(false)
const formRef = ref(null)

// 打开弹窗 → 修复：新增清空，编辑赋值
// 打开弹窗 → 最终根治版
const openDialog = () => {
  nextTick(() => {
    // 强制重置成干净的空表单
    localForm.VIPLevel = ''
    localForm.inviteCode = ''
    localForm.region = ''
    localForm.remark = ''
    localForm.status = ''
    localForm.storeName = ''
    localForm.wechatOpenId = []
    localForm.storeLocation = { address: '', geopoint: { coordinates: [0,0] } }
    localForm.phone = ''
    localForm._id = ''

    // 编辑模式才赋值
    if (props.mode === 'edit') {
      const data = JSON.parse(JSON.stringify(props.form))
      localForm.VIPLevel = data.VIPLevel ?? ''
      localForm.region = data.region ?? ''
      localForm.inviteCode = data.inviteCode ?? ''
      localForm.remark = data.remark ?? ''
      localForm.status = data.status ?? ''
      localForm.storeName = data.storeName ?? ''
      localForm.wechatOpenId = data.wechatOpenId ?? []
      localForm.storeLocation = data.storeLocation ?? { address: '', geopoint: { coordinates: [0,0] } }
      localForm.phone = data.phone ?? ''
      localForm._id = data._id ?? ''
    }

    dialogVisible.value = true

    // 最后清一次校验（绝杀）
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  })
}

// 关闭 → 清空校验
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 校验规则：只校验店铺名、客户等级、客户地区
const formRules = {
  storeName: [{ required: true, message: '请输入店铺名', trigger: 'blur' }],
  VIPLevel: [{ required: true, message: '请选择客户等级', trigger: 'change' }],
  region: [{ required: true, message: '请选择客户地区', trigger: 'change' }],
}

// 提交 → 把本地数据抛给父组件
const handleSubmit = async () => {
  try {
    // 清除旧校验
    formRef.value?.clearValidate()

    // 先校验编号是否重复
    if (!validateInviteCode()) {
      ElMessage.warning('客户编号已存在，请修改')
      return
    }

    // 等待校验完成
    const valid = await formRef.value?.validate()
    if (!valid) return

    // 深拷贝拿到最新数据（解决响应式不更新）
    const submitData = JSON.parse(JSON.stringify(localForm))

    // 提交给父组件
    emit('submit', submitData)

    ElMessage.success('保存成功')
    handleClose()
  } catch (error) {
    console.log("❌ 校验失败：", error)
  }
}

const handleDeleteWechat = async (item) => {
  const loading = ElLoading.service({ text: '更新中...' })
  try {
    const openIds = localForm.wechatOpenId.filter(id => id !== item)
    const customerId = localForm._id
    const res = await updateWechatOpenId(customerId,openIds)
    if (res.success){
      localForm.wechatOpenId = openIds
    }
  }catch (error) {
    console.log(error)
  }finally {
    loading.close()
  }
}

defineExpose({ openDialog })

onMounted(async () => {
  existInviteCodes.value = await fetchInviteCodeList()
})
</script>

<style scoped>
:deep(.no-form-item-space) {
  margin-bottom: 0 !important;
}
:deep(.no-form-item-space .el-form-item__content) {
  margin-left: 0 !important;
}
</style>