
// B/L 번호 추출을 위한 정규식 패턴 목록
// 순서가 중요합니다. 더 구체적인 패턴을 앞에 배치합니다.
const patterns = [
  // EI 패턴들
  { name: 'EI_HB', regex: /HB:\s*(\d+)/ },
  { name: 'EI_HAWB', regex: /HAWB#\s*(\d+)/ },
  
  // DHL 패턴 (숫자만 추출)
  { name: 'DHL', regex: /DHL\s+(\d+)/ },
  
  // CNW 패턴
  { name: 'CNW', regex: /CNW Pre-Alert\s*-\s*(\d+)/ },
  
  // 일반적인 패턴들
  { name: 'AWB', regex: /AWB\s+(\S+)/ },
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
 * UPS 메일 본문에서 여러 B/L 번호를 추출합니다.
 * @param body 이메일 본문
 * @param subject 이메일 제목
 * @returns 추출된 B/L 번호 배열
 */
export function extractUpsBlNumbers(body: string, subject: string): string[] {
  const blNumbers: string[] = [];
  
  // UPS Pre-Alert 패턴인지 확인
  if (!subject.includes('[Pre-Alert]')) {
    return blNumbers;
  }
  
  // 본문에서 테이블 형식의 BL 번호 추출
  // 예: tracking number, BL number 등의 테이블 데이터
  // 실제 본문 구조에 따라 조정 필요
  const tablePattern = /([A-Z0-9]{10,})/g;
  const matches = body.match(tablePattern);
  
  if (matches) {
    blNumbers.push(...matches);
  }
  
  // 제목에서 첫 번째 BL 번호 추출 (예: 03ER03B4LQ7)
  const subjectMatch = subject.match(/\[Pre-Alert\]\s*([A-Z0-9]+)/);
  if (subjectMatch && subjectMatch[1]) {
    blNumbers.push(subjectMatch[1]);
  }
  
  return [...new Set(blNumbers)]; // 중복 제거
}
