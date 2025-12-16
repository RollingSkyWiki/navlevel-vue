<script setup lang="ts">
import { reactive, ref } from 'vue';

import { type LevelEntry } from './data';
import { convByVar } from './hanassist';
import { getVariantedLevelName } from './variants';
import { isCurrentPage as icp1 } from './data';
import { isCurrentPage as icp2 } from './polyfill/devdata';
import { rautospace } from './autospace';
import PopupVue from './Popup.vue';

const isCurrentPage = import.meta.env.PROD ? icp1 : icp2;

defineProps<{
    levels: LevelEntry[];
    usesMwNativePopup: boolean;
    showsBirthday: boolean;
    processPopup: (level: LevelEntry, div: HTMLDivElement) => void;
}>();


/**
 * 如果带繁简转换的中文名，则返回当前用户的语言环境下对应的名称
 * @param name 
 */
function extractName(name: string) {
    const match = name.match(/\-\{\s*zh\-hans:\s*(.*?)\s*;\s*zh\-hant:\s*(.*?)\s*\}\-/);
    if (match) {
        return convByVar({
            hans: match[1],
            hant: match[2]
        })
    } else {
        return name;
    }
}

function extractNameFromEntry(entry: LevelEntry) {
    // return entry.name ? extractName(entry.name) : entry.page;
    return getVariantedLevelName(entry.page);
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
</script>
<template>
    <ul class="hlist">
        <li v-for="level in levels">
            <a :href="isCurrentPage(level.page) ? undefined : `/wiki/${encodeURI(level.page)}`"
            @mouseover="focusLevel(level)"
            @touchstart="focusLevel(level)"
            @focus="focusLevel(level)"
            :class="isCurrentPage(level.page) ? 'mw-selflink selflink' : ''"
            :title="usesMwNativePopup ? extractNameFromEntry(level) : undefined"
            >
                {{ extractNameFromEntry(level) }}{{ showsBirthday && todayIsBirthday(level) ? '🎂' : '' }}
            </a>
            <popup-vue v-if="focusedLevel === level" :process="(div) => processPopup(level, div)">
                <span style="font-weight: bold;">
                    {{ `${level.type === '官方' ? 'Lv.' : 'Co.'}${level.num} ${extractNameFromEntry(level)} ${'★'.repeat(level.stars)}` }}
                </span><br>
                {{ `${level.award === 'crown' ? '3👑 ' : level.award === 'present' ? '10🎁 ' : ''}${level.dia}💎` }}
                <br>
                <a :href="'/wiki/' + level.inVer">{{ level.inVer }}</a>{{ `(${level.inDate || '????-??-??'})${convByVar({ hans: '版本加入游戏', hant: '版本加入遊戲'})}` }}
            </popup-vue>
        </li>
    </ul>
</template>

<style scoped>
li:hover :deep(.navlevel-popup > div), li:focus-within :deep(.navlevel-popup > div) {
    display: block;
}
</style>