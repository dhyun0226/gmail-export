import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXTRACTION_PROMPT, parseAiResponse } from './extractorInterface';
import type { ExtractedDocumentData } from './types';

/**
 * Gemini Flash로 PDF 문서 데이터 추출
 */
export async function extractWithGemini(
  pdfBuffer: Buffer,
  filename: string,
  messageId: string
): Promise<ExtractedDocumentData> {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    return {
      messageId,
      sourceFilename: filename,
      documentType: '기타',
      blNumber: '', productName: '', quantity: '', weight: '',
      amount: '', hsCode: '', countryOfOrigin: '', shipper: '',
      error: 'GEMINI_API_KEY가 설정되지 않았습니다'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // PDF를 base64로 변환
    const pdfBase64 = pdfBuffer.toString('base64');

    console.log(`[Gemini] Extracting from: ${filename} (${Math.round(pdfBuffer.length / 1024)}KB)`);

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64
        }
      },
      { text: EXTRACTION_PROMPT }
    ]);

    const responseText = result.response.text();
    console.log(`[Gemini] Response for ${filename}:`, responseText.substring(0, 200));

    return parseAiResponse(responseText, messageId, filename);

  } catch (error: any) {
    console.error(`[Gemini] Error extracting ${filename}:`, error);

    let errorMessage = 'Gemini 추출 실패';
    if (error.message?.includes('429')) {
      errorMessage = 'API 요청 한도 초과 (잠시 후 재시도)';
    } else if (error.message?.includes('400')) {
      errorMessage = 'PDF 읽기 실패';
    }

    return {
      messageId,
      sourceFilename: filename,
      documentType: '기타',
      blNumber: '', productName: '', quantity: '', weight: '',
      amount: '', hsCode: '', countryOfOrigin: '', shipper: '',
      error: errorMessage
    };
  }
}
