
// B/L 번호 추출을 위한 정규식 패턴 목록
// 순서가 중요합니다. 더 구체적인 패턴을 앞에 배치합니다.
const patterns = [
  { name: 'HB', regex: /HB:\s*(\S+)/ },
  { name: 'AWB', regex: /AWB\s+(\S+)/ },
  { name: 'DHL', regex: /DHL\s+(\S+)/ },
];

/**
 * 이메일 제목에서 B/L 번호를 추출합니다.
 * @param subject 이메일 제목
 * @returns 추출된 B/L 번호 또는 'N/A'
 */
export function extractBlNumber(subject: string): string {
  // 1. 정규식 기반 패턴 매칭
  for (const pattern of patterns) {
    const match = subject.match(pattern.regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. '/' 분리 기반 패턴 (G343646 / ...)
  if (subject.includes('/')) {
    const parts = subject.split('/');
    if (parts[0]) {
      return parts[0].trim();
    }
  }

  // 3. 일치하는 패턴이 없는 경우
  return 'N/A';
}
