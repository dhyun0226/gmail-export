<template>
  <div class="processing-status" v-if="isProcessing || statistics">
    <div class="status-header">
      <h3>처리 상태</h3>
      <div v-if="isProcessing" class="spinner"></div>
    </div>
    
    <div v-if="isProcessing" class="progress-info">
      <p>BL 번호 데이터를 조회하고 있습니다...</p>
      <p class="progress-detail">{{ currentStep }}</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
    
    <div v-if="statistics" class="statistics">
      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-label">전체</div>
          <div class="stat-value">{{ statistics.total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">메일 수신</div>
          <div class="stat-value">{{ statistics.withMailData }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">하기신고수리</div>
          <div class="stat-value">{{ statistics.withLowerDeclAccept }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">창고반입</div>
          <div class="stat-value">{{ statistics.withWarehouseEntry }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">수입신고</div>
          <div class="stat-value">{{ statistics.withImportDecl }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">수입신고수리</div>
          <div class="stat-value">{{ statistics.withImportAccept }}</div>
        </div>
        <div class="stat-item success">
          <div class="stat-label">완료</div>
          <div class="stat-value">{{ statistics.complete }}</div>
        </div>
        <div class="stat-item error" v-if="statistics.withError > 0">
          <div class="stat-label">오류</div>
          <div class="stat-value">{{ statistics.withError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

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
  statistics?: Statistics;
  currentStep?: string;
}>();

const progressPercent = ref(0);

watch(() => props.isProcessing, (newVal) => {
  if (newVal) {
    // 처리 시작시 진행률 애니메이션
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

<style scoped>
.processing-status {
  margin: 30px 0;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.status-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-info {
  margin-bottom: 20px;
}

.progress-info p {
  margin: 8px 0;
  color: #4b5563;
}

.progress-detail {
  font-size: 14px;
  color: #6b7280;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.statistics {
  margin-top: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.stat-item.success {
  background: #d1fae5;
  border-color: #6ee7b7;
}

.stat-item.error {
  background: #fee2e2;
  border-color: #fca5a5;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-item.success .stat-value {
  color: #059669;
}

.stat-item.error .stat-value {
  color: #dc2626;
}
</style>