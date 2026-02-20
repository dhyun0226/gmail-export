<template>
  <div>
    <!-- Mode Selector -->
    <KpiModeSelector v-model:mode="kpiMode" />

    <!-- Step 1: 공통 설정 및 파일 업로드 -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-6">설정 및 파일 업로드</h2>

      <!-- 공통 설정 영역 -->
      <div class="settings-area mb-6">
        <div class="flex items-center gap-4 mb-4">
          <label class="text-sm font-semibold text-gray-700 min-w-[100px]">AMAT WK</label>
          <input
            v-model="amatWeek"
            type="text"
            placeholder="FY202427"
            class="w-[200px] px-4 py-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-dark transition-colors"
            :disabled="processing"
          />
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label class="text-sm font-semibold text-gray-700 min-w-[100px]">AMAT MONTH</label>
          <input
            v-model="amatMonth"
            type="text"
            placeholder="FY24 Q3M1"
            class="w-[200px] px-4 py-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-dark transition-colors"
            :disabled="processing"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="text-sm font-semibold text-gray-700 min-w-[100px]">BL 년도</label>
          <input
            v-model="blYear"
            type="number"
            placeholder="2026"
            class="w-[120px] px-4 py-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-primary-dark transition-colors"
            :disabled="processing"
          />
          <span class="text-sm text-gray-500">유니패스 조회를 위한 년도</span>
        </div>
      </div>

      <!-- ========== Import 모드 ========== -->
      <div v-if="kpiMode === 'import'">
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-600 mb-3">impo 양식 엑셀 업로드</h3>
          <KpiExcelUploader mode="import" @uploaded="handleFileUploaded" />
        </div>

        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-600 mb-3">사유(키워드) 엑셀 업로드 (선택)</h3>
          <KpiReasonUploader @uploaded="handleReasonUploaded" />
        </div>
      </div>

      <!-- ========== Export 모드 ========== -->
      <div v-if="kpiMode === 'export'">
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-600 mb-3">expo 양식 엑셀 업로드</h3>
          <KpiExcelUploader mode="export" @uploaded="handleExportFileUploaded" />
        </div>
      </div>

      <!-- 추출 시작 버튼 -->
      <div v-if="hasUploadedFile">
        <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5">
          <span class="text-2xl">📄</span>
          <span class="flex-1 font-semibold text-blue-800">{{ uploadedFileName }}</span>
          <span class="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">준비 완료</span>
        </div>

        <button
          @click="startProcessing"
          :disabled="!blYear || !hasUploadedFile || processing"
          class="w-full py-3 px-8 bg-primary-dark text-white font-bold text-lg rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mb-5"
        >
          {{ processing ? `처리 중... (${formatTime(processingTime)})` : '추출 시작' }}
        </button>

        <div v-if="currentItemList.length > 0" class="bg-gray-50 p-5 rounded-lg">
          <h3 class="text-base font-semibold text-gray-600 mb-3">
            추출된 {{ kpiMode === 'import' ? 'BL 번호' : '신고번호' }} ({{ currentItemList.length }}개)
          </h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in currentItemList.slice(0, 10)" :key="item" class="inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-mono text-gray-700">
              {{ item }}
            </span>
            <span v-if="currentItemList.length > 10" class="inline-flex items-center px-3 py-1.5 text-gray-500 text-sm italic">
              ... 외 {{ currentItemList.length - 10 }}개
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
      :mode="kpiMode"
    />

    <!-- Step 3: 수입 결과 테이블 -->
    <KpiResultTable
      v-if="kpiMode === 'import' && importResults.length > 0"
      :results="importResults"
      :originalFileName="uploadedFileName"
      :rawData="rawData"
    />

    <!-- Step 3: 수출 결과 테이블 -->
    <KpiExportResultTable
      v-if="kpiMode === 'export' && exportResults.length > 0"
      :results="exportResults"
      :originalFileName="uploadedFileName"
    />

    <!-- KPI 리포트 다운로드 -->
    <div v-if="importResults.length > 0 || exportResults.length > 0" class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <h3 class="text-lg font-bold text-gray-800 mb-3">KPI 리포트 다운로드</h3>
      <p class="text-sm text-gray-600 mb-4">
        Import KPI + Export KPI + Summary 3시트 리포트를 다운로드합니다.
        <span v-if="importResults.length > 0" class="text-blue-600 font-semibold"> (Import: {{ importResults.length }}건)</span>
        <span v-if="exportResults.length > 0" class="text-green-600 font-semibold"> (Export: {{ exportResults.length }}건)</span>
      </p>
      <button
        @click="downloadKpiReport"
        :disabled="downloadingReport"
        class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ downloadingReport ? '생성 중...' : 'KPI 리포트 다운로드 (3시트)' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import KpiModeSelector from '~/components/kpi/KpiModeSelector.vue';
import KpiExcelUploader from '~/components/kpi/KpiExcelUploader.vue';
import KpiReasonUploader from '~/components/kpi/KpiReasonUploader.vue';
import KpiProcessingStatus from '~/components/kpi/KpiProcessingStatus.vue';
import KpiResultTable from '~/components/kpi/KpiResultTable.vue';
import KpiExportResultTable from '~/components/kpi/KpiExportResultTable.vue';

const emit = defineEmits<{
  error: [message: string]
}>();

// 모드
const kpiMode = ref<'import' | 'export'>('import');

// 공통 설정
const amatWeek = ref('');
const amatMonth = ref('');
const blYear = ref(new Date().getFullYear().toString());

