<template>
  <div class="w-full">
    <div class="upload-zone relative">
      <div v-if="!file">
        <p class="text-sm font-semibold text-gray-800 mb-1">미분류 메일 목록 업로드</p>
        <p class="text-xs text-gray-500">A열 수신일시 + B열 메일제목</p>
        <input ref="fileInput" type="file" accept=".xlsx,.xls"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileSelect" />
      </div>
      <div v-else class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-800 truncate">{{ file.name }}</h3>
          <p class="text-xs text-gray-500">{{ matchedCount }}개 BL 추출</p>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" @click="removeFile">삭제</button>
      </div>
    </div>
    <div v-if="processing" class="text-xs text-blue-600 mt-2">파일 처리 중...</div>
    <div v-if="error" class="alert alert-error mt-3">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { buildMailTimeMap } from '~/utils/kpiMailList'

const emit = defineEmits<{
  uploaded: [data: { mailTimeMap: Record<string, string>, fileName: string, rowCount: number }]
}>()
const fileInput = ref<HTMLInputElement>()
const file = ref<File | null>(null)
const processing = ref(false)
const matchedCount = ref(0)
const error = ref('')

const handleFileSelect = async (event: Event) => {
  const selected = (event.target as HTMLInputElement).files?.[0]
  if (!selected) return
  if (!/\.(xlsx|xls)$/i.test(selected.name)) {
    error.value = '엑셀 파일(.xlsx, .xls)만 업로드할 수 있습니다.'
    return
  }
  file.value = selected
  processing.value = true
  error.value = ''
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(await selected.arrayBuffer(), { type: 'array', cellDates: true })
    const sheetName = workbook.SheetNames.find(name => {
      const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[name], { header: 1, defval: '' })
      return rows.some(row => String(row[0]).trim() === '수신일시' && String(row[1]).trim() === '메일제목')
    })
    if (!sheetName) throw new Error('수신일시(A열)와 메일제목(B열)을 찾을 수 없습니다.')
    const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[sheetName], { header: 1, defval: '', raw: false })
    const headerIndex = rows.findIndex(row => String(row[0]).trim() === '수신일시' && String(row[1]).trim() === '메일제목')
    const mailTimeMap = buildMailTimeMap(rows.slice(headerIndex + 1).map(row => ({ receivedAt: row[0], subject: row[1] })))
    matchedCount.value = Object.keys(mailTimeMap).length
    emit('uploaded', { mailTimeMap, fileName: selected.name, rowCount: matchedCount.value })
  } catch (caught: any) {
    file.value = null
    matchedCount.value = 0
    error.value = caught?.message || '미분류 메일 목록 처리에 실패했습니다.'
  } finally {
    processing.value = false
  }
}

const removeFile = () => {
  file.value = null
  matchedCount.value = 0
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
  emit('uploaded', { mailTimeMap: {}, fileName: '', rowCount: 0 })
}
</script>
