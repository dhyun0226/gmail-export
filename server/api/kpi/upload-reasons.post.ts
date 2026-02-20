// server/api/kpi/upload-reasons.post.ts
// 사유(키워드).xls 업로드 처리 - F열(BL번호) + K열(특이사항) 매핑 추출
import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import * as XLSX from 'xlsx/xlsx.mjs'

export default defineEventHandler(async (event) => {
  console.log('[API] /api/kpi/upload-reasons: Received reason file upload request.')

  try {
    const parts = await readMultipartFormData(event)
    const file = parts?.find(p => p.name === 'file' && p.data)

    if (!file || !(file.data instanceof Uint8Array) || file.data.length === 0) {
      console.error('[API Error] No file data found in multipart form.')
      throw createError({ statusCode: 400, statusMessage: '사유(키워드) 엑셀 파일이 업로드되지 않았습니다.' })
    }

    console.log(`[API] Reason file received: ${file.filename || '(no name)'}, size: ${file.data.length} bytes.`)

    const wb = XLSX.read(file.data, { type: 'buffer', codepage: 65001 })

    // Sheet2를 우선 시도, 없으면 첫 번째 시트
    let sheetName = wb.SheetNames.find((name: string) => name === 'Sheet2') || wb.SheetNames[1] || wb.SheetNames[0]
    if (!sheetName) throw createError({ statusCode: 400, statusMessage: '시트가 비어 있습니다.' })

    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '' })

    // F열(BL번호) + K열(특이사항) 매핑 추출
    const reasonMap: Record<string, string> = {}
    let extractCount = 0

    for (let i = 1; i < rows.length; i++) { // 헤더 행 제외
      const row = rows[i] as any
      const blNumber = row['F']?.toString().trim()
      const remark = row['K']?.toString().trim()

      if (blNumber && blNumber !== '') {
        reasonMap[blNumber] = remark || ''
        extractCount++
      }
    }

    console.log(`[API] Successfully extracted ${extractCount} reason mappings from ${sheetName}.`)

    return {
      success: true,
      fileName: file.filename || 'unknown.xls',
      rowCount: extractCount,
      reasonMap
    }

  } catch (err: any) {
    console.error('[API Error] Failed to process reason file:', err)
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: err?.statusMessage || '사유 파일 처리 중 서버 오류가 발생했습니다.' })
  }
})
