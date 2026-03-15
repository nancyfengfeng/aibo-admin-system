import cloudbase from '@cloudbase/js-sdk';

// 单例：保证只初始化一次
let appInstance = null;
let authInstance = null;

// 初始化腾讯云 CloudBase
export function initCloudBase() {
    if (appInstance) return appInstance;

    appInstance = cloudbase.init({
        env: "cloud1-1gx1jccfb2c6cfd9", // 你的环境ID
        persistence: 'local'
    });

    return appInstance;
}

// 获取 app 实例（全局唯一）
export const app = initCloudBase();

// 获取 auth 登录实例
export const auth = app.auth();