<template>
  <div v-if="isProcessing || completed" class="card-elevated mb-6">
    <div class="card-header">
      <h3 class="section-title">처리 상태</h3>
      <div v-if="isProcessing" class="spinner-md"></div>
      <span v-else class="badge badge-green">완료</span>
    </div>

    <div class="card-body">
      <!-- Processing -->
      <div v-if="isProcessing">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm text-gray-600">{{ currentStep }}</span>
          <span class="text-sm font-semibold text-blue-600">({{ formatTime(elapsedTime) }})</span>
        </div>

        <div class="flex justify-between text-sm text-gray-500 mb-1.5">
          <span>{{ processedCount }}/{{ totalCount }} 파일</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>

        <p v-if="currentFilename" class="text-xs text-gray-400 mt-2">
          {{ currentFilename }}
        </p>
      </div>

      <!-- Completed Statistics -->
      <div v-if="completed && statistics" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="stat-card border-gray-200 bg-gray-50">
          <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">전체 PDF</div>
          <div class="text-xl font-bold text-gray-900">{{ statistics.totalPdfs }}</div>
        </div>
        <div class="stat-card border-emerald-200 bg-emerald-50">
          <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">추출 성공</div>
          <div class="text-xl font-bold text-emerald-600">{{ statistics.successfulExtractions }}</div>
        </div>
        <div v-if="statistics.failedExtractions > 0" class="stat-card border-red-200 bg-red-50">
          <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">추출 실패</div>
          <div class="text-xl font-bold text-red-600">{{ statistics.failedExtractions }}</div>
        </div>
        <div class="stat-card border-blue-200 bg-blue-50">
          <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">BL 수</div>
          <div class="text-xl font-bold text-blue-600">{{ statistics.uniqueBlNumbers }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Statistics {
  totalEmails: number;
  totalPdfs: number;
  successfulExtractions: number;
  failedExtractions: number;
  uniqueBlNumbers: number;
}

const props = defineProps<{
  isProcessing: boolean;
  completed: boolean;
  currentStep: string;
  currentFilename?: string;
  elapsedTime: number;
  processedCount: number;
  totalCount: number;
  statistics?: Statistics;
}>();

const progressPercent = computed(() => {
  if (props.totalCount === 0) return 0;
  return Math.round((props.processedCount / props.totalCount) * 100);
});

const formatTime = (seconds: number): string => {
  if (!seconds) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${remainingSeconds}초`;
};
</script>
