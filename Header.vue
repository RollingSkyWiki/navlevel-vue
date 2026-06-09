<script setup lang="ts">
import { CdxRadio } from '@wikimedia/codex';
import { watch } from 'vue';
import { ref } from 'vue';
import { useI18n } from "vue-i18n";

const selectedLanguage = ref('zh-hans');

const { locale } = useI18n();

const setLocale = (lang: string) => {
    locale.value = lang;
}
</script>

<template>
    <div class="header">
        Languages:
        <cdx-radio
            v-for="(lang, _) in [{ label: '简体中文', value: 'zh-hans' }, { label: '繁体中文', value: 'zh-hant' }, { label: 'English', value: 'en' }]"
            v-model:model-value="selectedLanguage"
            :input-value="lang.value"
            :key="lang.value"
            :inline="true"
            @update:model-value="setLocale(selectedLanguage)"
            name="lang"
        >{{ lang.label }}</cdx-radio>
    </div>
</template>