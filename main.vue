<script lang="ts">
export type LevelEntry = prodData.LevelEntry
    & { difficulty: [number, number] | [[number, number, string], [number, number, string]]}
    & { main: LevelEntry };
export interface Group {
    group: string;
    list: LevelEntry[];
}

export interface DoubleGroup {
    group: string;
    list: Group[];
}

export interface TripleGroup {
    group: string;
    list: DoubleGroup[];
}
</script>
<script setup lang="ts">
import { CdxCheckbox, CdxRadio } from '@wikimedia/codex';
import { computed, onBeforeUpdate, onMounted, reactive, ref, watch } from 'vue';
import * as devData from './polyfill/devdata';
import * as prodData from './data';
import HList from './HList.vue';
import PrioritySort from './components/PrioritySort.vue';

import { useI18n } from 'vue-i18n';
import { autospace, rautospace } from './autospace';
import { init } from "./expose";
import Groups from './Groups.vue';

// 使用相同的策略选择数据模块
const dataModule = __NO_MW__ ? devData : prodData;
const { saveOptionsToStorage, loadOptionsFromStorage } = dataModule;



const props = defineProps<{
    recvData: LevelEntry[];
    recvLevels: string[];
    recvDifficulty: prodData.DiffcultyData;
    /** 保留的服务端渲染的DOM元素数组，在这里指"其他"一行等多个元素 */
    preserveElements: HTMLElement[];
    /** 保留的DOM元素数组，插入在内容之前 */
    preserveBeforeElements: HTMLElement[];
    titleElement: HTMLElement;
}>();

const data = ref(props.recvData);
const levels = ref(props.recvLevels);
const diffculty = props.recvDifficulty;

const { t } = useI18n();

function mergeDifficulty(levelData: prodData.LevelEntry[], difficulty: prodData.DiffcultyData) {
    for (const level of levelData) {
        const name = level.page;
        (level as LevelEntry).difficulty = difficulty[name] ?? [null, null];
    }
    return levelData;
}
mergeDifficulty(data.value, diffculty);

/**
 * 对每个关卡链接其相关主关卡。
 * @param levelData 
 */
function link(levelData: prodData.LevelEntry[]) {
    const levelDict = {} as Record<string, LevelEntry>;
    for (const level of levelData) {
        levelDict[level.page] = level as LevelEntry;
    }
    outer: for (const level of levelData) {
        const rel = level.rel;
        if (!rel) {
            (level as LevelEntry).main = level as LevelEntry;
            continue;
        }
        if (level.page === "沙滩派对" || level.page === "午夜迪斯科") {
            (level as LevelEntry).main = levelDict["沙滩派对"] || level as LevelEntry;
            // 沙滩派对是例外，不可由时间来判断
            continue;
        }
        // 除了沙滩派对和午夜迪斯科这对关卡，其余关卡的主关都是同族关卡中最早推出的
        let earliest: LevelEntry = level as LevelEntry;
        for (const related of rel) {
            const entry = levelDict[related];
            if (!entry) {
                continue;
            }
            if (entry.main) { // 如果同族关已经确定了主关卡
                (level as LevelEntry).main = entry.main;
                continue outer;
            }
            if (entry.inDate < earliest.inDate || (entry.inDate === earliest.inDate && entry.stars > earliest.stars)) {
                earliest = entry
            }
        }
        (level as LevelEntry).main = earliest;
        
    }
}


link(data.value);

const ct = (s: string) => computed(() => t(s))
// console.log(data.value.forEach((e) => console.log(e.page, e.main.page, e, e.main)));

// 使用响应式以便于后续添加
const Grouping = reactive({
    type: ct('grouping.type'),
    era: ct('grouping.era'),
    stars: ct('grouping.stars'),
    starsplus: ct('grouping.starsplus'),
    version: ct('grouping.version'),
    present: ct('grouping.present'),
    year: ct('grouping.year'),
    completeDifficulty: ct('grouping.completeDifficulty'),
    perfectDifficulty: ct('grouping.perfectDifficulty'),
    none: ct('grouping.none')
});

watch(Grouping, () => {
    Promise.resolve().then(sort);
})

type Grouping = keyof typeof Grouping;

