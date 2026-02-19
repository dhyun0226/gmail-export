import { EXTRACTION_PROMPT, parseAiResponse } from './extractorInterface';
import type { ExtractedDocumentData } from './types';

/**
 * Claude Sonnet으로 PDF 문서 데이터 추출
 * 정식 운영 시 사용 (npm install @anthropic-ai/sdk 필요)
 */
export async function extractWithClaude(
  pdfBuffer: Buffer,
  filename: string,
  messageId: string
): Promise<ExtractedDocumentData> {
  const config = useRuntimeConfig();
  const apiKey = config.anthropicApiKey;

  if (!apiKey) {
    return {
      messageId,
      sourceFilename: filename,
      documentType: '기타',
      blNumber: '', productName: '', quantity: '', weight: '',
      amount: '', hsCode: '', countryOfOrigin: '', shipper: '',
      error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다'
    };
  }

  try {
    // 동적 import (설치되지 않았을 수도 있으므로)
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const pdfBase64 = pdfBuffer.toString('base64');

    console.log(`[Claude] Extracting from: ${filename} (${Math.round(pdfBuffer.length / 1024)}KB)`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64
            }
          },
          {
            type: 'text',
            text: EXTRACTION_PROMPT
          }
        ]
      }]
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log(`[Claude] Response for ${filename}:`, responseText.substring(0, 200));

    return parseAiResponse(responseText, messageId, filename);

  } catch (error: any) {
    console.error(`[Claude] Error extracting ${filename}:`, error);

    let errorMessage = 'Claude 추출 실패';
    if (error.status === 429) {
      errorMessage = 'API 요청 한도 초과 (잠시 후 재시도)';
    } else if (error.status === 400) {
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
