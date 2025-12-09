// 开发环境数据

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

// 从 cargo.json 导入的真实关卡数据
import cargoData from './cargo.json';
import levelsData from './levels.json';

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