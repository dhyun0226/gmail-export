<template>
  <div class="result-table" v-if="results && results.length > 0">
    <div class="table-header">
      <h3>처리 결과</h3>
      <span class="result-count">총 {{ results.length }}건</span>
    </div>
    
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>순번</th>
            <th>B/L 번호</th>
            <th>메일 수신 시간</th>
            <th>하기신고수리일시</th>
            <th>창고반입일시</th>
            <th>수입신고일시</th>
            <th>수입신고수리일시</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in displayResults" :key="index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="bl-number">{{ result.blNumber }}</td>
            <td>{{ result.mailReceiveTime || '-' }}</td>
            <td>{{ result.lowerDeclAcceptTime || '-' }}</td>
            <td>{{ result.warehouseEntryTime || '-' }}</td>
            <td>{{ result.importDeclTime || '-' }}</td>
            <td>{{ result.importAcceptTime || '-' }}</td>
            <td>
              <span v-if="result.error" class="status-badge error">
                {{ result.error }}
              </span>
              <span v-else-if="isComplete(result)" class="status-badge success">
                완료
              </span>
              <span v-else class="status-badge partial">
                부분완료
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

interface KpiResult {
  blNumber: string;
  mailReceiveTime?: string;
  lowerDeclAcceptTime?: string;
  warehouseEntryTime?: string;
  importDeclTime?: string;
  importAcceptTime?: string;
  error?: string;
}

const props = defineProps<{
  results: KpiResult[];
}>();

const displayLimit = ref(20);

const displayResults = computed(() => {
  return props.results.slice(0, displayLimit.value);
});

const showMore = () => {
  displayLimit.value += 20;
};

const isComplete = (result: KpiResult): boolean => {
  return !!(
    result.mailReceiveTime &&
    result.lowerDeclAcceptTime &&
    result.warehouseEntryTime &&
    result.importDeclTime &&
    result.importAcceptTime
  );
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
  transform: translateY(-1px);
}
</style>