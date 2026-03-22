import { app } from '@/utils/cloudbase'
const models = app.models

export async function getTagList() {
    try {
        const { data } = await models.Tag.list({
            filter: {
                where: {
                    enabled: {
                        $eq: true
                    }
                }
            },
            select: {
                _id: true,
                name: true
            }
        })
        return data.records || []
    } catch (err) {
        console.error('获取标签列表失败', err)
        // 出错返回空数组，防止页面报错
        return []
    }
}