<template>
  <div class="max-w-2xl mx-auto">
    <!-- BL Year -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <label class="form-label mb-0">BL 년도</label>
        <input
          v-model="blYear"
          type="number"
          class="form-input w-24"
          placeholder="2024"
        />
      </div>
    </div>

    <!-- File Upload Zone -->
    <div v-if="!uploadedFile"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      @dragleave.prevent
      :class="['upload-zone', isDragging && 'upload-zone-active']"
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

      <p class="text-sm font-medium text-gray-700">엑셀 파일 업로드</p>
      <p class="text-xs text-gray-500 mt-1">A열에 BL번호가 있는 파일</p>
    </div>

    <!-- Uploaded File -->
    <div v-if="uploadedFile && !excelProcessing && !excelResult" class="card p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-gray-700">{{ uploadedFile.name }}</span>
        </div>
        <button @click="removeFile" class="btn btn-ghost btn-sm">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <button
        @click="processExcel"
        :disabled="!blYear"
        class="btn btn-primary btn-lg w-full"
      >
        유니패스 조회 시작
      </button>
    </div>

    <!-- Processing -->
    <div v-if="excelProcessing" class="card p-8 text-center">
      <div class="spinner-lg mx-auto mb-3"></div>
      <p class="text-sm text-gray-600 mb-2">처리 중...</p>
      <p class="text-lg font-semibold text-gray-900">{{ formatElapsedTime(elapsedTime) }}</p>
    </div>

    <!-- Result -->
    <div v-if="excelResult" class="alert alert-success flex-col !items-stretch">
      <div class="flex items-center justify-between mb-3">
        <span class="font-medium">{{ excelResult.message }}</span>
      </div>
      <div class="flex gap-2">
        <button
          @click="downloadResult('xlsx')"
          :disabled="downloading === 'xlsx'"
          class="btn btn-accent btn-md flex-1"
        >
          {{ downloading === 'xlsx' ? '다운로드 중...' : '엑셀 다운로드' }}
        </button>
        <button
          @click="downloadResult('csv')"
          :disabled="downloading === 'csv'"
          class="btn btn-primary btn-md flex-1"
        >
          {{ downloading === 'csv' ? '다운로드 중...' : 'CSV 다운로드' }}
        </button>
      </div>
      <button
        @click="resetAll"
        class="w-full mt-2 text-gray-500 text-sm hover:text-gray-700 transition-colors py-1"
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

const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}분 ${secs}초`;
};

const startTimer = () => {
  elapsedTime.value = 0;
  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

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

const removeFile = () => {
  uploadedFile.value = null;
  excelResult.value = null;
};

const processExcel = async () => {
  if (!uploadedFile.value) return;

  excelProcessing.value = true;
  excelResult.value = null;
  startTimer();

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
    stopTimer();
  }
};

const downloadResult = async (format: 'xlsx' | 'csv') => {
  if (!excelResult.value) return;

  downloading.value = format;

  try {
    const body: any = {
      format: format
    };

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

const resetAll = () => {
  uploadedFile.value = null;
  excelResult.value = null;
  excelProcessing.value = false;
  stopTimer();
  elapsedTime.value = 0;
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

onUnmounted(() => {
  stopTimer();
});
</script>
