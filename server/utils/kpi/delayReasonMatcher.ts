import type { KpiProcessResult } from './types';

/**
 * Exception Code 키워드 매칭 규칙 정의
 * 우선순위 숫자가 낮을수록 높은 우선순위
 */
const KEYWORD_RULES = [
  {
    priority: 1,
    code: '#2',
    keywords: ['RWA', 'EASCA', '전파인증'],
    reason: 'Exemption/Approval for Import&Export requirements; RWA, EASCA...',
    controllable: 'Uncontrollable' as const,
  },
  {
    priority: 1,
    code: '#10',
    keywords: ['무상회신대기', '수리회신대기', '재수입회신대기', '무상사유대기'],
    reason: 'Confirmation of import reason for No-charge shipments',
    controllable: 'Uncontrollable' as const,
  },
  {
    priority: 2,
    code: '#1',
    keywords: ['세관장'],
    reason: 'Review for Import & Export requirements related; RWA, EASCA and OGA',
    controllable: 'Uncontrollable' as const,
  },
  {
    priority: 3,
    code: '#4',
    keywords: ['CR문의'],
    reason: 'Review KR HTS with Classification team or Global trade team',
    controllable: 'Uncontrollable' as const,
  },
  {
    priority: 3,
    code: '#5',
    keywords: ['전용물품'],
    reason: 'Confirmation of necessary information for Customs clearance...',
    controllable: 'Uncontrollable' as const,
  },
];

/**
 * 날짜 문자열에서 Date 객체 파싱 (안전하게)
 */
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr || dateStr === '-' || dateStr === '') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 두 날짜가 다른 날인지 확인 (nextDay가 다음날 이상인지)
 */
function isNextDayOrLater(laterDateStr: string | undefined, earlierDateStr: string | undefined): boolean {
  const later = parseDate(laterDateStr);
  const earlier = parseDate(earlierDateStr);
  if (!later || !earlier) return false;

  // 날짜만 비교 (시간 무시)
  const laterDay = new Date(later.getFullYear(), later.getMonth(), later.getDate());
  const earlierDay = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());

  return laterDay.getTime() > earlierDay.getTime();
}

/**
 * 시간 차이를 일 단위로 계산
 */
function calcDiffDays(endTime: string | undefined, startTime: string | undefined): number | null {
  const end = parseDate(endTime);
  const start = parseDate(startTime);
  if (!end || !start) return null;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

interface MatchResult {
  reason: string;
  controllable: string;
}

/**
 * 사유 키워드 매칭 (수입 KPI 전용)
 *
 * @param remarkText 사유(키워드).xls의 K열 특이사항 텍스트
 * @param kpiResult KPI 처리 결과 (시간 데이터)
 * @returns { reason, controllable } 또는 null (매칭 없음)
 */
export function matchDelayReason(
  remarkText: string | undefined,
  kpiResult: KpiProcessResult
): MatchResult | null {
  // 1단계: 키워드 텍스트 매칭 (우선순위순)
  if (remarkText && remarkText.trim()) {
    const matched: Array<{ priority: number; reason: string; controllable: string }> = [];

    for (const rule of KEYWORD_RULES) {
      for (const keyword of rule.keywords) {
        if (remarkText.includes(keyword)) {
          matched.push({
            priority: rule.priority,
            reason: rule.reason,
            controllable: rule.controllable,
          });
          break; // 같은 룰 내에서는 하나만 매칭
        }
      }
    }

    if (matched.length > 0) {
      // 우선순위 숫자가 낮은 것 우선
      matched.sort((a, b) => a.priority - b.priority);
      return { reason: matched[0].reason, controllable: matched[0].controllable };
    }
  }

  // 2단계: #6 조건 - Diff time > 0 + DHL Doc > Dest.Arrival + 다른 키워드 사유 없음
  const diffTime = calcDiffDays(kpiResult.importAcceptTime, kpiResult.lowerDeclAcceptTime);
  const kpiDiff = diffTime !== null ? Math.round((diffTime - 0.2) * 100) / 100 : null;

  const dhlDocDate = parseDate(kpiResult.mailReceiveTime);
  const destArrivalDate = parseDate(kpiResult.lowerDeclAcceptTime);

  if (
    kpiDiff !== null && kpiDiff > 0 &&
    dhlDocDate !== null && destArrivalDate !== null &&
    dhlDocDate.getTime() > destArrivalDate.getTime()
  ) {
    return {
      reason: 'Pre-alert missing by carriers',
      controllable: 'Uncontrollable',
    };
  }

  // 3단계: #21 조건 - Custom Clearance 날짜 > Submitted to Customs 날짜 (다음날 이상)
  if (isNextDayOrLater(kpiResult.importAcceptTime, kpiResult.importDeclTime)) {
    return {
      reason: 'Delay in bringing cargo into bonded warehouse by airlines',
      controllable: 'Uncontrollable',
    };
  }

  // 4단계: #22 조건 - 메일수신시간 09시 이전 또는 18시 이후 (가장 낮은 우선순위)
  if (kpiResult.mailReceiveTime) {
    const mailDate = parseDate(kpiResult.mailReceiveTime);
    if (mailDate) {
      const hour = mailDate.getHours();
      if (hour < 9 || hour >= 18) {
        return {
          reason: "Out of broker's office hours",
          controllable: 'Uncontrollable',
        };
      }
    }
  }

  // 어떤 조건에도 해당 안됨
  return null;
}
