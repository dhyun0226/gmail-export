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
      <!-- ... (로그인 UI는 변경 없음) ... -->
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
      <!-- ... (에러 UI는 변경 없음) ... -->
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

// --- 인증 관련 (변경 없음) ---
const checkAuth = async () => { /* ... */ };
const login = () => { /* ... */ };
const logout = async () => { /* ... */ };

// --- 새로운 통합 프로세스 --- 

// 1. 자식 컴포넌트에서 파일 선택/제거 이벤트를 받음
const handleFileSelected = (file: File | null) => {
  selectedFile.value = file;
  if (file) {
    uploadedFileName.value = file.name;
  }
  // 파일이 바뀌면 이전 결과는 초기화
  results.value = [];
  statistics.value = null;
  error.value = '';
};

// 2. 타이머 시작/정지 함수
const startTimer = () => {
  stopTimer(); // 기존 타이머가 있다면 초기화
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
    // 3-1. Presigned URL 요청
    currentStep.value = '업로드 준비 중...';
    const presignResponse = await $fetch('/api/kpi/upload', {
      method: 'POST',
      body: { filename: selectedFile.value.name },
    });

    if (!presignResponse.success || !presignResponse.uploadUrl) {
      throw new Error('업로드 URL을 받아오지 못했습니다.');
    }

    // 3-2. Vercel Blob에 파일 업로드
    currentStep.value = '파일 업로드 중...';
    const blobUploadResult = await fetch(presignResponse.uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type },
    });

    if (!blobUploadResult.ok) {
      throw new Error('클라우드에 파일 업로드를 실패했습니다.');
    }

    // 3-3. 통합 처리 API 호출
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
/* --- 새로운 레이아웃 스타일 --- */
.input-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: center;
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

/* --- 기존 스타일 (변경 없음) --- */
.kpi-container, .kpi-header, .user-info, .logout-btn, .login-section, .login-card, .login-btn, .google-icon, .kpi-main, .step-section, .step-header, .step-number, .error-container, .error-content, .error-icon {
  /* ... */
}
</style>
