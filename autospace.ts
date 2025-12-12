/**
 * 自动决定是否在西文/数字与中文之间插入空格
 */

// Wiki上有个叫做separate-space的小工具，通过检验它是否启用来判断是否需要插入空格
// 已经准备好，说明用户开了这个小工具，所以用户的偏好是“需要插入空格”
const needsSpace = import.meta.env.DEV
    ? new URLSearchParams(location.search).get("space") === "1"
    : mw.loader.getState("ext.gadget.separate-space") === "ready";

export function autospace(text: string | number) {
    return needsSpace ? " " + text + " " : text;
}

export function lautospace(text: string | number) {
    return needsSpace ? " " + text : text;
}

export function rautospace(text: string | number) {
    return needsSpace ? text + " " : text;
}