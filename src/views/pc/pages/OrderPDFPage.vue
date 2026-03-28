<template>
  <div>
    <!-- 面包屑 -->
    <div class="mb-6">
      <t-breadcrumb>
        <t-breadcrumb-item to="/">
          <template #icon>
            <icon-font name="iconfont icon-shouye" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          首页
        </t-breadcrumb-item>
        <t-breadcrumb-item to="/order">
          <template #icon>
            <icon-font name="iconfont icon-dingdan" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          全部订单
        </t-breadcrumb-item>
        <t-breadcrumb-item :disabled="true">
          <template #icon>
            <icon-font name="iconfont icon-daochu" :url="iconUrl" size="24" class="mr-2"/>
          </template>
          导出出货清单
        </t-breadcrumb-item>
      </t-breadcrumb>
    </div>
<!--    导出页面数据-->
    <div class="m-5 font-sans" style="width: 98%;margin: auto">
      <div class="flex justify-end px-5">
        <el-button type="primary" @click="exportPDF">导出</el-button>
      </div>
      <el-divider />
<!--      要导出的内容-->
      <div ref="pdfContent" class="m-5 bg-white font-sans p-5 mx-auto " style="width: 80mm;">
        <div>
          <h1 class="text-xl pdf-line-fix">出货清单</h1>
          <h3 class="text-lg">Lista de despacho</h3>
        </div>
        <h3 class="text-base flex mt-4">日期（Fecha）：{{currentDate}}</h3>
        <div v-for="order in orderList" :key="order._id">
          <div class="mt-6 border-t-4 border-double">
<!--            客户信息-->
            <div class="text-sm my-2 flex items-center">
              <div class="text-right mr-2">
                <div class="pdf-line-fix">客户编号：</div>
                <div class="text-xs pr-3">Número del cliente</div>
              </div>
              <div>{{order.customer.inviteCode}}</div>
            </div>
            <div class="text-sm mb-2 flex items-center">
              <div class="text-right mr-2">
                <div class="pdf-line-fix">客户名称：</div>
                <div class="text-xs pr-3">Nombre del cliente</div>
              </div>
              <div>{{order.customer.storeName}}</div>
            </div>
          </div>
<!--          订单信息-->
          <div>
            <div class="text-sm mb-2 flex items-center">
              <div class="text-right mr-2">
                <div class="pdf-line-fix">订单号：</div>
                <div class="text-xs pr-3">Número de pedido</div>
              </div>
              <div>{{order.order_no}}</div>
            </div>
            <div class="text-sm mb-2 flex items-center">
              <div class="text-right mr-2">
                <div class="pdf-line-fix">订单状态：</div>
                <div class="text-xs pr-3">Estado del pedido</div>
              </div>
              <div class="p-2 text-red-600 font-bold tracking-wider">{{orderStatusMap[order.order_status] || '未知状态'}}</div>
            </div>
            <div class="text-sm mb-2 flex items-center">
              <div class="text-right mr-2">
                <div class="pdf-line-fix">订单创建时间：</div>
                <div class="text-xs pr-3">Fecha del pedido</div>
              </div>
              <div>{{new Date(order.createdAt).toLocaleDateString()}}</div>
            </div>
          </div>
<!--          订单信息-->
          <div class="flex justify-between border-y">
            <div class="w-7 text-center pdf-line-fix">No.</div>
            <div class="flex-1 text-center pdf-line-fix">SKU</div>
            <div class="w-15 text-center pdf-line-fix">Cantidad</div>
          </div>
<!--          循环-->
          <div class="flex justify-between text-base" v-for="(item, index) in order.order_items" :key="item._id">
            <div class="w-7 text-center pdf-line-fix">{{ index + 1 }}</div>
            <div class="flex-1 text-center pdf-line-fix">{{item.sku.skuCode}}</div>
            <div class="w-15 text-center pdf-line-fix">{{item.quantity}}</div>
          </div>

          <!-- 出货签名 -->
          <div class="border-t mt-8 mb-20">
            <!-- 出货签名 -->
            <div class="py-5 pr-10">
              <h3 class="text-base">签名(Firmar)：</h3>
            </div>

            <!-- 日期 -->
            <div class="pr-6">
              <h3 class="text-sm">日期(Fecha)：</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from "vue-router";
