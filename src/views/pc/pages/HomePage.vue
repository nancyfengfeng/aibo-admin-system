<template>
<div class="home-page__content">
<!--  顶部欢迎-->
  <div class="home-page__title">
    <h1 class="text-2xl font-bold text-slate-900">欢迎回来！</h1>
    <p class="text-slate-600 mt-1">这是【AIBO 塑料用品批发】 后台管理系统</p>
  </div>
<!--  总览-->
  <div class="home-page__overview">
    <t-row t-row :gutter="16">
      <t-col :span="3" v-for="item in overviewOptions" :key="item.title">
        <t-card :bordered="false" hover-shadow>
          <div class="overview__content">
            <div class="overview__center">
              <div class="overview__center__left">
                <div class="text-sm font-medium text-slate-600">{{item.title}}</div>
                <div class="text-2xl font-bold text-slate-900 mt-1">{{item.context}}</div>
              </div>
              <div class="overview__center__right">
                <div class="center__right__icon">
                  <t-icon :name="item.icon" size="30"></t-icon>
                </div>
              </div>
            </div>
            <div class="flex items-center mt-4 gap-2">
              <!-- 图标 + 颜色 -->
              <div class="text-sm" :class="item.isUp ? 'text-green-500' : 'text-red-500'">
                <t-icon
                    :name="item.isUp ? 'trending-up' : 'trending-down'"
                    size="20"
                />
              </div>
              <p class="text-sm text-slate-500">相对于上个月</p>
              <span class="text-sm" :class="item.isUp ? 'text-green-500' : 'text-red-500'">
                {{ item.percent }}
              </span>
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
<!--  两列-->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <!-- 左侧占 2份 -->
    <div class="md:col-span-2 bg-white p-5 rounded-lg shadow">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">月度销售趋势</h3>

      <!-- 无数据时显示 -->
      <div
          class="flex items-center justify-center h-64 text-slate-500"
          v-if="!loading && overviewOptions.length && overviewOptions[0]?.context === '₡ 0'"
      >
        暂无销售数据
      </div>

      <!-- 有数据时显示图表 -->
      <div
          v-else
          ref="chart"
          class="w-full h-[320px]"
      ></div>
    </div>

    <!-- 右侧占 1份 -->
    <div class="bg-white p-5 rounded-lg shadow">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">快速操作</h3>
      <div class="space-y-3">
        <button onclick="window.location.href='跳转地址'"
            class="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus mr-2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          添加新商品
        </button>
        <button onclick="window.location.href='跳转地址'"
            class="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart mr-2"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
          处理待发货订单
        </button>
        <button onclick="window.location.href='跳转地址'"
            class="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye mr-2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
          查看销售报表
        </button>
        <button onclick="window.location.href='跳转地址'"
            class="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          客户管理
        </button>
      </div>
    </div>
  </div>


<!--  最近订单-->
  <div class="mt-6">
    <div class="bg-white rounded-lg shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900">最近订单</h3>
        <button
            @click="goTo('/order')"
            class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
        >
          查看全部订单 →
        </button>
      </div>

      <OrderTable :order-list="orderList" :show-action="false" />

      <div class="px-6 py-3 border-t border-slate-200">
        <button
            @click="goTo('/order')"
            class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
        >
          查看所有订单 →
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import * as echarts from 'echarts'

// 函数
import {getDashboardStats} from "../../common/HomePage/getDashboardStats";
import {fetchDailySales} from "../../common/HomePage/fetchDailySales.js";
import {fetchRecentOrders} from "../../common/OrderPage/orderService.js";

// 组件
import OrderTable from '../../../components/OrderTable.vue'

// 总览卡片数据
const overviewOptions = ref([])
const loading = ref(true)
const chart = ref(null)
let myChart = null
const orderList = ref([])

onMounted(async () => {
  try {
    loading.value = true

    // 2. 并行获取数据（更快）
    const [overviewData, salesData, recentOrders] = await Promise.all([
      getDashboardStats(),
      fetchDailySales(),
      fetchRecentOrders() // ✅ 在这里获取最近订单
    ])

    overviewOptions.value = overviewData

    await nextTick()
    if (overviewOptions.value[0]?.context !== '₡ 0') {
      const { days, amounts } = salesData
      renderChart(days, amounts)
    }

    // 3. 把订单数据赋值给你的页面变量
    orderList.value = recentOrders

  } catch (err) {
    console.error('获取数据失败', err)
  } finally {
    loading.value = false
  }
})

// ✅ 渲染真实的每日销售图表
function renderChart(days, amounts) {
  if (!chart.value) return
  myChart = echarts.init(chart.value)
  myChart.setOption({
    grid: {
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days
    },
    yAxis: { type: 'value' },
    series: [{
      data: amounts,
      type: 'line',
      smooth: true,
      lineStyle: { color: '#0052d9' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,82,217,0.2)' },
          { offset: 1, color: 'rgba(0,82,217,0)' }
        ])
      }
    }]
  })
}

const goTo = (url)=>{
  router.push(url)
}

onUnmounted(() => {
  myChart?.dispose()
})


</script>


<style lang="scss" scoped>
.home-page__content{
  .home-page__overview{
    margin: 30px 0;
    .overview__content {
      padding: 8px 0;

      .overview__center {
        display: flex;
        justify-content: space-between;

        .overview__center__right {
          align-items: center;

          .center__right__icon {
            color: #24ba65;
            background-color: rgba(223, 255, 241, 0.59);
            padding: 12px;
            border-radius: 10px;
          }
        }
      }
    }
  }
}
</style>