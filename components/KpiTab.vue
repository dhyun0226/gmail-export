<template>
  <div>
    <!-- Step 1: 설정 및 파일 업로드 -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6">설정 및 파일 업로드</h2>

      <!-- BL 년도 입력 -->
      <div class="flex items-center gap-4 mb-6">
        <label class="text-sm font-semibold text-gray-700 min-w-[80px]">BL 년도</label>
        <input
          v-model="blYear"
          type="number"
          placeholder="2024"
          class="w-[120px] px-4 py-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-dark transition-colors"
          :disabled="processing"
        />
        <span class="text-sm text-gray-500">유니패스 조회를 위한 년도를 입력하세요</span>
      </div>

      <!-- 파일 업로드 -->
      <div class="mb-6">
        <KpiExcelUploader @uploaded="handleFileUploaded" />
      </div>

      <!-- 추출 시작 버튼 -->
      <div v-if="uploadedFileName">
        <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5">
          <span class="text-2xl">📄</span>
          <span class="flex-1 font-semibold text-blue-800">{{ uploadedFileName }}</span>
          <span class="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">준비 완료</span>
        </div>

        <button
          @click="startProcessing"
          :disabled="!blYear || !uploadedFileName || processing"
          class="w-full py-3 px-8 bg-primary-dark text-white font-bold text-lg rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mb-5"
        >
          {{ processing ? `처리 중... (${formatTime(processingTime)})` : '추출 시작' }}
        </button>

        <div v-if="blNumbers.length > 0" class="bg-gray-50 p-5 rounded-lg">
          <h3 class="text-base font-semibold text-gray-600 mb-3">추출된 BL 번호 ({{ blNumbers.length }}개)</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="bl in blNumbers.slice(0, 10)" :key="bl" class="inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-mono text-gray-700">
              {{ bl }}
            </span>
            <span v-if="blNumbers.length > 10" class="inline-flex items-center px-3 py-1.5 text-gray-500 text-sm italic">
              ... 외 {{ blNumbers.length - 10 }}개
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: 처리 상태 -->
    <KpiProcessingStatus
      :isProcessing="processing"
      :statistics="statistics"
      :currentStep="currentStep"
      :processingTime="processingTime"
      :processedCount="processedCount"
      :totalCount="totalCount"
      :currentPhase="currentPhase"
    />

    <!-- Step 3: 결과 테이블 (다운로드 버튼 포함) -->
    <KpiResultTable
      v-if="results.length > 0"
      :results="results"
      :originalFileName="uploadedFileName"
      :rawData="rawData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import KpiExcelUploader from '~/components/kpi/KpiExcelUploader.vue';
import KpiProcessingStatus from '~/components/kpi/KpiProcessingStatus.vue';
import KpiResultTable from '~/components/kpi/KpiResultTable.vue';

const emit = defineEmits<{
  error: [message: string]
}>();

// 상태 관리
const blNumbers = ref<string[]>([]);
const uploadedFileName = ref('');
const rawData = ref<any[]>([]);
const blYear = ref(new Date().getFullYear().toString());
const processing = ref(false);
const processingTime = ref(0);
const currentStep = ref('');
const results = ref<any[]>([]);
const statistics = ref(null);
let processingTimer: NodeJS.Timeout | null = null;

// 진행 상태
const processedCount = ref(0);
const totalCount = ref(0);
const currentPhase = ref<'gmail' | 'unipass' | 'complete'>('gmail');

// 초를 분:초 형식으로 변환
const formatTime = (seconds: number): string => {
  if (!seconds) return '0초';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${seconds}초`;
  } else {
    return `${minutes}분 ${remainingSeconds}초`;
  }
};

// 파일 업로드 완료 처리
const handleFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[] }) => {
  uploadedFileName.value = data.fileName;
  blNumbers.value = data.blNumbers;
  rawData.value = data.rawData || [];

  // 이전 결과 초기화
  results.value = [];
  statistics.value = null;
};

// 추출 시작 버튼 클릭 시 호출
const startProcessing = async () => {
  if (!blYear.value || blNumbers.value.length === 0) return;

  // 타이머 시작
  processingTime.value = 0;
  if (processingTimer) clearInterval(processingTimer);
  processingTimer = setInterval(() => {
    processingTime.value++;
  }, 1000);

  await processData();

  // 타이머 정지
  if (processingTimer) {
    clearInterval(processingTimer);
    processingTimer = null;
  }
};

// 실제 데이터 처리 로직
const processData = async () => {
  if (!blYear.value || blNumbers.value.length === 0) return;

  processing.value = true;
  results.value = [];
  processedCount.value = 0;
  totalCount.value = blNumbers.value.length;
  currentPhase.value = 'gmail';

  try {
    currentStep.value = `Gmail과 Unipass 데이터 조회 중... (${blNumbers.value.length}개 BL)`;

    const response = await $fetch('/api/kpi/process', {
      method: 'POST',
      body: {
        blNumbers: blNumbers.value,
        blYear: blYear.value
      }
    });

    if (response.success) {
      results.value = response.results;
      statistics.value = response.statistics;
      processedCount.value = blNumbers.value.length;
      currentPhase.value = 'complete';
      currentStep.value = `처리 완료! (${blNumbers.value.length}개 BL, 총 ${formatTime(processingTime.value)} 소요)`;
    }

  } catch (err: any) {
    console.error('Process error:', err);
    const errorMessage = err.data?.statusMessage || '데이터 처리 중 오류가 발생했습니다.';
    emit('error', errorMessage);

    if (err.data?.statusCode === 401) {
      setTimeout(() => {
        window.location.href = '/api/auth/google';
      }, 2000);
    }
  } finally {
    processing.value = false;
  }
};
</script>
