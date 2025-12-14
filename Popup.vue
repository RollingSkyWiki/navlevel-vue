<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';



const span = ref<HTMLSpanElement | null>(null);
const div = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    await nextTick();
    const ele = div.value;
    const rect = ele.getBoundingClientRect();
    // 判定是否超出视窗
    console.log('Rect:', rect, window.innerWidth);
    if (rect.right > window.innerWidth) {
        console.log('Out of viewport', span.value.parentElement.clientWidth);
        ele.style.right = span.value.parentElement.firstElementChild.getBoundingClientRect().width + "px";
        ele.style.left = "unset";
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
    top: 0;
    left: 0;
    background-color: var(--background-color, #ddd);
    border-radius: 4px;
    padding: 0.5em;
    z-index: 0;
    box-shadow: 1px 1px 5px hsl(0 0 calc(100% * var(--rswiki-dark-mode-enabled, 0)));
}
</style>