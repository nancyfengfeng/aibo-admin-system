import { app } from '@/utils/cloudbase'
const models = app.models

// 获取当月每日销售额（给图表用）
export async function fetchDailySales() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const start = new Date(year, month, 1).getTime()
    const end = new Date(year, month + 1, 1).getTime()

    try {
        const res = await models.Orders.list({
            filter: {
                where: {
                    $and: [
                        { createdAt: { $gte: start } },
                        { createdAt: { $lt: end } },
                        { order_status: '4' } // 只算已完成订单
                    ]
                }
            },
            select: {
                actual_amount: true,
                createdAt: true
            }
        })

        const list = res.data.records || []

        // 按日期分组统计
        const dayMap = {}
        list.forEach(item => {
            const d = new Date(item.createdAt)
            const day = d.getDate()
            dayMap[day] = (dayMap[day] || 0) + item.actual_amount
        })

        // 生成 1 ~ 31 日数据
        const days = []
        const amounts = []
        for (let i = 1; i <= 31; i++) {
            days.push(i + '日')
            amounts.push(dayMap[i] || 0)
        }

        return { days, amounts }
    } catch (err) {
        console.error('获取每日销售额失败', err)
        return { days: [], amounts: [] }
    }
}