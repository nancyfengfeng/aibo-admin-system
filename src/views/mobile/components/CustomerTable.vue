<template>
  <div>
    <el-table v-loading="loading" :data="customerList" border size="large">
      <el-table-column label="客户编号" prop="inviteCode" align="center"></el-table-column>
      <el-table-column label="客户店铺" prop="storeName" align="center"></el-table-column>
      <el-table-column label="客户地区" align="center">
        <template #default="scope">
          {{
            regionList.find(item => item.value === scope.row.region)?.label || '—'
          }}
        </template>
      </el-table-column>
      <el-table-column label="客户地址" align="center" >
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
    </el-table>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {fetchAllCustomers} from "../../common/CustomerPage/customerService.js";

const props = defineProps({
  regionList: Array
})


const loading = ref(false)
const customerList = ref([])



const getCustomerList = async (filter={}) => {
  loading.value = true
  const res = await fetchAllCustomers(10,1,filter)
  customerList.value = res.result
  loading.value = false
}

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

// 打开地图
const openMap = (storeLocation) => {
  if (!storeLocation?.geopoint?.coordinates) return
  const [lng, lat] = storeLocation.geopoint.coordinates
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  window.open(url, '_blank')
}

const onFilterGetCustomers =  (filter = {}) => {
  getCustomerList(filter)
}

defineExpose({
  onFilterGetCustomers
})

onMounted(async () => {
  await getCustomerList()
})
</script>

<style scoped lang="scss">

</style>