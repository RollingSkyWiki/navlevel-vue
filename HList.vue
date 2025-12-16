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
                {{ extractNameFromEntry(level) }}{{ !showsBirthday || level.inDate.startsWith('?') ? '' : (level.inDate.substring(5, 10) === new Date().toISOString().substring(5, 10)) ? '🎂' : '' }}
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