<template>
  <div class="download-section" v-if="hasResults">
    <div class="download-header">
      <h3>결과 다운로드</h3>
      <p>처리된 데이터를 엑셀 또는 CSV 형식으로 다운로드할 수 있습니다.</p>
    </div>
    
    <div class="download-buttons">
      <button 
        @click="download('xlsx')" 
        :disabled="downloading === 'xlsx'"
        class="download-btn excel"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12.5,10A3.5,3.5 0 0,1 16,13.5A3.5,3.5 0 0,1 12.5,17A3.5,3.5 0 0,1 9,13.5A3.5,3.5 0 0,1 12.5,10Z"/>
        </svg>
        <span>{{ downloading === 'xlsx' ? '다운로드 중...' : 'Excel 다운로드' }}</span>
      </button>
      
      <button 
        @click="download('csv')" 
        :disabled="downloading === 'csv'"
        class="download-btn csv"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span>{{ downloading === 'csv' ? '다운로드 중...' : 'CSV 다운로드' }}</span>
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  results: any[];
  originalFileName?: string;
  hasResults: boolean;
  rawData?: any[];
}>();

const downloading = ref<false | 'xlsx' | 'csv'>(false);
const error = ref('');

const download = async (format: 'xlsx' | 'csv') => {
  downloading.value = format;
  error.value = '';
  
  try {
    const response = await fetch(`/api/kpi/export?format=${format}`, {
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
    a.download = format === 'xlsx' 
      ? `KPI_결과_${timestamp}.xlsx`
      : `KPI_결과_${timestamp}.csv`;
    
    a.click();
    window.URL.revokeObjectURL(url);
    
  } catch (err: any) {
    error.value = `${format.toUpperCase()} 다운로드 중 오류가 발생했습니다.`;
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.download-section {
  margin: 30px 0;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.download-header {
  margin-bottom: 24px;
}

.download-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.download-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.download-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  justify-content: center;
}

.download-btn.excel {
  background: #10b981;
  color: white;
}

.download-btn.excel:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.download-btn.csv {
  background: #3b82f6;
  color: white;
}

.download-btn.csv:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.download-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.icon {
  width: 20px;
  height: 20px;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  text-align: center;
}
</style>