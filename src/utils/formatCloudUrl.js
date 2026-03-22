import {envId} from "./cloudbase.js"

import { storage } from '@/utils/cloudbase'

// 获取临时图片URL（官方方法，100%可用）
const getSignedUrl = async (cloudPath) => {
    if (!cloudPath || !cloudPath.startsWith("cloud://")) return cloudPath;

    try {
        const { data, error } = await storage.createSignedUrl(cloudPath, 3600 * 24 * 7);
        if (error) throw error;
        return data.signedUrl;
    } catch (err) {
        console.error("获取图片URL失败", err);
        return "";
    }
};



// 图片地址转换
export function formatCloudUrl(cloudPath) {
    if (!cloudPath || !cloudPath.startsWith('cloud://')) return cloudPath;
    const envPart = cloudPath.split('/')[2];
    const env = envPart.split('.')[1];
    const path = cloudPath.split('/').slice(3).join('/');
    return `https://${envId}.tcb.qcloud.la/${path}`;
}

// 反向解析：https 地址 → cloud:// 地址
export function revertCloudUrl(httpsUrl) {
    if (!httpsUrl || !httpsUrl.startsWith('https://')) return httpsUrl;

    try {
        const paths = httpsUrl.split('/').slice(3).join('/');

        // ✅ 直接用你定义的 envId，最准确！
        return `cloud://${envId}/${paths}`;
    } catch (e) {
        return httpsUrl;
    }
}