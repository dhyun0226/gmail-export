<template>
  <div class="kpi-container">
    <!-- 헤더 -->
    <div class="kpi-header">
      <h1>KPI 수입 데이터 처리</h1>
      <p>엑셀 파일을 업로드하여 BL 번호별 통관 정보를 조회합니다</p>
      <div v-if="isAuthenticated" class="user-info">
        <span>{{ userEmail }}</span>
        <button @click="logout" class="logout-btn">로그아웃</button>
      </div>
    </div>

    <!-- 로그인 섹션 -->
    <div v-if="!isAuthenticated" class="login-section">
      <div class="login-card">
        <h2>로그인이 필요합니다</h2>
        <p>Gmail 데이터 조회를 위해 Google 계정으로 로그인해주세요</p>
        <button @click="login" class="login-btn">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>
      </div>
    </div>

    <!-- 메인 컨텐츠 (로그인 후) -->
    <div v-else class="kpi-main">
      <!-- Step 1: 설정 및 파일 업로드 -->
      <div class="step-section">
        <div class="step-header">
          <span class="step-number">1</span>
          <h2>설정 및 파일 업로드</h2>
        </div>
        
        <!-- BL 년도 입력 -->
        <div class="setting-section">
          <label class="setting-label">BL 년도</label>
          <input 
            v-model="blYear" 
            type="number" 
            placeholder="2024"
            class="year-input"
            :disabled="processing"
          />
          <span class="setting-hint">유니패스 조회를 위한 년도를 입력하세요</span>
        </div>
        
        <!-- 파일 업로드 -->
        <div class="upload-section">
          <KpiExcelUploader @uploaded="handleFileUploaded" />
        </div>
        
        <!-- 추출 시작 버튼 -->
        <div v-if="uploadedFileName" class="action-section">
          <div class="file-info-display">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ uploadedFileName }}</span>
            <span class="file-status">준비 완료</span>
          </div>
          
          <button 
            @click="startProcessing" 
            :disabled="!blYear || !uploadedFileName || processing"
            class="extract-btn"
          >
            {{ processing ? `처리 중... (${formatTime(processingTime)})` : '추출 시작' }}
          </button>
          
          <div v-if="blNumbers.length > 0" class="bl-preview">
            <h3>추출된 BL 번호 ({{ blNumbers.length }}개)</h3>
            <div class="bl-list">
              <span v-for="bl in blNumbers.slice(0, 10)" :key="bl" class="bl-chip">
                {{ bl }}
              </span>
              <span v-if="blNumbers.length > 10" class="bl-more">
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

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-container">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import KpiExcelUploader from '~/components/kpi/KpiExcelUploader.vue';
import KpiProcessingStatus from '~/components/kpi/KpiProcessingStatus.vue';
import KpiResultTable from '~/components/kpi/KpiResultTable.vue';

// 상태 관리
const isAuthenticated = ref(false);
const userEmail = ref('');
const blNumbers = ref<string[]>([]);
const uploadedFileName = ref('');
const rawData = ref<any[]>([]); // 원본 엑셀 데이터 저장
const blYear = ref(new Date().getFullYear().toString());
const processing = ref(false);
const processingTime = ref(0); // 처리 경과 시간
const currentStep = ref('');
const results = ref<any[]>([]);
const statistics = ref(null);
const error = ref('');
let processingTimer: NodeJS.Timeout | null = null; // 타이머 ID 저장

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

// 인증 확인
const checkAuth = async () => {
  try {
    const data = await $fetch('/api/user');
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
      userEmail.value = data.user.email;
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
};

// 로그인
const login = () => {
  window.location.href = '/api/auth/google';
};

// 로그아웃
const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    isAuthenticated.value = false;
    userEmail.value = '';
    blNumbers.value = [];
    results.value = [];
    statistics.value = null;
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// 파일 업로드 완료 처리 (처리는 하지 않음)
const handleFileUploaded = (data: { blNumbers: string[], fileName: string, rawData?: any[] }) => {
  // 파일 정보만 저장, 실제 처리는 startProcessing에서 수행
  uploadedFileName.value = data.fileName;
  blNumbers.value = data.blNumbers;
  rawData.value = data.rawData || [];
  
  // 이전 결과 초기화
  results.value = [];
  statistics.value = null;
  error.value = '';
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
  
  // 데이터 처리 시작
  await processData();
  
  // 타이머 정지
  if (processingTimer) {
    clearInterval(processingTimer);
    processingTimer = null;
  }
};

// 실제 데이터 처리 로직 (단순화)
const processData = async () => {
  if (!blYear.value || blNumbers.value.length === 0) return;
  
  processing.value = true;
  error.value = '';
  results.value = [];
  processedCount.value = 0;
  totalCount.value = blNumbers.value.length;
  currentPhase.value = 'gmail';
  
  try {
    currentStep.value = `Gmail과 Unipass 데이터 조회 중... (${blNumbers.value.length}개 BL)`;
    
    // 단일 API 호출로 모든 BL 처리
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
    error.value = err.data?.statusMessage || '데이터 처리 중 오류가 발생했습니다.';
    
    if (err.data?.statusCode === 401) {
      setTimeout(() => {
        login();
      }, 2000);
    }
  } finally {
    processing.value = false;
  }
};

// 통계는 서버에서 생성하므로 로컬 통계 함수 제거

onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
.kpi-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.kpi-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  padding-top: 40px;
}

.kpi-header h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
}

.kpi-header p {
  font-size: 18px;
  opacity: 0.9;
}

.user-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.user-info span {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.logout-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
}

.login-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #1f2937;
}

.login-card p {
  color: #6b7280;
  margin-bottom: 24px;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px 24px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 24px;
  height: 24px;
}

.kpi-main {
  max-width: 1200px;
  margin: 0 auto;
}

.step-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 700;
}

.step-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.setting-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.year-input {
  width: 120px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.year-input:focus {
  outline: none;
  border-color: #667eea;
}

.year-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.setting-hint {
  font-size: 14px;
  color: #6b7280;
}

.upload-section {
  margin-bottom: 24px;
}

.action-section {
  margin-top: 24px;
}

.file-info-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 20px;
}

.file-icon {
  font-size: 24px;
}

.file-name {
  flex: 1;
  font-weight: 600;
  color: #1e40af;
}

.file-status {
  padding: 4px 12px;
  background: #10b981;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.extract-btn {
  width: 100%;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.extract-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.extract-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.bl-preview {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.bl-preview h3 {
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 12px 0;
}

.bl-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bl-chip {
  display: inline-block;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  color: #374151;
}

.bl-more {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}

.error-container {
  max-width: 600px;
  margin: 40px auto;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.error-icon {
  width: 32px;
  height: 32px;
  color: #ef4444;
  flex-shrink: 0;
}

.error-content p {
  margin: 0;
  color: #dc2626;
  font-size: 15px;
}
</style>