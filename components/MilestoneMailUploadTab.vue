<template>
  <div class="max-w-6xl mx-auto">
    <!-- BL Year -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
        * 메일 목록과 함께 전일 누락건 엑셀을 업로드하면 미완료 마일스톤을 함께 재조회합니다.
      </p>
    </div>

    <!-- Upload Zones (3-Column Grid) -->
    <div v-if="!processing && !result" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <!-- 1. Mail List File (Required / or Missing File) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            1. 메일 목록 파일 <span class="text-emerald-600 text-xs">(신규)</span>
          </label>
          <span class="text-xs text-gray-400">메일목록.xls</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!mailFile"
          @drop.prevent="handleMailDrop"
          @dragover.prevent="isDraggingMail = true"
          @dragleave.prevent="isDraggingMail = false"
          @click="$refs.mailFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 text-center',
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
          <svg class="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-700">메일 목록 엑셀</p>
          <p class="text-xs text-gray-500 mt-1">수신일시, 제목, 발신자 포함 (중복 자동제거)</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-emerald-200 bg-emerald-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
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
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-emerald-700 mt-3 bg-emerald-100/60 py-1 px-2 rounded">
            ✔ 중복 제거 후 가장 빠른 시간 선별
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
          <span class="text-xs text-gray-400">UPS.xlsx</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!upsFile"
          @drop.prevent="handleUpsDrop"
          @dragover.prevent="isDraggingUps = true"
          @dragleave.prevent="isDraggingUps = false"
          @click="$refs.upsFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 text-center',
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
          <svg class="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-700">UPS 엑셀 파일</p>
          <p class="text-xs text-gray-500 mt-1">B열: BL, C열: Tracking, G열: 수신시간</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-blue-200 bg-blue-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
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
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-blue-700 mt-3 bg-blue-100/60 py-1 px-2 rounded">
            ✔ CSV에서 Tracking 번호로 대체
          </p>
        </div>
      </div>

      <!-- 3. Missing File (Optional, Re-fetch) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            3. 전일 누락건 파일 <span class="text-amber-700 text-xs font-semibold">(재조회)</span>
          </label>
          <span class="text-xs text-gray-400">missing_milestones.xlsx</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!missingFile"
          @drop.prevent="handleMissingDrop"
          @dragover.prevent="isDraggingMissing = true"
          @dragleave.prevent="isDraggingMissing = false"
          @click="$refs.missingFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed rounded-xl cursor-pointer transition-all p-4 text-center',
            isDraggingMissing ? 'border-amber-500 bg-amber-50/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          ]"
        >
          <input
            ref="missingFileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleMissingSelect"
            class="hidden"
          />
          <svg class="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p class="text-sm font-medium text-gray-700">전일 누락건 엑셀 파일</p>
          <p class="text-xs text-gray-500 mt-1">어제 미완료된 SC/CT 마일스톤 재조회</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-amber-200 bg-amber-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <div class="p-2 bg-amber-100 rounded-lg text-amber-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 break-all">{{ missingFile.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatFileSize(missingFile.size) }}</p>
              </div>
            </div>
            <button @click="missingFile = null" class="btn btn-ghost btn-sm text-gray-400 hover:text-red-500">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-amber-800 mt-3 bg-amber-100/70 py-1 px-2 rounded">
            ✔ DR은 중복 방지하고, SC/CT만 CSV에 추가 반영
          </p>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div v-if="!processing && !result" class="mb-8">
      <button
        @click="processFiles"
        :disabled="(!mailFile && !missingFile) || !blYear"
        class="btn btn-primary btn-lg w-full py-3.5 text-base font-semibold shadow-sm"
      >
        마일스톤 생성 시작 (엑셀 파싱 + 유니패스 조회)
      </button>
    </div>

    <!-- Processing State -->
    <div v-if="processing" class="card p-10 text-center mb-8">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-base font-semibold text-gray-900 mb-1">엑셀 파일 분석 및 유니패스 조회 중입니다...</p>
      <p class="text-xs text-gray-500 mb-3">메일목록 중복 제거, BL 추출, 전일 누락건 병합, 통관접수 및 수리시간을 조회하고 있습니다.</p>
      <p class="text-2xl font-bold text-gray-800 tracking-tight">{{ formatElapsedTime(elapsedTime) }}</p>
    </div>

    <!-- Results Container -->
    <div v-if="result" class="result-container mb-8">
      <!-- Result Summary Header -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                조회 성공
              </span>
              <h2 class="text-lg font-bold text-gray-900">
                총 <span class="text-emerald-600">{{ result.totalCount }}</span>건 처리 완료
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
              <span>신규 메일: <strong class="text-gray-700">{{ result.mailCount }}</strong>건</span>
              <span>•</span>
              <span>UPS: <strong class="text-gray-700">{{ result.upsCount }}</strong>건</span>
              <span v-if="result.missingInputCount > 0">•</span>
              <span v-if="result.missingInputCount > 0">전일 재조회: <strong class="text-amber-700">{{ result.missingInputCount }}</strong>건</span>
              <span>•</span>
              <span class="text-emerald-700 font-medium">수리완료: {{ result.totalCount - (result.missingCount || 0) }}건</span>
              <span>•</span>
              <span :class="result.missingCount > 0 ? 'text-amber-600 font-semibold' : 'text-gray-500'">
                재조회 대상(누락): {{ result.missingCount || 0 }}건
              </span>
            </div>
          </div>

          <!-- Download Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <!-- 1. CSV Download -->
            <button
              @click="downloadExport('csv')"
              :disabled="downloading !== false"
              class="btn btn-primary btn-md flex items-center justify-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ downloading === 'csv' ? '생성 중...' : 'CSV 다운로드 (TMS 양식)' }}</span>
            </button>

            <!-- 2. Missing Excel Download (Crucial) -->
            <button
              @click="downloadMissing"
              :disabled="downloading !== false || !result.missingCount"
              :class="[
                'btn btn-md flex items-center justify-center gap-1.5 transition-all',
                result.missingCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-semibold'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              ]"
              :title="result.missingCount > 0 ? '내일 재업로드할 누락건 엑셀 다운로드' : '누락된 건이 없습니다'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ downloading === 'missing' ? '추출 중...' : `누락건 엑셀 (${result.missingCount || 0}건)` }}</span>
            </button>

            <!-- 3. XLSX Download -->
            <button
              @click="downloadExport('xlsx')"
              :disabled="downloading !== false"
              class="btn btn-secondary btn-md flex items-center justify-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ downloading === 'xlsx' ? '생성 중...' : '전체 엑셀' }}</span>
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
              <th class="w-24 text-center">구분</th>
              <th>B/L 번호</th>
              <th>Tracking 번호</th>
              <th>메일 수신일시 (DR)</th>
              <th>통관접수일시 (SC)</th>
              <th>수리일시 (CT)</th>
              <th class="w-28 text-center">마일스톤 상태</th>
              <th class="w-28 text-center">차기 재조회</th>
              <th>메일 제목 / 화물 정보</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in displayResults"
              :key="item.id || idx"
              :class="[
                item.reFetchTag ? 'bg-amber-50/20' : (item.isUps ? 'bg-blue-50/20' : '')
              ]"
            >
              <td class="text-center">
                <span
                  v-if="item.reFetchTag"
                  class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"
                >
                  재조회:{{ item.reFetchTag }}
                </span>
                <span
                  v-else
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
              <td class="text-gray-700 text-sm whitespace-nowrap">
                <span v-if="item.reFetchTag" class="text-gray-400 text-xs">(전일 반영) </span>
                {{ item.emailDateTimeDisplay || (item.emailDate ? `${item.emailDate} ${item.emailTime}` : '-') }}
              </td>
              <td class="text-sm whitespace-nowrap">
                <span v-if="item.acceptanceTimeDisplay" class="text-emerald-700 font-medium">{{ item.acceptanceTimeDisplay }}</span>
                <span v-else class="text-red-400 font-medium">미완료 (누락)</span>
              </td>
              <td class="text-sm whitespace-nowrap">
                <span v-if="item.clearanceTimeDisplay" class="text-emerald-700 font-medium">{{ item.clearanceTimeDisplay }}</span>
                <span v-else class="text-red-400 font-medium">미완료 (누락)</span>
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
                  미신고
                </span>
              </td>
              <td class="text-center">
                <span
                  v-if="!item.nextMissingTag"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  완료
                </span>
                <span
                  v-else-if="item.nextMissingTag === 'SC,CT'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  title="신고와 수리 모두 미완료되어 내일 재조회 대상입니다"
                >
                  신고/수리 누락
                </span>
                <span
                  v-else-if="item.nextMissingTag === 'CT'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                  title="수리가 미완료되어 내일 재조회 대상입니다"
                >
                  수리 누락
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
const missingFile = ref<File | null>(null);
const blYear = ref(new Date().getFullYear().toString());