import {fetchShippingOrder} from "../../common/OrderPage/orderService.js";
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {useOrderPdfStore} from "../../../stores/orderPdfStore.js";

const orderStatusMap = {
  '1': '待备货',
  '2': '待发货',
  '3': '待付款',
  '4': '已完成',
  '5': '已取消'
}

const iconUrl = inject('iconUrl')
const route = useRoute()

const currentDate = ref('')
const orderList = ref([]) // 页面渲染的订单数据

const pdfContent = ref(null)

onMounted(async () => {
  await getOrdersInfo()
  getCurrentDate()
})

// 获取当前日期
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
}

const getOrdersInfo = async () => {
  const orderPdfStore = useOrderPdfStore()
  const orderIds = orderPdfStore.orderIds // 👈 从全局状态拿，不走路由

  // 1. 判断有没有订单ID
  if (!orderIds || orderIds.length === 0) {
    ElNotification({
      title: '温馨提示',
      message: '未检测到有效订单信息，请返回订单页面选择要出货的清单信息',
      type: 'warning',
      duration: 3000
    })
    return
  }

  // 2. 开始加载
  const loading = ElLoading.service({ text: '加载中...' })

  try {
    // 直接用全局的 orderIds 数组，不用 split
    const res = await fetchShippingOrder(orderIds)
    console.log("res", res)

    if (res.success) {
      orderList.value = res.data
    } else {
      ElNotification({
        title: '获取失败',
        message: res.message || '获取订单信息失败',
        type: 'error'
      })
    }

  } catch (err) {
    console.error('加载异常：', err)
    ElNotification({
      title: '加载失败',
      message: '网络异常，请重试',
      type: 'error'
    })
  } finally {
    loading.close()
  }
}

const exportPDF = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在生成 PDF，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  setTimeout(async () => {
    try {
      const canvas = await html2canvas(pdfContent.value, {
        scale: 4, // 高清
        useCORS: true,
        backgroundColor: '#fff',
        logging: false,
        onclone: (clonedDoc) => {
          // 克隆容器
          const cloneElement = clonedDoc.querySelector('[ref="pdfContent"]')
          if (cloneElement) {
            cloneElement.style.height = 'auto'
            cloneElement.style.overflow = 'visible'
            cloneElement.style.paddingBottom = '10mm'

            // 递归处理所有子元素
            cloneElement.querySelectorAll('*').forEach(el => {
              el.style.height = 'auto'
              el.style.overflow = 'visible'
              el.style.lineHeight = '1.6 !important' // 保证文字不被裁掉
              el.style.paddingTop = '2px'
              el.style.paddingBottom = '2px'
              el.style.wordBreak = 'break-word'
            })
          }

          // 全局样式覆盖
          const style = clonedDoc.createElement('style')
          style.innerHTML = `
            * {
              color: black !important;
              background: white !important;
              border-color: #000 !important;

              overflow: visible !important;
              height: auto !important;
              word-break: break-word !important;
            }
            div {
              height: auto !important;
              overflow: visible !important;
            }
            .pdf-line-fix{
              line-height: 2 !important;
            }
          `
          clonedDoc.body.appendChild(style)
        }
      })

      // PDF 尺寸计算
      const pdfWidth = 80
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      })

      pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0, 0, pdfWidth, pdfHeight
      )

      // 新窗口打开 PDF
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank')

    } catch (err) {
      console.error('导出失败', err)
    } finally {
      loading.close()
    }
  }, 30)
}
</script>

<style scoped lang="scss">

</style>