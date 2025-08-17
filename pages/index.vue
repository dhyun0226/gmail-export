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

          <!-- 날짜 및 BL 년도 선택 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label class="block text-sm font-medium text-text-light mb-2"
                >시작일시</label
              >
              <input
                v-model="startDate"
                type="datetime-local"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-light mb-2"
                >종료일시</label
              >
              <input
                v-model="endDate"
                type="datetime-local"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-light mb-2"
                >BL 년도</label
              >
              <input
                v-model="blYear"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
              />
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="fetchEmails"
              :disabled="loading || !startDate || !endDate"
              class="flex-1 bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md"
              :class="{ '!bg-gray-400': loading }"
            >
              {{ loading ? `조회 중... (${loadingTime}s)` : "메일 조회" }}
            </button>
          </div>
        </div>

        <!-- 메일 목록 -->
        <div v-if="emails.length > 0" class="bg-white rounded-xl shadow-lg">
          <div
            class="p-8 border-b border-gray-200 flex justify-between items-center"
          >
            <h2 class="text-2xl font-bold text-primary-dark">
              조회 결과:
              <span class="text-accent-DEFAULT">{{ emails.length }}</span
              >개
            </h2>
            <button
              @click="downloadExcel"
              :disabled="downloading"
              class="bg-accent-dark hover:bg-accent-dark disabled:bg-secondary-light text-white font-semibold py-2.5 px-6 rounded-lg transition duration-300 ease-in-out shadow-md"
            >
              {{ downloading ? "다운로드 중..." : "엑셀 다운로드" }}
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    제목
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    B/L 번호
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    Tracking 번호
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    통관접수시간
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    수리시간
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    메일 수신날짜
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider"
                  >
                    메일 수신 시간
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(email, index) in emailsWithRowspan"
                  :key="`${email.id}-${index}`"
                  class="hover:bg-gray-50 transition duration-150 ease-in-out even:bg-gray-50"
                >
                  <td
                    v-if="email.showSubject"
                    :rowspan="email.rowspan"
                    class="px-6 py-4 text-sm text-text-DEFAULT align-middle border-r border-gray-200 bg-gray-100 font-medium"
                  >
                    {{ email.subject }}
                  </td>
                  <td class="px-6 py-4 text-sm text-text-DEFAULT">
                    <div class="flex items-center gap-2">
                      <span class="text-text-light">{{ email.blNumber }}</span>
                      <!-- <span
                        v-if="email.unipassData"
                        class="text-accent-DEFAULT text-xs"
                        >●</span
                      > -->
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-text-DEFAULT">
                    {{ email.trackingNumber || "N/A" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-text-light">
                    {{ email.acceptanceTime || "-" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-text-light">
                    {{ email.clearanceTime || "-" }}
                  </td>
                  <td class="px-6 py-4 text-sm text-text-light">
                    {{ email.date }}
                  </td>
                  <td class="px-6 py-4 text-sm text-text-light">
                    {{ email.time }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 더보기 버튼 -->
          <div
            v-if="emails.length > displayCount"
            class="p-6 text-center border-t border-gray-200 bg-gray-50"
          >
            <button
              @click="showMore"
              class="text-primary-DEFAULT hover:text-primary-dark font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              더 보기 ({{ emails.length - displayCount }}개 남음)
            </button>
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
import { ref, computed, onMounted, nextTick } from "vue";

interface Email {
  id: string;
  subject: string;
  body: string;
  blNumber: string;
  trackingNumber?: string;
  date: string;
  time: string;
  unipassData?: any;
  acceptanceTime?: string;
  clearanceTime?: string;
}

const isAuthenticated = ref(false);
const userEmail = ref("");
const emails = ref<Email[]>([]);
const startDate = ref("");
const endDate = ref("");
const blYear = ref(new Date().getFullYear().toString());
const loading = ref(false);
const loadingTime = ref(0);
let loadingTimer: NodeJS.Timeout | null = null;
const downloading = ref(false);
const error = ref("");
const xmlDebugging = ref(false);
const displayCount = ref(50);

const displayEmails = computed(() => emails.value.slice(0, displayCount.value));

// 제목 병합을 위한 계산된 속성
const emailsWithRowspan = computed(() => {
  const result: any[] = [];
  const slicedEmails = displayEmails.value;

  let i = 0;
  while (i < slicedEmails.length) {
    const currentEmail = slicedEmails[i];
    let rowspan = 1;

    // 같은 제목이 연속으로 나오는 개수 계산
    while (
      i + rowspan < slicedEmails.length &&
      slicedEmails[i + rowspan].subject === currentEmail.subject
    ) {
      rowspan++;
    }

    // 첫 번째 행에는 rowspan 정보 추가
    result.push({
      ...currentEmail,
      rowspan,
      showSubject: true,
    });

    // 나머지 행들은 제목 표시 안 함
    for (let j = 1; j < rowspan; j++) {
      result.push({
        ...slicedEmails[i + j],
        rowspan: 0,
        showSubject: false,
      });
    }

    i += rowspan;
  }

  return result;
});

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
    emails.value = [];
    userEmail.value = "";
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// 메일 조회
const fetchEmails = async () => {
  loading.value = true;
  loadingTime.value = 0;
  if (loadingTimer) clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    loadingTime.value++;
  }, 1000);

  error.value = "";
  emails.value = [];
  displayCount.value = 50;

  try {
    const data = await $fetch("/api/emails", {
      params: {
        startDate: new Date(startDate.value).toISOString(),
        endDate: new Date(endDate.value).toISOString(),
        blYear: blYear.value,
      },
    });

    emails.value = data || [];
  } catch (err: any) {
    error.value =
      err.data?.statusMessage || "메일 조회 중 오류가 발생했습니다.";

    if (err.data?.statusCode === 401) {
      // 토큰 만료 시 재로그인
      setTimeout(() => {
        login();
      }, 2000);
    }
  } finally {
    loading.value = false;
    if (loadingTimer) clearInterval(loadingTimer);
    console.log("Fetched emails:", emails.value);
  }
};

// 엑셀 다운로드
const downloadExcel = async () => {
  downloading.value = true;

  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        emails: emails.value.map(email => ({
          id: email.id,
          subject: email.subject,
          blNumber: email.blNumber,
          trackingNumber: email.trackingNumber,
          acceptanceTime: email.acceptanceTime,
          clearanceTime: email.clearanceTime,
          date: email.date,
          time: email.time
        }))
      }),
    });

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gmail_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = "엑셀 다운로드 중 오류가 발생했습니다.";
  } finally {
    downloading.value = false;
  }
};

// 더 보기
const showMore = () => {
  displayCount.value += 50;
};

// Unipass 팝업 관련
const showUnipassModal = ref(false);
const selectedBL = ref("");
const unipassData = ref<any>(null);
const unipassLoading = ref(false);
const unipassError = ref("");

const parsedXml = ref<Document | null>(null);

declare const Prism: any;

const showUnipassData = async (email: Email) => {
  selectedBL.value = email.blNumber;
  unipassData.value = email.unipassData;
  showUnipassModal.value = true;
  unipassLoading.value = false;
  unipassError.value = "";

  if (unipassData.value && unipassData.value.originalData) {
    const parser = new DOMParser();
    parsedXml.value = parser.parseFromString(
      unipassData.value.originalData,
      "application/xml"
    );
  }

  await nextTick();
  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  }
};

const closeUnipassModal = () => {
  showUnipassModal.value = false;
  selectedBL.value = "";
  unipassData.value = null;
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
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

onMounted(() => {
  checkAuth();
  setDefaultDates();

  // URL 파라미터 확인 (에러 처리)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("error")) {
    error.value = "로그인 중 오류가 발생했습니다.";
  }
});
</script>
