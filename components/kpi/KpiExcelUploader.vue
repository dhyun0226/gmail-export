<template>
  <div class="kpi-uploader">
    <div
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      @dragleave.prevent
      class="upload-area"
      :class="{ 'drag-over': isDragging }"
    >
      <div v-if="!file" class="upload-prompt">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="upload-text">
          엑셀 파일을 드래그하거나 클릭하여 업로드
        </p>
        <p class="upload-hint">KPI 수입.xls 파일을 업로드해주세요</p>
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
        <button @click="removeFile" class="remove-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="file" class="action-buttons">
      <button @click="uploadFile" :disabled="uploading" class="upload-btn">
        {{ uploading ? '업로드 중...' : 'BL 번호 추출' }}
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const emit = defineEmits<{
  uploaded: [data: { blNumbers: string[], fileName: string, rawData?: any[] }]
}>();

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const error = ref('');

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const droppedFile = files[0];
    if (validateFile(droppedFile)) {
      file.value = droppedFile;
      error.value = '';
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
    
    const response = await $fetch('/api/kpi/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      emit('uploaded', {
        blNumbers: response.blNumbers,
        fileName: response.fileName,
        rawData: response.rawData
      });
    } else {
      error.value = response.error || '업로드 실패';
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

<style scoped>
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

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.upload-btn {
  padding: 12px 32px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.upload-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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