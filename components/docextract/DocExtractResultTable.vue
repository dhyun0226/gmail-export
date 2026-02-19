<template>
  <div v-if="results.length > 0" class="bg-white rounded-xl shadow-lg">
    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-xl font-bold text-primary-dark">
        추출 결과: <span class="text-accent-DEFAULT">{{ results.length }}</span>건
      </h2>
      <div class="flex gap-3">
        <button
          @click="$emit('downloadExcel')"
          :disabled="downloading"
          class="bg-accent-dark hover:bg-accent-dark disabled:bg-secondary-light text-white font-semibold py-2 px-5 rounded-lg transition duration-300 shadow-md text-sm"
        >
          {{ downloading ? '다운로드 중...' : '엑셀 다운로드' }}
        </button>
        <button
          @click="$emit('uploadDrive')"
          :disabled="uploading"
          class="bg-primary-dark hover:bg-primary-dark disabled:bg-secondary-light text-white font-semibold py-2 px-5 rounded-lg transition duration-300 shadow-md text-sm"
        >
          {{ uploading ? '업로드 중...' : 'Drive 업로드' }}
        </button>
      </div>
    </div>

    <!-- Drive 업로드 결과 -->
    <div v-if="driveResult" class="px-6 py-3 bg-green-50 border-b border-green-200 text-sm text-green-700">
      Drive 업로드 완료: {{ driveResult.uploadedFiles.length }}개 파일, {{ driveResult.createdFolders.length }}개 BL 폴더
      <span v-if="driveResult.errors.length > 0" class="text-red-600 ml-2">
        (오류 {{ driveResult.errors.length }}건)
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">순번</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">문서종류</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">제목 BL</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">문서 BL</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">BL 일치</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">품명</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">수량</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">중량</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">금액</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">HS코드</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">원산지</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">송하인</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">파일명</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">상태</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(result, index) in results"
            :key="index"
            class="hover:bg-gray-50 transition duration-150 even:bg-gray-50"
            :class="{ 'bg-red-50': result.error }"
          >
            <td class="px-4 py-3 text-sm text-text-light">{{ index + 1 }}</td>
            <td class="px-4 py-3 text-sm">
              <span
                class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                :class="docTypeClass(result.documentType)"
              >
                {{ result.documentType }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-text-DEFAULT">{{ result.subjectBlNumber || '-' }}</td>
            <td class="px-4 py-3 text-sm font-medium text-text-DEFAULT">{{ result.documentBlNumber || '-' }}</td>
            <td class="px-4 py-3 text-sm">
              <span v-if="result.blMatch === 'match'" class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">일치</span>
              <span v-else-if="result.blMatch === 'mismatch'" class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">불일치</span>
              <span v-else-if="result.blMatch === 'subject_only'" class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">제목만</span>
              <span v-else-if="result.blMatch === 'document_only'" class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">문서만</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-text-DEFAULT max-w-[200px] truncate" :title="result.productName">{{ result.productName || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light">{{ result.quantity || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light">{{ result.weight || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light">{{ result.amount || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light">{{ result.hsCode || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light">{{ result.countryOfOrigin || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light max-w-[150px] truncate" :title="result.shipper">{{ result.shipper || '-' }}</td>
            <td class="px-4 py-3 text-sm text-text-light max-w-[150px] truncate" :title="result.sourceFilename">{{ result.sourceFilename }}</td>
            <td class="px-4 py-3 text-sm">
              <span v-if="result.error" class="text-red-600 font-medium">{{ result.error }}</span>
              <span v-else class="text-green-600 font-medium">성공</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ExtractedResult {
  messageId: string;
  sourceFilename: string;
  documentType: string;
  blNumber: string;
  subjectBlNumber?: string;
  documentBlNumber?: string;
  blMatch?: 'match' | 'mismatch' | 'subject_only' | 'document_only' | 'none';
  productName: string;
  quantity: string;
  weight: string;
  amount: string;
  hsCode: string;
  countryOfOrigin: string;
  shipper: string;
  error?: string;
}

interface DriveResult {
  uploadedFiles: { filename: string; blNumber: string; webViewLink?: string }[];
  createdFolders: { blNumber: string; folderId: string }[];
  errors: string[];
}

defineProps<{
  results: ExtractedResult[];
  downloading: boolean;
  uploading: boolean;
  driveResult?: DriveResult;
}>();

defineEmits<{
  downloadExcel: [];
  uploadDrive: [];
}>();

const docTypeClass = (type: string) => {
  switch (type) {
    case 'Invoice':
    case 'Commercial Invoice':
      return 'bg-blue-100 text-blue-700';
    case 'Packing List':
      return 'bg-green-100 text-green-700';
    case 'Airbill':
    case 'Bill of Lading':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
</script>
