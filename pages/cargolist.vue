<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- 메인 헤더 -->
      <div class="flex items-center justify-center mb-10">
        <img src="/logo.png" alt="Logo" class="h-12 w-12" />
        <h1 class="text-4xl font-extrabold text-primary-dark ml-4">TOP CargoList</h1>
      </div>

      <!-- 로그인 안 된 경우 -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-lg">
        <p class="mb-8 text-lg text-gray-600">
          기능을 사용하려면 먼저 Google 계정으로 로그인해주세요.
        </p>
        <button @click="login" class="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-md">
          <svg class="w-6 h-6 mr-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google로 로그인
        </button>
      </div>

      <!-- 로그인 된 경우 -->
      <div v-else class="bg-white rounded-xl shadow-lg p-8">
        <!-- 사용자 정보 및 네비게이션 -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <p class="text-sm text-gray-500">로그인됨:</p>
            <p class="font-semibold text-lg text-primary-dark">{{ userEmail }}</p>
          </div>
          <button @click="logout" class="text-red-600 font-medium py-2 px-4 rounded-md transition duration-200 hover:bg-red-50">
            로그아웃
          </button>
        </div>
        
        <!-- 페이지 네비게이션 -->
        <div class="border-b border-gray-200 mb-8">
          <nav class="-mb-px flex space-x-8">
            <NuxtLink to="/cargolist" class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 border-primary-dark text-primary-dark">
              Cargo List 분류
            </NuxtLink>
          </nav>
        </div>

        <!-- 컨트롤 영역 -->
        <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div class="flex items-center gap-4">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700">시작일</label>
              <input type="date" id="startDate" v-model="startDate" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2">
            </div>
            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700">종료일</label>
              <input type="date" id="endDate" v-model="endDate" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2">
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4 sm:mt-0">
            <button @click="startProcess" :disabled="loading" class="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
              {{ loading ? '처리 중...' : '메일 가져와서 분류하기' }}
            </button>
            <button v-if="results" @click="downloadMultiSheetExcel" :disabled="!results" class="bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
              엑셀 다운로드
            </button>
          </div>
        </div>

        <!-- 상태 메시지 (가져온 메일 개수) -->
        <div v-if="emailCount !== null && !loading" class="text-center my-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          총 {{ emailCount }}개의 '이고요청' 메일을 가져왔습니다.
        </div>

        <!-- 에러 메시지 -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md shadow-sm mb-6">
          <strong>에러:</strong> {{ error }}
        </div>

        <!-- 로딩 및 결과 표시 영역 -->
        <div v-if="loading" class="text-center py-12 text-gray-500">
          <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="mt-4">{{ loadingMessage }}</p>
        </div>
        <div v-else-if="results" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 분류 성공 결과 -->
          <div class="result-group"><h2 class="text-xl font-bold text-gray-700">익스피다이터스</h2><p class="text-sm text-gray-500 mb-4">{{ results.expeditors.length }}개 항목</p><ul v-if="results.expeditors.length > 0"><li v-for="(bl, index) in results.expeditors" :key="`exp-${index}`">{{ bl }}</li></ul><p v-else class="text-gray-400 text-center py-4">해당 항목 없음</p></div>
          <div class="result-group"><h2 class="text-xl font-bold text-gray-700">DGF</h2><p class="text-sm text-gray-500 mb-4">{{ results.dgf.length }}개 항목</p><ul v-if="results.dgf.length > 0"><li v-for="(bl, index) in results.dgf" :key="`dgf-${index}`">{{ bl }}</li></ul><p v-else class="text-gray-400 text-center py-4">해당 항목 없음</p></div>
          <div class="result-group"><h2 class="text-xl font-bold text-gray-700">CEVA</h2><p class="text-sm text-gray-500 mb-4">{{ results.ceva.length }}개 항목</p><ul v-if="results.ceva.length > 0"><li v-for="(bl, index) in results.ceva" :key="`ceva-${index}`">{{ bl }}</li></ul><p v-else class="text-gray-400 text-center py-4">해당 항목 없음</p></div>
          <!-- 분류 실패 목록 -->
          <div v-if="results.unclassifiedEmails && results.unclassifiedEmails.length > 0" class="md:col-span-3 mt-2 border-t border-gray-200 pt-6"><h3 class="text-lg font-semibold text-red-600 mb-4">분류에 실패한 메일 ({{ results.unclassifiedEmails.length }}개)</h3><div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50 sticky top-0"><tr><th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th><th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실패 이유</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><tr v-for="(email, index) in results.unclassifiedEmails" :key="`fail-${index}`"><td class="px-4 py-2 text-sm text-gray-800">{{ email.subject }}</td><td class="px-4 py-2 whitespace-nowrap text-sm text-red-500">{{ email.reason }}</td></tr></tbody></table></div></div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <p>날짜를 선택하고 버튼을 눌러 메일 분류를 시작하세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Email { id: string; subject: string; }

// --- 상태 관리 ---
const isAuthenticated = ref(false);
const userEmail = ref('');
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

// --- 메소드 ---
const checkAuth = async () => {
  try {
    const data = await $fetch("/api/user");
    isAuthenticated.value = data.authenticated;
    if (data.authenticated) {
      userEmail.value = data.user.email;
    }
  } catch (err) {
    isAuthenticated.value = false;
  }
};

const login = () => { window.location.href = "/api/auth/google"; };

const logout = async () => {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    isAuthenticated.value = false;
    userEmail.value = "";
    error.value = "";
    results.value = null;
    emailCount.value = null;
  } catch (err) {
    console.error("Logout error:", err);
  }
};

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

// 컴포넌트가 마운트될 때 인증 상태 확인 및 날짜 기본값 설정
onMounted(() => {
  checkAuth();
  const today = new Date();
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
  endDate.value = today.toISOString().split('T')[0];
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
});
</script>

<style scoped>
.result-group {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-5;
}
.result-group ul {
  @apply list-none p-0 space-y-2;
}
.result-group li {
  @apply bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-700;
}
</style>
