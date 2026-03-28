import { app } from '@/utils/cloudbase'
const models = app.models

export async function fetchRecentOrders() {
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
                    inviteCode:true,
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
                customerCode:order.customer?.inviteCode || 'AIBO-xxxxxxxx',
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

export async function fetchOrderCount(status) {
    try {
        const { data } = await models.Orders.list({
            filter: {
                where: {
                    order_status:{$eq: status}
                }
            },
            select: {
                _id: true,
            },
            getCount: true
        })
        return data.total
    }catch (error) {
        console.log(error)
        return 0
    }
}

function buildOrderFilter(filter = {}) {
    const { status, customerID } = filter
    const finalFilter = {}

    // ----------------------
    // 1. 处理订单状态 where 查询
    // ----------------------
    if (status) {
        finalFilter.where = {
            order_status: { $eq: status }
        }
    }

    // ----------------------
    // 2. 处理客户关联查询 relateWhere
    // ----------------------
    if (customerID) {
        finalFilter.relateWhere = {
            customer: {
                where: {
                    _id: { $eq: customerID }
                }
            }
        }
    }

    return finalFilter
}

export async function fetchAllOrders(pageSize, pageNumber, filter = {}) {
    try {
        // 1. 构建筛选条件
        const finalFilter = buildOrderFilter(filter)

        const { data } = await models.Orders.list({
            pageSize,
            pageNumber,
            filter: finalFilter,
            select: {
                _id: true,
                order_no: true,
                customer: {
                    inviteCode: true,
                    storeName: true,
                },
                order_items: {
                    quantity: true,
                },
                order_status: true,
                actual_amount: true,
                createdAt: true,
                updatedAt: true,
                pay_time:true,
                shipping_time:true,
                receive_time:true,
                cancel_time:true,
            },
            getCount: true
        })

        // ============================
        // ✅ 收集【所有订单ID】（正确写法）
        // ============================
        const orderIds = data.records.map(item => item._id)

        // ============================
        // ✅ 查询该批订单的所有订单项
        // ============================
        const itemsRes = await models.OrderItems.list({
            filter: {
                relateWhere: {
                    order_items: {
                        where: {
                            _id: { $in: orderIds }
                        }
                    }
                }
            },
            select: {
                price: true,
                quantity: true,
                sub_total: true,
                sku: {
                    attributes: true,
                    skuCode: true,
                    _id: true
                },
                product: {
                    name: true,
                    _id: true
                },
                order_items: {
                    _id: true
                }
            }
        })

        const orderItems = itemsRes.data?.records || []

        // ✅ 格式化数据：统计数量 + 提取客户名
        const result = data.records.map(order => {
            // 统计订单总数量
            const totalQuantity = order.order_items.reduce((sum, item) => {
                return sum + (item.quantity || 0)
            }, 0)

            // ============================
            // 把当前订单的订单项也塞进去（可选）
            // ============================
            const currentItems = orderItems.filter(
                item => item.order_items?._id === order._id
            )

            return {
                _id: order._id,
                order_no: order.order_no,
                customerCode: order.customer?.inviteCode || 'AIBO-xxxxxxxx',
                customerName: order.customer?.storeName || '未知客户',
                totalQuantity: totalQuantity,
                order_status: order.order_status,
                actual_amount: order.actual_amount,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                pay_time:order.pay_time,
                shipping_time:order.shipping_time,
                receive_time:order.receive_time,
                cancel_time:order.cancel_time,
                items: currentItems
            }
        })

        return { result, total: data.total }
    } catch (error) {
        console.log("获取订单失败", error)
        return { result: [], total: 0 }
    }
}

export async function updateOrderStatus(ids,statusData) {
    try{
        const { data } = await models.Orders.updateMany({
            data:statusData,
            filter:{
                where:{
                    _id:{ $in: ids }
                }
            }
        })
        return {
            success: true,
            result: data
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            data: null
        }
    }
}

// 获取出货单
export async function fetchShippingOrder(ids) {
    try {
        // 1. 校验参数
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: '订单ID不能为空' };
        }

        // 2. 查询订单主表（包含关联客户）
        const { data } = await models.Orders.list({
            filter: {
                where: {
                    _id: { $in: ids }
                }
            },
            select: {
                _id: true,
                order_no: true,
                createdAt: true,
                customer: {
                    _id: true,
                    storeName: true,
                    inviteCode: true,
                },
                order_items: {
                    _id: true,
                    quantity: true
                },
                order_status: true,
            }
        });

        const orderList = data.records

        if (!orderList || orderList.length === 0) {
            return { success: false, message: '未查询到订单', data: [] };
        }

        // 3. 提取所有订单项 ID
        const orderItemIds = [];
        orderList.forEach(order => {
            if (order.order_items && order.order_items.length > 0) {
                order.order_items.forEach(item => {
                    if (item._id) orderItemIds.push(item._id);
                });
            }
        });

        if (orderItemIds.length === 0) {
            return {
                success: true,
                data: orderList
            };
        }

        // 4. 查询订单项详情（包含SKU）→ 正确用法
        const itemRes = await models.OrderItems.list({
            filter: {
                where: {
                    _id: { $in: orderItemIds }
                }
            },
            select: {
                _id: true,
                quantity: true,
                sku: {
                    _id: true,
                    skuCode: true,
                    attributes: true
                }
            }
        });

        const itemList = itemRes.data.records

        // 5. 把订单项信息合并回订单（关键）
        const result = orderList.map(order => {
            const fullItems = order.order_items.map(orderItem => {
                const realItem = itemList.find(it => it._id === orderItem._id) || {};
                return {
                    ...orderItem,
                    sku: realItem.sku || null
                };
            });

            return {
                ...order,
                order_items: fullItems,
                note:''
            };
        });

        // 6. 最终返回
        return {
            success: true,
            data: result
        };

    } catch (err) {
        console.error('查询发货订单失败：', err);
        return {
            success: false,
            message: '查询失败：' + err.message,
            data: []
        };
    }
}