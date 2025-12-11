<script setup lang="ts">
import { CdxRadio } from '@wikimedia/codex';
import { computed, onMounted, ref } from 'vue';
import * as devData from './polyfill/devdata';
import * as prodData from './data';
import HList from './HList.vue';
import PrioritySort from './components/PrioritySort.vue';

import { convByVar } from './hanassist';
import { variantedType } from './variants';
import { autospace, rautospace } from './autospace';

// 使用相同的策略选择数据模块
const dataModule = import.meta.env.DEV ? devData : prodData;
const { saveOptionsToStorage, loadOptionsFromStorage } = dataModule;

type LevelEntry = prodData.LevelEntry;

const props = defineProps<{
    recvData: LevelEntry[];
    recvLevels: string[];
    /** 保留的服务端渲染的DOM元素数组，在这里指"其他"一行等多个元素 */
    preserveElements: HTMLElement[];
    /** 保留的DOM元素数组，插入在内容之前 */
    preserveBeforeElements: HTMLElement[];
    titleElement: HTMLElement;
}>();

const data = ref(props.recvData);
const levels = ref(props.recvLevels);



const Grouping = {
    type: convByVar({ hans: "类型", hant: "類型" }),
    era: convByVar({ hans: "时期", hant: "時期" }),
    // status: , // 地位（传统意义上的主线、奖励）
    // year: "年份",
    stars: convByVar({ hans: "星数", hant: "星數" }),
    none: convByVar({ hans: "无", hant: "無" })
}

type Grouping = keyof typeof Grouping;

const Sorting = {
    num: convByVar({ hans: "编号", hant: "編號"}),
    name: convByVar({ hans: "名称", hant: "名稱" }),
    stars: convByVar({ hans: "星数", hant: "星數" }),
    default: convByVar({ hans: "默认", hant: "預設" })
}

type Sorting = keyof typeof Sorting;

const Direction = {
    asc: "升序",
    desc: "降序"
}

type Direction = keyof typeof Direction;

const options = loadOptionsFromStorage();

// 验证函数，确保传入的值是合法的键名
function isValidGrouping(value: string): value is Grouping {
    return value in Grouping;
}

function isValidSorting(value: string): value is Sorting {
    return value in Sorting;
}

function isValidDirection(value: string): value is Direction {
    return value in Direction;
}

// 默认分组，使用fallback逻辑
const grouping1 = ref<Grouping>(
    options?.grouping1 && isValidGrouping(options.grouping1) 
        ? options.grouping1 
        : "type"
);
const grouping2 = ref<Grouping>(
    options?.grouping2 && isValidGrouping(options.grouping2) 
        ? options.grouping2 
        : "stars"
);


const direction = ref<Direction>(
    options?.direction && isValidDirection(options.direction) 
        ? options.direction 
        : "asc"
);

// 排序优先级，使用fallback逻辑，兼容旧数据
const sortingPriority = ref<Sorting[]>(
    options?.sortingPriority && Array.isArray(options.sortingPriority) && 
    options.sortingPriority.every(item => isValidSorting(item))
        ? options.sortingPriority 
        : ['default', 'num', 'name', 'stars'] // 默认值
);

const mark = ref<HTMLElement>(null)
const markerBefore = ref<HTMLElement>(null)

const displayData = ref<any>({});



onMounted(() => {
    // 组件挂载时，插入preserve-before元素到markerBefore之前
    if (markerBefore.value && props.preserveBeforeElements?.length) {
        let referenceNode = markerBefore.value;
        props.preserveBeforeElements.forEach((element) => {
            if (element && referenceNode.parentNode) {
                referenceNode.parentNode.insertBefore(element, referenceNode);
                referenceNode = element;
            }
        });
    }
    
    // 插入preserve元素到mark之后
    if (mark.value && props.preserveElements?.length) {
        let referenceNode = mark.value;
        props.preserveElements.forEach((element) => {
            if (element && referenceNode && referenceNode.parentNode) {
                referenceNode.parentNode.insertBefore(element, referenceNode.nextSibling);
                referenceNode = element; // 更新参考节点为刚插入的元素
            }
        });
    }
    
    // 移除marker元素
    if (mark.value) {
        mark.value.remove();
    }
    if (markerBefore.value) {
        markerBefore.value.remove();
    }
    
    sort();
})

