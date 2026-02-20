// server/api/kpi/upload.post.ts
import { defineEventHandler, readMultipartFormData, createError, getQuery } from 'h3'
// CJS 대신 ESM 엔트리포인트를 직접 임포트
import * as XLSX from 'xlsx/xlsx.mjs'
import type { ExportCodeMapEntry } from '../../utils/kpi/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mode = (query.mode as string) || 'import'

  console.log(`[API] /api/kpi/upload: Received file upload request. mode=${mode}`)

  try {
    const parts = await readMultipartFormData(event)
    const file = parts?.find(p => p.name === 'file' && p.data)

    if (!file || !(file.data instanceof Uint8Array) || file.data.length === 0) {
      console.error('[API Error] No file data found in multipart form.')
      throw createError({ statusCode: 400, statusMessage: '엑셀 파일이 업로드되지 않았습니다.' })
    }

    console.log(`[API] File received: ${file.filename || '(no name)'}, size: ${file.data.length} bytes.`)

    // UTF-8 강제 → cpexcel 동적 로딩 차단
    const wb = XLSX.read(file.data, { type: 'buffer', codepage: 65001 })
    const sheetName = wb.SheetNames[0]

    if (!sheetName) throw createError({ statusCode: 400, statusMessage: '시트가 비어 있습니다.' })

    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '' })

    if (mode === 'export') {
      // === 수출 모드: A열(신고번호) 중복제거 + B열(세관코드)/L열(C/S구분)/M열(거래구분) 매핑 ===
      const declNumbers: string[] = []
      const exportCodeMap: Record<string, ExportCodeMapEntry> = {}
      const seen = new Set<string>()

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any
        const declNumber = row['A']?.toString().trim()
        if (declNumber && !seen.has(declNumber)) {
          seen.add(declNumber)
          declNumbers.push(declNumber)
          exportCodeMap[declNumber] = {
            customsCode: row['B']?.toString().trim() || '',
            csType: row['L']?.toString().trim() || '',
            tradeType: row['M']?.toString().trim() || '',
          }
        }
      }

      console.log(`[API] Export mode: extracted ${declNumbers.length} unique declaration numbers.`)

      return {
        success: true,
        fileName: file.filename || 'unknown.xlsx',
        rowCount: declNumbers.length,
        blNumbers: declNumbers,  // 호환을 위해 blNumbers 키 유지
        declNumbers,
        exportCodeMap,
        rawData: [],
      }
    } else {
      // === 수입 모드: H열(BL번호) 추출 (기존 C열 → H열 변경) ===
      const blNumbers: string[] = []
      const rawData: any[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any
        const blNumber = row['H']?.toString().trim()
        if (blNumber) {
          blNumbers.push(blNumber)
          rawData.push(row)
        }
      }

      console.log(`[API] Import mode: extracted ${blNumbers.length} BL numbers from column H.`)

      return {
        success: true,
        fileName: file.filename || 'unknown.xlsx',
        rowCount: blNumbers.length,
        blNumbers: [...new Set(blNumbers)], // 중복 제거
        rawData,
      }
    }

  } catch (err: any) {
    console.error('[API Error] Failed to process file:', err)
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: err?.statusMessage || '파일 처리 중 서버 오류가 발생했습니다.' })
  }
})
