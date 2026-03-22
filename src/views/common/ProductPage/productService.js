import { app } from '@/utils/cloudbase'
import {formatCloudUrl, revertCloudUrl} from "../../../utils/formatCloudUrl.js";
const models = app.models
import { storage} from '@/utils/cloudbase'

export async function getProducts(pageSize, pageNumber, filter = {}) {
    try {
        const { data } = await models.Product.list({
            pageSize,
            pageNumber,
            filter,
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

        const productIds = data.records.map(item => item._id)

        const skuResult = await models.SKU.list({
            filter: {
                relateWhere: {
                    product_sku: {
                        where: { _id: { $in: productIds } }
                    }
                }
            },
            select: {
                _id: true,
                product_sku: { _id: true },
                skuCode: true,
                enabled: true,
                stock: true,
                price: true,
                attributes: true,
                vip_price: true
            }
        })

        const allSkus = skuResult.data.records || []

        // 收集所有图片
        const allImagePaths = []
        data.records.forEach(p => {
            if (p.images && Array.isArray(p.images)) allImagePaths.push(...p.images)
        })

        // 批量获取签名URL
        const signedUrlMap = {}
        if (allImagePaths.length > 0) {
            const { data: signedData } = await app.storage
                .from()
                .createSignedUrls(allImagePaths, 3600 * 24 * 7)

            signedData.forEach(item => {
                signedUrlMap[item.path] = item.signedUrl
            })
        }
        console.log("signedUrlMap", signedUrlMap)

        const formattedRecords = data.records.map(product => {
            if (product.images && Array.isArray(product.images)) {
                product.images = product.images.map(img => {
                    // 生成完整路径去匹配签名URL
                    const fullPath = img.replace(
                        "cloud://cloud1-1gx1jccfb2c6cfd9/",
                        "cloud://cloud1-1gx1jccfb2c6cfd9.636c-cloud1-1gx1jccfb2c6cfd9-1397980379/"
                    )
                    const url = signedUrlMap[fullPath] || ''

                    // ✅ 你要的标准格式！
                    return {
                        fileId: img,
                        url: url
                    }
                })
            }

            product.skus = allSkus.filter(sku => sku.product_sku._id === product._id)
            return product
        })
        console.log("formattedRecords", formattedRecords)

        return { ...data, records: formattedRecords }

    } catch (err) {
        console.error("获取商品失败", err)
        return { records: [], total: 0 }
    }
}

export async function getProductShownSku(spuId){
    try{
        const { data } = await models.Product.get({
            filter: {
                where:{
                    _id:{$eq: spuId}
                }
            },
            select:{
                sku_shown:{
                    _id:true
                }
            }
        })
        return data.sku_shown._id
    }catch(err){
        console.log(err)
        return ''
    }
}

/*
* Product表
* {name,description,images,category,tags,skus,code}
* images:[],category:{_id:},tags:{_id:},skus:[{}]⬇️
*SKU表
* {skuCode,enabled,stock,price,attributes,vip_price}
* attributes:{quantity:},vip_price:[{vip1:,vip2:,...,vip5:...}]
* */

export async function formattedProductData(product,shownSkuId){
    const data = JSON.parse(JSON.stringify(product))
    console.log("formattedProductData",data)
    const skus = data.skus.map(sku => ({ _id: sku._id }))
    const category = {_id:data.category._id}
    const tags = {_id:data.tags._id}
    const images = data.images.map(item => item.fileId)
    const sku_shown = {_id:shownSkuId}

    return {
        productData:{
            name: data.name,
            code: data.code,
            description: data.description,
            category,
            tags,
            images,
            skus,
            sku_shown,
            updatedAt: Date.now()
        }
    }
}

export async function updateProduct(spuId,productData){
    try {
        const res = await models.Product.update({
            filter:{
                where:{
                    _id:{$eq: spuId}
                }
            },
            data:productData
        })
        return {
            success:res.data.count > 0,
            data:res.data
        }
    }catch (err){
        console.error(err)
        return {
            success: false,
            data: []
        }
    }
}

// 新增商品
export async function addProduct(productData) {
    try{
        const res = await models.Product.create({
            data:productData
        })
        return {
            success:res.data.count > 0,
            data:res.data
        }

    }catch (err){
        console.error(err)
        return {
            success: false,
            data: []
        }
    }
}