function rawCompare(basis: Sorting): (a: LevelEntry, b: LevelEntry) => number {
    const levs = levels.value;
    switch (basis) {
        case 'num':
            return (a, b) => a.type === b.type ? a.num - b.num : a.type === "官方" ? -1 : 1;
        case 'name':
            return (a, b) => a.name.localeCompare(b.name);
        case 'stars':
            return (a, b) => a.stars - b.stars;
        case 'default':
            // 使用levels里面的顺序
            return (a, b) =>levs.indexOf(a.page) - levs.indexOf(b.page);
        default:
            return () => 0;
    }
}

function compare(a: LevelEntry, b: LevelEntry) {
    for (let i = 0; i < sortingPriority.value.length; i++) {
        const c = rawCompare(sortingPriority.value[i])(a, b);
        if (c !== 0) return c * (direction.value === "asc" ? 1 : -1);
    }
    return 0;
}

function rawgroup(entries: LevelEntry[], grouping: string) {
    switch (grouping) {
        case 'era':
            return [
                {
                    group: "辣椒",
                    list: entries.filter(entry =>
                        entry.type === "官方" && entry.num <= 7
                    ) // 俄方（8）
                },
                {
                    group: convByVar({ hans: "猎豹", hant: "獵豹" }),
                    list: entries.filter(entry =>
                        entry.type === "官方" && entry.num > 7 && entry.num <= 94
                    )
                },
                {
                    group: convByVar({ hans: "米麦", hant: "米麥" }),
                    list: entries.filter(entry =>
                        entry.type === "共创" || entry.type === "官方" && entry.num > 94
                    )
                }
            ]
        case 'type':
            const groups = [];
            groups.push({
                group: "官方",
                list: entries.filter(entry => entry.type === "官方")
            });
            groups.push({
                group: variantedType("共创"),
                list: entries.filter(entry => entry.type === "共创")
            });
            return groups
        case 'stars':
            const seenStars = new Set<number>();
            entries.forEach(entry => seenStars.add(entry.stars));
            const stars = Array.from(seenStars).sort((a, b) => a - b);
            return stars.map(star => {
                return {
                    group: rautospace(star.toString()) + "星",
                    list: entries.filter(entry => entry.stars === star)
                }
            });
        // case Grouping.status:
        default:
            return entries;
    }
}
/** 分组并排序 */
function group(entries: LevelEntry[], grouping: Grouping) {
    return rawgroup(entries, grouping).map(g => {
        g.list = g.list.sort(compare);
        return g;
    });
}

interface Group {
    group: string;
    list: LevelEntry[];
}

interface DoubleGroup {
    group: string;
    list: Group[];
}

/** 用于奇偶行的索引值，每行自增1 */
let index = 0;

function sort() {
    index = 0;
    // 如果grouping1和grouping2相同，
    // 强制修改grouping2
    if (grouping1.value === grouping2.value && grouping2.value !== 'none') {
        grouping2.value = grouping1.value === 'stars' ? 'type' : 'stars';
    }
    if (grouping1.value === 'none') {
        grouping2.value = 'none';
    }
    saveOptionsToStorage({
        grouping1: grouping1.value,
        grouping2: grouping2.value,
        sortingPriority: sortingPriority.value,
        direction: direction.value
    })
    const dat = data.value
    if (grouping1.value === 'none') {
        displayData.value = [...dat].sort(compare);
        return;
    } else if (grouping2.value === 'none') {
        displayData.value = group(dat, grouping1.value);
    } else {
        displayData.value = group(dat, grouping1.value)
            .map((g) => {
                g.list = group(g.list, grouping2.value);
                return g;
            });
    }
}

function oddEven() {
    return (++index) % 2 ? 'navbox-odd' : 'navbox-even';
}

async function purge() {
    const { levels: pLevels, data: pData } = await dataModule.hotPurge();
    if (pLevels) {
        levels.value = pLevels;
    } else {
        mw.notify(convByVar({
            hans: "获取合法关卡列表失败。",
            hant: "獲取合法關卡列表失敗。"
        }), { type: 'error' });
    }
    if (pData) {
        data.value = pData;
    } else {
        mw.notify(convByVar({
            hans: `获取关卡${autospace("Cargo")}数据失败。`,
            hant: `獲取關卡${autospace("Cargo")}數據失敗。`
        }), { type: 'error' });
    }
    sort();
}

</script>

