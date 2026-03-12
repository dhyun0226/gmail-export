<template>
  <div>
    <!-- Step 1: Settings & All File Uploads (Compact Horizontal Layout) -->
    <div class="mb-8">
      <h2 class="section-title mb-6">KPI 통합 처리 (4개 파일 일괄 업로드)</h2>

      <!-- Common Settings (Slim Version) -->
      <div class="card card-body mb-6 bg-gray-50/50 border-none shadow-sm">
        <div class="flex flex-wrap items-center gap-x-10 gap-y-4">
          <div class="flex items-center gap-3">
            <label class="text-sm font-bold text-gray-600">AMAT WK</label>
            <input
              v-model="amatWeek"
              type="text"
              placeholder="FY202427"
              class="form-input w-[140px] bg-white"
              :disabled="processing"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm font-bold text-gray-600">AMAT MONTH</label>
            <input
              v-model="amatMonth"
              type="text"
              placeholder="FY24 Q3M1"
              class="form-input w-[140px] bg-white"
              :disabled="processing"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm font-bold text-gray-600">BL 년도</label>
            <input
              v-model="blYear"
              type="number"
              placeholder="2026"
              class="form-input w-[100px] bg-white"
              :disabled="processing"
            />
          </div>
        </div>
      </div>

      <!-- Horizontal Upload Row: 4 Files in a Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        <!-- 1. Cumulative Report (누적본) - PURPLE -->
        <div class="card p-4 border-t-4 border-purple-500 flex flex-col h-full bg-white shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-purple-700 flex items-center gap-2">
              <span class="bg-purple-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
              기존 KPI 누적 리포트
            </h3>
            <span v-if="baseReportData.importData.length > 0" class="text-[10px] font-bold text-purple-500">READY</span>
          </div>
          <div class="flex-1">
            <KpiBaseReportUploader @uploaded="handleBaseReportUploaded" />
          </div>
        </div>

        <!-- 2. Import Source (impo) - BLUE -->
        <div class="card p-4 border-t-4 border-blue-500 flex flex-col h-full bg-white shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-blue-700 flex items-center gap-2">
              <span class="bg-blue-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
              impo 양식 (수입)
            </h3>
            <span v-if="blNumbers.length > 0" class="text-[10px] font-bold text-blue-500">{{ blNumbers.length }} BL</span>
          </div>
          <div class="flex-1">
            <KpiExcelUploader mode="import" @uploaded="handleFileUploaded" />
          </div>
        </div>

        <!-- 3. Reasons (사유) - AMBER -->
        <div class="card p-4 border-t-4 border-amber-500 flex flex-col h-full bg-white shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-amber-700 flex items-center gap-2">
              <span class="bg-amber-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
              사유(키워드) 매핑
            </h3>
            <span v-if="Object.keys(reasonMap).length > 0" class="text-[10px] font-bold text-amber-500">MAPPED</span>
          </div>
          <div class="flex-1">
            <KpiReasonUploader @uploaded="handleReasonUploaded" />
          </div>
        </div>

        <!-- 4. Export Source (expo) - EMERALD -->
        <div class="card p-4 border-t-4 border-emerald-500 flex flex-col h-full bg-white shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <span class="bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">4</span>
              expo 양식 (수출)
            </h3>
            <span v-if="declNumbers.length > 0" class="text-[10px] font-bold text-emerald-500">{{ declNumbers.length }} DECL</span>
          </div>
          <div class="flex-1">
            <KpiExcelUploader mode="export" @uploaded="handleExportFileUploaded" />
          </div>
        </div>
      </div>

      <!-- 통합 시작 버튼 (Full Width) -->
      <div class="mt-8">
        <button
          @click="startFullProcessing"
          :disabled="!isReadyToProcess || processing"
          class="btn btn-primary btn-lg w-full py-4 text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <span v-if="processing" class="animate-spin text-xl">🔄</span>
          <span>{{ processing ? `통합 처리 중... (${formatTime(processingTime)})` : 'KPI 통합 추출 시작' }}</span>
        </button>
        <p v-if="!isReadyToProcess" class="text-center text-gray-400 text-xs mt-3">
          수입(impo) 또는 수출(expo) 파일을 업로드하면 추출을 시작할 수 있습니다.
        </p>
      </div>
    </div>

    <!-- Step 2: Integrated Processing Status -->
    <KpiProcessingStatus
      v-if="processing || statistics || exportStatistics"
      :isProcessing="processing"
      :statistics="statistics"
      :currentStep="currentStep"
      :processingTime="processingTime"
      :processedCount="processedCount"
      :totalCount="totalCount"
      :currentPhase="currentPhase"
      mode="combined"
    />

    <!-- Step 3: Results Display -->
    <div v-if="importResults.length > 0 || exportResults.length > 0" class="mt-10">
      <div class="flex items-center justify-between mb-4 px-2">
        <div class="flex bg-gray-100 p-1 rounded-lg">
          <button 
            @click="viewTab = 'import'" 
            :class="['px-5 py-2 rounded-md font-bold text-sm transition-all', viewTab === 'import' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          >
            수입 결과 ({{ importResults.length }})
          </button>
          <button 
            @click="viewTab = 'export'" 
            :class="['px-5 py-2 rounded-md font-bold text-sm transition-all', viewTab === 'export' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          >
            수출 결과 ({{ exportResults.length }})
          </button>
        </div>

        <button
          @click="downloadKpiReport"
          :disabled="downloadingReport"
          class="btn btn-accent btn-md shadow-md"
        >
          {{ downloadingReport ? '파일 생성 중...' : '통합 리포트 다운로드 (.xlsx)' }}
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <KpiResultTable
          v-if="viewTab === 'import' && importResults.length > 0"
          :results="importResults"
          :originalFileName="uploadedFileName"
          :rawData="rawData"
        />

        <KpiExportResultTable
          v-if="viewTab === 'export' && exportResults.length > 0"
          :results="exportResults"
          :originalFileName="exportUploadedFileName"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import KpiExcelUploader from '~/components/kpi/KpiExcelUploader.vue';
