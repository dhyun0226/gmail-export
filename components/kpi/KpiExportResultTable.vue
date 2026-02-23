<template>
  <div v-if="results && results.length > 0" class="result-container mt-8">
    <div class="result-header">
      <div class="flex items-center gap-3">
        <h3 class="section-title">수출 KPI 결과</h3>
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
            <th>신고번호</th>
            <th>세관</th>
            <th>C/S구분</th>
            <th>거래구분</th>
            <th>수출신고수리일시</th>
            <th>적재완료일시</th>
            <th class="text-center">Gross</th>
            <th class="text-center">Net</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in displayResults" :key="index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="font-mono font-semibold text-gray-900">{{ result.declNumber }}</td>
            <td>{{ result.customsName || '' }}</td>
            <td>{{ result.inspectionType || '' }}</td>
            <td>{{ result.tradeType || '' }}</td>
            <td>{{ result.exportDeclAcceptTime || '' }}</td>
            <td>{{ result.loadingCompleteTime || '' }}</td>
            <td class="text-center">
              <span v-if="calcGross(result)" :class="['badge', calcGross(result) === 'Y' ? 'badge-green' : 'badge-red']">
                {{ calcGross(result) }}
              </span>
            </td>
            <td class="text-center">
              <span v-if="calcNet(result)" :class="['badge', calcNet(result) === 'Y' ? 'badge-green' : 'badge-red']">
                {{ calcNet(result) }}
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

interface ExportResult {
  declNumber: string;
  customsName?: string;
  inspectionType?: string;
  tradeType?: string;
  exportDeclAcceptTime?: string;
  loadingCompleteTime?: string;
  error?: string;
}

const props = defineProps<{
  results: ExportResult[];
  originalFileName?: string;
}>();

const displayLimit = ref(20);
const downloading = ref(false);

const displayResults = computed(() => {
  return props.results.slice(0, displayLimit.value);
});

const showMore = () => {
  displayLimit.value += 20;
};

const calcDiffDays = (end?: string, start?: string): number | null => {
  if (!end || !start) return null;
  const e = new Date(end);
  const s = new Date(start);
  if (isNaN(e.getTime()) || isNaN(s.getTime())) return null;
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
};

const calcGross = (r: ExportResult): string => {
  const actual = calcDiffDays(r.loadingCompleteTime, r.exportDeclAcceptTime);
  if (actual === null) return '';
  const diff = Math.round((actual - 0.0625) * 10000) / 10000;
  return diff > 0 ? 'N' : 'Y';
};

const calcNet = (r: ExportResult): string => {
  return calcGross(r);
};

const isComplete = (result: ExportResult): boolean => {
  return !!(result.exportDeclAcceptTime && result.loadingCompleteTime);
};

const isPartial = (result: ExportResult): boolean => {
  return !!(result.exportDeclAcceptTime || result.loadingCompleteTime) && !isComplete(result);
};

const downloadExcel = async () => {
  downloading.value = true;

  try {
    const response = await fetch('/api/kpi/export?format=xlsx&mode=export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: props.results,
        originalFileName: props.originalFileName,
      }),
    });

    if (!response.ok) throw new Error('다운로드 실패');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KPI_Export_결과_${new Date().toISOString().split('T')[0]}.xlsx`;
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
