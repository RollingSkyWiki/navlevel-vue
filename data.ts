/// <reference types="types-mediawiki" />

const KEY = 'rswiki:NavLevel-data'
const LEVEL_KEY = 'rswiki:NavLevel-levels'
const EXPIRY_KEY = 'rswiki:NavLevel-expiry'
const OPTIONS_KEY = 'rswiki:NavLevel-options'
const REJECT_THRESHOLD = 210; // 当前有218个非饭制关卡，如果钻取到的数据低于210，则认为数据无效，使用旧数据
const EXPIRY_SECS = 3600 * 12;
const EXPIRY_MS = EXPIRY_SECS * 1000;

const ORIGIN = "https://rs.miraheze.org/";

export async function fetchData(): Promise<LevelEntry[] | null> {
    const res = await (new mw.Api).get({
        action: 'cargoquery',
        formatversion: 2,
        tables: "Level, Version",
        fields: "\
Level.name_zh = name, Level.num = num, Level._pageName = page, Level.type = type, Level.stars = stars, \
Level.first_came_version = inVer, Level.removed_version = remVer, Level.restored_version = resVer, \
Level.award = award, Level.diamonds = dia, Version.date = inDate",
        where: "Level.stars IS NOT NULL AND(Level.type = '官方' OR Level.type = '共创') AND Level._pageName NOT LIKE '%（旧）'",
        join_on: "Level.first_came_version = Version._pageName",
        limit: 500
    });
    if (!res.cargoquery) {
        return null;
    }
    const data = res.cargoquery.map(item => {
        return {            
            num: Number(item.title.num),
            stars: Number(item.title.stars),
            inVer: item.title.inVer,
            remVer: item.title.remVer,
            resVer: item.title.resVer,
            inDate: item.title.inDate,
            type: item.title.type,
            page: item.title.page,
            name: item.title.name,
            award: item.title.award,
            dia: Number(item.title.dia),
        } satisfies LevelEntry;
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


export async function fetchLevels(): Promise<string[] | null> {
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
        return JSON.parse(intoJSON);
    } catch (e) {
        return null;
    }
}

// 可信的关卡列表
// 从Module:NavLevel/levels中获取
// 这个Lua文件不应当包含复杂的语法，只有一个return扁平数组的语句
export async function getValidLevels(): Promise<string[] | null> {
    let levels = mw.storage.getObject(LEVEL_KEY);
    if (levels) {
        return levels;
    }
    levels = await fetchLevels();
    mw.storage.setObject(LEVEL_KEY, levels, EXPIRY_SECS);
    return levels;
}

export interface Options {
    grouping1: string;
    grouping2: string;
    sortingPriority: string[];
    direction: string;
    showsBirthday: boolean;
}

export function saveOptionsToStorage(options: Options) {
    mw.storage.setObject(OPTIONS_KEY, options); 
}

export function loadOptionsFromStorage(): Options {
    const options = mw.storage.getObject(OPTIONS_KEY);
    if (!options) {
        return null;
    }
    return options;
}

export function isCurrentPage(page: string) {
    // 下划线管他有没有，归一化为空格
    return mw.config.get('wgPageName').replace(/_/g, " ")=== page.replace(/_/g, " ");
}

/**
 * 重新强制获取数据，*不会*刷新页面
 */
export async function hotPurge(): Promise<{ levels: string[] | null, data: LevelEntry[] | null }> {
    const levels = await fetchLevels();
    const data = await fetchData();
    if (levels) {
        mw.storage.setObject(LEVEL_KEY, levels, EXPIRY_SECS);
    }
    if (data) { // 不使用mediawiki的storage，因为需要手动处理fallback
        localStorage.setItem(KEY, JSON.stringify(data));
        localStorage.setItem(EXPIRY_KEY, String(Date.now() + EXPIRY_MS));
    }
    return { levels, data };
}

export interface LevelEntry {
    /** 带繁简转换的中文名 */
    name: string;
    /** 序号 */
    num: number;
    /** 页面名 */
    page: string;
    /** 星数 */
    stars: number;
    /** 类型 */
    type: "共创" | "官方";
    /** 首次出现版本 */
    inVer: string;
    /** 移除版本 */
    remVer: string;
    /** 恢复版本 */
    resVer: string;
    /** 首次出现版本的发布日期 */
    inDate: string;
    /** 奖励方式 */
    award: "none" | "crown" | "present";
    /** 钻石数 */
    dia: number;
}
