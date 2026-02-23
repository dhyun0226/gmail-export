<template>
  <div class="w-full max-w-[600px] mx-auto">
    <div
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      @dragleave.prevent
      :class="['upload-zone relative', isDragging && 'upload-zone-active']"
    >
      <div v-if="!file" class="relative">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="text-sm font-semibold text-gray-800 mb-1">
          사유(키워드) 엑셀 파일을 드래그하거나 클릭하여 업로드
        </p>
        <p class="text-xs text-gray-500">F열(BL번호) + K열(특이사항)이 포함된 파일</p>
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          accept=".xlsx,.xls"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div v-else class="flex items-center gap-4">
        <div class="text-3xl">📋</div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-800 truncate">{{ file.name }}</h3>
          <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
        </div>
        <button @click="removeFile" class="btn btn-ghost btn-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="file && !uploaded" class="mt-4 flex justify-center">
      <button
        @click="uploadFile"
        :disabled="uploading"
        class="btn btn-primary btn-md"
      >
        {{ uploading ? '업로드 중...' : '사유 키워드 추출' }}
      </button>
    </div>

    <div v-if="uploaded" class="alert alert-success mt-3 justify-center font-semibold">
      사유 키워드 {{ reasonCount }}건 추출 완료
    </div>

    <div v-if="error" class="alert alert-error mt-3 justify-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  uploaded: [data: { reasonMap: Record<string, string>, fileName: string, rowCount: number }]
}>();

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploaded = ref(false);
const reasonCount = ref(0);
const error = ref('');

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    if (validateFile(files[0])) {
      file.value = files[0];
      error.value = '';
      uploaded.value = false;
    }
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    if (validateFile(files[0])) {
      file.value = files[0];
      error.value = '';
      uploaded.value = false;
    }
  }
};

const validateFile = (f: File): boolean => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileExtension = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));

  if (!validExtensions.includes(fileExtension)) {
    error.value = '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.';
    return false;
  }

  if (f.size > 10 * 1024 * 1024) {
    error.value = '파일 크기는 10MB 이하여야 합니다.';
    return false;
  }

  return true;
};

const removeFile = () => {
  file.value = null;
  error.value = '';
  uploaded.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const uploadFile = async () => {
  if (!file.value) return;

  uploading.value = true;
  error.value = '';

  try {
    const formData = new FormData();
    formData.append('file', file.value);

    const response = await $fetch('/api/kpi/upload-reasons', {
      method: 'POST',
      body: formData,
    });

    if (response.success) {
      uploaded.value = true;
      reasonCount.value = response.rowCount;
      emit('uploaded', {
        reasonMap: response.reasonMap,
        fileName: response.fileName,
        rowCount: response.rowCount,
      });
    } else {
      error.value = '업로드 실패';
    }
  } catch (err: any) {
    error.value = err.message || '업로드 중 오류가 발생했습니다.';
  } finally {
    uploading.value = false;
  }
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
</script>
