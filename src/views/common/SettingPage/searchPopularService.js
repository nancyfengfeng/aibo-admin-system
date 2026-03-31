import { app } from '@/utils/cloudbase'
const models = app.models

export async function fetchSearchPopularList() {
    try{
        const {data} = await models.SearchPopular.list({
            select:{
                _id:true,
                name:true,
                enabled:true
            }
        })
        return data.records
    }catch (err){
        console.log(err)
        return []
    }
}

export async function createSearchPopular(searchPopular) {
    try{
        const {data} = await models.SearchPopular.create({
            data:searchPopular
        })
        console.log(data)
        return{
            success: true,
            data:data
        }
    }catch (err){
        console.log(err)
        return {
            success: false,
            data:[]
        }
    }
}

export async function deleteSearchPopular(searchPopularId) {
    try{
        const {data} = await models.SearchPopular.delete({
            filter:{
                where:{
                    _id:searchPopularId
                }
            }
        })
        return {
            success: data.count > 0,
            data:data
        }
    }catch (err){
        console.log(err)
        return {
            success: false,
            data: null
        }
    }
}

export async function updateSearchPopular(searchPopularId,searchPopularEnabled) {
    try{
        const{data} = await models.SearchPopular.update({
            filter:{
                where:{
                    _id:searchPopularId,
                }
            },
            data:{
                enabled:searchPopularEnabled
            }
        })
        return {
            success: data.count > 0,
            data:data
        }
    }catch (err){
        console.log(err)
        return {
            success: false,
            data: null
        }
    }
}