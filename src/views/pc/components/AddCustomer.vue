<template>
  <el-dialog
      v-model="dialogVisible"
      :title="mode === 'edit' ? '编辑客户' : '新增客户'"
      :close-on-click-modal="false"
      width="600px"
      @close="handleClose"
  >
    <el-form ref="formRef" :model="localForm" :rules="formRules" label-width="0px">
      <el-descriptions border :column="1" size="medium">

        <el-descriptions-item label="店铺名">
          <el-form-item prop="storeName" class="no-form-item-space">
            <el-input v-model="localForm.storeName" style="width:100%"/>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户等级">
          <el-form-item prop="VIPLevel" class="no-form-item-space">
            <el-select v-model="localForm.VIPLevel" style="width:100%" clearable>
              <el-option v-for="item in vipList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="客户地区">
          <el-form-item prop="region" class="no-form-item-space">
            <el-select v-model="localForm.region" style="width:100%" clearable>
              <el-option v-for="item in regionList" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-descriptions-item>

        <el-descriptions-item label="微信号">
          <el-form-item class="no-form-item-space">
            <div class="grid grid-cols-1 gap-1">
              <el-tag
                  v-for="(item, index) in form.wechatOpenId"
                  :key="index"
                  type="info"
              >
                {{ item || '尚未绑定' }}
              </el-tag>

            </div>
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
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  form: Object,        // 父组件传来的原始数据
  mode: String,
  vipList: Array,
  regionList: Array
})

const emit = defineEmits(['submit'])

// 本地表单（不会触发父组件自动校验）
const localForm = reactive({
  storeName: '',
  VIPLevel: '',
  region: '',
  wechatOpenId: ['', '', ''],
  _id: ''
})

const dialogVisible = ref(false)
const formRef = ref(null)

// 打开弹窗 → 复制父组件数据到本地
const openDialog = () => {
  nextTick(() => {
    Object.assign(localForm, JSON.parse(JSON.stringify(props.form)))
    dialogVisible.value = true
  })
}

// 关闭 → 清空校验
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 校验规则
const formRules = {
  storeName: [{ required: true, message: '请输入店铺名', trigger: 'blur' }],
  VIPLevel: [{ required: true, message: '请选择VIP等级', trigger: 'change' }],
  region: [{ required: true, message: '请选择客户地区', trigger: 'change' }],
}

// 提交 → 把本地数据抛给父组件
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  emit('submit', localForm) // ✅ 关键：把填写好的表单抛出去
  ElMessage.success('保存成功')
  handleClose()
}

defineExpose({ openDialog })
</script>

<style scoped>
:deep(.no-form-item-space) {
  margin-bottom: 0 !important;
}
:deep(.no-form-item-space .el-form-item__content) {
  margin-left: 0 !important;
}
</style>