const Sorting = reactive({
    num: ct('sorting.num'),
    name: ct('sorting.name'),
    stars: ct('sorting.stars'),
    date: ct('sorting.date'),
    completeDifficulty: ct('sorting.completeDifficulty'),
    perfectDifficulty: ct('sorting.perfectDifficulty'),
    default: ct('sorting.default')
});
watch(Sorting, () => {
    Promise.resolve().then(sort);
})

type Sorting = keyof typeof Sorting;

const Direction = {
    asc: ct('direction.asc'),
    desc: ct('direction.desc')
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
    options?.grouping1 as Grouping ?? "type"
);
const grouping2 = ref<Grouping>(
    options?.grouping2 as Grouping ?? "stars"
);
const grouping3 = ref<Grouping>(
    options?.grouping3 as Grouping ?? "starsplus"
);

const validateGrouping = (grouping: string, fallback: Grouping) => {
    return grouping in Grouping ? grouping : fallback;
};

const direction = ref<Direction>(
    options?.direction && isValidDirection(options.direction) 
        ? options.direction 
        : "asc"
);

const usesMwNativePopup = ref(false);
const showsBirthday = ref(options?.showsBirthday ?? false);
const followsMain = ref(options?.followsMain ?? false);
const validGrouping = new Set(["none", "era", "type"]);
const followsMainAvailable = computed(() =>
    validGrouping.has(grouping1.value) && validGrouping.has(grouping2.value))
// 若要使用跟随主关，必须使用上面三种分组

const defaultSorting: Sorting[] = ['default', 'num', 'date', 'name', 'stars']

// 排序优先级，使用fallback逻辑，兼容旧数据
const sortingPriority = ref<Sorting[]>(
    options?.sortingPriority as Sorting[] ?? defaultSorting
);

const validateSortingPriority = (priority: Sorting[]) => {
    // 若优先级数组中有不合法项，使用默认排序
    if (priority.some(item => !isValidSorting(item))) {
        return defaultSorting;
    }
    // 若优先级数组的长度不匹配Sorting的键值对个数，但并没有不合法项，则追加那些选项到末尾
    if (priority.length !== Object.keys(Sorting).length) {
        priority.push(...Object.keys(Sorting).filter(item => !priority.includes(item as Sorting)) as Sorting[]);
    }
    return priority;
};

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
    return sortingFunctions[basis] || (() => 0);
}

function compare(a: LevelEntry, b: LevelEntry) {
    if (followsMain.value && followsMainAvailable.value) {
        if (a.main.page !== b.main.page) {
            a = a.main;
            b = b.main;
        } else {
            if (a.main.page === a.page) {
                return -1;
            } else if (b.main.page === b.page) {
                return 1;
            }
            return a.main.rel.indexOf(a.page) - a.main.rel.indexOf(b.page);
        }
    }
    const prio = validateSortingPriority(sortingPriority.value);
    for (let i = 0; i < prio.length; i++) {
        const c = rawCompare(prio[i])(a, b);
        if (c !== 0) return c * (direction.value === "asc" ? 1 : -1);
    }
    return 0;
}

function unwrapCanBeArray(canBeArray: any, i: number)  {
    return Array.isArray(canBeArray) ? canBeArray[i] : canBeArray;
}
/**
 * 
 * @param entry 
 * @param i 在难度数组中的位置（平民0，完美1）
 */
function intDifficultyOf(entry: LevelEntry, i: number) {
    const diff = entry.difficulty;
    const rawComplete = unwrapCanBeArray(diff[i], 0);
    if (!rawComplete) {
        return entry.stars;
    } else if (typeof rawComplete === "string") {
        return parseInt(rawComplete);
    } else { // 这里认为是数字
        return Math.floor(rawComplete);
    }
}

function diffcultyOf(entry: LevelEntry, i: number) {
    const diff = entry.difficulty;
    const rawComplete = unwrapCanBeArray(diff[i], 0);
    if (!rawComplete) {
        return entry.stars - 0.01; // 保证这些未填入数据的关卡难度值在最小的之前
    } else if (typeof rawComplete === "string") {
        return parseInt(rawComplete) - 0.01;
    } else { // 这里认为是数字
        return rawComplete;
    }
}

