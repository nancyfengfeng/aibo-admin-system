import { app } from '@/utils/cloudbase'
const models = app.models

// 公共方法：根据时间段获取统计
async function fetchOrderData(monthStart, monthEnd) {
    try {
        const orderRes = await models.Orders.list({
            filter: {
                where: {
                    $and: [
                        { createdAt: { $gte: monthStart } },
                        { createdAt: { $lt: monthEnd } }
                    ]
                }
            },
            getCount: true,
            select: {
                actual_amount: true,
                order_status: true,
            }
        })

        const data = orderRes.data.records || []
        const totalOrders = orderRes.data.total || 0

        const totalSales = data.reduce((sum, item) => sum + (item.actual_amount || 0), 0)
        const completed = data.filter(item => item.order_status === '4').length
        const pending = totalOrders - completed

        return {
            totalSales,
            totalOrders,
            completed,
            pending
        }
    } catch (err) {
        console.error('统计失败', err)
        return { totalSales: 0, totalOrders: 0, completed: 0, pending: 0 }
    }
}

// 计算涨幅
function calcPercent(current, last) {
    if (last === 0) return { isUp: true, percent: '+100%' }
    const diff = current - last
    const percent = ((diff / last) * 100).toFixed(1)
    return {
        isUp: diff >= 0,
        percent: `${percent >= 0 ? '+' : ''}${percent}%`
    }
}

// 导出：返回你要的卡片数组格式
export async function getDashboardStats() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    // 当月
    const currentStart = new Date(year, month, 1).getTime()
    const currentEnd = new Date(year, month + 1, 1).getTime()

    // 上月
    const lastStart = new Date(year, month - 1, 1).getTime()
    const lastEnd = new Date(year, month, 1).getTime()

    // 查询
    const current = await fetchOrderData(currentStart, currentEnd)
    const last = await fetchOrderData(lastStart, lastEnd)

    // 👇 最终返回你要的数组结构！！！
    return [
        {
            title: '总销售额',
            context: `₡ ${current.totalSales.toLocaleString()}`,
            icon: 'money',
            ...calcPercent(current.totalSales, last.totalSales)
        },
        {
            title: '总订单数',
            context: `${current.totalOrders}`,
            icon: 'cart',
            ...calcPercent(current.totalOrders, last.totalOrders)
        },
        {
            title: '已完成订单',
            context: `${current.completed}`,
            icon: 'trending-up',
            ...calcPercent(current.completed, last.completed)
        },
        {
            title: '待处理订单',
            context: `${current.pending}`,
            icon: 'trending-down',
            ...calcPercent(current.pending, last.pending)
        }
    ]
}
