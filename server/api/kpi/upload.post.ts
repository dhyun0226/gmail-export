// server/api/kpi/upload.post.ts
import { defineEventHandler, readMultipartFormData, createError } from 'h3'
// CJS 대신 ESM 엔트리포인트를 직접 임포트
import * as XLSX from 'xlsx/xlsx.mjs'

export default defineEventHandler(async (event) => {
  console.log('[API] /api/kpi/upload: Received file upload request.')

  try {
    const parts = await readMultipartFormData(event)
    const file = parts?.find(p => p.name === 'file' && p.data)

    // [장점 1] GPT의 더 엄격한 유효성 검사 적용
    if (!file || !(file.data instanceof Uint8Array) || file.data.length === 0) {
      console.error('[API Error] No file data found in multipart form.')
      throw createError({ statusCode: 400, statusMessage: '엑셀 파일이 업로드되지 않았습니다.' })
    }

    console.log(`[API] File received: ${file.filename || '(no name)'}, size: ${file.data.length} bytes.`)

    // UTF-8 강제 → cpexcel 동적 로딩 차단
    const wb = XLSX.read(file.data, { type: 'buffer', codepage: 65001 })
    const sheetName = wb.SheetNames[0]
    
    // [장점 2] GPT의 빈 시트 검사 로직 추가
    if (!sheetName) throw createError({ statusCode: 400, statusMessage: '시트가 비어 있습니다.' })

    const ws = wb.Sheets[sheetName]
    // [장점 3] GPT의 defval 옵션을 사용하여 데이터 일관성 확보
    const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '' })

    // [핵심] 기존 코드의 BL 번호 추출 로직 적용
    const blNumbers: string[] = []
    const rawData: any[] = []
    // 헤더 행(1행)을 제외하고 C열 데이터 추출
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any
      const blNumber = row['C']?.toString().trim()
      if (blNumber) {
        blNumbers.push(blNumber)
        rawData.push(row) // 원본 데이터도 저장
      }
    }

    console.log(`[API] Successfully parsed and extracted ${blNumbers.length} BL numbers.`)

    // 최종적으로 BL번호 리스트와 원본 데이터를 포함하여 반환
    return {
      success: true,
      fileName: file.filename || 'unknown.xlsx',
      rowCount: blNumbers.length,
      blNumbers: [...new Set(blNumbers)], // 중복 제거
      rawData: rawData // 원본 데이터 추가
    }

  } catch (err: any) {
    console.error('[API Error] Failed to process file:', err)
    // [장점 4] GPT의 더 상세한 에러 리포팅 방식 적용
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: err?.statusMessage || '파일 처리 중 서버 오류가 발생했습니다.' })
  }
})