<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Cargo List</h1>
      <p class="page-subtitle">이고요청 메일을 분류하여 Cargo List를 생성합니다.</p>
    </div>

    <!-- Controls -->
    <div class="card-elevated p-6 mb-6">
      <div class="flex flex-col sm:flex-row items-end gap-4">
        <div>
          <label for="startDate" class="form-label">시작일</label>
          <input type="date" id="startDate" v-model="startDate" class="form-input" />
        </div>
        <div>
          <label for="endDate" class="form-label">종료일</label>
          <input type="date" id="endDate" v-model="endDate" class="form-input" />
        </div>
        <div class="flex items-center gap-3">
          <button @click="startProcess" :disabled="loading" class="btn btn-primary btn-md">
            {{ loading ? '처리 중...' : '메일 가져와서 분류하기' }}
          </button>
          <button v-if="results" @click="downloadMultiSheetExcel" :disabled="!results" class="btn btn-accent btn-md">
            엑셀 다운로드
          </button>
        </div>
      </div>
    </div>

    <!-- Status message -->
    <div v-if="emailCount !== null && !loading" class="alert alert-info mb-6">
      총 {{ emailCount }}개의 '이고요청' 메일을 가져왔습니다.
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-error mb-6">
      <strong>에러:</strong> {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner-lg mx-auto"></div>
      <p class="mt-4 text-sm text-gray-500">{{ loadingMessage }}</p>
    </div>

    <!-- Results -->
    <div v-else-if="results" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="cat in categories" :key="cat.key" class="card p-5">
        <h2 class="section-title">{{ cat.label }}</h2>
        <p class="text-xs text-gray-500 mb-4">{{ results[cat.key].length }}개 항목</p>
        <ul v-if="results[cat.key].length > 0" class="space-y-2">
          <li v-for="(bl, index) in results[cat.key]" :key="`${cat.key}-${index}`" class="bg-gray-50 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">{{ bl }}</li>
        </ul>
        <p v-else class="empty-state-text py-4">해당 항목 없음</p>
      </div>

      <!-- Unclassified -->
      <div v-if="results.unclassifiedEmails && results.unclassifiedEmails.length > 0" class="md:col-span-3 mt-2 border-t border-gray-200 pt-6">
        <h3 class="section-title text-red-600 mb-4">분류에 실패한 메일 ({{ results.unclassifiedEmails.length }}개)</h3>
        <div class="table-container card-elevated">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>실패 이유</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(email, index) in results.unclassifiedEmails" :key="`fail-${index}`">
                <td>{{ email.subject }}</td>
                <td class="text-red-500">{{ email.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p class="empty-state-text">날짜를 선택하고 버튼을 눌러 메일 분류를 시작하세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Email { id: string; subject: string; }

const loading = ref(false);
const loadingMessage = ref('');
const error = ref<string | null>(null);
const startDate = ref('');
const endDate = ref('');
const emailCount = ref<number | null>(null);
const results = ref<{
  expeditors: string[];
  dgf: string[];
  ceva: string[];
  unclassifiedEmails?: { subject: string, reason: string }[];
} | null>(null);

const categories = [
  { key: 'expeditors' as const, label: '익스피다이터스' },
  { key: 'dgf' as const, label: 'DGF' },
  { key: 'ceva' as const, label: 'CEVA' },
];

async function startProcess() {
  loading.value = true;
  error.value = null;
  results.value = null;
  emailCount.value = null;

  loadingMessage.value = '메일을 가져오는 중...';
  const fetchedEmails = await fetchEmails();
  if (!fetchedEmails) {
    loading.value = false;
    return;
  }
  emailCount.value = fetchedEmails.length;

  loadingMessage.value = `${fetchedEmails.length}개의 메일을 분류하는 중...`;
  await processEmails(fetchedEmails);

  loading.value = false;
  loadingMessage.value = '';
}

async function fetchEmails(): Promise<Email[] | null> {
  try {
    if (!startDate.value || !endDate.value) {
      throw new Error('시작일과 종료일을 모두 선택해주세요.');
    }
    const fetched = await $fetch(`/api/cargolist/fetch-emails?startDate=${startDate.value}&endDate=${endDate.value}`);
    return fetched as Email[];
  } catch (e: any) {
    error.value = `메일 목록을 불러오는 중 에러 발생: ${e.message}`;
    if (e.statusCode === 401) error.value += ' - 로그인이 필요하거나 세션이 만료되었습니다.';
    return null;
  }
}

async function processEmails(emails: Email[]) {
  if (emails.length === 0) {
    results.value = { expeditors: [], dgf: [], ceva: [], unclassifiedEmails: [] };
    return;
  }
  try {
    const response = await $fetch('/api/cargolist/process', { method: 'POST', body: emails });
    if (response.success) {
      results.value = response.data;
    } else {
      throw new Error(response.error || 'API 처리 중 에러 발생');
    }
  } catch (e: any) {
    error.value = e.message || '알 수 없는 에러가 발생했습니다.';
  }
}

async function downloadMultiSheetExcel() {
  if (!results.value) return;
  const sheets = [
    { name: '익스피다이터스', data: results.value.expeditors.map(bl => ({ 'B/L Number': bl })) },
    { name: 'DGF', data: results.value.dgf.map(bl => ({ 'B/L Number': bl })) },
    { name: 'CEVA', data: results.value.ceva.map(bl => ({ 'B/L Number': bl })) },
  ].filter(sheet => sheet.data.length > 0);

  if (sheets.length === 0) {
    error.value = '다운로드할 데이터가 없습니다.';
    return;
  }
  try {
    const response = await $fetch('/api/excel/download-multisheet', {
      method: 'POST',
      body: { filename: 'Cargolist_통합.xlsx', sheets: sheets },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cargolist_통합.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (e: any) {
    error.value = `엑셀 다운로드 실패: ${e.message}`;
  }
}

onMounted(() => {
  const today = new Date();
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
  endDate.value = today.toISOString().split('T')[0];
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
});
</script>
