

// B/L 번호 추출을 위한 정규식 패턴 목록
// 순서가 중요합니다. 더 구체적인 패턴을 앞에 배치합니다.
const patterns = [
  // DHL B/L (e.g., "DHL 1234567890 (COMPANY NAME)...")
  { name: 'DHL_PARENTHESIS', regex: /DHL\s+(\d+)\s+\(/ },
];

/**
 * 이메일 제목에서 B/L 번호를 추출합니다.
 * @param subject 이메일 제목
 * @param sender 발신자 이메일 주소 (선택사항)
 * @returns 추출된 B/L 번호 또는 'N/A'
 */
export function extractBlNumber(subject: string, sender?: string): string {
  // 1. 정규식 기반 패턴 매칭
  for (const pattern of patterns) {
    const match = subject.match(pattern.regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. DFG 패턴 (발신자가 @dhl.com인 경우 첫 번째 단어)
  if (sender?.includes('@dhl.com') && subject.match(/^[A-Z]\d+/)) {
    const firstWord = subject.split(/[\s\/]/)[0];
    if (firstWord && /^[A-Z]\d+$/.test(firstWord)) {
      return firstWord;
    }
  }

  // 3. '/' 분리 기반 패턴 (G343646 / ...)
  if (subject.includes('/')) {
    const parts = subject.split('/');
    const firstPart = parts[0].trim();
    // 알파벳+숫자 조합인 경우만 반환
    if (/^[A-Z]\d+$/.test(firstPart)) {
      return firstPart;
    }
  }

  // 4. 일치하는 패턴이 없는 경우
  return 'N/A';
}

/**
 * UPS 메일 정보
 */
export interface UpsShipmentInfo {
  blNumber: string;
  trackingNumber?: string;
}

/**
 * UPS 메일 본문에서 BL 번호와 Tracking 번호를 추출합니다.
 * @param body 이메일 본문
 * @param subject 이메일 제목
 * @returns 추출된 배송 정보 배열
 */
export function extractUpsShipmentInfo(body: string, subject: string): UpsShipmentInfo[] {
  const shipments: UpsShipmentInfo[] = [];
  
  // UPS Pre-Alert 패턴인지 확인
  if (!subject.includes('[Pre-Alert]')) {
    return shipments;
  }
  
  // 본문을 줄 단위로 분석
  const lines = body.split('\n');
  
  // 패턴 1: 명시적인 라벨이 있는 경우 (BL Number: XXX, Tracking: YYY)
  const blNumberPattern = /(?:BL\s*Number|B\/L|BL)[\s:]+([A-Z0-9]{10,})/i;
  const trackingPattern = /(?:Tracking\s*(?:Number|No)?|Track)[\s:]+([A-Z0-9]+)/i;
  
  let currentBL = '';
  let currentTracking = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // BL 번호 찾기
    const blMatch = line.match(blNumberPattern);
    if (blMatch) {
      currentBL = blMatch[1];
    }
    
    // Tracking 번호 찾기
    const trackMatch = line.match(trackingPattern);
    if (trackMatch) {
      currentTracking = trackMatch[1];
    }
    
    // BL과 Tracking이 같은 라인 또는 인접한 라인에 있으면 하나의 shipment로 처리
    if (currentBL && (currentTracking || i === lines.length - 1 || lines[i + 1].trim() === '')) {
      shipments.push({
        blNumber: currentBL,
        trackingNumber: currentTracking || undefined
      });
      currentBL = '';
      currentTracking = '';
    }
  }
  
  // 패턴 2: 헤더 없는 표 형식 (연속된 코드들)
  // 예: 11자리 알파벳+숫자 조합이 연속으로 나오는 경우
  if (shipments.length === 0) {
    const codePattern = /\b([A-Z0-9]{10,})\b/g;
    const codes: string[] = [];
    let match;
    
    while ((match = codePattern.exec(body)) !== null) {
      codes.push(match[1]);
    }
    
    // 코드들을 분석하여 BL과 Tracking 구분
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      
      // UPS Tracking Number 패턴: 1Z로 시작하거나 특정 형식
      if (code.startsWith('1Z') || /^\d{12}$/.test(code)) {
        // 이전 코드가 BL 번호일 가능성이 높음
        if (i > 0 && !codes[i-1].startsWith('1Z')) {
          // 이미 추가된 shipment가 있고 tracking이 없으면 업데이트
          if (shipments.length > 0 && !shipments[shipments.length - 1].trackingNumber) {
            shipments[shipments.length - 1].trackingNumber = code;
          }
        }
        // 다음 코드가 BL 번호일 가능성
        if (i < codes.length - 1 && !codes[i+1].startsWith('1Z')) {
          shipments.push({
            blNumber: codes[i+1],
            trackingNumber: code
          });
          i++; // 다음 코드는 이미 처리했으므로 스킵
        }
      } else {
        // BL 번호로 추정되는 패턴 (10-11자리 알파벳+숫자)
        if (/^[A-Z0-9]{10,11}$/.test(code) && !code.startsWith('1Z')) {
          // 다음 코드가 tracking number인지 확인
          const nextTracking = (i < codes.length - 1 && codes[i+1].startsWith('1Z')) ? codes[i+1] : undefined;
          shipments.push({
            blNumber: code,
            trackingNumber: nextTracking
          });
          if (nextTracking) i++; // tracking number도 처리했으므로 스킵
        }
      }
    }
  }
  
  // 중복 제거
  const uniqueShipments: UpsShipmentInfo[] = [];
  const seen = new Set<string>();
  
  for (const shipment of shipments) {
    const key = `${shipment.blNumber}-${shipment.trackingNumber || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueShipments.push(shipment);
    }
  }
  
  return uniqueShipments;
}

/**
 * UPS 메일 본문에서 여러 B/L 번호를 추출합니다. (하위 호환성을 위해 유지)
 * @param body 이메일 본문
 * @param subject 이메일 제목
 * @returns 추출된 B/L 번호 배열
 */
export function extractUpsBlNumbers(body: string, subject: string): string[] {
  const shipments = extractUpsShipmentInfo(body, subject);
  return shipments.map(s => s.blNumber);
}
