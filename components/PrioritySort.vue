<template>
  <div class="priority-sort" role="list" aria-label="优先级排序">
    <template v-for="(item, index) in model" :key="item">
      <button type="button" class="priority-chip" @click="handleMove($event, index)"
        @keydown="handleKeydown($event, index)" :aria-label="`${getDisplayText(item)}，点击设为第一优先级，左右箭头键移动一位`">
        {{ getDisplayText(item) }}
      </button>
      <span v-if="index < model.length - 1" class="priority-arrow" aria-hidden="true">></span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue';

interface Props {
  labelMap?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  labelMap: () => ({})
});

const model = defineModel<string[]>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

// 计算显示文本
const getDisplayText = (value: string) => {
  return props.labelMap[value] || value;
};

const handleMove = (event: MouseEvent, index: number) => {
  moveToFirst(event.currentTarget as HTMLElement, index);
  emit('update:modelValue', model.value);
};

const handleKeydown = (event: KeyboardEvent, index: number) => {
  const element = event.currentTarget as HTMLElement;

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      moveToFirst(element, index);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      moveLeft(element, index);
      break;
    case 'ArrowRight':
      event.preventDefault();
      moveRight(element, index);
      break;
  }
  emit('update:modelValue', model.value);
};

const moveToFirst = (element: HTMLElement, index: number) => {
  if (index <= 0) return;

  const [selectedItem] = model.value.splice(index, 1);
  model.value.unshift(selectedItem);
  // 这里不知道为什么，明明元素复用了，但是就是会失焦
  const pe = element.parentElement;
  nextTick(() => {
    const buttons = Array.from(pe?.querySelectorAll('.priority-chip') || []) as HTMLElement[];
    buttons[0]?.focus();
  });
};

const moveLeft = (element: HTMLElement, index: number) => {
  if (index <= 0) return;

  const pe = element.parentElement;

  // 交换相邻元素
  const temp = model.value[index];
  model.value[index] = model.value[index - 1];
  model.value[index - 1] = temp;

  nextTick(() => {
    const buttons = Array.from(pe?.querySelectorAll('.priority-chip') || []) as HTMLElement[];
    buttons[index - 1]?.focus();
  });
};

const moveRight = (element: HTMLElement, index: number) => {
  if (index >= model.value.length - 1) return;

  const pe = element.parentElement;

  // 交换相邻元素
  const temp = model.value[index];
  model.value[index] = model.value[index + 1];
  model.value[index + 1] = temp;

  nextTick(() => {
    const buttons = Array.from(pe?.querySelectorAll('.priority-chip') || []) as HTMLElement[];
    buttons[index + 1]?.focus();
  });
};
</script>

<style scoped>
.priority-sort {
  display: flex;
  align-items: center;
  gap: var(--spacing-50, 8px);
  flex-wrap: wrap;
}

.priority-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-25, 4px) var(--spacing-25, 4px);
  background-color: var(--background-color-subtle, #f8f9fa);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: var(--border-radius-base, 4px);
  color: var(--color-base, #202122);
  font-size: var(--font-size-small, 0.8125rem);
  font-weight: var(--font-weight-normal, 400);
  font-family: var(--font-family-system-sans, sans-serif);
  cursor: pointer;
  transition: all var(--transition-duration-base, 100ms) var(--transition-timing-function-ease-in-out, ease-in-out);
  white-space: nowrap;
  user-select: none;
}

.priority-chip:hover {
  background-color: var(--background-color-interactive-subtle, #eaecf0);
  border-color: var(--border-color-interactive, #72777d);
}

.priority-chip:focus {
  outline: 2px solid var(--color-progressive, #36c);
  outline-offset: 2px;
}

.priority-chip:active {
  background-color: var(--background-color-interactive, #eaf3ff);
  border-color: var(--color-progressive, #36c);
}

.priority-arrow {
  color: var(--color-subtle, #54595d);
  font-weight: var(--font-weight-bold, 700);
  margin: 0 var(--spacing-25, 4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .priority-sort {
    gap: var(--spacing-35, 6px);
  }

  .priority-arrow {
    margin: 0 var(--spacing-15, 2px);
  }
}
</style>