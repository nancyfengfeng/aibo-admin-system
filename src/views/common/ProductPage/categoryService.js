import { app } from '@/utils/cloudbase'
const models = app.models

export async function getCategoryList() {
    try{
        const {data} = await models.Category.list({
            filter:{
                where:{
                    enabled:{$eq:true},
                }
            },select:{
                _id:true,
                name:true
            }
        })
        return data.records

    }catch (err){
        console.log("获取分类列表错误",err)
        return []
    }
}