<template>
  <div>
    <!-- 조회 조건 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div>
        <label class="block text-sm font-medium text-text-light mb-2">조회일자</label>
        <input
          v-model="queryDate"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-text-light mb-2">수출입 구분</label>
        <select
          v-model="imexTp"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 text-text-DEFAULT"
        >
          <option value="2">수입</option>
          <option value="1">수출</option>
        </select>
      </div>
      <div class="flex items-end">
        <button
          @click="fetchRates"
          :disabled="loading || !queryDate"
          class="w-full bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
          :class="{ '!bg-gray-400': loading }"
        >
          {{ loading ? '조회 중...' : '조회' }}
        </button>
      </div>
    </div>

    <!-- 주요 통화 카드 -->
    <div v-if="majorRates.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        v-for="rate in majorRates"
        :key="rate.currSgn"
        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-medium text-text-light">{{ rate.currSgn }}</span>
          <span class="text-xs text-gray-400">{{ rate.cntySgn }}</span>
        </div>
        <div class="text-2xl font-bold text-primary-dark">{{ rate.fxrt.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) }}</div>
        <div class="text-xs text-text-light mt-1">{{ rate.mtryUtNm }}</div>
      </div>
    </div>

    <!-- 전체 환율 테이블 -->
    <div v-if="rates.length > 0" class="bg-white rounded-xl shadow-lg">
      <div class="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-bold text-primary-dark">
          환율 목록: <span class="text-accent-DEFAULT">{{ rates.length }}</span>건
          <span class="text-sm font-normal text-text-light ml-2">적용개시일: {{ rates[0]?.aplyBgnDt }}</span>
        </h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">국가부호</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">통화부호</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">화폐단위명</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-text-light uppercase tracking-wider">환율 (원)</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">적용개시일</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">수출입</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="rate in rates"
              :key="rate.currSgn"
              class="hover:bg-gray-50 transition duration-150"
              :class="{ 'bg-blue-50': isMajor(rate.currSgn) }"
            >
              <td class="px-4 py-3 text-sm text-text-DEFAULT">{{ rate.cntySgn }}</td>
              <td class="px-4 py-3 text-sm font-medium text-primary-dark">{{ rate.currSgn }}</td>
              <td class="px-4 py-3 text-sm text-text-light">{{ rate.mtryUtNm }}</td>
              <td class="px-4 py-3 text-sm text-right font-medium text-text-DEFAULT">{{ rate.fxrt.toLocaleString('ko-KR', { maximumFractionDigits: 4 }) }}</td>
              <td class="px-4 py-3 text-sm text-text-light">{{ formatDate(rate.aplyBgnDt) }}</td>
              <td class="px-4 py-3 text-sm">
                <span
                  class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  :class="rate.imexTp === '2' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
                >
                  {{ rate.imexTp === '2' ? '수입' : '수출' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 결과 없음 -->
    <div v-if="searched && rates.length === 0 && !loading" class="text-center py-12 text-text-light">
      해당 날짜의 환율 정보가 없습니다.
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
