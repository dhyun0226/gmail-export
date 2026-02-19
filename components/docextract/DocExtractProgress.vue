<template>
  <div v-if="isProcessing || completed" class="bg-white rounded-xl shadow-lg p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-primary-dark">처리 상태</h3>
      <div v-if="isProcessing" class="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <span v-else class="text-sm font-semibold text-green-600">완료</span>
    </div>

    <!-- 진행 중 -->
    <div v-if="isProcessing">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-semibold text-text-DEFAULT">{{ currentStep }}</span>
        <span class="text-sm font-semibold text-blue-500">({{ formatTime(elapsedTime) }})</span>
      </div>

      <div class="flex justify-between text-sm text-text-light mb-1">
        <span>{{ processedCount }}/{{ totalCount }} 파일</span>
        <span>{{ progressPercent }}%</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <p v-if="currentFilename" class="text-xs text-text-light mt-2">
        {{ currentFilename }}
      </p>
    </div>

    <!-- 완료 통계 -->
    <div v-if="completed && statistics" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
        <div class="text-xs text-text-light font-semibold mb-1">전체 PDF</div>
        <div class="text-xl font-bold text-text-DEFAULT">{{ statistics.totalPdfs }}</div>
      </div>
      <div class="bg-green-50 rounded-lg p-3 text-center border border-green-200">
        <div class="text-xs text-text-light font-semibold mb-1">추출 성공</div>
        <div class="text-xl font-bold text-green-600">{{ statistics.successfulExtractions }}</div>
      </div>
      <div v-if="statistics.failedExtractions > 0" class="bg-red-50 rounded-lg p-3 text-center border border-red-200">
        <div class="text-xs text-text-light font-semibold mb-1">추출 실패</div>
        <div class="text-xl font-bold text-red-600">{{ statistics.failedExtractions }}</div>
      </div>
      <div class="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
        <div class="text-xs text-text-light font-semibold mb-1">BL 수</div>
        <div class="text-xl font-bold text-blue-600">{{ statistics.uniqueBlNumbers }}</div>
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
