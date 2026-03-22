import cloudbase from '@cloudbase/js-sdk';

let appInstance = null;
let authInstance = null;

export const envId = "cloud1-1gx1jccfb2c6cfd9";

export function initCloudBase() {
    if (appInstance) return appInstance;

    appInstance = cloudbase.init({
        env: envId,
        persistence: 'local'
    });

    return appInstance;
}

export const app = initCloudBase();
export const auth = app.auth();

// ✅ 只改这一行！！！新版 storage 这么写
export const storage = app.storage.from();