const isDraggingMail = ref(false);
const isDraggingUps = ref(false);
const isDraggingMissing = ref(false);

const processing = ref(false);
const result = ref<any>(null);
const elapsedTime = ref(0);
let timerInterval: NodeJS.Timeout | null = null;
const downloading = ref<false | 'csv' | 'xlsx' | 'missing'>(false);
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

// Missing File handlers
const handleMissingDrop = (e: DragEvent) => {
  isDraggingMissing.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    missingFile.value = files[0];
  }
};

const handleMissingSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0 && validateFile(files[0])) {
    missingFile.value = files[0];
  }
};

// Process Files
const processFiles = async () => {
  if (!mailFile.value && !missingFile.value) {
    emit('error', '메일 목록 파일 또는 전일 누락건 파일을 선택해 주세요.');
    return;
  }

  processing.value = true;
  result.value = null;
  displayCount.value = 50;
  startTimer();

  try {
    const formData = new FormData();
    if (mailFile.value) {
      formData.append('mailFile', mailFile.value);
    }
    if (upsFile.value) {
      formData.append('upsFile', upsFile.value);
    }
    if (missingFile.value) {
      formData.append('missingFile', missingFile.value);
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

// Download Missing Milestones Excel (For Next-Day Re-fetch)
const downloadMissing = async () => {
  if (!result.value?.results || result.value.results.length === 0) return;

  downloading.value = 'missing';
  try {
    const response = await $fetch('/api/milestone/export-missing', {
      method: 'POST',
      body: {
        items: result.value.results
      },
      responseType: 'blob'
    });

    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `missing_milestones_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Missing download error:', err);
    emit('error', '누락건 엑셀 다운로드 중 오류가 발생했습니다.');
  } finally {
    downloading.value = false;
  }
};

const resetAll = () => {
  mailFile.value = null;
  upsFile.value = null;
  missingFile.value = null;
  result.value = null;
  processing.value = false;
  stopTimer();
};
</script>
