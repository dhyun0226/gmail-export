<template>
  <div>
    <!-- Date & BL Year Selection -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div>
        <label class="form-label">시작일시</label>
        <input v-model="startDate" type="datetime-local" class="form-input" />
      </div>
      <div>
        <label class="form-label">종료일시</label>
        <input v-model="endDate" type="datetime-local" class="form-input" />
      </div>
      <div>
        <label class="form-label">BL 년도</label>
        <input v-model="blYear" type="number" class="form-input" />
      </div>
    </div>

    <div class="flex gap-4 mb-8">
      <button
        @click="fetchEmails"
        :disabled="loading || !startDate || !endDate"
        class="btn btn-primary btn-lg flex-1"
      >
        {{ loading ? `조회 중... (${loadingTime}s)` : '메일 조회' }}
      </button>
    </div>

    <!-- Email Results -->
    <div v-if="emails.length > 0" class="result-container">
      <div class="result-header">
        <h2 class="section-title">
          조회 결과: <span class="text-emerald-600">{{ emails.length }}</span>개
        </h2>
        <div class="flex gap-2">
          <button
            @click="downloadFile('xlsx')"
            :disabled="downloading"
            class="btn btn-accent btn-md"
          >
            {{ downloading === 'xlsx' ? '다운로드 중...' : '엑셀 다운로드' }}
          </button>
          <button
            @click="downloadFile('csv')"
            :disabled="downloading"
            class="btn btn-primary btn-md"
          >
            {{ downloading === 'csv' ? '다운로드 중...' : 'CSV 다운로드' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>B/L 번호</th>
              <th>Tracking 번호</th>
              <th>통관접수시간</th>
              <th>수리시간</th>
              <th>메일 수신날짜</th>
              <th>메일 수신 시간</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(email, index) in emailsWithRowspan"
              :key="`${email.id}-${index}`"
            >
              <td
                v-if="email.showSubject"
                :rowspan="email.rowspan"
                class="align-middle border-r border-gray-100 bg-gray-50/50 font-medium"
              >
                {{ email.subject }}
              </td>
              <td>{{ email.blNumber }}</td>
              <td>{{ email.trackingNumber || 'N/A' }}</td>
              <td>{{ email.acceptanceTime || '-' }}</td>
              <td>{{ email.clearanceTime || '-' }}</td>
              <td>{{ email.date }}</td>
              <td>{{ email.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Show more -->
      <div
        v-if="emails.length > displayCount"
        class="px-5 py-3 border-t border-gray-200 bg-gray-50/70 text-center"
      >
        <button @click="showMore" class="btn btn-secondary btn-md">
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
const startDate = ref('');
const endDate = ref('');
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

const emailsWithRowspan = computed(() => {
  const result: any[] = [];
  const slicedEmails = displayEmails.value;

  let i = 0;
  while (i < slicedEmails.length) {
    const currentEmail = slicedEmails[i];
    let rowspan = 1;

    while (
      i + rowspan < slicedEmails.length &&
      slicedEmails[i + rowspan].subject === currentEmail.subject
    ) {
      rowspan++;
    }

    result.push({
      ...currentEmail,
      rowspan,
      showSubject: true,
    });

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
    const data = await $fetch('/api/email/list', {
      params: {
        startDate: new Date(startDate.value).toISOString(),
        endDate: new Date(endDate.value).toISOString(),
        blYear: blYear.value,
      },
    });

    emails.value = data || [];
  } catch (err: any) {
    emit('error', err.data?.statusMessage || '메일 조회 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
    if (loadingTimer) clearInterval(loadingTimer);
  }
};

const downloadFile = async (format: 'xlsx' | 'csv') => {
  downloading.value = format;

  try {
    const response = await fetch('/api/email/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail_export_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    emit('error', `${format.toUpperCase()} 다운로드 중 오류가 발생했습니다.`);
  } finally {
    downloading.value = false;
  }
};

const showMore = () => {
  displayCount.value += 50;
};

const setDefaultDates = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const start = new Date(yesterday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(yesterday);
  end.setHours(23, 59, 59, 999);

  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

onMounted(() => {
  setDefaultDates();
});
</script>
