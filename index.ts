import { createApp } from "vue";
import Nav from "./main.vue";

async function initNavLevel() {
    // 开发环境使用模拟数据，生产环境使用真实数据
    const dataModule = process.env.NODE_ENV === 'development' 
        ? await import('./devdata')
        : await import('./data');
    
    const { getData, getValidLevels } = dataModule;
    const navboxes = document.querySelectorAll(".navlevel-sortable");
    
    $.each(navboxes, async (_, navbox) => {
        const $navbox = $(navbox);
        const $newBox = $("<div/>");
        $newBox.addClass("navbox hlist navbox-level-0");
        $navbox.after($newBox);
        
        try {
            // 获取数据
            const [data, levels] = await Promise.all([
                getData(),
                getValidLevels()
            ]);
            
            // 检查是否为空值
            const safeData = data || [];
            const safeLevels = levels || [];
            
            // 创建Vue应用
            const app = createApp(Nav, {
                data: safeData,
                levels: safeLevels,
                preservedElements: Array.from(
                    navbox.querySelectorAll(".navlevel-sortable-preserve")
                ),
                titleElement: navbox.querySelector('.navbox-title') || document.createElement('div')
            });
            
            app.mount($newBox[0]);
            
        } catch (error) {
            console.error('Failed to initialize NavLevel:', error);
            
            // 降级处理：仅插入保留元素
            const fallbackApp = createApp(Nav, {
                data: [],
                levels: [],
                preservedElements: Array.from(
                    navbox.querySelectorAll(".navlevel-sortable-preserve")
                ),
                titleElement: navbox.querySelector('.navbox-title') || document.createElement('div')
            });
            
            fallbackApp.mount($newBox[0]);
        }
    });
}

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavLevel);
} else {
    initNavLevel();
}

