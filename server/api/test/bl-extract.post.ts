import { extractBlNumber, extractUpsShipmentInfo } from '../../utils/blExtractor';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { subject, sender, body: emailBody } = body;
  
  const blNumbers: string[] = [];
  const shipments: any[] = [];
  
  // UPS Pre-Alert 패턴 확인
  if (sender?.toLowerCase().includes('ups') && subject.includes('[Pre-Alert]')) {
    // UPS의 경우 본문에서 BL 번호와 Tracking 번호 추출
    const upsShipments = extractUpsShipmentInfo(emailBody || '', subject);
    shipments.push(...upsShipments);
    blNumbers.push(...upsShipments.map(s => s.blNumber));
  } else {
    // 일반적인 경우 제목에서 BL 번호 추출
    const blNumber = extractBlNumber(subject, sender);
    if (blNumber !== 'N/A') {
      blNumbers.push(blNumber);
      shipments.push({ blNumber, trackingNumber: undefined });
    }
  }
  
  return {
    blNumbers,
    shipments,
    debug: {
      isUps: sender?.toLowerCase().includes('ups'),
      hasPreAlert: subject.includes('[Pre-Alert]'),
      subjectLength: subject.length,
      bodyLength: emailBody?.length || 0
    }
  };
});