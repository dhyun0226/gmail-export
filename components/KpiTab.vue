<template>
  <div>
    <!-- Mode Selector -->
    <KpiModeSelector v-model:mode="kpiMode" />

    <!-- Step 1: Settings & File Upload -->
    <div class="mb-8">
      <h2 class="section-title mb-6">설정 및 파일 업로드</h2>

      <!-- Common Settings -->
      <div class="card card-body mb-6">
        <div class="flex items-center gap-4 mb-4">
          <label class="form-label mb-0 min-w-[100px]">AMAT WK</label>
          <input
            v-model="amatWeek"
            type="text"
            placeholder="FY202427"
            class="form-input w-[200px]"
            :disabled="processing"
          />
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label class="form-label mb-0 min-w-[100px]">AMAT MONTH</label>
          <input
            v-model="amatMonth"
            type="text"
            placeholder="FY24 Q3M1"
            class="form-input w-[200px]"
            :disabled="processing"
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="form-label mb-0 min-w-[100px]">BL 년도</label>
          <input
            v-model="blYear"
            type="number"
            placeholder="2026"
            class="form-input w-[120px]"
            :disabled="processing"
          />
          <span class="text-xs text-gray-400">유니패스 조회를 위한 년도</span>
        </div>
      </div>

      <!-- Import Mode -->
      <div v-if="kpiMode === 'import'">
        <div class="mb-4">
          <h3 class="form-label">impo 양식 엑셀 업로드</h3>
          <KpiExcelUploader mode="import" @uploaded="handleFileUploaded" />
        </div>

        <div class="mb-4">
          <h3 class="form-label">사유(키워드) 엑셀 업로드 (선택)</h3>
          <KpiReasonUploader @uploaded="handleReasonUploaded" />
        </div>
      </div>

      <!-- Export Mode -->
      <div v-if="kpiMode === 'export'">
        <div class="mb-4">
          <h3 class="form-label">expo 양식 엑셀 업로드</h3>
          <KpiExcelUploader mode="export" @uploaded="handleExportFileUploaded" />
        </div>
      </div>

      <!-- Start Button -->
      <div v-if="hasUploadedFile">
        <div class="alert alert-info mb-5">
          <span class="flex-1 font-semibold">{{ uploadedFileName }}</span>
          <span class="badge badge-green">준비 완료</span>
        </div>

        <button
          @click="startProcessing"
          :disabled="!blYear || !hasUploadedFile || processing"
          class="btn btn-primary btn-lg w-full mb-5"
        >
          {{ processing ? `처리 중... (${formatTime(processingTime)})` : '추출 시작' }}
        </button>

        <div v-if="currentItemList.length > 0" class="card card-body">
          <h3 class="form-label">
            추출된 {{ kpiMode === 'import' ? 'BL 번호' : '신고번호' }} ({{ currentItemList.length }}개)
          </h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in currentItemList.slice(0, 10)" :key="item" class="bg-white rounded-md border border-gray-100 px-3 py-1.5 text-sm font-mono text-gray-700">
              {{ item }}
            </span>
            <span v-if="currentItemList.length > 10" class="inline-flex items-center px-3 py-1.5 text-gray-400 text-sm">
              ... 외 {{ currentItemList.length - 10 }}개
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Processing Status -->
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

    <!-- Step 3: Import Results -->
    <KpiResultTable
      v-if="kpiMode === 'import' && importResults.length > 0"
      :results="importResults"
      :originalFileName="uploadedFileName"
      :rawData="rawData"
    />

    <!-- Step 3: Export Results -->
    <KpiExportResultTable
      v-if="kpiMode === 'export' && exportResults.length > 0"
      :results="exportResults"
      :originalFileName="uploadedFileName"
    />

    <!-- KPI Report Download -->
    <div v-if="importResults.length > 0 || exportResults.length > 0" class="mt-8 card-elevated p-6">
      <h3 class="section-title mb-3">KPI 리포트 다운로드</h3>
      <p class="text-sm text-gray-500 mb-4">
        Import KPI + Export KPI + Summary 3시트 리포트를 다운로드합니다.
        <span v-if="importResults.length > 0" class="text-blue-600 font-semibold"> (Import: {{ importResults.length }}건)</span>
        <span v-if="exportResults.length > 0" class="text-emerald-600 font-semibold"> (Export: {{ exportResults.length }}건)</span>
      </p>
      <button
        @click="downloadKpiReport"
        :disabled="downloadingReport"
        class="btn btn-primary btn-md"
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

const kpiMode = ref<'import' | 'export'>('import');

const amatWeek = ref('');
const amatMonth = ref('');
const blYear = ref(new Date().getFullYear().toString());

const blNumbers = ref<string[]>([]);
const uploadedFileName = ref('');
const rawData = ref<any[]>([]);
const reasonMap = ref<Record<string, string>>({});
const importResults = ref<any[]>([]);

const declNumbers = ref<string[]>([]);
const exportCodeMap = ref<Record<string, any>>({});
const exportUploadedFileName = ref('');
const exportResults = ref<any[]>([]);

const processing = ref(false);
const processingTime = ref(0);
const currentStep = ref('');
const statistics = ref<any>(null);
let processingTimer: NodeJS.Timeout | null = null;
const processedCount = ref(0);
const totalCount = ref(0);
const currentPhase = ref<'gmail' | 'unipass' | 'complete'>('gmail');
const downloadingReport = ref(false);

const hasUploadedFile = computed(() => {
  if (kpiMode.value === 'import') return !!uploadedFileName.value;
  return !!exportUploadedFileName.value;
});

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

const handleFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[] }) => {
  uploadedFileName.value = data.fileName;
  blNumbers.value = data.blNumbers;
  rawData.value = data.rawData || [];
  importResults.value = [];
  statistics.value = null;
};

const handleReasonUploaded = (data: { reasonMap: Record<string, string>, fileName: string, rowCount: number }) => {
  reasonMap.value = data.reasonMap;
};

const handleExportFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[], declNumbers?: string[], exportCodeMap?: any }) => {
  exportUploadedFileName.value = data.fileName;
  declNumbers.value = data.declNumbers || data.blNumbers || [];
  exportCodeMap.value = data.exportCodeMap || {};
  exportResults.value = [];
  statistics.value = null;
};

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
