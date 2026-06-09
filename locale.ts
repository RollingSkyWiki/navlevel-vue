import { createI18n } from 'vue-i18n';

/**
 * 检测当前用户语言偏好，复用与 convByVar 相同的逻辑
 */
function detectLocale() {
    if (__NO_MW__) {
        return navigator.language
    }
    const { convByVar } = require('ext.gadget.HanAssist');
    return convByVar({ hans: 'zh-hans', hant: 'zh-hant' }) === 'zh-hant'
        ? 'zh-hant' : 'zh-hans';
}

const hans = {
    common: {
        level: '关',
        unknown: '未知',
    },
    grouping: {
        none: '无',
        type: '类型',
        era: '时期',
        stars: '星数',
        starsplus: '同星级内位置',
        version: '版本',
        present: '奖励方式',
        year: '年份',
        completeDifficulty: '完成难度',
        perfectDifficulty: '完美难度',
    },
    sorting: {
        default: '默认',
        num: '编号',
        name: '名称',
        stars: '星数',
        date: '日期',
        completeDifficulty: '完成难度',
        perfectDifficulty: '完美难度',
    },
    direction: {
        asc: '升序',
        desc: '降序',
    },
    era: {
        chili: '辣椒',
        cheetah: '猎豹',
        minimax: '米麦',
    },
    type: {
        official: '官方',
        cocreation: '共创',
        event: '活动',
        fanmade: '饭制',
    },
    stars: {
        star: '星',
        blueStar: '蓝星',
        purpleStar: '紫星',
    },
    present: {
        crown: '皇冠',
        mysteryBox: '神秘箱',
        none: '无',
        unknown: '未知',
    },
    hlist: {
        levelAbbr: { '官方': 'Lv.', '共创': 'Co.', '饭制': 'Fan.', '活动': 'Sp.' },
        by: 'by',
        versionAdded: { post: '版本加入游戏', pre: '' },
    },
    info: {
        experimental: '本智能排序为实验性功能。当前获取到{count}个关卡的数据。',
    },
    actions: {
        clearCache: '清除缓存',
    },
    labels: {
        primaryGroup: '一级分组：',
        secondaryGroup: '二级分组：',
        tertiaryGroup: '三级分组：',
        sort: '排序：',
    },
    options: {
        showMwPopup: '显示MediaWiki原生弹出框',
        showBirthday: '标记生日在今日（UTC+8）的关卡',
        bindFamily: '绑定同族关卡',
        highlightMain: '高亮主线（困难）关卡',
    },
    notify: {
        fetchLevelsFailed: '获取合法关卡列表失败。',
        fetchCargoFailed: '获取关卡{cargo}数据失败。',
        dataUpdated: '数据已更新。{records}条数据记录，{levels}个关卡。',
    },
    prioritySort: {
        ariaLabel: '优先级排序',
        ariaChip: '{label}，点击设为第一优先级，左右箭头键移动一位',
    },
}

