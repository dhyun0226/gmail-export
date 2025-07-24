<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Gmail Export to Excel</h1>
      
      <!-- 로그인 상태가 아닐 때 -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto text-center">
        <p class="mb-6 text-gray-600">구글 계정으로 로그인하여 메일을 조회하고 엑셀로 다운로드하세요.</p>
        <button
          @click="login"
          class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center"
        >
          <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>
      </div>
      
      <!-- 로그인 상태일 때 -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- 페이지 네비게이션 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex space-x-4">
            <nuxt-link 
              to="/"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              이메일 내보내기
            </nuxt-link>
            <nuxt-link 
              to="/bl-management"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              BL 번호 관리
            </nuxt-link>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <p class="text-sm text-gray-600">로그인됨:</p>
              <p class="font-medium">{{ userEmail }}</p>
            </div>
            <button
              @click="logout"
              class="text-red-600 hover:text-red-700 font-medium"
            >
              로그아웃
            </button>
          </div>
          
          <!-- 날짜 선택 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">시작일시</label>
              <input
                v-model="startDate"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">종료일시</label>
              <input
                v-model="endDate"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            @click="fetchEmails"
            :disabled="loading || !startDate || !endDate"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md"
          >
            {{ loading ? '조회 중...' : '메일 조회' }}
          </button>
        </div>
        
        <!-- 메일 목록 -->
        <div v-if="emails.length > 0" class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold">조회 결과: {{ emails.length }}개</h2>
              <button
                @click="downloadExcel"
                :disabled="downloading"
                class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md"
              >
                {{ downloading ? '다운로드 중...' : '엑셀 다운로드' }}
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B/L 번호</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">본문 (앞 50자)</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="email in displayEmails" :key="email.id">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ email.blNumber }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ email.subject }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ email.body.substring(0, 50) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ email.date }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ email.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 더보기 버튼 -->
          <div v-if="emails.length > displayCount" class="p-4 text-center border-t">
            <button
              @click="showMore"
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              더 보기 ({{ emails.length - displayCount }}개 남음)
            </button>
          </div>
        </div>
        
        <!-- 에러 메시지 -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Email {
  id: string;
  subject: string;
  body: string;
  blNumber: string;
  date: string;
  time: string;
}

const isAuthenticated = ref(false);
const userEmail = ref('');
const emails = ref<Email[]>([]);
const startDate = ref('');
const endDate = ref('');
const loading = ref(false);
const downloading = ref(false);
const error = ref('');
const displayCount = ref(50);

const displayEmails = computed(() => emails.value.slice(0, displayCount.value));

// 사용자 정보 확인
const checkAuth = async () => {
  try {
    const data = await $fetch('/api/user');
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
      userEmail.value = data.user.email;
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
};

// 로그인
const login = () => {
  window.location.href = '/api/auth/google';
};

// 로그아웃
const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    isAuthenticated.value = false;
    emails.value = [];
    userEmail.value = '';
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// 메일 조회
const fetchEmails = async () => {
  loading.value = true;
  error.value = '';
  emails.value = [];
  displayCount.value = 50;
  
  try {
    const data = await $fetch('/api/emails', {
      params: {
        startDate: new Date(startDate.value).toISOString(),
        endDate: new Date(endDate.value).toISOString()
      }
    });
    
    emails.value = data || [];
  } catch (err: any) {
    error.value = err.data?.statusMessage || '메일 조회 중 오류가 발생했습니다.';
    
    if (err.data?.statusCode === 401) {
      // 토큰 만료 시 재로그인
      setTimeout(() => {
        login();
      }, 2000);
    }
  } finally {
    loading.value = false;
    console.log('Fetched emails:', emails.value);
  }
};

// 엑셀 다운로드
const downloadExcel = async () => {
  downloading.value = true;
  
  try {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emails: emails.value })
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = '엑셀 다운로드 중 오류가 발생했습니다.';
  } finally {
    downloading.value = false;
  }
};

// 더 보기
const showMore = () => {
  displayCount.value += 50;
};

// 기본 날짜 설정 (어제 하루)
const setDefaultDates = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const start = new Date(yesterday);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(yesterday);
  end.setHours(23, 59, 59, 999);

  // 로컬 시간대에 맞는 YYYY-MM-DDTHH:mm 형식으로 변환
  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

onMounted(() => {
  checkAuth();
  setDefaultDates();
  
  // URL 파라미터 확인 (에러 처리)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error')) {
    error.value = '로그인 중 오류가 발생했습니다.';
  }
});
</script>