const groupingFunctions = {
    era(entries: LevelEntry[]) {
        return [
            {
                group: t('era.chili'),
                list: entries.filter(entry =>
                    entry.type === "官方" && entry.inDate <= "2016-06-05"
                ) // 俄方（8）
            },
            {
                group: t('era.cheetah'),
                list: entries.filter(entry =>
                    entry.type === "官方" && entry.inDate >= "2016-06-06" && entry.inDate <= "2020-07-01"
                )
            },
            {
                group: t('era.minimax'),
                list: entries.filter(entry => entry.inDate > "2020-07-01"
                )
            }
        ]
    },
    version(entries: LevelEntry[]) {
        const seenVersions = new Set<string>();
        entries.forEach(entry => seenVersions.add(entry.inVer.substring(0, 1)));
        if (seenVersions.has("2")) {
            seenVersions.delete("3");
        }
        const versions = Array.from(seenVersions).sort((a, b) => a.localeCompare(b));
        return versions.map(v => ({
            group: v === "2" ? "2.x / 3.x" : v + ".x",
            list: v === "2"
                ? entries.filter(entry => entry.inVer.startsWith("2") || entry.inVer.startsWith("3"))
                : entries.filter(entry => entry.inVer.startsWith(v))
        }));
    },
    type(entries: LevelEntry[]) {
        return [
            {
                group: t('type.official'),
                list: entries.filter(entry => entry.type === "官方")
            },
            {
                group: t('type.cocreation'),
                list: entries.filter(entry => entry.type === "共创")
            },
            {
                group: t('type.event'),
                list: entries.filter(entry => entry.type === "活动")
            },
            {
                group: t('type.fanmade'),
                list: entries.filter(entry => entry.type === "饭制")
            }
        ]
    },
    stars(entries: LevelEntry[]) {
        const seenStars = new Set<number>();
        entries.forEach(entry => seenStars.add(entry.stars));
        const stars = Array.from(seenStars).sort((a, b) => a - b);
        return stars.map(star => {
            return {
                group: rautospace(star.toString()) + t('stars.star', star),
                list: entries.filter(entry => entry.stars === star)
            }
        });
    },
    starsplus(entries: LevelEntry[]) {
        const nonPlus = [], plus = [];
        for (const entry of entries) {
            (entry.plus ? plus : nonPlus).push(entry);
        }
        const result = [];
        if (nonPlus.length > 0) {
            result.push({
                group: t('stars.blueStar'),
                list: nonPlus
            });
        }
        if (plus.length > 0) {
            result.push({
                group: t('stars.purpleStar'),
                list: plus
            });
        }
        return result;
    },
    year(entries: LevelEntry[]) {
        const seenYears = new Set<string>();
        entries.forEach(entry => seenYears.add(entry.inDate.substring(0, 4)));
        const emptyYears = new Set<string>();
        seenYears.forEach(year => {
            if (year.trim() === "") {
                emptyYears.add(year);
            }
        });
        emptyYears.forEach(year => seenYears.delete(year));
        const years = Array.from(seenYears).sort((a, b) => parseInt(a) - parseInt(b));
        return years.map(y => ({
            group: y,
            list: entries.filter(entry => entry.inDate.startsWith(y))
        }))
    },
    present(entries: LevelEntry[]) {
        const unknown = entries.filter(entry => !["crown", "present", "none"].includes(entry.award))
        const groups = [
            {
                group: t('present.crown'),
                list: entries.filter(entry => entry.award === "crown"),
            },
            {
                group: t('present.mysteryBox'),
                list: entries.filter(entry => entry.award === "present"),
            },
            {
                group: t('present.none'),
                list: entries.filter(entry => entry.award === "none"),
            }
        ];
        if (unknown.length > 0) {
            groups.push({
                group: t('present.unknown'),
                list: unknown
            });
        }
        return groups;
    },
    completeDifficulty(entries: LevelEntry[]) { 
        const integers = new Set<number>();
        for (const entry of entries) {
            integers.add(intDifficultyOf(entry, 0));
        }
        return Array.from(integers)
            .sort((a, b) => a - b)
            .map((stars) => ({
                group: stars + ".x",
                list: entries.filter(entry => 
                    intDifficultyOf(entry, 0) === stars
                )
            }))
    },
    perfectDifficulty(entries: LevelEntry[]) {
        const integers = new Set<number>();
        for (const entry of entries) {
            integers.add(intDifficultyOf(entry, 1));
        }
        return Array.from(integers)
            .sort((a, b) => a - b)
            .map((stars) => ({
                group: stars + ".x",
                list: entries.filter(entry => 
                    intDifficultyOf(entry, 1) === stars
                )
            }))
    },
    // 只是个占位符
    none(entries: LevelEntry[]) {
        return entries as unknown as { group: string, list: LevelEntry[] }[];
    }
} satisfies Record<Grouping, (entries: LevelEntry[]) => { group: string, list: LevelEntry[] }[]>;

