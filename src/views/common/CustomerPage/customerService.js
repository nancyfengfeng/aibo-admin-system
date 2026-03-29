import { app } from '@/utils/cloudbase'
const models = app.models

function buildCustomerFilter(filter={}){
    const {customerNo,region,vip} = filter
    const finalFilter = {}

    if (customerNo){
        finalFilter.where = {
            inviteCode:{$search: customerNo}
        }
    }

    if (region){
        finalFilter.where = {
            ...finalFilter.where,
            region:{$eq: region}
        }
    }
    if (vip){
        finalFilter.where = {
            ...finalFilter.where,
            VIPLevel:{$eq: vip}
        }
    }
    console.log(finalFilter)
    return finalFilter
}

export async function fetchAllCustomers(pageSize, pageNumber, filter = {}){
    try{
        const finalFilter = buildCustomerFilter(filter)
        const {data} = await models.Customer.list({
            pageSize,
            pageNumber,
            filter:finalFilter,
            select:{
                _id:true,
                storeName:true,
                region:true,
                remark:true,
                status:true,
                storeLocation:true,
                inviteCode:true,
                VIPLevel:true,
                wechatOpenId:true,
                phone:true,
            },
            getCount: true
        })
        return {
            result:data.records,total: data.total
        }
    }catch (error) {
        console.log("获取客户失败", error)
        return { result: [], total: 0 }
    }
}