<template>
  <div class="priority-wrapper">
    <h3>优先级排序组件 - Model验证</h3>
    <p class="description">
      这个组件验证PrioritySort的defineModel是否能正确向父组件传递数据变化
    </p>
    
    <!-- PrioritySort组件 -->
    <div class="sort-section">
      <h4>排序控制：</h4>
      <PrioritySort v-model="localModel" />
    </div>
    
    <!-- 实时显示model值 -->
    <div class="model-display">
      <h4>Model值验证（父组件接收）：</h4>
      <div class="model-items">
        <div 
          v-for="(item, index) in localModel" 
          :key="index" 
          class="model-item"
          :class="{ 'first-item': index === 0 }"
        >
          <span class="index">[{{ index }}]</span>
          <span class="value">{{ item }}</span>
          <span v-if="index === 0" class="badge">当前优先级</span>
        </div>
      </div>
      
      <div class="model-json">
        <strong>完整JSON：</strong>
        <pre>{{ JSON.stringify(localModel, null, 2) }}</pre>
      </div>
      
      <div class="model-info">
        <p><strong>数组长度：</strong>{{ localModel.length }}</p>
        <p><strong>第一项：</strong>{{ localModel[0] || '空' }}</p>
        <p><strong>最后一项：</strong>{{ localModel[localModel.length - 1] || '空' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PrioritySort from './PrioritySort.vue';

// 本地响应式数据，模拟父组件的数据
const localModel = ref([
  "默认顺序",
  "关卡编号", 
  "星数",
  "关卡名称",
  "关卡类型"
]);

// 监听model变化，验证数据流动
watch(localModel, (newValue, oldValue) => {
  console.log('Model变化检测：');
  console.log('旧值：', oldValue);
  console.log('新值：', newValue);
  console.log('变化时间：', new Date().toLocaleTimeString());
  
  // 验证数据是否真的改变了
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    console.log('✅ 数据确实发生了变化');
  } else {
    console.log('❌ 数据没有变化');
  }
}, { deep: true });
</script>

<style scoped>
.priority-wrapper {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #36c;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.description {
  color: #54595d;
  margin-bottom: 20px;
  font-style: italic;
}

.sort-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #a2a9b1;
}

.model-display {
  padding: 15px;
  background-color: #eaf3ff;
  border: 1px solid #36c;
  border-radius: 6px;
}

.model-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.model-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: white;
  border: 1px solid #a2a9b1;
  border-radius: 4px;
  font-size: 0.875rem;
}

.model-item.first-item {
  border-color: #36c;
  background-color: #eaf3ff;
  font-weight: bold;
}

.index {
  color: #54595d;
  font-family: monospace;
  font-weight: bold;
}

.value {
  color: #202122;
}

.badge {
  font-size: 0.75rem;
  background-color: #36c;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  margin-left: 4px;
}

.model-json {
  margin-bottom: 15px;
}

.model-json pre {
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #a2a9b1;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  margin: 8px 0 0 0;
}

.model-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.model-info p {
  margin: 0;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #a2a9b1;
  font-size: 0.875rem;
}

h3, h4 {
  margin-top: 0;
  color: #202122;
}

h4 {
  margin-bottom: 10px;
  font-size: 1rem;
}
</style>