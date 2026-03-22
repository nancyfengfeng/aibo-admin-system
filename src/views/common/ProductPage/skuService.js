import { app } from '@/utils/cloudbase'
const models = app.models

export async function updateSku(skuId, data) {
    try {

        // 正确写法
        const res = await models.SKU.update({
            filter: {
                where: {
                    _id: skuId // 简写即可，不用 $eq
                }
            },
            data: data
        })
        return {
            success: res.data.count > 0,
            data: res.data
        }

    } catch (err) {
        console.error('更新SKU错误', err)
        return {
            success: false,
            data: []
        }
    }
}

export async function addSku(data) {
    try {
        const res = await models.SKU.create({
            data: data
        })
        return {
            success: res.data.id,
            skuId: res.data.id
        }
    }catch (err) {
        console.log(err)
        return {
            success: false,
            skuId: ''
        }
    }
}