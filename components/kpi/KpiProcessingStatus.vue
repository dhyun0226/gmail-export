<template>
  <div v-if="isProcessing || statistics" class="card-elevated my-8">
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
          <span class="text-sm font-semibold text-blue-600">({{ formatTime(processingTime) }})</span>
        </div>

        <div class="flex justify-between text-sm text-gray-500 mb-1.5">
          <span>{{ processedCount || 0 }}/{{ totalCount || 0 }} BL</span>
          <span>{{ Math.round(((processedCount || 0) / (totalCount || 1)) * 100) }}%</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: ((processedCount || 0) / (totalCount || 1)) * 100 + '%' }"
          ></div>
        </div>

        <p v-if="currentStep" class="text-xs text-gray-400 mt-2">{{ currentStep }}</p>
      </div>

      <!-- Completed Statistics -->
      <div v-if="statistics">
        <!-- Import Stats -->
        <div v-if="mode !== 'export'" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">전체</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.total }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">메일 수신</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withMailData }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">하기신고수리</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withLowerDeclAccept }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">창고반입</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withWarehouseEntry }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">수입신고</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withImportDecl }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">수입신고수리</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withImportAccept }}</div>
          </div>
          <div class="stat-card border-emerald-200 bg-emerald-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">완료</div>
            <div class="text-xl font-bold text-emerald-600">{{ statistics.complete }}</div>
          </div>
          <div v-if="statistics.withError > 0" class="stat-card border-red-200 bg-red-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">오류</div>
            <div class="text-xl font-bold text-red-600">{{ statistics.withError }}</div>
          </div>
        </div>

        <!-- Export Stats -->
        <div v-if="mode === 'export'" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">전체</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.total }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">수출신고수리</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withExportDeclAccept || 0 }}</div>
          </div>
          <div class="stat-card border-gray-200 bg-gray-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">적재완료</div>
            <div class="text-xl font-bold text-gray-900">{{ statistics.withLoadingComplete || 0 }}</div>
          </div>
          <div class="stat-card border-emerald-200 bg-emerald-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">완료</div>
            <div class="text-xl font-bold text-emerald-600">{{ statistics.complete }}</div>
          </div>
          <div v-if="statistics.withError > 0" class="stat-card border-red-200 bg-red-50">
            <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">오류</div>
            <div class="text-xl font-bold text-red-600">{{ statistics.withError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Statistics {
  total: number;
  withMailData: number;
  withLowerDeclAccept: number;
  withWarehouseEntry: number;
  withImportDecl: number;
  withImportAccept: number;
  complete: number;
  withError: number;
}

const props = defineProps<{
  isProcessing: boolean;
  statistics?: any;
  currentStep?: string;
  processingTime?: number;
  processedCount?: number;
  totalCount?: number;
  currentPhase?: 'gmail' | 'unipass' | 'complete';
  mode?: 'import' | 'export';
}>();

const progressPercent = ref(0);

const formatTime = (seconds: number | undefined): string => {
  if (!seconds) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${remainingSeconds}초`;
};

watch(() => props.isProcessing, (newVal) => {
  if (newVal) {
    progressPercent.value = 0;
    const interval = setInterval(() => {
      if (progressPercent.value < 90) {
        progressPercent.value += Math.random() * 10;
      } else {
        clearInterval(interval);
      }
    }, 500);
  } else {
    progressPercent.value = 100;
  }
});
</script>
