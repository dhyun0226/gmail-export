import moment from 'moment-timezone';
import { extractBlNumber } from '../blExtractor';
import type { GmailData } from './types';

/**
 * Gmail에서 BL 번호를 포함한 DHL 메일 검색
 */
export async function searchDHLMailByBL(
  gmail: any, 
  blNumber: string,
  startDate?: string,
  endDate?: string
): Promise<GmailData> {
  try {
    // 검색 쿼리 생성
    let query = `from:dhl "${blNumber}"`;
    
    // 날짜 범위가 있으면 추가
    if (startDate && endDate) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      query += ` after:${startTimestamp} before:${endTimestamp}`;
    }
    
    console.log(`[KPI Gmail] Searching for BL ${blNumber} with query:`, query);
    
    // 메일 검색
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10
    });
    
    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      console.log(`[KPI Gmail] No DHL mail found for BL ${blNumber}`);
      return {};
    }
    
    // 첫 번째 메일의 상세 정보 가져오기 (가장 최근 메일)
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: messages[0].id!,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date']
    });
    
    const headers = detail.data.payload?.headers || [];
    const sender = headers.find((h: any) => h.name === 'From')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
    
    // DHL 메일인지 확인
    if (!sender.toLowerCase().includes('dhl')) {
      console.log(`[KPI Gmail] Found mail is not from DHL for BL ${blNumber}`);
      return {};
    }
    
    // 제목에서 BL 번호 추출하여 검증
    const extractedBL = extractBlNumber(subject, sender);
    if (extractedBL !== blNumber) {
      console.log(`[KPI Gmail] BL mismatch - searched: ${blNumber}, extracted: ${extractedBL} from subject: ${subject}`);
      // BL이 일치하지 않지만, 제목에 해당 BL이 포함되어 있다면 허용
      if (!subject.includes(blNumber)) {
        return {};
      }
    }
    
    // 한국 시간으로 변환
    const date = moment(dateHeader).tz('Asia/Seoul');
    const mailReceiveTime = date.format('YYYY-MM-DD HH:mm');
    
    console.log(`[KPI Gmail] Found DHL mail for BL ${blNumber}: ${subject} at ${mailReceiveTime}`);
    
    return {
      mailReceiveTime,
      sender,
      subject
    };
    
  } catch (error) {
    console.error(`[KPI Gmail] Error searching for BL ${blNumber}:`, error);
    return {};
  }
}

/**
 * 여러 BL 번호에 대한 DHL 메일 일괄 검색
 */
export async function searchMultipleDHLMails(
  gmail: any,
  blNumbers: string[],
  startDate?: string,
  endDate?: string
): Promise<Map<string, GmailData>> {
  const resultMap = new Map<string, GmailData>();
  
  // 순차 처리 (Gmail API 제한 고려)
  for (const blNumber of blNumbers) {
    try {
      const mailData = await searchDHLMailByBL(gmail, blNumber, startDate, endDate);
      resultMap.set(blNumber, mailData);
      
      // API 제한 방지를 위한 짧은 딜레이 (최적화)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[KPI Gmail] Failed to search for BL ${blNumber}:`, error);
      resultMap.set(blNumber, {});
    }
  }
  
  return resultMap;
}

/**
 * 날짜 범위로 모든 DHL 메일 조회
 */
export async function getAllDHLMails(
  gmail: any,
  startDate: string,
  endDate: string
): Promise<Map<string, GmailData>> {
  const resultMap = new Map<string, GmailData>();
  
  try {
    // DHL 메일만 검색
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    const query = `from:dhl after:${startTimestamp} before:${endTimestamp}`;
    
    console.log(`[KPI Gmail] Fetching all DHL mails with query:`, query);
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500
    });
    
    const messages = response.data.messages || [];
    console.log(`[KPI Gmail] Found ${messages.length} DHL mails`);
    
    // 각 메일 병렬 처리 (20개씩)
    const batchSize = 20;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      // 배치 내 메일들 병렬 처리
      const batchPromises = batch.map(async (message) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date']
          });
          
          const headers = detail.data.payload?.headers || [];
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
          const sender = headers.find((h: any) => h.name === 'From')?.value || '';
          
          // BL 번호 추출 (blExtractor 사용으로 정확도 향상)
          const blNumber = extractBlNumber(subject, sender);
          if (blNumber && blNumber !== 'N/A') {
            const date = moment(dateHeader).tz('Asia/Seoul');
            
            // 이미 존재하는 BL이면 최신 메일로 업데이트
            const existingData = resultMap.get(blNumber);
            if (!existingData || date.isAfter(moment(existingData.mailReceiveTime))) {
              resultMap.set(blNumber, {
                mailReceiveTime: date.format('YYYY-MM-DD HH:mm'),
                sender,
                subject
              });
              console.log(`[KPI Gmail] Found BL ${blNumber} from: ${subject}`);
            }
          }
          
        } catch (error) {
          console.error(`[KPI Gmail] Error processing message ${message.id}:`, error);
        }
      });
      
      // 배치 완료 대기
      await Promise.all(batchPromises);
      
      // 다음 배치 전 짧은 대기 (API 제한 방지)
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
  } catch (error) {
    console.error('[KPI Gmail] Error fetching all DHL mails:', error);
  }
  
  return resultMap;
}