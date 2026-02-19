<template>
  <div>
    <!-- 날짜 선택 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
    </div>

    <div class="flex gap-4 mb-8">
      <button
        @click="startExtraction()"
        :disabled="processing || !startDate || !endDate"
        class="flex-1 bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md"
        :class="{ '!bg-gray-400': processing }"
      >
        {{ processing ? '추출 중...' : '추출 시작' }}
      </button>
      <button
        @click="startExtraction(1)"
        :disabled="processing || !startDate || !endDate"
        class="bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md whitespace-nowrap"
        :class="{ '!bg-gray-400': processing }"
      >
        {{ processing ? '테스트 중...' : '1건 테스트' }}
      </button>
    </div>

    <!-- 진행 상태 -->
    <DocExtractProgress
      :is-processing="processing"
      :completed="completed"
      :current-step="currentStep"
      :current-filename="currentFilename"
      :elapsed-time="elapsedTime"
      :processed-count="processedCount"
      :total-count="totalCount"
      :statistics="statistics"
    />

    <!-- 결과 테이블 -->
    <DocExtractResultTable
      :results="extractionResults"
      :downloading="downloading"
      :uploading="uploading"
      :drive-result="driveResult"
      @download-excel="downloadExcel"
      @upload-drive="uploadToDrive"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DocExtractProgress from './DocExtractProgress.vue';
import DocExtractResultTable from './DocExtractResultTable.vue';

