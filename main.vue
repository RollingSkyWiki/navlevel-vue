<script setup lang="ts">
import { CdxRadio } from '@wikimedia/codex';
import { onMounted, ref } from 'vue';
import { type LevelEntry } from './data';

const props = defineProps<{
    data: LevelEntry[];
    levels: string[];
    /** 保留的服务端渲染的DOM元素数组，在这里指"其他"一行等多个元素 */
    preservedElements: HTMLElement[];
    titleElement: HTMLElement;
}>();



enum Grouping {
    type = "类型",
    status = "主副",
    year = "年份",
    stars = "星数",
    none = "无"
}

enum Sorting {
    date = "日期",
    name = "名称",
    stars = "星数",
    default = "默认"
}

// 默认分组
const grouping1 = ref(Grouping.type);
const grouping2 = ref(Grouping.stars);
// 默认排序
const sorting = ref(Sorting.default);

const mark = ref<HTMLElement>(null)

const displayData = ref<any>({});

function a() {

}

onMounted(() => {
    // 组件挂载时，把所有preservedElements依次插入到mark元素后面
    if (mark.value && props.preservedElements?.length) {
        let referenceNode = mark.value;
        props.preservedElements.forEach((element) => {
            if (element && referenceNode.parentNode) {
                referenceNode.parentNode.insertBefore(element, referenceNode.nextSibling);
                referenceNode = element; // 更新参考节点为刚插入的元素
            }
        });
        // 移除mark元素
        // 卸磨杀驴（划掉
        mark.value.remove();
    }
})

function sort() {
    // 如果grouping1和grouping2相同，
    // 强制修改grouping2
    if (grouping1.value === grouping2.value && grouping2.value !== Grouping.none) {
        grouping2.value = grouping1.value === Grouping.stars ? Grouping.status : Grouping.stars;
    }
    if (grouping1.value === Grouping.none) {
        grouping2.value = Grouping.none;
        displayData.value = [...props.data].sort((a, b) => {
            switch (sorting.value) {
                case Sorting.date:
                    return a.date.localeCompare(b.date);
                case Sorting.name:
                    return a.name.localeCompare(b.name);
                case Sorting.stars:
                    return b.stars - a.stars;
                case Sorting.default:
                    // 使用levels里面的顺序
                    return props.levels.indexOf(a.page) - props.levels.indexOf(b.page);
                default:
                    return 0;
            }
        })
    }
}

</script>

<template>
    <div class="navbox-above navbox-sole-row navlevel-nav">
        <div class="navlevel-radio-group">
            一级分组：
            <cdx-radio
                v-for="(grouping, _name) in Grouping"
                v-model:model-value="grouping1"
                :input-value="grouping"
                name="grouping1"
                :inline="true"
                @update:model-value="sort"
            >{{ grouping }}</cdx-radio>
        </div>
        <div class="navlevel-radio-group">
            二级分组：
            <cdx-radio
                v-for="(grouping, _name) in Grouping"
                v-model:model-value="grouping2"
                :input-value="grouping"
                name="grouping2"
                :inline="true"
                v-show="(grouping !== grouping1) !== (grouping1 === Grouping.none)"
                @update:model-value="sort"
            >
            <!-- 上面的!==其实是异或的意思 -->
            <!-- 也就是说，grouping1为none，则grouping2仅可为none，grouping1为非none，则grouping2不可与grouping1相同 -->
            {{ grouping }}</cdx-radio>
        </div>
    </div>
    <template v-if="grouping1 === Grouping.none">
        <div class="navbox-list navbox-sole-row"> 
        <ul>
            <li v-for="level in displayData">
                <a :href="level.name">{{ level.page }}</a>
            </li>
        </ul>
        </div>
    </template>
    <template v-else>
    </template>
    <!-- 模板里面不包含navbox这个根元素 -->
    <div ref="mark"></div>
</template>

<style scoped>
.navlevel-nav {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2px 1em;
}
.navlevel-radio-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px;
}
</style>