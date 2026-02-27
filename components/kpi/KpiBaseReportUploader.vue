<template>
  <div
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    class="relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center"
    :class="[
      isDragging ? 'border-primary-DEFAULT bg-primary-50' : 'border-gray-200 bg-gray-50',
      uploadedFile ? 'border-green-400 bg-green-50' : ''
    ]"
  >
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      accept=".xlsx,.xls"
      class="hidden"
    />

    <div v-if="!uploadedFile" @click="$refs.fileInput.click()" class="cursor-pointer">
      <div class="mb-2 text-gray-400">
        <svg class="mx-auto h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-700">기존 누적 KPI 리포트 파일 선택</p>
      <p class="text-xs text-gray-400 mt-1">드래그 앤 드롭 또는 클릭하여 업로드</p>
    </div>

    <div v-else class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-green-100">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="bg-green-100 p-2 rounded-lg">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="text-left overflow-hidden">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ uploadedFile.name }}</p>
          <p class="text-xs text-gray-500">데이터를 이어 붙일 기준 리포트입니다.</p>
        </div>
      </div>
      <button @click="removeFile" class="text-gray-400 hover:text-red-500 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx';

const emit = defineEmits<{
  uploaded: [data: { importData: any[], exportData: any[], fileName: string }]
}>();

const isDragging = ref(false);
const uploadedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) processFile(file);
};

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
};

const processFile = async (file: File) => {
  uploadedFile.value = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Import KPI 시트 찾기
    const importSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('import'));
    const importData = importSheetName 
      ? XLSX.utils.sheet_to_json(workbook.Sheets[importSheetName], { header: 1 })
      : [];
      
    // Export KPI 시트 찾기
    const exportSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('export'));
    const exportData = exportSheetName
      ? XLSX.utils.sheet_to_json(workbook.Sheets[exportSheetName], { header: 1 })
      : [];
    
    emit('uploaded', {
      importData,
      exportData,
      fileName: file.name
    });
  };
  reader.readAsArrayBuffer(file);
};

const removeFile = () => {
  uploadedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  emit('uploaded', { importData: [], exportData: [], fileName: '' });
};
</script>