interface AttachmentInfo {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface EmailWithAttachments {
  messageId: string;
  subject: string;
  sender: string;
  date: string;
  time: string;
  blNumber: string;
  attachments: AttachmentInfo[];
}

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

interface Statistics {
  totalEmails: number;
  totalPdfs: number;
  successfulExtractions: number;
  failedExtractions: number;
  uniqueBlNumbers: number;
}

const emit = defineEmits<{
  error: [message: string];
}>();

const startDate = ref('');
const endDate = ref('');
const processing = ref(false);
const completed = ref(false);
const currentStep = ref('');
const currentFilename = ref('');
const elapsedTime = ref(0);
const processedCount = ref(0);
const totalCount = ref(0);
const extractionResults = ref<ExtractedResult[]>([]);
const statistics = ref<Statistics | undefined>(undefined);
const downloading = ref(false);
const uploading = ref(false);
const driveResult = ref<DriveResult | undefined>(undefined);

let elapsedTimer: NodeJS.Timeout | null = null;

// PDF 참조 정보 (Drive 업로드용)
const pdfReferences = ref<{ messageId: string; attachmentId: string; filename: string; blNumber: string }[]>([]);

const startExtraction = async (limit?: number) => {
  processing.value = true;
  completed.value = false;
  extractionResults.value = [];
  pdfReferences.value = [];
  statistics.value = undefined;
  driveResult.value = undefined;
  processedCount.value = 0;
  totalCount.value = 0;
  elapsedTime.value = 0;
  currentStep.value = '메일 조회 중...';
  currentFilename.value = '';

  // 타이머 시작
  if (elapsedTimer) clearInterval(elapsedTimer);
  elapsedTimer = setInterval(() => {
    elapsedTime.value++;
  }, 1000);

  try {
    // 1단계: PDF 첨부파일 조회
    const fetchRes = await $fetch<{
      success: boolean;
      emails: EmailWithAttachments[];
      totalAttachments: number;
    }>('/api/docextract/fetch-attachments', {
      params: {
        startDate: new Date(startDate.value).toISOString(),
        endDate: new Date(endDate.value).toISOString()
      }
    });

    if (!fetchRes.emails || fetchRes.emails.length === 0) {
      currentStep.value = '해당 기간에 PDF 첨부파일이 있는 메일이 없습니다.';
      processing.value = false;
      if (elapsedTimer) clearInterval(elapsedTimer);
      return;
    }

    // 전체 PDF 목록 평탄화
    let allPdfs: { email: EmailWithAttachments; attachment: AttachmentInfo }[] = [];
    for (const email of fetchRes.emails) {
      for (const att of email.attachments) {
        allPdfs.push({ email, attachment: att });
      }
    }

    // 1건 테스트 모드: 첫 N개만 처리
    if (limit && limit > 0) {
      allPdfs = allPdfs.slice(0, limit);
    }

    totalCount.value = allPdfs.length;
    currentStep.value = limit
      ? `테스트 모드: ${allPdfs.length}개 PDF 추출 시작`
      : `${fetchRes.emails.length}개 메일, ${allPdfs.length}개 PDF 추출 시작`;

    // 2단계: PDF 1건씩 순차 추출
    for (let i = 0; i < allPdfs.length; i++) {
      const item = allPdfs[i]!;
      currentFilename.value = item.attachment.filename;
      currentStep.value = `추출 중 (${i + 1}/${allPdfs.length})`;

      try {
        const result = await $fetch<ExtractedResult>('/api/docextract/extract-single', {
          method: 'POST',
          body: {
            messageId: item.email.messageId,
            attachmentId: item.attachment.attachmentId,
            filename: item.attachment.filename,
            subject: item.email.subject,
            sender: item.email.sender,
            blNumber: item.email.blNumber
          }
        });

        extractionResults.value.push(result);

        // Drive 업로드용 참조 저장
        pdfReferences.value.push({
          messageId: item.email.messageId,
          attachmentId: item.attachment.attachmentId,
          filename: item.attachment.filename,
          blNumber: result.blNumber || item.email.blNumber || 'UNKNOWN'
        });
      } catch (err: any) {
        extractionResults.value.push({
          messageId: item.email.messageId,
          sourceFilename: item.attachment.filename,
          documentType: '기타',
          blNumber: item.email.blNumber || '',
          productName: '', quantity: '', weight: '',
          amount: '', hsCode: '', countryOfOrigin: '', shipper: '',
          error: err.data?.statusMessage || '추출 실패'
        });
      }

      processedCount.value = i + 1;
    }

    // 3단계: 통계 계산
    const uniqueBls = new Set(extractionResults.value.map(r => r.blNumber).filter(bl => bl && bl !== 'N/A'));
    statistics.value = {
      totalEmails: fetchRes.emails.length,
      totalPdfs: allPdfs.length,
      successfulExtractions: extractionResults.value.filter(r => !r.error).length,
      failedExtractions: extractionResults.value.filter(r => r.error).length,
      uniqueBlNumbers: uniqueBls.size
    };

    currentStep.value = '추출 완료';
    completed.value = true;

  } catch (err: any) {
    console.error('[DocExtract] Error:', err);
    emit('error', err.data?.statusMessage || '문서 추출 중 오류가 발생했습니다.');
  } finally {
    processing.value = false;
    if (elapsedTimer) clearInterval(elapsedTimer);
  }
};

// 엑셀 다운로드
const downloadExcel = async () => {
  downloading.value = true;

  try {
    const response = await fetch('/api/docextract/export-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: extractionResults.value })
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docextract_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    emit('error', '엑셀 다운로드 중 오류가 발생했습니다.');
  } finally {
    downloading.value = false;
  }
};

// Drive 업로드
const uploadToDrive = async () => {
  if (pdfReferences.value.length === 0) {
    emit('error', '업로드할 파일이 없습니다.');
    return;
  }

  uploading.value = true;

  try {
    const result = await $fetch<DriveResult & { success: boolean }>('/api/docextract/upload-drive', {
      method: 'POST',
      body: {
        results: extractionResults.value,
        pdfReferences: pdfReferences.value
      }
    });

    driveResult.value = {
      uploadedFiles: result.uploadedFiles,
      createdFolders: result.createdFolders,
      errors: result.errors
    };

    if (result.errors.length > 0) {
      emit('error', `Drive 업로드 일부 실패: ${result.errors.join(', ')}`);
    }
  } catch (err: any) {
    emit('error', err.data?.statusMessage || 'Drive 업로드 중 오류가 발생했습니다.');
  } finally {
    uploading.value = false;
  }
};

// 기본 날짜 설정 (어제 00:00 ~ 23:59)
const setDefaultDates = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const start = new Date(yesterday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(yesterday);
  end.setHours(23, 59, 59, 999);

  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

onMounted(() => {
  setDefaultDates();
});
</script>
