import { app } from '@/utils/cloudbase'
const models = app.models

export async function fetchTagList() {
    try {
        const { data } = await models.Tag.list({
            filter: {
                where: {
                    enabled: {
                        $eq: true
                    }
                }
            },
            orderBy: [{
                sortOrder:'asc'
            }],
            select: {
                _id: true,
                name: true,
                color:true,
                sortOrder:true
            }
        })
        return data.records || []
    } catch (err) {
        console.error('获取标签列表失败', err)
        // 出错返回空数组，防止页面报错
        return []
    }
}

export async function addTag(data) {
    try {
        const res = await models.Tag.create({
            data: data
        })
        // 正确返回格式：必须带 success: true
        return {
            success: true,
            data: res
        }
    } catch (error) {
        console.error("添加标签失败：", error)
        return {
            success: false,
            msg: error.message
        }
    }
}

export async function updateTag(tagId,data) {
    try {
        const res = await models.Tag.update({
            filter:{
                where: {
                    _id:tagId
                }
            },
            data:data
        })
        return {
            success: res.data.count > 0,
            data: res.data
        }
    }catch (error) {
        console.error("更新标签失败：", error)
        return {
            success: false,
            msg: error.message
        }
    }
}