const messages = {
    'zh-hans': hans,

    'zh-hant': {
        common: {
            level: '關',
            unknown: '未知',
        },
        grouping: {
            none: '無',
            type: '類型',
            era: '時期',
            stars: '星數',
            starsplus: '同星級內位置',
            version: '版本',
            present: '獎勵方式',
            year: '年份',
            completeDifficulty: '完成難度',
            perfectDifficulty: '完美難度',
        },
        sorting: {
            default: '預設',
            num: '編號',
            name: '名稱',
            stars: '星數',
            date: '日期',
            completeDifficulty: '完成難度',
            perfectDifficulty: '完美難度',
        },
        direction: {
            asc: '升序',
            desc: '降序',
        },
        era: {
            chili: '辣椒',
            cheetah: '獵豹',
            minimax: '米麥',
        },
        type: {
            official: '官方',
            cocreation: '共創',
            event: '活動',
            fanmade: '飯製',
        },
        stars: {
            star: '星',
            blueStar: '藍星',
            purpleStar: '紫星',
        },
        present: {
            crown: '皇冠',
            mysteryBox: '神秘箱',
            none: '無',
            unknown: '未知',
        },
        hlist: {
            levelAbbr: { '官方': 'Lv.', '共创': 'Co.', '饭制': 'Fan.', '活动': 'Sp.' },
            by: 'by',
            versionAdded: { post: '版本加入遊戲', pre: '' },
        },
        info: {
            experimental: '本智能排序為實驗性功能。當前獲取到{count}個關卡的數據。',
        },
        actions: {
            clearCache: '清除快取',
        },
        labels: {
            primaryGroup: '一級分組：',
            secondaryGroup: '二級分組：',
            tertiaryGroup: '三級分組：',
            sort: '排序：',
        },
        options: {
            showMwPopup: '顯示MediaWiki原生彈出框',
            showBirthday: '標記生日在今日（按UTC+8）的關卡',
            bindFamily: '綁定同族關卡',
            highlightMain: '高亮主線（困難）關卡',
        },
        notify: {
            fetchLevelsFailed: '獲取合法關卡列表失敗。',
            fetchCargoFailed: '獲取關卡{cargo}數據失敗。',
            dataUpdated: '數據已更新。{records}條數據記錄，{levels}個關卡。',
        },
        prioritySort: {
            ariaLabel: '優先級排序',
            ariaChip: '{label}，點擊設為第一優先級，左右箭頭鍵移動一位',
        },
    },
    'en': {
        common: {
            level: 'level | levels',
            unknown: 'Unknown',
        },
        grouping: {
            none: 'None',
            type: 'Type',
            era: 'Era',
            stars: 'Stars',
            starsplus: 'Star color',
            version: 'Version',
            present: 'Crown form',
            year: 'Year',
            completeDifficulty: 'Complete Difficulty',
            perfectDifficulty: 'Perfect Difficulty',
        },
        sorting: {
            default: 'Default',
            num: 'Number in type',
            name: 'Simplified Chinese name',
            stars: 'stars',
            date: 'Release Date',
            completeDifficulty: 'Complete Difficulty',
            perfectDifficulty: 'Perfect Difficulty',
        },
        direction: {
            asc: 'Ascending',
            desc: 'Descending',
        },
        era: {
            chili: 'TC',
            cheetah: 'CM',
            minimax: 'MM',
        },
        type: {
            official: 'Official',
            cocreation: 'Cocreation',
            event: 'Event',
            fanmade: 'Fanmade',
        },
        stars: {
            star: 'star | stars',
            blueStar: 'Blue',
            purpleStar: 'Purple',
        },
        present: {
            crown: 'Crowns',
            mysteryBox: 'Mystery Boxes',
            none: 'None',
            unknown: 'Unknown',
        },
        hlist: {
            levelAbbr: { '官方': 'Lv.', '共创': 'Co.', '饭制': 'Fan.', '活动': 'Sp.' },
            by: 'by',
            versionAdded: { post: '', pre: 'Introduced in '},
        },
        info: {
            experimental: 'This sorting is experimental for Rolling Sky Wiki. Currently we have data for {count} levels.',
        },
        actions: {
            clearCache: 'Clear Cache',
        },
        labels: {
            primaryGroup: 'Primary Groups:',
            secondaryGroup: 'Secondary Groups:',
            tertiaryGroup: 'Tertiary Groups:',
            sort: 'Sort by:',
        },
        options: {
            showMwPopup: 'Display MediaWiki\' native Popup (only for the wiki)',
            showBirthday: 'Mark the levels experiencing birthday today (by UTC+8)',
            bindFamily: 'Bind Levels in a Family',
            highlightMain: 'Highlight Main (or Difficult version) Levels',
        },
        notify: {
            fetchLevelsFailed: 'Failed to fetch qualified level list.',
            fetchCargoFailed: 'Failed to fetch {cargo} data.',
            dataUpdated: 'Data updated. {records} records, {levels} levels.',
        },
        prioritySort: {
            ariaLabel: 'Priority Sort',
            ariaChip: '{label}, click to set as the most prior, use arrow keys to increase/decrease priority by one.',
        },
    } satisfies typeof hans,
};

export const i18n = createI18n({
    legacy: false,
    locale: detectLocale(),
    fallbackLocale: 'zh-hans',
    messages,
});

/**
 * 非组件场景使用的 t 函数，直接访问 i18n 全局实例。
 */
export function t(key: string, ...args: any[]): string {
    return (i18n.global.t as any)(key, ...args);
}
