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
      <!-- Step 1: 파일 및 년도 입력 -->
      <div class="step-section">
        <div class="step-header">
          <span class="step-number">1</span>
          <h2>입력 정보</h2>
        </div>
        <div class="input-grid">
          <div class="uploader-wrapper">
            <KpiExcelUploader @file-selected="handleFileSelected" />
          </div>
          <div class="year-input-wrapper">
            <label for="blYearInput" class="year-label">BL 년도</label>
            <input 
              id="blYearInput"
              v-model="blYear" 
              type="number" 
              placeholder="예: 2024"
              class="year-input"
            />
          </div>
        </div>
        <div class="action-wrapper">
          <button 
            @click="startFullProcess" 
            :disabled="!selectedFile || !blYear || processing"
            class="process-btn"
          >
            {{ processing ? '처리 중...' : '업로드 및 조회 시작' }}
          </button>
        </div>
      </div>

      <!-- Step 2: 처리 상태 -->
      <KpiProcessingStatus 
        :isProcessing="processing"
        :statistics="statistics"
        :currentStep="currentStep"
      >
        <template #timer v-if="processing && elapsedSeconds > 0">
          <p class="timer-text">처리 중... ({{ elapsedSeconds }}초)</p>
        </template>
      </KpiProcessingStatus>

      <!-- Step 3: 결과 테이블 -->
      <KpiResultTable 
        v-if="results.length > 0"
        :results="results"
      />

      <!-- Step 4: 다운로드 -->
      <KpiDownloadButton 
        :results="results"
        :originalFileName="uploadedFileName"
        :hasResults="results.length > 0"
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
import KpiDownloadButton from '~/components/kpi/KpiDownloadButton.vue';

// --- 상태 관리 ---
const isAuthenticated = ref(false);
const userEmail = ref('');
const selectedFile = ref<File | null>(null);
const uploadedFileName = ref('');
const blYear = ref(new Date().getFullYear().toString());
const processing = ref(false);
const currentStep = ref('');
const results = ref<any[]>([]);
const statistics = ref(null);
const error = ref('');

// --- 타이머 상태 ---
const elapsedSeconds = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);

// --- 인증 관련 ---
const checkAuth = async () => {
  try {
    const data = await $fetch('/api/user');
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
      userEmail.value = data.user.email;
    }
  } catch (err) {
    isAuthenticated.value = false;
  }
};

const login = () => {
  window.location.href = '/api/auth/google';
};

const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// --- 새로운 통합 프로세스 ---

// 1. 자식 컴포넌트에서 파일 선택/제거 이벤트를 받음
const handleFileSelected = (file: File | null) => {
  selectedFile.value = file;
  if (file) {
    uploadedFileName.value = file.name;
  }
  results.value = [];
  statistics.value = null;
  error.value = '';
};

// 2. 타이머 시작/정지 함수
const startTimer = () => {
  stopTimer();
  elapsedSeconds.value = 0;
  timerInterval.value = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

// 3. "업로드 및 조회 시작" 버튼에 연결된 메인 함수
const startFullProcess = async () => {
  if (!selectedFile.value || !blYear.value) return;

  processing.value = true;
  error.value = '';
  results.value = [];
  statistics.value = null;
  startTimer();

  try {
    currentStep.value = '업로드 준비 중...';
    const presignResponse = await $fetch('/api/kpi/upload', {
      method: 'POST',
      body: { filename: selectedFile.value.name },
    });

    if (!presignResponse.success || !presignResponse.uploadUrl) {
      throw new Error('업로드 URL을 받아오지 못했습니다.');
    }

    currentStep.value = '파일 업로드 중...';
    const blobUploadResult = await fetch(presignResponse.uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type },
    });

    if (!blobUploadResult.ok) {
      throw new Error('클라우드에 파일 업로드를 실패했습니다.');
    }

    currentStep.value = 'Gmail 및 유니패스 데이터 조회 중...';
    const processResponse = await $fetch('/api/kpi/process-blob', {
      method: 'POST',
      body: { 
        pathname: presignResponse.pathname,
        blYear: blYear.value
      },
    });

    if (processResponse.success) {
      results.value = processResponse.results;
      statistics.value = processResponse.statistics;
      currentStep.value = '처리 완료!';
    } else {
      throw new Error(processResponse.error || '서버에서 데이터를 처리하지 못했습니다.');
    }

  } catch (err: any) {
    console.error('Full process failed:', err);
    error.value = err.data?.statusMessage || err.message || '알 수 없는 오류가 발생했습니다.';
    currentStep.value = '오류 발생';
    if (err.data?.statusCode === 401) {
      setTimeout(() => login(), 2000);
    }
  } finally {
    processing.value = false;
    stopTimer();
  }
};

onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
/* 전체적인 스타일 복구 */
.kpi-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
}

.kpi-header {
  text-align: center;
  color: #1f2937;
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
  color: #4b5563;
}

.user-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.user-info span {
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
}

.logout-btn {
  padding: 8px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #f9fafb;
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
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

.input-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: flex-start;
}

.year-input-wrapper {
  display: flex;
  flex-direction: column;
}

.year-label {
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.year-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.year-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.action-wrapper {
  margin-top: 24px;
  text-align: center;
}

.process-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.process-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.timer-text {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin-top: 16px;
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