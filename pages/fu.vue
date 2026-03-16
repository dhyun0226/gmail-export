<template>
  <div>
    <div class="page-header mb-8">
      <h1 class="page-title">FU 필터링</h1>
      <p class="page-subtitle">원본 엑셀의 FU 열을 기준으로 필터링 코드에 해당하는 행만 추출합니다.</p>
    </div>

    <!-- 파일 업로드 -->
    <div class="mb-6 flex flex-col gap-5">
      <!-- 원본 엑셀 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <label class="block text-sm font-bold text-gray-700 mb-2">1. 원본 엑셀 (FU 열 포함)</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          @change="onOriginalFile"
          :disabled="processing"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />
        <p v-if="originalFileName" class="mt-1.5 text-xs text-gray-500">{{ originalFileName }}</p>
      </div>

      <!-- 필터링 엑셀 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <label class="block text-sm font-bold text-gray-700 mb-2">2. 필터링 엑셀 (A열에 코드 목록, 헤더 없음)</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          @change="onFilterFile"
          :disabled="processing"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />
        <p v-if="filterFileName" class="mt-1.5 text-xs text-gray-500">{{ filterFileName }}</p>
      </div>
    </div>

    <!-- 실행 버튼 -->
    <div class="mb-6">
      <button
        @click="processFilter"
        :disabled="!originalFile || !filterFile || processing"
        class="btn btn-primary btn-lg gap-2"
      >
        <svg v-if="!processing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
        </svg>
        <span v-if="processing" class="animate-spin">&#8635;</span>
        {{ processing ? '처리 중...' : '필터링 후 다운로드' }}
      </button>
    </div>

    <!-- 에러 -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 성공 -->
    <div v-if="successMsg" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const originalFile = ref<File | null>(null);
const filterFile = ref<File | null>(null);
const originalFileName = ref('');
const filterFileName = ref('');
const processing = ref(false);
const error = ref('');
const successMsg = ref('');

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsArrayBuffer(file);
  });
};

const onOriginalFile = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    originalFile.value = target.files[0];
    originalFileName.value = target.files[0].name;
    error.value = '';
    successMsg.value = '';
  }
};

const onFilterFile = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    filterFile.value = target.files[0];
    filterFileName.value = target.files[0].name;
    error.value = '';
    successMsg.value = '';
  }
};

const processFilter = async () => {
  if (!originalFile.value || !filterFile.value) return;

  processing.value = true;
  error.value = '';
  successMsg.value = '';

  try {
    // XLSX 동적 import (브라우저에서만)
    const XLSX = await import('xlsx');

    // 두 파일 동시 읽기
    const [originalBuf, filterBuf] = await Promise.all([
      readFileAsArrayBuffer(originalFile.value),
      readFileAsArrayBuffer(filterFile.value),
    ]);

    // 필터링 엑셀: A열 코드 목록 (헤더 없음)
    const filterWorkbook = XLSX.read(filterBuf, { type: 'array' });
    const filterSheet = filterWorkbook.Sheets[filterWorkbook.SheetNames[0]];
    const filterRows: any[][] = XLSX.utils.sheet_to_json(filterSheet, { header: 1 });
    const filterCodes = new Set(
      filterRows.map((row) => String(row[0] ?? '').trim()).filter((v) => v !== '')
    );

    if (filterCodes.size === 0) {
      throw new Error('필터링 엑셀에 코드가 없습니다.');
    }

    // 원본 엑셀 읽기
    const originalWorkbook = XLSX.read(originalBuf, { type: 'array' });
    const originalSheet = originalWorkbook.Sheets[originalWorkbook.SheetNames[0]];
    const originalRows: any[][] = XLSX.utils.sheet_to_json(originalSheet, { header: 1 });

    if (originalRows.length === 0) {
      throw new Error('원본 엑셀이 비어있습니다.');
    }

    // 헤더에서 FU 열 찾기
    const headerRow = originalRows[0];
    const fuColIndex = headerRow.findIndex(
      (cell: any) => String(cell ?? '').trim().toUpperCase() === 'FU'
    );

    if (fuColIndex === -1) {
      throw new Error('원본 엑셀에서 FU 열을 찾을 수 없습니다.');
    }

    // 필터링: 헤더 + FU 열 값이 필터 코드에 있는 행
    const filteredRows: any[][] = [headerRow];
    for (let i = 1; i < originalRows.length; i++) {
      const row = originalRows[i];
      const fuValue = String(row[fuColIndex] ?? '').trim();
      if (filterCodes.has(fuValue)) {
        filteredRows.push(row);
      }
    }

    // 결과 엑셀 생성
    const resultWorkbook = XLSX.utils.book_new();
    const resultSheet = XLSX.utils.aoa_to_sheet(filteredRows);

    if (originalSheet['!cols']) {
      resultSheet['!cols'] = originalSheet['!cols'];
    }

    XLSX.utils.book_append_sheet(resultWorkbook, resultSheet, 'FU 필터링');

    // 다운로드
    const wbout = XLSX.write(resultWorkbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FU_필터링_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    successMsg.value = `필터링 완료! ${filteredRows.length - 1}건 추출되었습니다.`;
  } catch (err: any) {
    error.value = err.message || '필터링 처리 중 오류가 발생했습니다.';
  } finally {
    processing.value = false;
  }
};
</script>
