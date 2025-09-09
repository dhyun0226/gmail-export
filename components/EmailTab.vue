<template>
  <div>
    <!-- 날짜 및 BL 년도 선택 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div>
        <label class="block text-sm font-medium text-text-light mb-2">시작일시</label>
        <input
          v-model="startDate"
          type="datetime-local"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-text-light mb-2">종료일시</label>
        <input
          v-model="endDate"
          type="datetime-local"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-text-light mb-2">BL 년도</label>
        <input
          v-model="blYear"
          type="number"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
        />
      </div>
    </div>

    <div class="flex gap-4 mb-8">
      <button
        @click="fetchEmails"
        :disabled="loading || !startDate || !endDate"
        class="flex-1 bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md"
        :class="{ '!bg-gray-400': loading }"
      >
        {{ loading ? `조회 중... (${loadingTime}s)` : "메일 조회" }}
      </button>
    </div>

    <!-- 메일 목록 -->
    <div v-if="emails.length > 0" class="bg-white rounded-xl shadow-lg">
      <div class="p-8 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-primary-dark">
          조회 결과: <span class="text-accent-DEFAULT">{{ emails.length }}</span>개
        </h2>
        <div class="flex gap-3">
          <button
            @click="downloadFile('xlsx')"
            :disabled="downloading"
            class="bg-accent-dark hover:bg-accent-dark disabled:bg-secondary-light text-white font-semibold py-2.5 px-6 rounded-lg transition duration-300 ease-in-out shadow-md"
          >
            {{ downloading === 'xlsx' ? "다운로드 중..." : "엑셀 다운로드" }}
          </button>
          <button
            @click="downloadFile('csv')"
            :disabled="downloading"
            class="bg-primary-dark hover:bg-primary-dark disabled:bg-secondary-light text-white font-semibold py-2.5 px-6 rounded-lg transition duration-300 ease-in-out shadow-md"
          >
            {{ downloading === 'csv' ? "다운로드 중..." : "CSV 다운로드" }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">제목</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">B/L 번호</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">Tracking 번호</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">통관접수시간</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">수리시간</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">메일 수신날짜</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">메일 수신 시간</th>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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

const emails = ref<Email[]>([]);
const startDate = ref("");
const endDate = ref("");
const blYear = ref(new Date().getFullYear().toString());
const loading = ref(false);
const loadingTime = ref(0);
let loadingTimer: NodeJS.Timeout | null = null;
const downloading = ref(false as false | 'xlsx' | 'csv');
const displayCount = ref(50);

const emit = defineEmits<{
  error: [message: string]
}>();

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

// 메일 조회
const fetchEmails = async () => {
  loading.value = true;
  loadingTime.value = 0;
  if (loadingTimer) clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    loadingTime.value++;
  }, 1000);

  emails.value = [];
  displayCount.value = 50;

  try {
    const data = await $fetch("/api/email/list", {
      params: {
        startDate: new Date(startDate.value).toISOString(),
        endDate: new Date(endDate.value).toISOString(),
        blYear: blYear.value,
      },
    });

    emails.value = data || [];
  } catch (err: any) {
    emit('error', err.data?.statusMessage || "메일 조회 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
    if (loadingTimer) clearInterval(loadingTimer);
  }
};

// 파일 다운로드 (엑셀/CSV)
const downloadFile = async (format: 'xlsx' | 'csv') => {
  downloading.value = format;

  try {
    const response = await fetch("/api/email/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        format: format,
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
    a.download = `gmail_export_${new Date().toISOString().split("T")[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    emit('error', `${format.toUpperCase()} 다운로드 중 오류가 발생했습니다.`);
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
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

// 컴포넌트 마운트 시
onMounted(() => {
  setDefaultDates();
});
</script>