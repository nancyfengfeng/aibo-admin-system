import { app } from '@/utils/cloudbase'
const models = app.models

// ================================
// 1. 构建搜索筛选条件（支持：搜索 + 分类）
// ================================
function buildProductFilter(filter = {}) {
    const { useWordSearch, categoryId, ...restFilter } = filter;
    const finalFilter = {};

    // ==========================================
    // 1. 处理【分词搜索】：name / code → where
    // ==========================================
    if (useWordSearch) {
        const orArr = [];

        // 名称分词
        if (restFilter.name) {
            const keyword = restFilter.name.trim();
            const charArray = [...new Set(keyword.split(""))];
            const nameMatch = {
                $and: charArray.map((char) => ({
                    name: { $regex_ci: char },
                })),
            };
            orArr.push(nameMatch);
        }

        // 编号搜索
        if (restFilter.code) {
            orArr.push({ code: { $search: restFilter.code } });
        }

        if (orArr.length > 0) {
            finalFilter.where = orArr.length === 1 ? orArr[0] : { $or: orArr };
        }
    }

    // ==========================================
    // 2. 处理【分类】→ relateWhere
    // ==========================================
    if (categoryId) {
        finalFilter.relateWhere = {
            category: {
                where: {
                    _id: { $eq: categoryId },
                },
            },
        };
    }

    return finalFilter;
}

// ================================
// 2. 批量获取 SKU
// ================================
async function fetchProductSkus(productIds) {
    try {
        const skuResult = await models.SKU.list({
            filter: {
                relateWhere: {
                    product_sku: { where: { _id: { $in: productIds } } }
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
        return skuResult.data.records || []
    } catch (e) {
        console.error('获取SKU失败', e)
        return []
    }
}

// ================================
// 3. 格式化图片（生成签名）
// ================================
async function formatProductImages(products) {
    const allImagePaths = []
    products.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            allImagePaths.push(...p.images)
        }
    })

    const signedUrlMap = {}
    if (allImagePaths.length > 0) {
        const { data: signedData } = await app.storage
            .from()
            .createSignedUrls(allImagePaths, 3600 * 24 * 7)
        signedData.forEach(item => {
            signedUrlMap[item.path] = item.signedUrl
        })
    }

    return products.map(product => {
        if (product.images && Array.isArray(product.images)) {
            product.images = product.images.map(img => {
                const fullPath = img.replace(
                    'cloud://cloud1-1gx1jccfb2c6cfd9/',
                    'cloud://cloud1-1gx1jccfb2c6cfd9.636c-cloud1-1gx1jccfb2c6cfd9-1397980379/'
                )
                const url = signedUrlMap[fullPath] || ''
                return { fileId: img, url }
            })
        }
        return product
    })
}

// ================================
// 主函数（清爽！）
// ================================
export async function fetchProducts(pageSize, pageNumber, filter = {}) {
    try {
        // 1. 构建筛选条件
        const finalFilter = buildProductFilter(filter)

        // 2. 查询商品
        const { data } = await models.Product.list({
            pageSize,
            pageNumber,
            filter: finalFilter,
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

        // 3. 获取SKU
        const allSkus = await fetchProductSkus(productIds)

        // 4. 格式化图片
        const formattedRecords = await formatProductImages(data.records)

        // 5. 绑定SKU
        const result = formattedRecords.map(product => {
            product.skus = allSkus.filter(sku => sku.product_sku._id === product._id)
            return product
        })

        return { ...data, records: result }

    } catch (err) {
        console.error('获取商品失败', err)
        return { records: [], total: 0 }
    }
}

export async function fetchProductShownSku(spuId){
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
        console.log(res)
        return {
            success:res.data.id,
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