const sortingFunctions = {
    num: (a: LevelEntry, b: LevelEntry): number => {
        const ord = ["官方", "共创", "饭制", "活动"];
        return ord.indexOf(a.type) - ord.indexOf(b.type) || a.num - b.num;
    },
    name: (a: LevelEntry, b: LevelEntry): number => {
        return a.name.localeCompare(b.name);
    },
    stars: (a: LevelEntry, b: LevelEntry): number => {
        return a.stars - b.stars;
    },
    date: (a: LevelEntry, b: LevelEntry): number => {
        return a.inDate.localeCompare(b.inDate);
    },
    completeDifficulty: (a: LevelEntry, b: LevelEntry): number => {
        return diffcultyOf(a, 0) - diffcultyOf(b, 0);
    },
    perfectDifficulty: (a: LevelEntry, b: LevelEntry): number => {
        return diffcultyOf(a, 1) - diffcultyOf(b, 1);
    },
    default: (a: LevelEntry, b: LevelEntry): number => {
        const levs = levels.value;
        return levs.indexOf(a.page) - levs.indexOf(b.page);
    }
} satisfies Record<Sorting, (a: LevelEntry, b: LevelEntry) => number>;

const processPopup = init(Sorting, sortingFunctions, sortingPriority.value, Grouping, groupingFunctions);

function rawgroup(entries: LevelEntry[], grouping: Grouping) {
    return groupingFunctions[grouping](entries);
}
/** 分组并排序 */
function group(entries: LevelEntry[], grouping: Grouping) {
    return rawgroup(entries, grouping).map(g => {
        g.list = g.list.sort(compare);
        return g;
    });
}



/** 用于奇偶行的索引值，每行自增1 */
let index = 0;
const resetIndex = () => {
    index = 0;
}

function saveOptions() {
    saveOptionsToStorage({
        grouping1: grouping1.value,
        grouping2: grouping2.value,
        grouping3: grouping3.value,
        sortingPriority: sortingPriority.value,
        direction: direction.value,
        showsBirthday: showsBirthday.value,
        followsMain: followsMain.value
    })
}

function sort() {
    console.log("Sorting...");
    // 如果grouping1和grouping2相同，
    // 强制修改grouping2
    const vgrouping1 = validateGrouping(grouping1.value, "type") as Grouping;
    let vgrouping2 = validateGrouping(grouping2.value, "stars") as Grouping;
    let vgrouping3 = validateGrouping(grouping3.value, "starsplus") as Grouping;

    if (vgrouping1 === vgrouping2 && vgrouping2 !== 'none') {
        grouping2.value = vgrouping2 = vgrouping1 === 'stars' ? 'type' : 'stars';
    }
    if (vgrouping2 === vgrouping3 && vgrouping3 !== 'none') {
        grouping3.value = vgrouping3 = vgrouping2 === 'starsplus' ? 'none' : 'starsplus';
    }
    if (vgrouping1 === 'none') {
        grouping2.value = 'none';
    }
    if (grouping2.value === 'none') {
        grouping3.value = 'none';
    }
    saveOptions();
    const dat = data.value
    if (vgrouping1 === 'none') {
        displayData.value = [...dat].sort(compare);
        return;
    } else if (vgrouping2 === 'none') {
        displayData.value = group(dat, vgrouping1);
    } else if (vgrouping3 === 'none') {
        displayData.value = group(dat, vgrouping1)
            .map((g) => {
                (g as unknown as DoubleGroup).list = group(g.list, vgrouping2);
                return g;
            });
    } else {
        displayData.value = group(dat, vgrouping1)
            .map((g) => {
                (g as unknown as DoubleGroup).list = group(g.list, vgrouping2)
                    .map((sg) => {
                        (sg as unknown as TripleGroup).list = group(sg.list, vgrouping3);
                        return sg;
                    });
                return g;
            });
    }
}

