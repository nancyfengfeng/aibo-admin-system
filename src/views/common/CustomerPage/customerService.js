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

export async function updateWechatOpenId(customerId,openIds){
    try {
        const {data} = await models.Customer.update({
            filter:{
                where:{
                    _id:{$eq:customerId},
                }
            },
            data:{
                wechatOpenId:openIds
            }
        })
        return {
            success:data.count > 0
        }
    }catch (error) {
        return {success:false}
    }
}

export async function updateCustomerDetail(customerId,customerDetail){
    try{
        const {data} =await models.Customer.update({
            filter:{
                where:{
                    _id:{$eq:customerId},
                }
            },
            data:customerDetail
        })
        console.log(data)
        return {
            success:data.count > 0
        }
    }catch (error) {
        console.log(error)
        return {success:false}
    }
}

export async function createCustomerDetail(customerDetail){
    try{
        const {data} = await models.Customer.create({
            data:customerDetail
        })
        return {
            success:true
        }
    }catch (error) {
        console.log(error)
        return {
            success:false
        }
    }
}

export async function fetchInviteCodeList(){
    try{
        const{data} = await models.Customer.list({
            select:{
                inviteCode:true
            }
        })

        // 把所有 inviteCode 提取成一个纯数组
        return data.records.map(item => item.inviteCode)

    }catch (error) {
        return []
    }
}