<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">마일스톤</h1>
      <p class="page-subtitle">메일을 조회하거나 BL 엑셀을 업로드하여 마일스톤 데이터를 관리합니다.</p>
    </div>

    <!-- Sub-tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'email'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'email'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          메일 조회
        </button>
        <button
          @click="activeTab = 'excel'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'excel'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          BL 엑셀 업로드
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
    <EmailTab v-if="activeTab === 'email'" />
    <ExcelUploadTab v-if="activeTab === 'excel'" />
    <MilestoneV2Tab v-if="activeTab === 'milestone-v2'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EmailTab from '~/components/EmailTab.vue';
import ExcelUploadTab from '~/components/ExcelUploadTab.vue';
import MilestoneV2Tab from '~/components/MilestoneV2Tab.vue';

const activeTab = ref('email');
</script>
