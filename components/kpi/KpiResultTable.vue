<template>
  <div v-if="results && results.length > 0" class="result-container mt-8">
    <div class="result-header">
      <div class="flex items-center gap-3">
        <h3 class="section-title">처리 결과</h3>
        <span class="badge badge-gray">총 {{ results.length }}건</span>
      </div>
      <button
        v-if="results.length > 0"
        @click="downloadExcel"
        :disabled="downloading"
        class="btn btn-accent btn-md"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12.5,10A3.5,3.5 0 0,1 16,13.5A3.5,3.5 0 0,1 12.5,17A3.5,3.5 0 0,1 9,13.5A3.5,3.5 0 0,1 12.5,10Z"/>
        </svg>
        <span>{{ downloading ? '다운로드 중...' : 'Excel 다운로드' }}</span>
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>순번</th>
            <th>B/L 번호</th>
            <th>메일 수신 시간</th>
            <th>하기신고수리일시</th>
            <th>창고반입일시</th>
            <th>수입신고일시</th>
            <th>수입신고수리일시</th>
            <th>Delay Reason</th>
            <th>Cont/Uncont</th>
            <th class="text-center">Gross</th>
            <th class="text-center">Net</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in displayResults" :key="index" :class="{ 'highlight-both-n': result.gross === 'N' && result.net === 'N', 'highlight-net-n': result.net === 'N' && result.gross !== 'N' }">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="font-mono font-semibold text-gray-900">{{ result.blNumber }}</td>
            <td>{{ result.mailReceiveTime || '' }}</td>
            <td>{{ result.lowerDeclAcceptTime || '' }}</td>
            <td>{{ result.warehouseEntryTime || '' }}</td>
            <td>{{ result.importDeclTime || '' }}</td>
            <td>{{ result.importAcceptTime || '' }}</td>
            <td class="max-w-[200px] whitespace-normal text-xs leading-relaxed">{{ result.delayReason || '' }}</td>
            <td>
              <span v-if="result.controllable" :class="['badge', result.controllable === 'Uncontrollable' ? 'badge-yellow' : 'badge-blue']">
                {{ result.controllable }}
              </span>
            </td>
            <td class="text-center">
              <span v-if="result.gross" :class="['badge', result.gross === 'Y' ? 'badge-green' : 'badge-red']">
                {{ result.gross }}
              </span>
            </td>
            <td class="text-center">
              <span v-if="result.net" :class="['badge', result.net === 'Y' ? 'badge-green' : 'badge-red']">
                {{ result.net }}
              </span>
            </td>
            <td>
              <span v-if="result.error" class="badge badge-red">{{ result.error }}</span>
              <span v-else-if="isComplete(result)" class="badge badge-green">완료</span>
              <span v-else-if="isPartial(result)" class="badge badge-yellow">부분완료</span>
              <span v-else class="badge badge-gray">데이터 없음</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="results.length > displayLimit" class="px-5 py-3 border-t border-gray-200 bg-gray-50/70 text-center">
      <button @click="showMore" class="btn btn-secondary btn-md">
        더 보기 ({{ results.length - displayLimit }}개 남음)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface KpiResult {
  blNumber: string;
  mailReceiveTime?: string;
  lowerDeclAcceptTime?: string;
  warehouseEntryTime?: string;
  importDeclTime?: string;
  importAcceptTime?: string;
  delayReason?: string;
  controllable?: string;
  gross?: string;
  net?: string;
  error?: string;
}

const props = defineProps<{
  results: KpiResult[];
  originalFileName?: string;
  rawData?: any[];
}>();

const displayLimit = ref(20);
const downloading = ref(false);

const displayResults = computed(() => {
  return props.results.slice(0, displayLimit.value);
});

const showMore = () => {
  displayLimit.value += 20;
};

const isComplete = (result: KpiResult): boolean => {
  return !!(
    result.lowerDeclAcceptTime &&
    result.warehouseEntryTime &&
    result.importDeclTime &&
    result.importAcceptTime
  );
};

const isPartial = (result: KpiResult): boolean => {
  const hasAnyUnipassData = !!(
    result.lowerDeclAcceptTime ||
    result.warehouseEntryTime ||
    result.importDeclTime ||
    result.importAcceptTime
  );
  return hasAnyUnipassData && !isComplete(result);
};

const downloadExcel = async () => {
  downloading.value = true;

  try {
    const response = await fetch('/api/kpi/export?format=xlsx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        results: props.results,
        originalFileName: props.originalFileName,
        rawData: props.rawData
      })
    });

    if (!response.ok) {
      throw new Error('다운로드 실패');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `KPI_결과_${timestamp}.xlsx`;

    a.click();
    window.URL.revokeObjectURL(url);

  } catch (err: any) {
    console.error('Excel 다운로드 오류:', err);
    alert('Excel 다운로드 중 오류가 발생했습니다.');
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.highlight-net-n {
  background-color: #fef2f2 !important;
}
.highlight-net-n td {
  border-left-color: #fecaca !important;
  border-right-color: #fecaca !important;
}
.highlight-net-n td:first-child {
  border-left: 3px solid #ef4444 !important;
}
.highlight-both-n {
  background-color: #fee2e2 !important;
}
.highlight-both-n td {
  border-left-color: #fca5a5 !important;
  border-right-color: #fca5a5 !important;
  font-weight: 600;
}
.highlight-both-n td:first-child {
  border-left: 4px solid #dc2626 !important;
}
</style>
