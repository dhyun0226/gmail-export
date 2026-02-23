<template>
  <div v-if="results.length > 0" class="result-container">
    <div class="result-header">
      <div class="flex items-center gap-3">
        <h3 class="section-title">추출 결과</h3>
        <span class="badge badge-green">{{ results.length }}건</span>
      </div>
      <div class="flex gap-2">
        <button
          @click="$emit('downloadExcel')"
          :disabled="downloading"
          class="btn btn-accent btn-md"
        >
          {{ downloading ? '다운로드 중...' : '엑셀 다운로드' }}
        </button>
        <button
          @click="$emit('uploadDrive')"
          :disabled="uploading"
          class="btn btn-primary btn-md"
        >
          {{ uploading ? '업로드 중...' : 'Drive 업로드' }}
        </button>
      </div>
    </div>

    <!-- Drive Upload Result -->
    <div v-if="driveResult" class="alert alert-success rounded-none border-x-0 border-t-0">
      Drive 업로드 완료: {{ driveResult.uploadedFiles.length }}개 파일, {{ driveResult.createdFolders.length }}개 BL 폴더
      <span v-if="driveResult.errors.length > 0" class="text-red-600 ml-2">
        (오류 {{ driveResult.errors.length }}건)
      </span>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>순번</th>
            <th>문서종류</th>
            <th>제목 BL</th>
            <th>문서 BL</th>
            <th>BL 일치</th>
            <th>품명</th>
            <th>수량</th>
            <th>중량</th>
            <th>금액</th>
            <th>환율</th>
            <th>원화금액</th>
            <th>HS코드</th>
            <th>원산지</th>
            <th>송하인</th>
            <th>파일명</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(result, index) in results"
            :key="index"
            :class="{ 'bg-red-50/30': result.error }"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <span :class="['badge', docTypeClass(result.documentType)]">
                {{ result.documentType }}
              </span>
            </td>
            <td class="font-medium">{{ result.subjectBlNumber || '-' }}</td>
            <td class="font-medium">{{ result.documentBlNumber || '-' }}</td>
            <td>
              <span v-if="result.blMatch === 'match'" class="badge badge-green">일치</span>
              <span v-else-if="result.blMatch === 'mismatch'" class="badge badge-red">불일치</span>
              <span v-else-if="result.blMatch === 'subject_only'" class="badge badge-yellow">제목만</span>
              <span v-else-if="result.blMatch === 'document_only'" class="badge badge-yellow">문서만</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="max-w-[200px] truncate" :title="result.productName">{{ result.productName || '-' }}</td>
            <td>{{ result.quantity || '-' }}</td>
            <td>{{ result.weight || '-' }}</td>
            <td>{{ result.amount || '-' }}</td>
            <td>
              <span v-if="result.exchangeRate">{{ result.currency }} {{ result.exchangeRate }}</span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="font-medium text-blue-600">{{ result.amountKRW || '-' }}</td>
            <td>{{ result.hsCode || '-' }}</td>
            <td>{{ result.countryOfOrigin || '-' }}</td>
            <td class="max-w-[150px] truncate" :title="result.shipper">{{ result.shipper || '-' }}</td>
            <td class="max-w-[150px] truncate" :title="result.sourceFilename">{{ result.sourceFilename }}</td>
            <td>
              <span v-if="result.error" class="badge badge-red">{{ result.error }}</span>
              <span v-else class="badge badge-green">성공</span>
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
  currency?: string;
  amountValue?: number;
  exchangeRate?: number;
  amountKRW?: string;
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
      return 'badge-blue';
    case 'Packing List':
      return 'badge-green';
    case 'Airbill':
    case 'Bill of Lading':
      return 'badge-purple';
    default:
      return 'badge-gray';
  }
};
</script>
