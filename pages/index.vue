<template>
  <div class="min-h-screen bg-background text-text-DEFAULT font-sans">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <div class="flex items-center justify-center mb-10">
        <img src="/logo.png" alt="Logo" class="h-12 w-12" />
        <h1 class="text-4xl font-extrabold text-primary-dark">TOP Milestone</h1>
      </div>

      <!-- 로그인 상태가 아닐 때 -->
      <div
        v-if="!isAuthenticated"
        class="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-lg"
      >
        <p class="mb-8 text-lg text-text-light">
          구글 계정으로 로그인하여 메일을 조회하고 엑셀로 다운로드하세요.
        </p>
        <button
          @click="login"
          class="w-full bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-md"
        >
          <svg class="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>
      </div>

      <!-- 로그인 상태일 때 -->
      <div v-else class="max-w-full mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div
            class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200"
          >
            <div>
              <p class="text-sm text-text-light">로그인됨:</p>
              <p class="font-semibold text-lg text-primary-dark">
                {{ userEmail }}
              </p>
            </div>
            <button
              @click="logout"
              class="text-red-600 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              로그아웃
            </button>
          </div>

          <!-- 상위 탭 네비게이션 (마일스톤 / KPI) -->
          <div class="border-b-2 border-gray-200 mb-6">
            <nav class="-mb-px flex space-x-2">
              <button
                @click="mainTab = 'milestone'"
                :class="[
                  'py-3 px-6 font-bold text-base rounded-t-lg transition-all duration-200',
                  mainTab === 'milestone'
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                ]"
              >
                마일스톤
              </button>
              <button
                @click="mainTab = 'docextract'"
                :class="[
                  'py-3 px-6 font-bold text-base rounded-t-lg transition-all duration-200',
                  mainTab === 'docextract'
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                ]"
              >
                문서추출
              </button>
              <button
                @click="mainTab = 'kpi'"
                :class="[
                  'py-3 px-6 font-bold text-base rounded-t-lg transition-all duration-200',
                  mainTab === 'kpi'
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                ]"
              >
                KPI
              </button>
            </nav>
          </div>

          <!-- 마일스톤: 하위 탭 네비게이션 -->
          <div v-if="mainTab === 'milestone'" class="border-b border-gray-200 mb-8">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'email'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === 'email'
                    ? 'border-primary-dark text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                메일 조회
              </button>
              <button
                @click="activeTab = 'excel'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === 'excel'
                    ? 'border-primary-dark text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                BL 엑셀 업로드
              </button>
            </nav>
          </div>

          <!-- 탭 컨텐츠 -->
          <div>
            <template v-if="mainTab === 'milestone'">
              <EmailTab v-if="activeTab === 'email'" @error="handleError" />
              <ExcelUploadTab v-if="activeTab === 'excel'" @error="handleError" />
            </template>
            <DocExtractTab v-if="mainTab === 'docextract'" @error="handleError" />
            <KpiTab v-if="mainTab === 'kpi'" @error="handleError" />
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md shadow-md mt-8"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import EmailTab from "~/components/EmailTab.vue";
import ExcelUploadTab from "~/components/ExcelUploadTab.vue";
import KpiTab from "~/components/KpiTab.vue";
import DocExtractTab from "~/components/docextract/DocExtractTab.vue";

const isAuthenticated = ref(false);
const userEmail = ref("");
const error = ref("");
const mainTab = ref('milestone');
const activeTab = ref('email');

// 사용자 정보 확인
const checkAuth = async () => {
  try {
    const data = await $fetch("/api/user");
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
      userEmail.value = data.user.email;
    }
  } catch (err) {
    console.error("Auth check error:", err);
  }
};

// 로그인
const login = () => {
  window.location.href = "/api/auth/google";
};

// 로그아웃
const logout = async () => {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    isAuthenticated.value = false;
    userEmail.value = "";
    error.value = "";
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// 에러 처리
const handleError = (message: string) => {
  error.value = message;
  // 5초 후 에러 메시지 자동 숨김
  setTimeout(() => {
    error.value = "";
  }, 5000);
};

onMounted(() => {
  checkAuth();

  // URL 파라미터 확인 (에러 처리)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("error")) {
    error.value = "로그인 중 오류가 발생했습니다.";
  }
});
</script>
