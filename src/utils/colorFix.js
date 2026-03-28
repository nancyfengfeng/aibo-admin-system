import Color from 'colorjs.io'

// oklch 转 RGB
export function convertOklchToRgb(colorStr) {
    try {
        return new Color(colorStr).to('srgb').toString()
    } catch (e) {
        return colorStr
    }
}


// 导出 PDF 前预处理 DOM：自动替换 el-input 为纯文本
export function beforeExportPdfFix(clonedDoc) {
    if (!clonedDoc) return

    // 1. 把所有 el-input 替换成纯文本
    const allInputs = clonedDoc.querySelectorAll('.el-textarea__inner')
    allInputs.forEach((textarea) => {
        const value = textarea.value || ''
        const div = clonedDoc.createElement('div')
        div.textContent = value
        div.style.padding = '8px'
        div.style.minHeight = '42px'
        div.style.lineHeight = '1.6'
        div.style.width = '100%'
        div.style.boxSizing = 'border-box'
        textarea.parentNode.replaceChild(div, textarea)
    })

    // 2. 把所有 oklch 颜色转成 RGB
    replaceOklchStyles(clonedDoc.body)
}

// 递归替换颜色
function replaceOklchStyles(element) {
    if (!element || element.nodeType !== 1) return

    const style = getComputedStyle(element)
    const colorProps = [
        'color', 'backgroundColor', 'borderColor',
        'borderTopColor', 'borderLeftColor',
        'borderRightColor', 'borderBottomColor'
    ]

    colorProps.forEach((prop) => {
        const val = style[prop]
        if (val && val.includes('oklch')) {
            element.style[prop] = convertOklchToRgb(val)
        }
    })

    const children = Array.from(element.children)
    children.forEach((child) => replaceOklchStyles(child))
}