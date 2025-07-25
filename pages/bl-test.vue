<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">BL 번호 추출 테스트</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">제목 입력</h2>
      <input
        v-model="subject"
        type="text"
        placeholder="이메일 제목 입력"
        class="w-full p-3 border rounded-lg mb-4"
      >
      
      <h2 class="text-lg font-semibold mb-4">발신자 이메일 (선택사항)</h2>
      <input
        v-model="sender"
        type="email"
        placeholder="예: sender@dhl.com"
        class="w-full p-3 border rounded-lg mb-4"
      >
      
      <h2 class="text-lg font-semibold mb-4">본문 입력 (UPS Pre-Alert용)</h2>
      <textarea
        v-model="body"
        placeholder="이메일 본문 입력 (UPS Pre-Alert의 경우)"
        rows="6"
        class="w-full p-3 border rounded-lg mb-4"
      ></textarea>
      
      <button
        @click="testExtraction"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg"
      >
        API 테스트
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">실시간 추출 결과</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium text-gray-700 mb-2">클라이언트 추출 (실시간)</h3>
          <div class="p-3 bg-blue-50 rounded">
            <div class="font-semibold">{{ extractedBlNumber }}</div>
          </div>
        </div>
        <div v-if="currentExample">
          <h3 class="font-medium text-gray-700 mb-2">예상값</h3>
          <div class="p-3 bg-gray-50 rounded">
            <div class="font-semibold">{{ currentExample.expected }}</div>
          </div>
          <div class="mt-2">
            <span v-if="extractedBlNumber === currentExample.expected" class="text-green-600 font-medium">✅ 일치</span>
            <span v-else class="text-red-600 font-medium">❌ 불일치</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="results.length > 0" class="bg-white rounded-lg shadow p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">API 추출 결과</h2>
      <div class="space-y-2">
        <div v-for="(result, index) in results" :key="index" class="p-3 bg-gray-50 rounded">
          <div class="font-semibold">BL 번호: {{ result }}</div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">테스트 케이스 예시</h2>
      <div class="space-y-4">
        <div v-for="example in examples" :key="example.title" class="border-b pb-4">
          <h3 class="font-semibold text-blue-600 mb-2">{{ example.title }}</h3>
          <p class="text-sm text-gray-600 mb-2">제목: {{ example.subject }}</p>
          <p v-if="example.sender" class="text-sm text-gray-600 mb-2">발신자: {{ example.sender }}</p>
          <p class="text-sm text-gray-600">예상 BL: {{ example.expected }}</p>
          <button
            @click="loadExample(example)"
            class="mt-2 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            이 예시 테스트
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const subject = ref('');
const sender = ref('');
const body = ref('');
const results = ref<string[]>([]);
const currentExample = ref<any>(null);

// 실시간 BL 번호 추출
const extractedBlNumber = computed(() => {
  if (!subject.value) return 'N/A';
  
  // UPS Pre-Alert는 본문에서 추출해야 하지만, 여기서는 제목 기반만 처리
  // (클라이언트에서는 서버 로직을 직접 import할 수 없으므로)
  return extractBlNumberClient(subject.value, sender.value);
});

// 클라이언트용 BL 번호 추출 함수
function extractBlNumberClient(subject: string, sender?: string): string {
  // EI 패턴들
  const patterns = [
    { regex: /HB:\s*(\d+)(?:\||$|\s)/ },
    { regex: /HAWB#\s*(\d+)(?:\||$|\s)/ },
    { regex: /DHL\s+(\d+)/ },
    { regex: /CNW Pre-Alert\s*-\s*(\d+)/ },
    { regex: /AWB\s+(\S+)/ },
  ];
  
  // 패턴 매칭
  for (const pattern of patterns) {
    const match = subject.match(pattern.regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // DFG 패턴 (발신자가 @dhl.com인 경우)
  if (sender?.includes('@dhl.com') && subject.match(/^[A-Z]\d+/)) {
    const firstWord = subject.split(/[\s\/]/)[0];
    if (firstWord && /^[A-Z]\d+$/.test(firstWord)) {
      return firstWord;
    }
  }
  
  // '/' 분리 기반 패턴
  if (subject.includes('/')) {
    const parts = subject.split('/');
    const firstPart = parts[0].trim();
    if (/^[A-Z]\d+$/.test(firstPart)) {
      return firstPart;
    }
  }
  
  return 'N/A';
}

// 입력값이 변경될 때 현재 예시 찾기
watch([subject, sender], () => {
  currentExample.value = examples.find(ex => 
    ex.subject === subject.value && 
    (ex.sender || '') === sender.value
  ) || null;
});

const examples = [
  {
    title: 'DHL 패턴',
    subject: 'DHL 3344617975 (APPLIED MATERIALS SOUTH EAST ASIA P)',
    expected: '3344617975'
  },
  {
    title: 'EI HB 패턴 (파이프 있음)',
    subject: 'Pre-Alert Applied Materials - TPE-ICN | [SL1] - HB: 4812412901| MB: 695-51375133',
    expected: '4812412901'
  },
  {
    title: 'EI HAWB 패턴',
    subject: 'Applied Materials // HAWB# 4230771630 // MAWB# 180-26478023',
    expected: '4230771630'
  },
  {
    title: 'DFG 패턴',
    subject: 'G374089 / 98805597653 / 4520436594',
    sender: 'sender@dhl.com',
    expected: 'G374089'
  },
  {
    title: 'CNW 패턴',
    subject: '++CNEE++ CNW Pre-Alert - 11477525 - UA805',
    expected: '11477525'
  },
  {
    title: 'UPS Pre-Alert',
    subject: '[Pre-Alert] 8459V44MTRT 외 19건',
    body: `BL Number: 8459V44MTRT
Tracking: 1Z1234567890
Weight: 10kg

BL Number: 7652X33NQRS
Tracking: 1Z9876543210
Weight: 5kg`,
    expected: '8459V44MTRT, 7652X33NQRS'
  }
];

const loadExample = (example: any) => {
  subject.value = example.subject;
  sender.value = example.sender || '';
  body.value = example.body || '';
};

const testExtraction = async () => {
  try {
    const response = await $fetch('/api/test/bl-extract', {
      method: 'POST',
      body: {
        subject: subject.value,
        sender: sender.value,
        body: body.value
      }
    });
    
    results.value = response.blNumbers || [];
  } catch (error) {
    console.error('테스트 실패:', error);
    results.value = [];
  }
};
</script>