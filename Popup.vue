<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';



const span = ref<HTMLSpanElement | null>(null);
const div = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    await nextTick();
    const ele = div.value;
    const rect = ele.getBoundingClientRect();
    // 判定是否超出视窗
    if (rect.right > window.innerWidth) {
        ele.style.top = "100%"
        ele.style.left = `${window.innerWidth - rect.right - 15}px`;
    }
    if (rect.y < window.innerHeight / 2) {
        ele.style.bottom = "100%";
        ele.style.top = "unset";
    }
});

</script>

<template>
    <span class="navlevel-popup" ref="span">
        <div ref="div">
            <slot></slot>
        </div>
    </span>
</template>

<style scoped>

.navlevel-popup {
    position: relative;
}

.navlevel-popup > div {
    position: absolute;
    width: max-content;
    display: none;
    font-size: 80%;
    top: 0;
    left: 0;
    background-color: var(--background-color, #ddd);
    border-radius: 4px;
    padding: 0.5em;
    z-index: 0;
    box-shadow: 1px 1px 5px hsl(0 0 calc(100% * var(--rswiki-dark-mode-enabled, 0)));
}
</style>