import KpiReasonUploader from '~/components/kpi/KpiReasonUploader.vue';
import KpiBaseReportUploader from '~/components/kpi/KpiBaseReportUploader.vue';
import KpiProcessingStatus from '~/components/kpi/KpiProcessingStatus.vue';
import KpiResultTable from '~/components/kpi/KpiResultTable.vue';
import KpiExportResultTable from '~/components/kpi/KpiExportResultTable.vue';

const emit = defineEmits<{
  error: [message: string]
}>();

const kpiMode = ref<'import' | 'export'>('import');
const viewTab = ref<'import' | 'export'>('import');

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

const baseReportData = ref<{ importData: any[], exportData: any[] }>({
  importData: [],
  exportData: []
});

const processing = ref(false);
const processingTime = ref(0);
const currentStep = ref('');
const statistics = ref<any>(null);
const exportStatistics = ref<any>(null);
let processingTimer: NodeJS.Timeout | null = null;
const processedCount = ref(0);
const totalCount = ref(0);
const currentPhase = ref<'gmail' | 'unipass' | 'complete'>('gmail');
const downloadingReport = ref(false);

const isReadyToProcess = computed(() => blNumbers.value.length > 0 || declNumbers.value.length > 0);

const formatTime = (seconds: number): string => {
  if (!seconds) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}초`;
  return `${minutes}분 ${remainingSeconds}초`;
};

const handleFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[] }) => {
  uploadedFileName.value = data.fileName;
  blNumbers.value = data.blNumbers;
  rawData.value = data.rawData || [];
  importResults.value = [];
};

const handleExportFileUploaded = (data: { declNumbers: string[], fileName: string, exportCodeMap?: any }) => {
  exportUploadedFileName.value = data.fileName;
  declNumbers.value = data.declNumbers || [];
  exportCodeMap.value = data.exportCodeMap || {};
  exportResults.value = [];
};

const handleReasonUploaded = (data: { reasonMap: Record<string, string> }) => {
  reasonMap.value = data.reasonMap;
};

const handleBaseReportUploaded = (data: { importData: any[], exportData: any[] }) => {
  baseReportData.value = {
    importData: data.importData,
    exportData: data.exportData
  };
};

const startFullProcessing = async () => {
  processing.value = true;
  processingTime.value = 0;
  processedCount.value = 0;
  totalCount.value = blNumbers.value.length + declNumbers.value.length;
  
  if (processingTimer) clearInterval(processingTimer);
  processingTimer = setInterval(() => {
    processingTime.value++;
  }, 1000);

  try {
    if (blNumbers.value.length > 0) {
      currentPhase.value = 'gmail';
      currentStep.value = `수입 데이터(Gmail/Unipass) 조회 중... (${blNumbers.value.length}건)`;
      
      const impResponse = await $fetch('/api/kpi/process', {
        method: 'POST',
        body: {
          blNumbers: blNumbers.value,
          blYear: blYear.value,
          amatWeek: amatWeek.value,
          amatMonth: amatMonth.value,
          reasonMap: reasonMap.value,
        },
      });
      
      if (impResponse.success) {
        importResults.value = impResponse.results;
        statistics.value = impResponse.statistics;
        processedCount.value += blNumbers.value.length;
      }
    }

    if (declNumbers.value.length > 0) {
      currentPhase.value = 'unipass';
      currentStep.value = `수출 데이터(엑셀 기반) 계산 중... (${declNumbers.value.length}건)`;
      
      const expResponse = await $fetch('/api/kpi/process-export', {
        method: 'POST',
        body: {
          declNumbers: declNumbers.value,
          blYear: blYear.value,
          amatWeek: amatWeek.value,
          amatMonth: amatMonth.value,
          exportCodeMap: exportCodeMap.value,
        },
      });
      
      if (expResponse.success) {
        exportResults.value = expResponse.results;
        exportStatistics.value = expResponse.statistics;
        processedCount.value += declNumbers.value.length;
      }
    }

    currentPhase.value = 'complete';
    currentStep.value = `통합 처리 완료! (총 ${formatTime(processingTime.value)} 소요)`;
    viewTab.value = importResults.value.length > 0 ? 'import' : 'export';

  } catch (err: any) {
    console.error('Processing error:', err);
    emit('error', err.data?.statusMessage || '처리 중 오류가 발생했습니다.');
  } finally {
    processing.value = false;
    if (processingTimer) clearInterval(processingTimer);
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
        baseReportData: baseReportData.value,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Report Download] Error:', response.status, errorText);
      throw new Error(`리포트 생성 실패 (${response.status})`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KPI_Report_${amatWeek.value || 'Cumulative'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    alert(`다운로드 중 오류가 발생했습니다: ${err.message}`);
  } finally {
    downloadingReport.value = false;
  }
};
</script>

<style scoped>
.form-input {
  @apply px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm;
}
.card {
  @apply rounded-xl border border-gray-100;
}
</style>
