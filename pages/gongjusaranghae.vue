<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">테스트</h1>
      <p class="page-subtitle">문서추출 및 마일스톤 v2 테스트 페이지입니다.</p>
    </div>

    <!-- Sub-tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'docextract'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'docextract'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          문서추출
        </button>
        <button
          @click="activeTab = 'milestone-v2'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'milestone-v2'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          마일스톤 v2
        </button>
      </nav>
    </div>

    <!-- Tab content -->
    <DocExtractTab v-if="activeTab === 'docextract'" />
    <MilestoneV2Tab v-if="activeTab === 'milestone-v2'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DocExtractTab from '~/components/docextract/DocExtractTab.vue';
import MilestoneV2Tab from '~/components/MilestoneV2Tab.vue';

const activeTab = ref('docextract');
</script>
