import type { ExtractedDocumentData } from './types';

/** AI 추출 프롬프트 (모든 모델 공통) */
export const EXTRACTION_PROMPT = `이 PDF 문서에서 다음 정보를 추출해주세요. 반드시 JSON 형식으로만 응답하세요. 값이 없는 경우 빈 문자열("")로 표시하세요.

{
  "documentType": "문서 종류 (Invoice, Commercial Invoice, Packing List, Airbill, Bill of Lading, 기타)",
  "blNumber": "BL번호 (Bill of Lading number / 선하증권번호 / HAWB / MAWB / AWB)",
  "productName": "품명 (제품명, Product name/Description of goods)",
  "quantity": "수량 (Quantity, 단위 포함)",
  "weight": "중량 (Weight, 단위 포함, Gross Weight 우선)",
  "amount": "금액 (Amount/Value, 통화 포함)",
  "hsCode": "HS코드 (HS Code / Tariff number)",
  "countryOfOrigin": "원산지 (Country of Origin / 생산국)",
  "shipper": "송하인 (Shipper / Consignor / Exporter)"
}

중요 지침:
- JSON 외의 어떤 텍스트도 포함하지 마세요. 코드블록(\`\`\`)도 사용하지 마세요.
- 여러 품명이 있으면 세미콜론(;)으로 구분하세요.
- 금액은 통화 기호와 함께 표시하세요 (예: USD 1,234.56).
- 중량은 단위와 함께 표시하세요 (예: 123.45 KG).
- BL번호가 여러 개인 경우, 가장 눈에 띄는 것 하나만 추출하세요.
- documentType은 반드시 위 목록 중 하나로 지정하세요.`;

/** AI 응답에서 JSON 파싱 */
export function parseAiResponse(
  responseText: string,
  messageId: string,
  filename: string
): ExtractedDocumentData {
  try {
    // 코드블록 제거
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    return {
      messageId,
      sourceFilename: filename,
      documentType: parsed.documentType || '기타',
      blNumber: parsed.blNumber || '',
      productName: parsed.productName || '',
      quantity: parsed.quantity || '',
      weight: parsed.weight || '',
      amount: parsed.amount || '',
      hsCode: parsed.hsCode || '',
      countryOfOrigin: parsed.countryOfOrigin || '',
      shipper: parsed.shipper || ''
    };
  } catch (error) {
    console.error(`[AI Extractor] JSON parse failed for ${filename}:`, error);
    return {
      messageId,
      sourceFilename: filename,
      documentType: '기타',
      blNumber: '',
      productName: '',
      quantity: '',
      weight: '',
      amount: '',
      hsCode: '',
      countryOfOrigin: '',
      shipper: '',
      error: 'JSON 파싱 실패'
    };
  }
}

/**
 * AI Provider에 따라 적절한 추출기 호출
 */
export async function extractDataFromPdf(
  pdfBuffer: Buffer,
  filename: string,
  messageId: string
): Promise<ExtractedDocumentData> {
  const config = useRuntimeConfig();
  const provider = config.aiProvider || 'gemini';

  if (provider === 'claude') {
    const { extractWithClaude } = await import('./claudeExtractor');
    return extractWithClaude(pdfBuffer, filename, messageId);
  } else {
    const { extractWithGemini } = await import('./geminiExtractor');
    return extractWithGemini(pdfBuffer, filename, messageId);
  }
}
