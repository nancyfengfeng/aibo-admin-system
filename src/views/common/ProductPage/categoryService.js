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
                name:true,
                enabled:true
            }
        })
        return data.records

    }catch (err){
        console.log("获取分类列表错误",err)
        return []
    }
}

export async function addCategory(data){
    try{
        const res = await models.Category.create({
            data:data,
        })
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

export async function updateCategory(categoryId,name){
    try{
        const res = await models.Category.update({
            filter:{
                where:{
                    _id:categoryId,
                }
            },
            data:{
                name:name,
            }
        })
        return {
            success: res.data.count > 0,
            data: res.data
        }
    }catch (err){
        console.error(err)
        return {
            success: false,
            data: []
        }
    }
}