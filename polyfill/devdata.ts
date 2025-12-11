// 开发环境数据
import { type LevelEntry } from '../data';

// 从 cargo.json 导入的真实关卡数据
import cargoData from './cargo.json';
import levelsData from './levels.json';

// 开发环境选项配置
interface Options {
    grouping1: string;
    grouping2: string;
    sorting: string;
    direction: string;
}

export function saveOptionsToStorage(options: Options) {
    // 开发环境使用 localStorage
    localStorage.setItem('navlevel-options', JSON.stringify(options)); 
}

export function loadOptionsFromStorage(): Options {
    const options = localStorage.getItem('navlevel-options');
    if (!options) {
        return null;
    }
    return JSON.parse(options);
}

// 直接使用本地JSON数据
export const mockLevels: LevelEntry[] = cargoData;
export const mockValidLevels: string[] = levelsData;

export async function getData(): Promise<LevelEntry[] | null> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLevels;
}

export async function getValidLevels(): Promise<string[] | null> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockValidLevels;
}

export function isCurrentPage(page: string) {
    return page === "山丘";
}

export async function hotPurge() {
    return { levels: mockValidLevels, data: mockLevels };
}