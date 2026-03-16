import { app } from '@/utils/cloudbase'
const models = app.models

// 图片地址转换（正确版）
function formatCloudUrl(cloudPath) {
    if (!cloudPath || !cloudPath.startsWith('cloud://')) return cloudPath;
    const envPart = cloudPath.split('/')[2];
    const env = envPart.split('.')[1];
    const path = cloudPath.split('/').slice(3).join('/');
    return `https://${env}.tcb.qcloud.la/${path}`;
}

export default async function getProducts(pageSize, pageNumber, filter = {}) {
    try {
        // 1. 获取商品列表
        const { data } = await models.Product.list({
            pageSize: pageSize,
            pageNumber: pageNumber,
            filter: filter,
            select: {
                name: true,
                description: true,
                images: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                category: { _id: true, name: true },
                tags: { _id: true, name: true, color: true },
                code: true,
            },
            getCount: true,
        })

        // 2. 提取所有商品 ID
        const productIds = data.records.map(item => item._id)

        // 3. 根据商品ID 查询所有 SKU
        const skuResult = await models.SKU.list({
            filter: {
                relateWhere:{
                    product_sku:{
                        where:{
                            _id:{ $in: productIds }
                        }
                    }
                }
            },
            select: {
                _id: true,
                product_sku:{
                    _id:true
                },
                skuCode: true,
                enabled: true,
                stock: true,
                price: true,
                attributes:true,
                vip_price: true
            }
        })

        const allSkus = skuResult.data.records || []

        // 4. 把 SKU 合并到对应商品里
        const formattedRecords = data.records.map(product => {
            // 处理图片
            if (product.images && Array.isArray(product.images)) {
                product.images = product.images.map(img => formatCloudUrl(img))
            }

            // 给商品加上 skus 字段
            product.skus = allSkus.filter(sku => sku.product_sku._id === product._id)
            return product
        })

        console.log(formattedRecords)
        return {
            ...data,
            records: formattedRecords
        }

    } catch (err) {
        console.error("获取商品失败", err)
        return { records: [], total: 0 }
    }
}