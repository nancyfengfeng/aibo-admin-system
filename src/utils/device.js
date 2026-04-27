export function isMobile() {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent.toLowerCase()
    return /iphone|ipad|android|mobile|ipod|ios/i.test(ua) || window.innerWidth <= 1024
}

export function clearForceMobile() {
    sessionStorage.removeItem('forceMobile')
}