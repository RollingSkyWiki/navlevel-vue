<template>
  <div class="simple-priority-example">
    <h3>排序优先级</h3>
    <p>点击任意排序方式将其置为第一优先级：</p>
    
    <PrioritySort
      v-model="sortingPriority"
    />
    
    <div class="current-order" v-if="sortingPriority.length > 0">
      <h4>当前排序顺序：</h4>
      <p>{{ sortingPriority.map(item => item.label).join(' → ') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PrioritySort from './PrioritySort.vue';

interface PriorityItem {
  label: string;
  value: string;
}

const sortingPriority = ref<PriorityItem[]>([
  { label: "默认顺序", value: "default" },
  { label: "关卡编号", value: "num" },
  { label: "星数", value: "stars" },
  { label: "关卡名称", value: "name" },
]);
</script>

<style scoped>
.simple-priority-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h3 {
  color: var(--color-base, #202122);
  margin-bottom: 12px;
}

p {
  color: var(--color-subtle, #54595d);
  margin-bottom: 20px;
}

.current-order {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--background-color-subtle, #f8f9fa);
  border-radius: var(--border-radius-base, 2px);
  border: 1px solid var(--border-color-base, #a2a9b1);
}

h4 {
  color: var(--color-base, #202122);
  margin: 0 0 8px 0;
  font-size: var(--font-size-medium, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
}

.current-order p {
  margin: 0;
  color: var(--color-base, #202122);
  font-weight: var(--font-weight-medium, 500);
}
</style>