<template>
  <div class="reason-uploader">
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
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="upload-text">
          사유(키워드) 엑셀 파일을 드래그하거나 클릭하여 업로드
        </p>
        <p class="upload-hint">F열(BL번호) + K열(특이사항)이 포함된 파일</p>
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          accept=".xlsx,.xls"
          class="file-input"
        />
      </div>

      <div v-else class="file-info">
        <div class="file-icon">📋</div>
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

    <div v-if="file && !uploaded" class="action-buttons">
      <button @click="uploadFile" :disabled="uploading" class="upload-btn">
        {{ uploading ? '업로드 중...' : '사유 키워드 추출' }}
      </button>
    </div>

    <div v-if="uploaded" class="success-message">
      사유 키워드 {{ reasonCount }}건 추출 완료
    </div>

    <div v-if="error" class="error-message">
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

<style scoped>
.reason-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 30px 20px;
  background: #fefce8;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.upload-area:hover {
  border-color: #f59e0b;
  background: #fef9c3;
}

.upload-area.drag-over {
  border-color: #f59e0b;
  background: #fde68a;
}

.upload-prompt {
  text-align: center;
  position: relative;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #d97706;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.upload-hint {
  font-size: 13px;
  color: #92400e;
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
  font-size: 40px;
}

.file-details {
  flex: 1;
}

.file-details h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.file-details p {
  font-size: 13px;
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
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.upload-btn {
  padding: 10px 28px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: #d97706;
}

.upload-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.success-message {
  margin-top: 12px;
  padding: 10px;
  background: #d1fae5;
  color: #059669;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.error-message {
  margin-top: 12px;
  padding: 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  text-align: center;
}
</style>
