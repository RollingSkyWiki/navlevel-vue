<template>
  <div class="level-priority-example">
    <h3>关卡排序优先级设置</h3>
    <p>选择您希望关卡按照哪些条件进行排序，以及排序的优先级：</p>
    
    <PrioritySort
      v-model="sortingPriority"
      label="排序方式优先级"
      help-text="启用的项目将按照优先级从高到低进行排序。您可以通过拖拽或箭头按钮来调整优先级。"
      allow-reset
      reset-text="恢复默认排序"
      :default-items="defaultSortingPriority"
      @change="handlePriorityChange"
    />
    
    <div class="current-priority-display" v-if="enabledSortingMethods.length > 0">
      <h4>当前排序优先级：</h4>
      <ol class="priority-list">
        <li v-for="(method, index) in enabledSortingMethods" :key="method" class="priority-item">
          {{ getSortingMethodLabel(method) }}
          <span class="priority-hint">({{ getSortingMethodDescription(method) }})</span>
        </li>
      </ol>
    </div>
    
    <div class="example-result" v-if="sortedLevels.length > 0">
      <h4>排序预览：</h4>
      <div class="level-preview">
        <div v-for="(level, index) in sortedLevels.slice(0, 5)" :key="level.page" class="level-item">
          <span class="level-rank">{{ index + 1 }}.</span>
          <span class="level-name">{{ level.name }}</span>
          <span class="level-type">{{ level.type }}</span>
          <span class="level-stars">{{ level.stars }}星</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import PrioritySort from './PrioritySort.vue';
import { LevelEntry } from './data';

// 示例关卡数据
const exampleLevels: LevelEntry[] = [
  { name: "辣椒1", num: 1, page: "1", type: "官方", stars: 1, inVer: "", remVer: "", resVer: "" },
  { name: "辣椒2", num: 2, page: "2", type: "官方", stars: 2, inVer: "", remVer: "", resVer: "" },
  { name: "共创关卡1", num: 100, page: "100", type: "共创", stars: 3, inVer: "", remVer: "", resVer: "" },
  { name: "猎豹1", num: 8, page: "8", type: "官方", stars: 1, inVer: "", remVer: "", resVer: "" },
  { name: "猎豹2", num: 9, page: "9", type: "官方", stars: 4, inVer: "", remVer: "", resVer: "" },
];

interface SortingPriorityItem {
  label: string;
  value: string;
  enabled: boolean;
  disabled: boolean;
}

// 默认排序优先级
const defaultSortingPriority: SortingPriorityItem[] = [
  { label: "默认顺序", value: "default", enabled: true, disabled: false },
  { label: "关卡编号", value: "num", enabled: false, disabled: false },
  { label: "关卡名称", value: "name", enabled: false, disabled: false },
  { label: "星数", value: "stars", enabled: false, disabled: false },
  { label: "关卡类型", value: "type", enabled: false, disabled: false },
];

const sortingPriority = ref<SortingPriorityItem[]>([...defaultSortingPriority]);

// 获取启用的排序方法
const enabledSortingMethods = computed(() => {
  return sortingPriority.value
    .filter(item => item.enabled && !item.disabled)
    .map(item => item.value);
});

// 根据优先级排序关卡
const sortedLevels = computed(() => {
  if (enabledSortingMethods.value.length === 0) {
    return [...exampleLevels];
  }

  return [...exampleLevels].sort((a, b) => {
    for (const method of enabledSortingMethods.value) {
      const result = compareLevels(a, b, method);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  });
});

// 比较两个关卡
const compareLevels = (a: LevelEntry, b: LevelEntry, method: string): number => {
  switch (method) {
    case 'default':
      return 0; // 保持原顺序
    case 'num':
      return a.num - b.num;
    case 'name':
      return a.name.localeCompare(b.name);
    case 'stars':
      return a.stars - b.stars;
    case 'type':
      // 官方关卡优先
      if (a.type === "官方" && b.type === "共创") return -1;
      if (a.type === "共创" && b.type === "官方") return 1;
      return 0;
    default:
      return 0;
  }
};

// 获取排序方法标签
const getSortingMethodLabel = (method: string): string => {
  const item = sortingPriority.value.find(item => item.value === method);
  return item ? item.label : method;
};

// 获取排序方法描述
const getSortingMethodDescription = (method: string): string => {
  const descriptions = {
    'default': '按照维基页面中定义的默认顺序',
    'num': '按照关卡编号从小到大排序',
    'name': '按照关卡名称的字母顺序排序',
    'stars': '按照星数从小到大排序',
    'type': '官方关卡优先于共创关卡'
  };
  return descriptions[method] || '';
};

// 处理优先级变化
const handlePriorityChange = (newPriority: SortingPriorityItem[]) => {
  console.log('排序优先级已更新:', newPriority);
  // 这里可以触发重新排序或保存设置
};
</script>

<style scoped>
.level-priority-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h3, h4 {
  color: var(--color-base, #202122);
  margin-bottom: 12px;
}

p {
  color: var(--color-subtle, #54595d);
  margin-bottom: 20px;
  line-height: var(--line-height-small, 1.4);
}

.current-priority-display {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--background-color-subtle, #f8f9fa);
  border-radius: var(--border-radius-base, 2px);
  border: 1px solid var(--border-color-base, #a2a9b1);
}

.priority-list {
  margin: 12px 0 0 20px;
  padding: 0;
}

.priority-item {
  margin-bottom: 8px;
  line-height: var(--line-height-small, 1.4);
}

.priority-hint {
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-small, 0.875rem);
  margin-left: 8px;
}

.example-result {
  margin-top: 24px;
}

.level-preview {
  border: 1px solid var(--border-color-base, #a2a9b1);
  border-radius: var(--border-radius-base, 2px);
  background-color: var(--background-color-base, #fff);
  overflow: hidden;
}

.level-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  gap: 12px;
}

.level-item:last-child {
  border-bottom: none;
}

.level-rank {
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-emphasized, #000);
  min-width: 30px;
}

.level-name {
  flex: 1;
  color: var(--color-base, #202122);
}

.level-type {
  padding: 2px 8px;
  border-radius: var(--border-radius-base, 2px);
  font-size: var(--font-size-small, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
}

.level-type:nth-child(3) {
  background-color: var(--background-color-progressive-subtle, #eaf3ff);
  color: var(--color-progressive, #36c);
}

.level-stars {
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-small, 0.875rem);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .level-priority-example {
    padding: 16px;
  }
  
  .level-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .level-rank {
    min-width: auto;
  }
  
  .level-type, .level-stars {
    align-self: flex-end;
  }
}
</style>