<template>
    <div ref="markerBefore"></div>
    <div class="navbox-above navbox-cell navbox-sole-row">
        {{ convByVar({
            hans: `本智能排序为实验性功能。当前获取到${autospace(data.length)}个关卡的数据。`,
            hant: `本智能排序為實驗性功能。當前獲取到${autospace(data.length)}個關卡的數據。`
           })
        }}
        （<a @click="purge" role="button" tabindex="0">{{ convByVar({ hans: "清除缓存", hant: "清除快取"}) }}</a>）
    </div>
    <div class="navbox-above navbox-cell navbox-sole-row navlevel-nav">
        <div class="navlevel-radio-group">
            {{ convByVar({ hans: "一级分组：", hant: "一級分組："}) }}
            <cdx-radio
                v-for="(_, key) in Grouping"
                v-model:model-value="grouping1"
                :input-value="key"
                name="grouping1"
                :inline="true"
                @update:model-value="sort"
            >{{ Grouping[key] }}</cdx-radio>
        </div>
        <div class="navlevel-radio-group">
            {{ convByVar({ hans: "二级分组：", hant: "二級分組："}) }}
            <cdx-radio
                v-for="(_, key) in Grouping"
                v-model:model-value="grouping2"
                :input-value="key"
                name="grouping2"
                :inline="true"
                :disabled="(key !== grouping1) === (grouping1 === 'none')"
                @update:model-value="sort"
            >
                <!-- 上面的!==其实是异或的意思 -->
                <!-- 也就是说，grouping1为none，则grouping2仅可为none，grouping1为非none，则grouping2不可与grouping1相同 -->
                {{ Grouping[key] }}
            </cdx-radio>
        </div>
        <div class="navlevel-radio-group">
            {{ convByVar({ hans: "排序：", hant: "排序："}) }}
            <priority-sort v-model="sortingPriority" :label-map="Sorting" @update:model-value="sort()"/>
        </div>
        <div class="navlevel-radio-group">
            <cdx-radio
                v-for="(_, key) in Direction"
                name="direction"
                :input-value="key"
                v-model:model-value="direction"
                @update:model-value="sort"
                :inline="true"
            >
                {{ Direction[key] }}
            </cdx-radio>
        </div>
    </div><!--
    <div class="navbox-above navbox-sole-row">
        <cdx-button action="progressive" @click="save">保存到用户设置</cdx-button>
    </div> -->
    <template v-if="grouping1 === 'none'">
        <div :class="'navbox-list navbox-sole-row ' + oddEven()"> 
            <h-list :levels="displayData"></h-list>
        </div>
    </template>
    <template v-else>
        <template v-if="grouping2 === 'none'">
            <template v-for="group in <Group[]>displayData">
                <div class="navbox-group navbox-cell">
                    <span class="navbox-group-flex-inner">
                        {{ group.group }}
                    </span>
                </div>
                <div :class="'navbox-list navbox-cell ' + oddEven()">
                    <h-list :levels="group.list"></h-list>
                </div>
            </template>
        </template>
        <template v-else>
            <template v-for="group in <DoubleGroup[]>displayData">
                <div v-if="group.list.length > 0" class="navbox-group navbox-cell">
                    <span class="navbox-group-flex-inner">
                        {{ group.group }}
                    </span>
                </div>
                <div v-if="group.list.length > 0"
                    class="navbox navbox-list navbox-cell navbox-level-1 mobileplainbox">
                    <template v-for="subgroup in group.list">
                        <div v-if="subgroup.list.length > 0" class="navbox-group navbox-cell">
                            <span class="navbox-group-flex-inner">
                                {{ subgroup.group }}
                            </span>
                        </div>
                        <div v-if="subgroup.list.length > 0" :class="'navbox-list navbox-cell ' + oddEven()">
                            <h-list :levels="subgroup.list"></h-list>
                        </div>
                    
                    </template>
                </div>
            </template> 
        </template>
    </template>
    <!-- 模板里面不包含navbox这个根元素 -->
    <div ref="mark"></div>
</template>

<style scoped>
.navlevel-nav {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1em;
}



.navlevel-radio-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 2px;
}
</style>
<style>
/*
 * Radio里面有复杂的定位，层级关系不能只看z-index。
 * 不应当修改Radio，保持组件独立性，隔离内部和外部。
 */
/* 在这里，本来可以用scoped从而无需限定.navlevel-sortable，
 * 但是由于标题格是传进来的，不是Vue挂载的，所以会需要
 */
.navlevel-sortable .navbox-title {
    z-index: 1;
}
</style>