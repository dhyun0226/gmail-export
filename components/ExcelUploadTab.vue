<template>
  <div class="max-w-2xl mx-auto">
    <!-- 심플한 상단 영역 -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <label class="text-sm font-medium text-gray-600">BL 년도</label>
        <input
          v-model="blYear"
          type="number"
          class="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-light"
          placeholder="2024"
        />
      </div>
    </div>
    
    <!-- 파일 업로드 영역 (심플) -->
    <div v-if="!uploadedFile" 
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      @dragleave.prevent
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-light transition-colors cursor-pointer"
      :class="{ 'border-primary-light bg-blue-50': isDragging }"
      @click="$refs.fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <svg class="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      <p class="text-gray-700 font-medium">엑셀 파일 업로드</p>
      <p class="text-sm text-gray-500 mt-1">A열에 BL번호가 있는 파일</p>
    </div>

    <!-- 업로드된 파일 표시 (심플) -->
    <div v-if="uploadedFile && !excelProcessing && !excelResult" class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-700">{{ uploadedFile.name }}</span>
        </div>
        <button @click="removeFile" class="text-gray-400 hover:text-gray-600">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <button
        @click="processExcel"
        :disabled="!blYear"
        class="w-full bg-primary-dark text-white py-2 rounded-lg hover:bg-primary-dark transition"
        :class="{ '!bg-gray-400': !blYear }"
      >
        유니패스 조회 시작
      </button>
    </div>

    <!-- 처리 중 (심플) -->
    <div v-if="excelProcessing" class="border border-gray-200 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark mx-auto mb-3"></div>
      <p class="text-gray-600 mb-2">처리 중...</p>
      <p class="text-lg font-semibold text-primary-dark">{{ formatElapsedTime(elapsedTime) }}</p>
    </div>

    <!-- 처리 완료 (심플) -->
    <div v-if="excelResult" class="border border-green-200 bg-green-50 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-green-700">{{ excelResult.message }}</span>
      </div>
      <div class="flex gap-2">
        <button
          @click="downloadResult('xlsx')"
          :disabled="downloading === 'xlsx'"
          class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {{ downloading === 'xlsx' ? '다운로드 중...' : '엑셀 다운로드' }}
        </button>
        <button
          @click="downloadResult('csv')"
          :disabled="downloading === 'csv'"
          class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {{ downloading === 'csv' ? '다운로드 중...' : 'CSV 다운로드' }}
        </button>
      </div>
      <button
        @click="resetAll"
        class="w-full mt-2 text-gray-600 text-sm hover:text-gray-800 transition"
      >
        새 파일 업로드
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const uploadedFile = ref<File | null>(null);
const excelProcessing = ref(false);
const excelResult = ref<any>(null);
const blYear = ref(new Date().getFullYear().toString());
const isDragging = ref(false);
const elapsedTime = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);
const downloading = ref<false | 'xlsx' | 'csv'>(false);

const emit = defineEmits<{
  error: [message: string]
}>();

// 파일 크기 포맷
const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// 경과 시간 포맷 (초 -> 분:초)
const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}분 ${secs}초`;
};

// 타이머 시작
const startTimer = () => {
  elapsedTime.value = 0;
  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

// 타이머 정지
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

// 파일 드롭 처리
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (validateFile(file)) {
      uploadedFile.value = file;
      excelResult.value = null;
    }
  }
};

// 파일 선택 처리
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    if (validateFile(files[0])) {
      uploadedFile.value = files[0];
      excelResult.value = null;
    }
  }
};

// 파일 유효성 검사
const validateFile = (file: File): boolean => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension)) {
    emit('error', '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
    return false;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    emit('error', '파일 크기는 10MB 이하여야 합니다.');
    return false;
  }
  
  return true;
};

// 파일 제거
const removeFile = () => {
  uploadedFile.value = null;
  excelResult.value = null;
  const fileInput = $refs.fileInput as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

// 엑셀 파일 처리
const processExcel = async () => {
  if (!uploadedFile.value) return;
  
  excelProcessing.value = true;
  excelResult.value = null;
  startTimer(); // 타이머 시작
  
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value);
    formData.append('blYear', blYear.value);
    
    const response = await $fetch('/api/excel/process', {
      method: 'POST',
      body: formData
    });
    
    excelResult.value = response;
  } catch (err: any) {
    emit('error', err.data?.statusMessage || '엑셀 파일 처리 중 오류가 발생했습니다.');
  } finally {
    excelProcessing.value = false;
    stopTimer(); // 타이머 정지
  }
};

// 결과 파일 다운로드
const downloadResult = async (format: 'xlsx' | 'csv') => {
  if (!excelResult.value) return;

  downloading.value = format;

  try {
    const body: any = {
      format: format
    };

    // CSV인 경우 results 데이터 사용, Excel인 경우 fileData 사용
    if (format === 'csv') {
      body.data = excelResult.value.results;
    } else {
      body.fileData = excelResult.value.fileData;
    }

    const response = await fetch('/api/excel/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('다운로드에 실패했습니다.');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `유니패스_조회결과_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    emit('error', `${format.toUpperCase()} 다운로드 중 오류가 발생했습니다.`);
  } finally {
    downloading.value = false;
  }
};

// 전체 초기화
const resetAll = () => {
  uploadedFile.value = null;
  excelResult.value = null;
  excelProcessing.value = false;
  stopTimer(); // 타이머 정지
  elapsedTime.value = 0;
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  stopTimer();
});
</script>