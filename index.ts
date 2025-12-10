import Nav from "./Main.vue";

// 静态导入两个模块，Vite会做tree-shaking
import * as devData from './polyfill/devdata';
import * as prodData from './data';

import { collectLevelVariants } from "./variants";

async function initNavLevel() {
    // 开发环境使用模拟数据，生产环境使用真实数据
    const dataModule = import.meta.env.DEV ? devData : prodData;
    
    const { getData, getValidLevels } = dataModule;
    const navboxes = document.querySelectorAll(".navlevel-sortable");
    
    $.each(navboxes, async (_, navbox) => {
        collectLevelVariants(Array.from(navbox.querySelectorAll('a[href]')));
        const $navbox = $(navbox);
        const $newBox = $("<div/>");
        $newBox.addClass("navbox hlist navbox-level-0");
        $newBox.attr("style", $navbox.attr("style"));
        $navbox.after($newBox);
        
        try {
            // 获取数据
            const [data, levels] = await Promise.all([
                getData(),
                getValidLevels()
            ]);
            
            // 检查是否为空值
            if (!data || !levels) {
                return;
            }
            
            // 创建Vue应用
            const app = Vue.createApp(Nav, {
                data: data,
                levels: levels,
                preservedElements: Array.from(
                    navbox.querySelectorAll(".navlevel-sortable-preserve")
                ),
                titleElement: navbox.querySelector('.navbox-title') || document.createElement('div')
            });
            
            app.mount($newBox[0]);
            
        } catch (error) {
            console.error('Failed to initialize NavLevel:', error);
            
        }
    });
}

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavLevel);
} else {
    initNavLevel();
}

