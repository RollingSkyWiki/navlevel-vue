import Nav from "./Main.vue";

// 静态导入两个模块，Vite会做tree-shaking
import * as devData from './polyfill/devdata';
import * as prodData from './data';

import "./polyfill/vue";

import { collectLevelVariants } from "./variants";

async function initNavLevel() {
    // 开发环境使用模拟数据，生产环境使用真实数据
    const dataModule = import.meta.env.DEV ? devData : prodData;
    
    const { getData, getValidLevels } = dataModule;
    
    try {
        // 先获取数据
        const [data, levels] = await Promise.all([
            getData(),
            getValidLevels()
        ]);
        
        // 检查是否为空值
        if (!data || !levels) {
            mw.notify('Failed to fetch qualified data', {type: 'error'});
            return;
        }
        
        const navboxes = document.querySelectorAll(".navlevel-sortable");
        
        $.each(navboxes, async (_, navbox) => {
            collectLevelVariants(Array.from(navbox.querySelectorAll('a[href]')));
            
            // 分别获取保留元素
            const preserveElements = Array.from(navbox.querySelectorAll(".navlevel-sortable-preserve"));
            const preserveBeforeElements = Array.from(navbox.querySelectorAll(".navlevel-sortable-preserve-before"));
            
            // 移除保留元素
            [...preserveElements, ...preserveBeforeElements].forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            
            // 清空导航框内容，但保留样式
            const $navbox = $(navbox);
            $navbox.empty();
            
            // 创建Vue应用
            const app = Vue.createApp(Nav, {
                data: data,
                levels: levels,
                preserveElements: preserveElements,
                preserveBeforeElements: preserveBeforeElements,
                titleElement: navbox.querySelector('.navbox-title') || document.createElement('div')
            });
            
            app.mount(navbox);
        });
        
    } catch (error) {
        console.error('Failed to initialize NavLevel:', error);
        mw.notify('Failed to initialize NavLevel: ' + error.message, {type: 'error'});
    }
}

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavLevel);
} else {
    initNavLevel();
}

