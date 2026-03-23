// 仅判断是否是手机（iPhone / 安卓）
export function isMobile() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|android/i.test(ua);
}