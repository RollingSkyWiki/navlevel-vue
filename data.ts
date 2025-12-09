/// <reference types="types-mediawiki" />

const KEY = 'rswiki:NavLevel-data'
const LEVEL_KEY = 'rswiki:NavLevel-levels'
const EXPIRY_KEY = 'rswiki:NavLevel-expiry'
const REJECT_THRESHOLD = 210; // 当前有218个非饭制关卡，如果钻取到的数据低于210，则认为数据无效，使用旧数据
const EXPIRY_SECS = 3600 * 12;
const EXPIRY_MS = EXPIRY_SECS * 1000;

const ORIGIN = process.env.NODE_ENV === 'development' ? "/api/rs/" : "https://rs.miraheze.org/";

export async function fetchData(): Promise<LevelEntry[] | null> {
    const res = await (new mw.Api).get({
        action: 'cargoquery',
        formatversion: 2,
        tables: "Level",
        fields: "Level.name_zh = name, Level.num = num, Level._pageName = page, Level.type = type, Level.stars = stars",
        where: "Level.type = '官方' or Level.type = '共创'",
        limit: 500
    });
    if (!res.cargoquery) {
        return null;
    }
    const data = res.cargoquery.map(item => {
        return {
            ...item.title,
            num: Number(item.title.num)
        } as LevelEntry;
    });
    if (data.length < REJECT_THRESHOLD) {
        return null;
    }
    return data;
}

export async function getData(): Promise<LevelEntry[] | null> {
    const dataJson = localStorage.getItem(KEY);
    let data: LevelEntry[];
    try {
        if (!dataJson) {
            throw new Error('No data');
        }
        data = JSON.parse(dataJson);
    } catch (e) {
    }
    const expiry = localStorage.getItem(EXPIRY_KEY);
    // 如过期，重新获取，但如果获取失败，则使用旧数据
    if (expiry && Number(expiry) && Number(expiry) < Date.now()) {
        console.log('Expired, fetching new data');
        const newData = await fetchData();
        if (newData) {
            localStorage.setItem(KEY, JSON.stringify(newData));
            localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
            return newData;
        } else {
            return data;
        }
    }
    if (!data) {
        data = await fetchData();
        if (data) {
            localStorage.setItem(KEY, JSON.stringify(data));
            localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
        }
        return data;
    }
    return data;
}

// 可信的关卡列表
// 从Module:NavLevel/levels中获取
// 这个Lua文件不应当包含复杂的语法，只有一个return扁平数组的语句
export async function getValidLevels(): Promise<string[] | null> {
    let levels = mw.storage.getObject(LEVEL_KEY);
    if (levels) {
        return levels;
    }
    const res = await fetch(ORIGIN + "wiki/Module:NavLevel/levels?action=raw");
    if (!res.ok) {
        return null;
    }
    const text = await res.text();
    const intoJSON = text
        .replace(/^return\s+/, "")
        .replace(/\{/g, "[")
        .replace(/\}/g, "]")
        .replace(/\-\-.*?\n/g, "");
    try {
        levels = JSON.parse(intoJSON);
    } catch (e) {
        return null;
    }
    mw.storage.setObject(LEVEL_KEY, levels, EXPIRY_SECS);
    return levels;
}

export interface LevelEntry {
    /** 带繁简转换的中文名 */
    name: string;
    /** 序号 */
    num: string;
    /** 页面名 */
    page: string;
    /** 星数 */
    stars: number;
    /** 类型 */
    type: "共创" | "官方"
}
