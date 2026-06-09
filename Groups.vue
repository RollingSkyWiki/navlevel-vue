<script setup lang="ts">
    import { rautospace } from './autospace.ts';
import Groups from './Groups.vue';
import { useI18n } from 'vue-i18n';
    import HList from './HList.vue';
    import type { DoubleGroup, Group, LevelEntry, TripleGroup } from './Main.vue';
    const {
        level,
        groupings,
        group,
        followsMain,
        usesMwNativePopup,
        showsBirthday,
        processPopup,
        oddEven,
    } = defineProps<{
        level: number;
        groupings: string[];
        group: Group | DoubleGroup | TripleGroup;
        followsMain: boolean;
        usesMwNativePopup: boolean;
        showsBirthday: boolean;
        processPopup: (entry: LevelEntry, div: HTMLDivElement) => void;
        oddEven: () => string;
    }>();
    const { t } = useI18n();
    const isEmpty = (g: Group | DoubleGroup | TripleGroup) => {
        return g.list.length === 0 || ("group" in g.list[0] && g.list.every(g => isEmpty(g)));
    }
</script>
<template>
    <template v-if="!isEmpty(group)">
        <div class="navbox-group navbox-cell">
            <span class="navbox-group-flex-inner" :title="`${rautospace(group.list.length)}${t('common.level', group.list.length)}`">
                {{ group.group }}
            </span>
        </div>
        <template v-if="groupings.length <= 1 || groupings[1] === 'none'">
            <div :class="('navbox-list navbox-cell ' + oddEven())">
                <h-list :levels="<LevelEntry[]>group.list"
                        :uses-mw-native-popup="usesMwNativePopup"
                        :shows-birthday="showsBirthday"
                        :process-popup="processPopup"
                        :follows-main="followsMain"></h-list>
            </div>
        </template>
        <template v-else>
            <div :class="`navbox-list navbox navbox-cell navbox-level-${level} ${level === 1 ? 'mobileplainbox' : ''}`">
                <template v-for="subgroup in <Group[] | DoubleGroup[]>group.list">
                <groups
                    :level="level + 1"
                    :groupings="groupings.slice(1)"
                    :group="subgroup"
                    :follows-main="followsMain"
                    :uses-mw-native-popup="usesMwNativePopup"
                    :shows-birthday="showsBirthday"
                    :process-popup="processPopup"
                    :odd-even="oddEven" />
                </template>
            </div>
        </template>
    </template>
</template>