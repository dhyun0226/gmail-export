<template>
  <div>
    <!-- Query Conditions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div>
        <label class="form-label">조회일자</label>
        <input v-model="queryDate" type="date" class="form-input" />
      </div>
      <div>
        <label class="form-label">수출입 구분</label>
        <select v-model="imexTp" class="form-select">
          <option value="2">수입</option>
          <option value="1">수출</option>
        </select>
      </div>
      <div class="flex items-end">
        <button
          @click="fetchRates"
          :disabled="loading || !queryDate"
          class="btn btn-primary btn-md w-full"
        >
          {{ loading ? '조회 중...' : '조회' }}
        </button>
      </div>
    </div>

    <!-- Major Currency Cards -->
    <div v-if="majorRates.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="rate in majorRates" :key="rate.currSgn" class="card p-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[13px] text-gray-500">{{ rate.currSgn }}</span>
          <span class="text-xs text-gray-400">{{ rate.cntySgn }}</span>
        </div>
        <div class="text-xl font-bold text-gray-900">{{ rate.fxrt.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ rate.mtryUtNm }}</div>
      </div>
    </div>

    <!-- Full Rate Table -->
    <div v-if="rates.length > 0" class="card-elevated overflow-hidden">
      <div class="result-header">
        <h2 class="section-title">
          환율 목록: <span class="text-emerald-600">{{ rates.length }}</span>건
          <span class="text-xs font-normal text-gray-500 ml-2">적용개시일: {{ rates[0]?.aplyBgnDt }}</span>
        </h2>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>국가부호</th>
              <th>통화부호</th>
              <th>화폐단위명</th>
              <th class="text-right">환율 (원)</th>
              <th>적용개시일</th>
              <th>수출입</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rate in rates"
              :key="rate.currSgn"
              :class="{ 'bg-blue-50/20': isMajor(rate.currSgn) }"
            >
              <td>{{ rate.cntySgn }}</td>
              <td class="font-medium text-gray-900">{{ rate.currSgn }}</td>
              <td>{{ rate.mtryUtNm }}</td>
              <td class="text-right font-medium">{{ rate.fxrt.toLocaleString('ko-KR', { maximumFractionDigits: 4 }) }}</td>
              <td>{{ formatDate(rate.aplyBgnDt) }}</td>
              <td>
                <span :class="['badge', rate.imexTp === '2' ? 'badge-blue' : 'badge-green']">
                  {{ rate.imexTp === '2' ? '수입' : '수출' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="searched && rates.length === 0 && !loading" class="empty-state">
      <p class="empty-state-text">해당 날짜의 환율 정보가 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface ExchangeRate {
  cntySgn: string;
  mtryUtNm: string;
  fxrt: number;
  currSgn: string;
  aplyBgnDt: string;
  imexTp: string;
}

const emit = defineEmits<{
  error: [message: string];
}>();

const MAJOR_CURRENCIES = ['USD', 'EUR', 'JPY', 'CNY'];

const queryDate = ref('');
const imexTp = ref<'1' | '2'>('2');
const loading = ref(false);
const searched = ref(false);
const rates = ref<ExchangeRate[]>([]);

const majorRates = computed(() =>
  MAJOR_CURRENCIES
    .map(c => rates.value.find(r => r.currSgn === c))
    .filter((r): r is ExchangeRate => !!r)
);

const isMajor = (currSgn: string) => MAJOR_CURRENCIES.includes(currSgn);

const formatDate = (d: string) => {
  if (!d || d.length !== 8) return d;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
};

const fetchRates = async () => {
  loading.value = true;
  searched.value = true;
  rates.value = [];

  try {
    const dateStr = queryDate.value.replace(/-/g, '');
    const res = await $fetch<{ success: boolean; rates: ExchangeRate[] }>('/api/unipass/exchange-rate', {
      params: { date: dateStr, imexTp: imexTp.value }
    });

    rates.value = res.rates;
  } catch (err: any) {
    emit('error', err.data?.statusMessage || '환율 조회 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  queryDate.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
});
</script>
