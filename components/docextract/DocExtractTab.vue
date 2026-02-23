<template>
  <div>
    <!-- Date Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <label class="form-label">시작일시</label>
        <input v-model="startDate" type="datetime-local" class="form-input" />
      </div>
      <div>
        <label class="form-label">종료일시</label>
        <input v-model="endDate" type="datetime-local" class="form-input" />
      </div>
    </div>

    <div class="flex gap-4 mb-8">
      <button
        @click="startExtraction()"
        :disabled="processing || !startDate || !endDate"
        class="btn btn-primary btn-lg flex-1"
      >
        {{ processing ? '추출 중...' : '추출 시작' }}
      </button>
      <button
        @click="startExtraction(1)"
        :disabled="processing || !startDate || !endDate"
        class="btn btn-warning btn-md whitespace-nowrap"
      >
        {{ processing ? '테스트 중...' : '1건 테스트' }}
      </button>
    </div>

    <!-- Progress -->
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

    <!-- Result Table -->
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

  if (elapsedTimer) clearInterval(elapsedTimer);
  elapsedTimer = setInterval(() => {
    elapsedTime.value++;
  }, 1000);

  try {
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

    let allPdfs: { email: EmailWithAttachments; attachment: AttachmentInfo }[] = [];
    for (const email of fetchRes.emails) {
      for (const att of email.attachments) {
        allPdfs.push({ email, attachment: att });
      }
    }

    if (limit && limit > 0) {
      allPdfs = allPdfs.slice(0, limit);
    }

    totalCount.value = allPdfs.length;
    currentStep.value = limit
      ? `테스트 모드: ${allPdfs.length}개 PDF 추출 시작`
      : `${fetchRes.emails.length}개 메일, ${allPdfs.length}개 PDF 추출 시작`;

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

    currentStep.value = '환율 조회 중...';
    await applyExchangeRates();

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

function parseAmount(amount: string): { currency: string; value: number } | null {
  if (!amount) return null;
  const match = amount.match(/([A-Z]{3})\s*([\d,]+\.?\d*)/i)
    || amount.match(/([\d,]+\.?\d*)\s*([A-Z]{3})/i);
  if (!match) return null;

  let currency: string;
  let numStr: string;
  if (/^[A-Z]/i.test(match[1]!)) {
    currency = match[1]!.toUpperCase();
    numStr = match[2]!;
  } else {
    numStr = match[1]!;
    currency = match[2]!.toUpperCase();
  }
  const value = parseFloat(numStr.replace(/,/g, ''));
  if (isNaN(value)) return null;
  return { currency, value };
}

const applyExchangeRates = async () => {
  try {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;

    const res = await $fetch<{ rates: { currSgn: string; fxrt: number }[] }>('/api/unipass/exchange-rate', {
      params: { date: dateStr, imexTp: '2' }
    });

    const rateMap = new Map<string, number>();
    for (const r of res.rates) {
      rateMap.set(r.currSgn, r.fxrt);
    }

    for (const result of extractionResults.value) {
      if (!result.amount || result.error) continue;
      const parsed = parseAmount(result.amount);
      if (!parsed || parsed.currency === 'KRW') continue;

      result.currency = parsed.currency;
      result.amountValue = parsed.value;

      const rate = rateMap.get(parsed.currency);
      if (rate) {
        result.exchangeRate = rate;
        const krw = Math.round(parsed.value * rate);
        result.amountKRW = krw.toLocaleString('ko-KR') + ' KRW';
      }
    }
  } catch (err) {
    console.warn('[DocExtract] Exchange rate lookup failed:', err);
  }
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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  startDate.value = toLocalISOString(start);
  endDate.value = toLocalISOString(end);
};

onMounted(() => {
  setDefaultDates();
});
</script>