// 수입 상태
const blNumbers = ref<string[]>([]);
const uploadedFileName = ref('');
const rawData = ref<any[]>([]);
const reasonMap = ref<Record<string, string>>({});
const importResults = ref<any[]>([]);

// 수출 상태
const declNumbers = ref<string[]>([]);
const exportCodeMap = ref<Record<string, any>>({});
const exportUploadedFileName = ref('');
const exportResults = ref<any[]>([]);

// 공통 처리 상태
const processing = ref(false);
const processingTime = ref(0);
const currentStep = ref('');
const statistics = ref<any>(null);
let processingTimer: NodeJS.Timeout | null = null;
const processedCount = ref(0);
const totalCount = ref(0);
const currentPhase = ref<'gmail' | 'unipass' | 'complete'>('gmail');
const downloadingReport = ref(false);

// 현재 업로드된 파일 여부
const hasUploadedFile = computed(() => {
  if (kpiMode.value === 'import') return !!uploadedFileName.value;
  return !!exportUploadedFileName.value;
});

// 현재 아이템 리스트 (BL번호 or 신고번호)
const currentItemList = computed(() => {
  if (kpiMode.value === 'import') return blNumbers.value;
  return declNumbers.value;
});

const formatTime = (seconds: number): string => {
  if (!seconds) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${remainingSeconds}초`;
};

// === Import 파일 업로드 ===
const handleFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[] }) => {
  uploadedFileName.value = data.fileName;
  blNumbers.value = data.blNumbers;
  rawData.value = data.rawData || [];
  importResults.value = [];
  statistics.value = null;
};

// === 사유(키워드) 업로드 ===
const handleReasonUploaded = (data: { reasonMap: Record<string, string>, fileName: string, rowCount: number }) => {
  reasonMap.value = data.reasonMap;
};

// === Export 파일 업로드 ===
const handleExportFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[], declNumbers?: string[], exportCodeMap?: any }) => {
  exportUploadedFileName.value = data.fileName;
  declNumbers.value = data.declNumbers || data.blNumbers || [];
  exportCodeMap.value = data.exportCodeMap || {};
  exportResults.value = [];
  statistics.value = null;
};

// 추출 시작
const startProcessing = async () => {
  if (!blYear.value) return;

  processingTime.value = 0;
  if (processingTimer) clearInterval(processingTimer);
  processingTimer = setInterval(() => {
    processingTime.value++;
  }, 1000);

  if (kpiMode.value === 'import') {
    await processImportData();
  } else {
    await processExportData();
  }

  if (processingTimer) {
    clearInterval(processingTimer);
    processingTimer = null;
  }
};

// === 수입 데이터 처리 ===
const processImportData = async () => {
  if (!blYear.value || blNumbers.value.length === 0) return;

  processing.value = true;
  importResults.value = [];
  processedCount.value = 0;
  totalCount.value = blNumbers.value.length;
  currentPhase.value = 'gmail';

  try {
    currentStep.value = `Gmail과 Unipass 데이터 조회 중... (${blNumbers.value.length}개 BL)`;

    const response = await $fetch('/api/kpi/process', {
      method: 'POST',
      body: {
        blNumbers: blNumbers.value,
        blYear: blYear.value,
        amatWeek: amatWeek.value,
        amatMonth: amatMonth.value,
        reasonMap: reasonMap.value,
      },
    });

    if (response.success) {
      importResults.value = response.results;
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

// === 수출 데이터 처리 ===
const processExportData = async () => {
  if (!blYear.value || declNumbers.value.length === 0) return;

  processing.value = true;
  exportResults.value = [];
  processedCount.value = 0;
  totalCount.value = declNumbers.value.length;
  currentPhase.value = 'unipass';

  try {
    currentStep.value = `Unipass 수출 데이터 조회 중... (${declNumbers.value.length}개 신고번호)`;

    const response = await $fetch('/api/kpi/process-export', {
      method: 'POST',
      body: {
        declNumbers: declNumbers.value,
        blYear: blYear.value,
        amatWeek: amatWeek.value,
        amatMonth: amatMonth.value,
        exportCodeMap: exportCodeMap.value,
      },
    });

    if (response.success) {
      exportResults.value = response.results;
      statistics.value = response.statistics;
      processedCount.value = declNumbers.value.length;
      currentPhase.value = 'complete';
      currentStep.value = `처리 완료! (${declNumbers.value.length}개 신고번호, 총 ${formatTime(processingTime.value)} 소요)`;
    }

  } catch (err: any) {
    console.error('Export process error:', err);
    const errorMessage = err.data?.statusMessage || '수출 데이터 처리 중 오류가 발생했습니다.';
    emit('error', errorMessage);
  } finally {
    processing.value = false;
  }
};

// === KPI 리포트 다운로드 (3시트) ===
const downloadKpiReport = async () => {
  downloadingReport.value = true;

  try {
    const response = await fetch('/api/kpi/export-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        importResults: importResults.value,
        exportResults: exportResults.value,
        amatWeek: amatWeek.value,
        amatMonth: amatMonth.value,
      }),
    });

    if (!response.ok) throw new Error('리포트 생성 실패');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

  } catch (err: any) {
    console.error('KPI 리포트 다운로드 오류:', err);
    alert('KPI 리포트 다운로드 중 오류가 발생했습니다.');
  } finally {
    downloadingReport.value = false;
  }
};
</script>

<style scoped>
.settings-area {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
</style>
