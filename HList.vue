<script setup lang="ts"> 
import { type LevelEntry } from './data';
import { convByVar } from './hanassist';
import { getVariantedLevelName } from './variants';
import { isCurrentPage as icp1 } from './data';
import { isCurrentPage as icp2 } from './polyfill/devdata';

const isCurrentPage = import.meta.env.PROD ? icp1 : icp2;

defineProps<{
    levels: LevelEntry[];
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



</script>
<template>
    <ul class="hlist">
        <li v-for="level in levels">
            <a :href="isCurrentPage(level.page) ? undefined : `/wiki/${encodeURI(level.page)}`" :title="
`${level.type === '官方' ? 'Lv.' : 'Co.'}${level.num} ${extractNameFromEntry(level)} ${'★'.repeat(level.stars)}`
            "
            :class="isCurrentPage(level.page) ? 'mw-selflink selflink' : ''"
            >
                {{ extractNameFromEntry(level) }}
            </a> 
        </li>
    </ul>
</template>