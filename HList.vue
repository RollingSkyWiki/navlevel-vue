<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { type LevelEntry as PartialLevelEntry } from './data';
import { getVariantedLevelName } from './variants';
import { isCurrentPage as icp1 } from './data';
import { isCurrentPage as icp2 } from './polyfill/devdata';
import { rautospace } from './autospace';
import PopupVue from './Popup.vue';
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const isCurrentPage = (!__NO_MW__) ? icp1 : icp2;

type LevelEntry = PartialLevelEntry & { difficulty: [number, number] | [[number, number, string], [number, number, string]] }

const props = defineProps<{
    levels: LevelEntry[];
    usesMwNativePopup: boolean;
    showsBirthday: boolean;
    followsMain: boolean;
    processPopup: (level: LevelEntry, div: HTMLDivElement) => void;
}>();




function extractNameFromEntry(entry: LevelEntry) {
    // return entry.name ? extractName(entry.name) : entry.page;
    return getVariantedLevelName(entry.page);
}

function nameCanEn(entry: LevelEntry) {
    
    return computed(() => !locale.value.startsWith("zh") ? entry.en + (entry.versyb && entry.page.includes("（") ? ("[" + entry.versyb + "]") : "") : getVariantedLevelName(entry.page));
}

const focusedLevel = ref<LevelEntry | null>(null);

function focusLevel(level: LevelEntry) {
    setTimeout(() => focusedLevel.value = level, 200);
}

function todayIsBirthday(level: LevelEntry) {
    const inDate = level.inDate;
    if (inDate.startsWith('?')) return false;
    const m = Number(inDate.substring(5, 7));
    const d = Number(inDate.substring(8, 10));
    const today = new Date();
    const todayStr = today.toLocaleDateString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    })
    const tm = Number(todayStr.substring(5, 7));
    const td = Number(todayStr.substring(8, 10));
    return m === tm && d === td;
}

function numOrNull(num: number | null) {
    return !num ? "?.?" : (num.toFixed?.(1) || num);
}

function difficulty(difficulty: [number, number] | [number, number, string]) {
    if (!difficulty) {
        return "?.?/?.?"
    } else if (difficulty[2]) {
        return `${numOrNull(difficulty[0])}/${numOrNull(difficulty[1])}（${difficulty[2]}）`
    } else {
        return `${numOrNull(difficulty[0])}/${numOrNull(difficulty[1])}`
    }
}
const _HOST = HOST

</script>
<template>
    <ul class="hlist">
        <li v-for="level in levels">
            <a :href="isCurrentPage(level.page) ? undefined : (_HOST + `/wiki/${encodeURI(level.page)}`)"
            @mouseover="focusLevel(level)"
            @touchstart="focusLevel(level)"
            @focus="focusLevel(level)"
            :class="isCurrentPage(level.page) ? 'mw-selflink selflink' : ''"
            :style=" {fontWeight: followsMain && (level as LevelEntry & {main: LevelEntry}).main === level ? 'bold' : ''} "
            :title="usesMwNativePopup ? extractNameFromEntry(level) : undefined"
            >
                {{ nameCanEn(level) }}{{ showsBirthday && todayIsBirthday(level) ? '🎂' : '' }}
            </a>
            <popup-vue v-if="focusedLevel === level" :process="(div) => processPopup(level, div)">
                <span style="font-weight: bold;">
                    {{ `${ {
                        '官方': 'Lv.',
                        '共创': 'Co.',
                        '饭制': 'Fan.',
                        '活动': 'Sp.'
                    }[level.type] || '??' }${level.num}${level.versyb ? '[' + level.versyb + ']' : ''} ${extractNameFromEntry(level)} ${level.en !== level.page ? level.en : ""}
${(level.type === '活动' ? '😃' : '★').repeat(level.stars)}${level.plus ? '☆' : ''}` }}
                </span><br>
                {{ `${level.award === 'crown' ? '3👑 ' : level.award === 'present' ? '10🎁 ' : ''}${level.dia}💎` }}
                <br>
                <span v-if="Array.isArray(level.difficulty?.[0])" style="font-size: 120%;">
                    {{ difficulty(level.difficulty[0]) }}<br/>
                    {{ difficulty(level.difficulty[1] as [number, number, string]) }}
                </span>
                <span v-else style="font-size: 140%;">
                    {{ difficulty(level.difficulty as [number, number]) }}
                </span>
                <br/>
                <span style="font-weight: bold;">{{ level.songType?.join("/") || t('common.unknown') }}</span>
                &nbsp;
                <span v-if="level.authors">by</span>
                &nbsp;
                <span v-if="level.authors" style="font-weight: bold;"> {{level.authors?.join("&") ?? "" }}</span>
                <br/>
                {{ t("hlist.versionAdded.pre") }}<a :href="'/wiki/' + level.inVer">{{ level.inVer }}</a>{{ `(${level.inDate || '????-??-??'})${t('hlist.versionAdded.post')}` }}
            </popup-vue>
        </li>
    </ul>
</template>

<style scoped>
li:hover :deep(.navlevel-popup > div), li:focus-within :deep(.navlevel-popup > div) {
    display: block;
}
</style>