function oddEven() {
    return (++index) % 2 ? 'navbox-odd' : 'navbox-even';
}

async function purge() {
    const { levels: pLevels, data: pData, difficulty: pDifficulty } = await dataModule.hotPurge();
    if (pLevels) {
        levels.value = pLevels;
    } else {
        mw.notify(t('notify.fetchLevelsFailed'), { type: 'error' });
    }
    if (pData) {
        // @ts-expect-error 这里会对data带来副作用
        data.value = mergeDifficulty(pData, pDifficulty);
        link(data.value);
    } else {
        mw.notify(t('notify.fetchCargoFailed', { cargo: autospace("Cargo") }), { type: 'error' });
    }
    if (pLevels || pData) {
        mw?.notify?.(t('notify.dataUpdated', {
            records: rautospace(data.value.length),
            levels: rautospace(levels.value.length)
        }));
    }
    sort();
}

onBeforeUpdate(() => {
    resetIndex();
})
const LEV = t('common.level');

</script>

<template>
    <div ref="markerBefore"></div>
    <div class="navbox-above navbox-cell navbox-sole-row">
        {{ t('info.experimental', { count: autospace(data.length) }) }}
        （<a @click="purge" @keydown.enter.prevent="purge" @keydown.space.prevent="purge" role="button" tabindex="0">{{ t('actions.clearCache') }}</a>）
    </div>
    <div class="navbox-above navbox-cell navbox-sole-row navlevel-nav">
        <div class="navlevel-radio-group">
            {{ t('labels.primaryGroup') }}
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
            {{ t('labels.secondaryGroup') }}
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
            {{ t('labels.tertiaryGroup') }}
            <cdx-radio
                v-for="(_, key) in Grouping"
                v-model:model-value="grouping3"
                :input-value="key"
                name="grouping3"
                :inline="true"
                :disabled="(key !== grouping2) === (grouping2 === 'none') || (key !== grouping1) === (grouping1 === 'none')"
                @update:model-value="sort"
            >
                {{ Grouping[key] }}
            </cdx-radio>
        </div>
        <div class="navlevel-radio-group">
            {{ t('labels.sort') }}
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
        <div class="navlevel-radio-group">
            <cdx-checkbox :inline="true" v-model:model-value="usesMwNativePopup">{{ t('options.showMwPopup') }}</cdx-checkbox>
            <cdx-checkbox :inline="true" v-model:model-value="showsBirthday" @update:model-value="saveOptions()">{{ t('options.showBirthday') }}</cdx-checkbox>
            <cdx-checkbox :inline="true" v-model:model-value="followsMain" @update:model-value="saveOptions();sort()">{{ followsMainAvailable ? t('options.bindFamily')
                : t('options.highlightMain') }}</cdx-checkbox>
        </div>
    </div><!--
    <div class="navbox-above navbox-sole-row">
        <cdx-button action="progressive" @click="save">保存到用户设置</cdx-button>
    </div> -->
    <template v-if="grouping1 === 'none'">
        <div :class="'navbox-list navbox-sole-row ' + oddEven()"> 
            <h-list :levels="displayData"
                    :uses-mw-native-popup="usesMwNativePopup"
                    :shows-birthday="showsBirthday"
                    :process-popup="processPopup"
                    :follows-main="followsMain"></h-list>
        </div>
    </template>
    <template v-else>
        <template v-for="group in displayData">
        <groups
            :level="1"
            :groupings="[grouping1, grouping2, grouping3]"
            :group
            :follows-main="followsMain"
            :uses-mw-native-popup="usesMwNativePopup"
            :shows-birthday="showsBirthday"
            :process-popup="processPopup"
            :odd-even="oddEven" />
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
    gap: 0.2em 1em;
}



.navlevel-radio-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 2px;
}

a[role="button"] {
    cursor: pointer;
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

.navbox.navlevel-sortable, .navlevel-sortable .navbox {
    overflow: visible !important;
}
</style>