<template>
  <div class="result-table" v-if="results && results.length > 0">
    <div class="table-header">
      <div class="header-left">
        <h3>수출 KPI 결과</h3>
        <span class="result-count">총 {{ results.length }}건</span>
      </div>
      <button
        v-if="results.length > 0"
        @click="downloadExcel"
        :disabled="downloading"
        class="excel-download-btn"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12.5,10A3.5,3.5 0 0,1 16,13.5A3.5,3.5 0 0,1 12.5,17A3.5,3.5 0 0,1 9,13.5A3.5,3.5 0 0,1 12.5,10Z"/>
        </svg>
        <span>{{ downloading ? '다운로드 중...' : 'Excel 다운로드' }}</span>
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>순번</th>
            <th>신고번호</th>
            <th>세관</th>
            <th>C/S구분</th>
            <th>거래구분</th>
            <th>수출신고수리일시</th>
            <th>적재완료일시</th>
            <th>Gross</th>
            <th>Net</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in displayResults" :key="index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="bl-number">{{ result.declNumber }}</td>
            <td>{{ result.customsName || '' }}</td>
            <td>{{ result.inspectionType || '' }}</td>
            <td>{{ result.tradeType || '' }}</td>
            <td>{{ result.exportDeclAcceptTime || '' }}</td>
            <td>{{ result.loadingCompleteTime || '' }}</td>
            <td class="text-center">
              <span v-if="calcGross(result)" :class="['gross-badge', calcGross(result) === 'Y' ? 'yes' : 'no']">
                {{ calcGross(result) }}
              </span>
            </td>
            <td class="text-center">
              <span v-if="calcNet(result)" :class="['gross-badge', calcNet(result) === 'Y' ? 'yes' : 'no']">
                {{ calcNet(result) }}
              </span>
            </td>
            <td>
              <span v-if="result.error" class="status-badge error">
                {{ result.error }}
              </span>
              <span v-else-if="isComplete(result)" class="status-badge success">
                완료
              </span>
              <span v-else-if="isPartial(result)" class="status-badge partial">
                부분완료
              </span>
              <span v-else class="status-badge no-data">
                데이터 없음
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="results.length > displayLimit" class="table-footer">
      <button @click="showMore" class="show-more-btn">
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
  return calcGross(r); // 수출은 사유 없으므로 Gross와 동일
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

<style scoped>
.result-table {
  margin: 30px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.result-count {
  font-size: 14px;
  color: #6b7280;
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

tbody tr:hover {
  background: #f9fafb;
}

td {
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

.bl-number {
  font-weight: 600;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: #d1fae5;
  color: #059669;
}

.status-badge.partial {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.error {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.no-data {
  background: #e5e7eb;
  color: #6b7280;
}

.gross-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.gross-badge.yes {
  background: #d1fae5;
  color: #059669;
}

.gross-badge.no {
  background: #fee2e2;
  color: #dc2626;
}

.table-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.show-more-btn {
  padding: 10px 24px;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: #3b82f6;
  color: white;
}

.excel-download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.excel-download-btn:hover:not(:disabled) {
  background: #059669;
}

.excel-download-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.excel-download-btn .icon {
  width: 16px;
  height: 16px;
}
</style>
