<template>
  <div>
    <div class="page-header mb-8">
      <h1 class="page-title">중량문의 조회</h1>
      <p class="page-subtitle">중량문의 메일에서 적하중량/순중량 데이터를 자동 추출합니다.</p>
    </div>

    <!-- 조회 조건 -->
    <div class="mb-6 flex items-end gap-4 flex-wrap">
      <div>
        <label class="block text-sm font-bold text-gray-600 mb-1">조회 시작일</label>
        <input
          v-model="startDateStr"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          :disabled="searching"
        />
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-600 mb-1">조회 종료일</label>
        <input
          v-model="endDateStr"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          :disabled="searching"
        />
      </div>
      <button
        @click="search"
        :disabled="searching"
        class="btn btn-primary btn-lg gap-2"
      >
        <svg v-if="!searching" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span v-if="searching" class="animate-spin">&#8635;</span>
        {{ searching ? `조회 중... (${formatTime(searchTime)})` : '중량문의 메일 조회' }}
      </button>
    </div>

    <!-- 에러 -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 결과 -->
    <div v-if="results.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 결과 헤더 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-gray-900">조회 결과</h3>
          <span class="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            {{ results.length }}건
          </span>
          <span class="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            적하진행 {{ confirmedCount }}건
          </span>
        </div>
        <button
          @click="downloadExcel"
          :disabled="downloading"
          class="btn btn-accent btn-md gap-2"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          {{ downloading ? '다운로드 중...' : 'Excel 다운로드' }}
        </button>
      </div>

      <!-- 테이블 -->
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center">순번</th>
              <th>메일 일자</th>
              <th>HB 번호</th>
              <th>MB 번호</th>
              <th class="text-right">적하중량</th>
              <th class="text-right">순중량</th>
              <th class="text-center">적하중량 진행</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayResults" :key="index">
              <td class="text-center text-gray-500">{{ index + 1 }}</td>
              <td>{{ item.date }}</td>
              <td class="font-mono font-semibold text-gray-900">{{ item.hbNumber || '-' }}</td>
              <td class="font-mono text-gray-700">{{ item.mbNumber || '-' }}</td>
              <td class="text-right">{{ item.loadingWeight || '-' }}</td>
              <td class="text-right">{{ item.netWeight || '-' }}</td>
              <td class="text-center">
                <span
                  :class="[
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold',
                    item.confirmedByLoading === 'O'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  ]"
                >
                  {{ item.confirmedByLoading }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 더보기 -->
      <div v-if="results.length > displayLimit" class="px-5 py-3 border-t border-gray-200 bg-gray-50/70 text-center">
        <button @click="displayLimit += 50" class="btn btn-secondary btn-md">
          더 보기 ({{ results.length - displayLimit }}건 남음)
        </button>
      </div>
    </div>

    <!-- 빈 결과 -->
    <div v-if="searched && results.length === 0 && !searching" class="text-center py-16 text-gray-400">
      <p class="text-lg">중량문의 메일이 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface WeightInquiryItem {
  date: string;
  subject: string;
  hbNumber: string;
  mbNumber: string;
  loadingWeight: string;
  netWeight: string;
  confirmedByLoading: 'O' | 'X';
  threadId: string;
}

// 기본값: 6개월 전 ~ 오늘
const today = new Date();
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const startDateStr = ref(toDateStr(sixMonthsAgo));
const endDateStr = ref(toDateStr(today));

const results = ref<WeightInquiryItem[]>([]);
const searching = ref(false);
const searched = ref(false);
const downloading = ref(false);
const error = ref('');
const searchTime = ref(0);
const displayLimit = ref(50);
let searchTimer: NodeJS.Timeout | null = null;

const displayResults = computed(() => results.value.slice(0, displayLimit.value));
const confirmedCount = computed(() => results.value.filter(r => r.confirmedByLoading === 'O').length);

const formatTime = (seconds: number): string => {
  if (!seconds) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${remaining}초`;
  return `${minutes}분 ${remaining}초`;
};

const search = async () => {
  searching.value = true;
  searched.value = false;
  error.value = '';
  results.value = [];
  searchTime.value = 0;
  displayLimit.value = 50;

  if (searchTimer) clearInterval(searchTimer);
  searchTimer = setInterval(() => { searchTime.value++; }, 1000);

  try {
    const data = await $fetch(`/api/weight-inquiry/search?startDate=${startDateStr.value}&endDate=${endDateStr.value}`);
    if (data.success) {
      results.value = data.results;
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || '조회 중 오류가 발생했습니다.';
  } finally {
    searching.value = false;
    searched.value = true;
    if (searchTimer) clearInterval(searchTimer);
  }
};

const downloadExcel = async () => {
  downloading.value = true;
  try {
    const response = await fetch('/api/weight-inquiry/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: results.value }),
    });

    if (!response.ok) throw new Error('다운로드 실패');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `중량문의_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    error.value = 'Excel 다운로드 중 오류가 발생했습니다.';
  } finally {
    downloading.value = false;
  }
};
</script>
