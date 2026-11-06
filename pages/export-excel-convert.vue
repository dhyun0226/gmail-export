<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">수출 엑셀 자동변환</h1>
      <p class="page-subtitle">
        DGF 엑셀 파일(.xlsx, .xls)을 업로드하면 정해진 규칙에 맞춰 수출신고용 엑셀 양식으로 자동 변환하여 다운로드합니다.
      </p>
    </div>

    <!-- Upload Card -->
    <div class="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
        :class="isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx, .xls"
          class="hidden"
          @change="handleFileSelect"
        />
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-700">
              클릭하여 DGF 엑셀 파일을 선택하거나 여기로 드래그하세요
            </p>
            <p class="text-xs text-gray-400 mt-1">.xlsx, .xls 파일 지원</p>
          </div>
          <div v-if="selectedFileName" class="mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ selectedFileName }}
          </div>
        </div>
      </div>

      <!-- Action Button & Summary -->
      <div v-if="convertedRows.length > 0" class="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div class="text-sm text-gray-600">
          총 <span class="font-bold text-blue-600">{{ convertedRows.length }}</span> 건의 품목 데이터가 성공적으로 변환되었습니다.
        </div>
        <button
          @click="downloadExcel"
          class="btn btn-primary gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          변환된 수출 엑셀 다운로드
        </button>
      </div>
    </div>

    <!-- Rule Guide -->
    <div class="card p-5 bg-gray-50 rounded-xl border border-gray-200">
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">변환 규칙 안내</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
        <div>• <b>HS 코드</b>: Q열</div>
        <div>• <b>원산지</b>: V열</div>
        <div>• <b>포장수량/단위</b>: 0 / VO</div>
        <div>• <b>거래품명</b>: F열, H열</div>
        <div>• <b>모델명</b>: G열</div>
        <div>• <b>수량</b>: L열</div>
        <div>• <b>단위</b>: M열</div>
        <div>• <b>총금액</b>: N열</div>
        <div>• <b>단가</b>: 총금액 ÷ 수량</div>
        <div>• <b>순중량</b>: I열</div>
      </div>
    </div>

    <!-- Preview Table -->
    <div v-if="convertedRows.length > 0" class="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-800">변환 결과 미리보기 (상위 50건)</h2>
        <span class="text-xs text-gray-400">가로 스크롤 가능</span>
      </div>
      <div class="overflow-x-auto max-h-[500px]">
        <table class="w-full text-left text-xs text-gray-600 border-collapse">
          <thead class="bg-gray-50 text-gray-700 font-semibold sticky top-0 shadow-sm z-10">
            <tr>
              <th v-for="h in headers" :key="h" class="p-3 border-b whitespace-nowrap bg-gray-50">
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(row, idx) in previewRows" :key="idx" class="hover:bg-gray-50/80">
              <td class="p-3 whitespace-nowrap font-mono">{{ row['HS 코드'] }}</td>
              <td class="p-3 whitespace-nowrap font-medium text-center">{{ row['원산지'] }}</td>
              <td class="p-3 whitespace-nowrap text-right">{{ row['포장수량'] }}</td>
              <td class="p-3 whitespace-nowrap text-center">{{ row['포장단위'] }}</td>
              <td class="p-3 whitespace-nowrap max-w-xs truncate" :title="row['거래품명(=모델명2)']">
                {{ row['거래품명(=모델명2)'] }}
              </td>
              <td class="p-3 whitespace-nowrap font-mono">{{ row['모델명'] }}</td>
              <td class="p-3 whitespace-nowrap max-w-xs truncate" :title="row['모델명2']">
                {{ row['모델명2'] }}
              </td>
              <td class="p-3 whitespace-nowrap text-right font-medium">{{ row['수량'] }}</td>
              <td class="p-3 whitespace-nowrap text-center">{{ row['단위'] }}</td>
              <td class="p-3 whitespace-nowrap text-right font-mono">{{ formatNumber(row['단가']) }}</td>
              <td class="p-3 whitespace-nowrap text-right font-mono font-medium text-gray-900">{{ formatNumber(row['총금액']) }}</td>
              <td class="p-3 whitespace-nowrap text-right font-mono">{{ row['순중량'] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import {
  convertDgfWorkbookToExportRows,
  EXPORT_EXCEL_HEADERS,
  type ExportExcelRow
} from '~/utils/exportExcelConverter';

const headers = [...EXPORT_EXCEL_HEADERS];

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedFileName = ref('');
const convertedRows = ref<ExportExcelRow[]>([]);

const previewRows = computed(() => {
  return convertedRows.value.slice(0, 50);
});

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    processFile(file);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

const processFile = (file: File) => {
  selectedFileName.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const resultBuffer = e.target?.result;
      if (!resultBuffer) return;
      const data = new Uint8Array(resultBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      convertedRows.value = convertDgfWorkbookToExportRows(workbook);
    } catch (err) {
      console.error(err);
      alert('파일을 파싱하는 중 오류가 발생했습니다. DGF 엑셀 파일 형식을 확인해주세요.');
    }
  };

  reader.readAsArrayBuffer(file);
};

const formatNumber = (val: any) => {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const downloadExcel = () => {
  if (convertedRows.value.length === 0) return;

  const exportData = convertedRows.value.map((row) => ({
    'HS 코드': row['HS 코드'],
    '원산지': row['원산지'],
    '포장수량': row['포장수량'],
    '포장단위': row['포장단위'],
    '거래품명(=모델명2)': row['거래품명(=모델명2)'],
    '모델명': row['모델명'],
    '모델명2': row['모델명2'],
    '수량': row['수량'],
    '단위': row['단위'],
    '단가': row['단가'],
    '총금액': row['총금액'],
    '순중량': row['순중량']
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '수출 엑셀 자동변환');

  const baseName = selectedFileName.value.replace(/\.[^/.]+$/, '');
  const outFileName = `수출엑셀_자동변환_${baseName || 'export'}.xlsx`;

  XLSX.writeFile(workbook, outFileName);
};
</script>
