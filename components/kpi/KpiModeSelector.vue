<template>
  <div class="mode-selector">
    <button
      @click="$emit('update:mode', 'import')"
      :class="['mode-btn', { active: mode === 'import' }]"
    >
      Import (수입)
    </button>
    <button
      @click="$emit('update:mode', 'export')"
      :class="['mode-btn', { active: mode === 'export' }]"
    >
      Export (수출)
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'import' | 'export';
}>();

defineEmits<{
  'update:mode': [value: 'import' | 'export'];
}>();
</script>

<style scoped>
.mode-selector {
  display: flex;
  gap: 0;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
}

.mode-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: #6b7280;
}

.mode-btn:hover:not(.active) {
  background: #e5e7eb;
  color: #374151;
}

.mode-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
