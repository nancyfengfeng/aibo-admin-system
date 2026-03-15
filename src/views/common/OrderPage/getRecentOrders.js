import { app } from '@/utils/cloudbase'
const models = app.models

export default async function getRecentOrders() {
    try {
        const { data } = await models.Orders.list({
            pageSize: 10,
            filter: {
                where: {
                    // 创建时间在最近30天内
                    createdAt: {
                        $gte: Date.now() - 30 * 24 * 60 * 60 * 1000
                    }
                }
            },
            sort: {
                createdAt: 'desc'
            },
            select: {
                _id: true,
                order_no: true,
                customer:{
                    storeName:true,
                },
                order_items:{
                    quantity:true,
                },
                order_status: true,
                actual_amount: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        // ✅ 格式化数据：统计数量 + 提取客户名
        const result = data.records.map(order => {
            // 统计订单总数量
            const totalQuantity = order.order_items.reduce((sum, item) => {
                return sum + (item.quantity || 0)
            }, 0)

            return {
                _id: order._id,
                order_no: order.order_no,
                customerName: order.customer?.storeName || '未知客户', // 改成 customerName
                totalQuantity: totalQuantity, // 统计好的总数量
                order_status: order.order_status,
                actual_amount: order.actual_amount,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
                // ✅ order_items 已自动删除
            }
        })
        return result

    } catch (error) {
        console.log("获取最近订单错误：", error)
        return []
    }
}