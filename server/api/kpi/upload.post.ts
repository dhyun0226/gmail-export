// server/api/kpi/upload.post.ts
import { readMultipartFormData } from 'h3'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
  console.log('[API] /api/kpi/upload: Received file upload request.')

  try {
    // 1. 디스크 쓰기 없이 파일을 메모리로 바로 읽어옵니다.
    const multipartData = await readMultipartFormData(event)

    // 'file'이라는 이름으로 전송된 파일 데이터를 찾습니다.
    const fileData = multipartData?.find(el => el.name === 'file')

    if (!fileData || !fileData.data || fileData.data.length === 0) {
      console.error('[API Error] No file data found in multipart form.')
      throw createError({
        statusCode: 400,
        statusMessage: '엑셀 파일이 업로드되지 않았습니다.',
      })
    }

    console.log(`[API] File received: ${fileData.filename}, size: ${fileData.data.length} bytes.`)

    // 2. 메모리에 있는 Buffer를 직접 파싱합니다.
    // nuxt.config.ts의 alias 설정 덕분에 이 XLSX 객체는 cpexcel을 요구하지 않습니다.
    const workbook = XLSX.read(fileData.data, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // 3. C열(BL번호) 데이터만 추출합니다.
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' })
    const blNumbers: string[] = []

    // 헤더 행(1행)을 제외하고 C열 데이터 추출
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      const blNumber = row['C']?.toString().trim()
      if (blNumber) {
        blNumbers.push(blNumber)
      }
    }
    
    console.log(`[API] Successfully parsed ${blNumbers.length} BL numbers.`)

    return {
      success: true,
      blNumbers: [...new Set(blNumbers)], // 중복 제거
      fileName: fileData.filename || 'unknown.xlsx',
      rowCount: blNumbers.length,
    }

  } catch (error: any) {
    console.error('[API Error] Failed to process file:', error)

    // 클라이언트에게 에러를 반환합니다.
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '파일 처리 중 서버 오류가 발생했습니다.',
    })
  }
})
