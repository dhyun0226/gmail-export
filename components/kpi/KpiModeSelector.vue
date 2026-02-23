<template>
  <div class="segment-control mb-6">
    <button
      @click="$emit('update:mode', 'import')"
      :class="['segment-btn', mode === 'import' ? 'segment-btn-active' : 'segment-btn-inactive']"
    >
      Import (수입)
    </button>
    <button
      @click="$emit('update:mode', 'export')"
      :class="['segment-btn', mode === 'export' ? 'segment-btn-active' : 'segment-btn-inactive']"
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
