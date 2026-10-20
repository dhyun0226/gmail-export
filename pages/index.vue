<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">마일스톤</h1>
      <p class="page-subtitle">메일 목록 엑셀 및 UPS 파일을 업로드하여 마일스톤 데이터를 생성하고 유니패스를 조회합니다.</p>
    </div>

    <!-- Sub-tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'file-milestone'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'file-milestone'
              ? 'border-gray-900 text-gray-900 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          마일스톤 파일 생성 (신규)
        </button>
        <button
          @click="activeTab = 'email'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'email'
              ? 'border-gray-900 text-gray-900 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          메일 조회 (기존 POP3/Gmail)
        </button>
        <button
          @click="activeTab = 'excel'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === 'excel'
              ? 'border-gray-900 text-gray-900 font-semibold'
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
              ? 'border-gray-900 text-gray-900 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          마일스톤 v2
        </button>
      </nav>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error mb-6 flex items-center justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="btn btn-ghost btn-sm text-red-500">
        ✕
      </button>
    </div>

    <!-- Tab content -->
    <MilestoneMailUploadTab
      v-if="activeTab === 'file-milestone'"
      @error="(msg) => errorMessage = msg"
    />
    <EmailTab
      v-if="activeTab === 'email'"
      @error="(msg) => errorMessage = msg"
    />
    <ExcelUploadTab
      v-if="activeTab === 'excel'"
      @error="(msg) => errorMessage = msg"
    />
    <MilestoneV2Tab
      v-if="activeTab === 'milestone-v2'"
      @error="(msg) => errorMessage = msg"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MilestoneMailUploadTab from '~/components/MilestoneMailUploadTab.vue';
import EmailTab from '~/components/EmailTab.vue';
import ExcelUploadTab from '~/components/ExcelUploadTab.vue';
import MilestoneV2Tab from '~/components/MilestoneV2Tab.vue';

const activeTab = ref('file-milestone');
const errorMessage = ref('');
</script>
