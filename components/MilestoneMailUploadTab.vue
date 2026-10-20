<template>
  <div class="max-w-5xl mx-auto">
    <!-- BL Year -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <label class="form-label mb-0 font-semibold text-gray-700">BL 연도</label>
        <input
          v-model="blYear"
          type="number"
          class="form-input w-28 text-center"
          placeholder="2026"
        />
      </div>
      <p class="text-xs text-gray-500">
        * POP3 직접 수신 불가 환경에 맞춘 파일 업로드 기반 마일스톤 생성기입니다.
      </p>
    </div>

    <!-- Upload Zones (2-Column Grid) -->
    <div v-if="!processing && !result" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 1. Mail List File (Required) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            1. 메일 목록 파일 <span class="text-red-500 text-xs">(필수)</span>
          </label>
          <span class="text-xs text-gray-400">마일스톤 메일목록.xls</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!mailFile"
          @drop.prevent="handleMailDrop"
          @dragover.prevent="isDraggingMail = true"
          @dragleave.prevent="isDraggingMail = false"
          @click="$refs.mailFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-xl cursor-pointer transition-all',
            isDraggingMail ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          ]"
        >
          <input
            ref="mailFileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleMailSelect"
            class="hidden"
          />
          <svg class="h-9 w-9 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-700">메일 목록 엑셀 파일 선택 또는 드래그</p>
          <p class="text-xs text-gray-500 mt-1">수신일시, 제목, 발신자 포함 (중복 자동제거)</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-emerald-200 bg-emerald-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 break-all">{{ mailFile.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatFileSize(mailFile.size) }}</p>
              </div>
            </div>
            <button @click="mailFile = null" class="btn btn-ghost btn-sm text-gray-400 hover:text-red-500">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-emerald-700 mt-3 bg-emerald-100/60 py-1 px-2 rounded">
            ✔ 중복 제거 후 가장 빠른 메일 수신시간을 기준으로 자동 선별됩니다.
          </p>
        </div>
      </div>

      <!-- 2. UPS File (Optional) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            2. UPS 업로드 파일 <span class="text-gray-400 text-xs font-normal">(선택)</span>
          </label>
          <span class="text-xs text-gray-400">UPS 업로드파일.xlsx</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!upsFile"
          @drop.prevent="handleUpsDrop"
          @dragover.prevent="isDraggingUps = true"
          @dragleave.prevent="isDraggingUps = false"
          @click="$refs.upsFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-xl cursor-pointer transition-all',
            isDraggingUps ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          ]"
        >
          <input
            ref="upsFileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleUpsSelect"
            class="hidden"
          />
          <svg class="h-9 w-9 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-700">UPS 엑셀 파일 선택 또는 드래그</p>
          <p class="text-xs text-gray-500 mt-1">B열: BL, C열: Tracking, G열: 수신시간</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-blue-200 bg-blue-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 break-all">{{ upsFile.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatFileSize(upsFile.size) }}</p>
              </div>
            </div>
            <button @click="upsFile = null" class="btn btn-ghost btn-sm text-gray-400 hover:text-red-500">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-blue-700 mt-3 bg-blue-100/60 py-1 px-2 rounded">
            ✔ 유니패스는 BL로 조회하고, 최종 CSV에는 Tracking 번호로 자동 대체됩니다.
          </p>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div v-if="!processing && !result" class="mb-8">
      <button
        @click="processFiles"
        :disabled="!mailFile || !blYear"
        class="btn btn-primary btn-lg w-full py-3.5 text-base font-semibold shadow-sm"
      >
        마일스톤 생성 시작 (엑셀 파싱 + 유니패스 조회)
      </button>
    </div>

    <!-- Processing State -->
    <div v-if="processing" class="card p-10 text-center mb-8">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-base font-semibold text-gray-900 mb-1">엑셀 파일 분석 및 유니패스 조회 중입니다...</p>
      <p class="text-xs text-gray-500 mb-3">메일목록 중복 제거, BL 추출, 통관접수 및 수리시간을 조회하고 있습니다.</p>
      <p class="text-2xl font-bold text-gray-800 tracking-tight">{{ formatElapsedTime(elapsedTime) }}</p>
    </div>

    <!-- Results Container -->
    <div v-if="result" class="result-container mb-8">
      <!-- Result Summary Header -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                조회 성공
              </span>
              <h2 class="text-lg font-bold text-gray-900">
                총 <span class="text-emerald-600">{{ result.totalCount }}</span>건의 마일스톤 생성 완료
              </h2>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              일반 메일: {{ result.mailCount }}건 | UPS 건: {{ result.upsCount }}건
              <span v-if="result.unipassFailures && result.unipassFailures.length > 0" class="text-amber-600 ml-2">
                (유니패스 미확인: {{ result.unipassFailures.length }}건)
              </span>
            </p>
          </div>

          <!-- Download Action Buttons -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="downloadExport('csv')"
              :disabled="downloading !== false"
              class="btn btn-primary btn-md flex-1 sm:flex-none flex items-center justify-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ downloading === 'csv' ? '생성 중...' : 'CSV 다운로드 (TMS 양식)' }}</span>
            </button>
            <button
              @click="downloadExport('xlsx')"
              :disabled="downloading !== false"
              class="btn btn-secondary btn-md flex-1 sm:flex-none flex items-center justify-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ downloading === 'xlsx' ? '생성 중...' : '엑셀 다운로드' }}</span>
            </button>
            <button
              @click="resetAll"
              class="btn btn-ghost btn-md text-gray-500 hover:text-gray-700"
              title="새로 업로드"
            >
              다시 하기
            </button>
          </div>
        </div>
      </div>

      <!-- Result Table -->
      <div class="table-container shadow-sm border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-16 text-center">구분</th>
              <th>B/L 번호</th>
              <th>Tracking 번호</th>
              <th>메일 수신일시 (DR)</th>
              <th>통관접수일시 (SC)</th>
              <th>수리일시 (CT)</th>
              <th class="w-24 text-center">상태</th>
              <th>메일 제목 / 화물 정보</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in displayResults"
              :key="item.id || idx"
              :class="item.isUps ? 'bg-blue-50/20' : ''"
            >
              <td class="text-center">
                <span
                  :class="[
                    'inline-block px-2 py-0.5 rounded text-xs font-semibold',
                    item.isUps ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ item.isUps ? 'UPS' : '일반' }}
                </span>
              </td>
              <td class="font-mono font-medium text-gray-900">{{ item.blNumber }}</td>
              <td class="font-mono text-gray-700">
                <span v-if="item.trackingNumber" class="text-blue-600 font-semibold">{{ item.trackingNumber }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="text-gray-700 text-sm whitespace-nowrap">{{ item.emailDateTimeDisplay || `${item.emailDate} ${item.emailTime}` }}</td>
              <td class="text-sm whitespace-nowrap">
                <span v-if="item.acceptanceTimeDisplay" class="text-emerald-700 font-medium">{{ item.acceptanceTimeDisplay }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="text-sm whitespace-nowrap">
                <span v-if="item.clearanceTimeDisplay" class="text-emerald-700 font-medium">{{ item.clearanceTimeDisplay }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="text-center">
                <span
                  v-if="item.clearanceDate"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  수리완료
                </span>
                <span
                  v-else-if="item.acceptanceDate"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                >
                  신고진행
                </span>
                <span
                  v-else-if="item.unipassFailed"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                >
                  조회실패
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500"
                >
                  미통관
                </span>
              </td>
              <td class="text-xs text-gray-500 max-w-xs truncate" :title="item.subject">
                {{ item.subject }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Show More Button -->
      <div
        v-if="result.results.length > displayCount"
        class="px-5 py-3 border-t border-gray-200 bg-gray-50/70 text-center rounded-b-xl"
      >
        <button @click="displayCount += 50" class="btn btn-secondary btn-md">
          더 보기 ({{ result.results.length - displayCount }}개 남음)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const mailFile = ref<File | null>(null);
const upsFile = ref<File | null>(null);
const blYear = ref(new Date().getFullYear().toString());

const isDraggingMail = ref(false);
const isDraggingUps = ref(false);

const processing = ref(false);
const result = ref<any>(null);
const elapsedTime = ref(0);
let timerInterval: NodeJS.Timeout | null = null;
const downloading = ref<false | 'csv' | 'xlsx'>(false);
const displayCount = ref(50);

const emit = defineEmits<{
  error: [message: string];
}>();

const displayResults = computed(() => {
  if (!result.value?.results) return [];
  return result.value.results.slice(0, displayCount.value);
});

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}분 ${secs}초`;
};

const startTimer = () => {
  elapsedTime.value = 0;
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

onUnmounted(() => {
  stopTimer();
});

// File validation
const validateFile = (file: File): boolean => {
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
    emit('error', '엑셀 파일(.xlsx, .xls) 또는 .csv 파일만 업로드 가능합니다.');
    return false;
  }
  if (file.size > 30 * 1024 * 1024) {
    emit('error', '파일 크기는 30MB 이하여야 합니다.');
    return false;
  }
  return true;
};

// Mail File handlers
const handleMailDrop = (e: DragEvent) => {
  isDraggingMail.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    mailFile.value = files[0];
  }
};

const handleMailSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    mailFile.value = files[0];
  }
};

// UPS File handlers
const handleUpsDrop = (e: DragEvent) => {
  isDraggingUps.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    upsFile.value = files[0];
  }
};

const handleUpsSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    upsFile.value = files[0];
  }
};

// Process Files
const processFiles = async () => {
  if (!mailFile.value) {
    emit('error', '메일 목록 파일을 선택해 주세요.');
    return;
  }

  processing.value = true;
  result.value = null;
  displayCount.value = 50;
  startTimer();

  try {
    const formData = new FormData();
    formData.append('mailFile', mailFile.value);
    if (upsFile.value) {
      formData.append('upsFile', upsFile.value);
    }
    formData.append('blYear', blYear.value);

    const response = await $fetch<any>('/api/milestone/process', {
      method: 'POST',
      body: formData
    });

    result.value = response;
  } catch (err: any) {
    console.error('Milestone processing error:', err);
    emit('error', err.data?.statusMessage || err.message || '처리 중 오류가 발생했습니다.');
  } finally {
    processing.value = false;
    stopTimer();
  }
};

// Download CSV / XLSX
const downloadExport = async (format: 'csv' | 'xlsx') => {
  if (!result.value?.results || result.value.results.length === 0) return;

  downloading.value = format;
  try {
    const response = await $fetch('/api/milestone/export', {
      method: 'POST',
      body: {
        format,
        items: result.value.results
      },
      responseType: 'blob'
    });

    const blob = new Blob([response as any], {
      type: format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = format === 'csv' ? `milestone_tms_${dateStr}.csv` : `milestone_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Download error:', err);
    emit('error', '다운로드 생성 중 오류가 발생했습니다.');
  } finally {
    downloading.value = false;
  }
};

const resetAll = () => {
  mailFile.value = null;
  upsFile.value = null;
  result.value = null;
  processing.value = false;
  stopTimer();
};
</script>
