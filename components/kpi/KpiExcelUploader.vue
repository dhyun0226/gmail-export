<template>
  <div class="kpi-uploader">
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      class="upload-area"
      :class="{ 'drag-over': isDragging }"
      @click="() => fileInput?.click()"
    >
      <div v-if="!file" class="upload-prompt">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="upload-text">
          엑셀 파일을 드래그하거나 클릭하여 선택
        </p>
        <p class="upload-hint">KPI 수입.xls 또는 .xlsx 파일을 선택해주세요</p>
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          accept=".xlsx,.xls"
          class="file-input"
        />
      </div>
      
      <div v-else class="file-info">
        <div class="file-icon">📊</div>
        <div class="file-details">
          <h3>{{ file.name }}</h3>
          <p>{{ formatFileSize(file.size) }}</p>
        </div>
        <button @click.stop="removeFile" class="remove-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

// 부모에게 file-selected 이벤트를 발생시킴
const emit = defineEmits<{
  (e: 'file-selected', file: File | null): void
}>();

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const isDragging = ref(false);
const error = ref('');

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    selectFile(files[0]);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    selectFile(files[0]);
  }
};

const selectFile = (selectedFile: File) => {
  if (validateFile(selectedFile)) {
    file.value = selectedFile;
    error.value = '';
    emit('file-selected', file.value); // 파일 객체를 부모로 전달
  }
};

const validateFile = (f: File): boolean => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileExtension = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));
  if (!validExtensions.includes(fileExtension)) {
    error.value = '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.';
    return false;
  }
  if (f.size > 10 * 1024 * 1024) { // 10MB
    error.value = '파일 크기는 10MB 이하여야 합니다.';
    return false;
  }
  return true;
};

const removeFile = () => {
  file.value = null;
  error.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('file-selected', null); // 파일 제거를 부모로 전달
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
/* 스타일은 이전과 동일하게 유지됩니다. */
.kpi-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  background: #f9fafb;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #dbeafe;
}

.upload-prompt {
  text-align: center;
  position: relative;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #9ca3af;
}

.upload-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  font-size: 48px;
}

.file-details {
  flex: 1;
}

.file-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.file-details p {
  font-size: 14px;
  color: #6b7280;
}

.remove-btn {
  padding: 8px;
  background: #fee2e2;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #dc2626;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #fca5a5;
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