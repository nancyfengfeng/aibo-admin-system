import { app } from '@/utils/cloudbase'
const models = app.models

export async function fetchBanners() {
    try{
        const {data} = await models.SwiperBanner.list({
            select:{
                _id:true,
                image:true,
                enabled:true
            }
        })
        return data.records
    }catch (err){
        console.log(err)
        return []
    }
}

export async function updateBannerEnabled(bannerId, bannerEnabled){
    try{
        const {data} = await models.SwiperBanner.update({
            filter:{
                where:{
                    _id:{$eq:bannerId},
                }
            },
            data:{
                enabled:bannerEnabled
            }
        })
        return {
            success: data.count > 0
        }
    }catch (err){
        console.log(err)
        return {
            success: false
        }
    }
}

export async function createBanner(banner){
    try{
        const {data} = await models.SwiperBanner.create({
            data:banner
        })
        return {
            success:true,
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

export async function deleteBanner(bannerId){
    try {
        const {data} = await models.SwiperBanner.delete({
            filter:{
                where:{
                    _id:{$eq:bannerId},
                }
            }
        })
        console.log(data)
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