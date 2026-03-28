import { defineStore } from 'pinia'

export const useOrderPdfStore = defineStore('orderPdf', {
    state: () => ({
        orderIds: [], // 存放要打印的订单ID
    }),
    actions: {
        setOrderIds(ids) {
            this.orderIds = ids
        },
        clearOrderIds() {
            this.orderIds = []
        },
    },
})