export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = body.data;

  if (!data || !Array.isArray(data)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data is required'
    });
  }

  // 날짜 포맷 변환: YYYY-MM-DD → YYYYMMDD
  function toLocalDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '');
  }

  // 시간 포맷: 앞자리 0 제거 (09:30 → 9:30)
  function toLocalTime(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    return `${parseInt(parts[0], 10)}:${parts[1]}`;
  }

  function escapeCsvValue(value: string) {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // 마일스톤 행 생성
  const drRows: any[] = [];
  const scRows: any[] = [];
  const ctRows: any[] = [];

  for (const result of data) {
    // 규칙:
    //  - Load ID가 있는 경우 → SystemLoadID=loadId, TrackingNumber=공란
    //  - Load ID가 없는 경우 → SystemLoadID=공란, TrackingNumber=메일에서 추출한 UPS tracking
    const hasLoadId = !!(result.loadId && String(result.loadId).trim());
    const systemLoadId = hasLoadId ? String(result.loadId).trim() : '';
    const trackingNumber = hasLoadId ? '' : (result.trackingNumber || '');

    const common = {
      brokerName: 'TOPCUSTOM',
      carrierCode: result.carrierCode || '',
      systemLoadId,
      trackingNumber,
      city: 'Incheon',
      state: '',
      country: 'KR',
      sortKey: systemLoadId || result.blNumber || ''
    };

    // DR - Gmail 메일 수신시간
    if (result.emailDate) {
      drRows.push({
        ...common,
        secCode: 'DR',
        localDate: result.emailDate, // 이미 YYYYMMDD 형식
        localTime: result.emailTime || '',
      });
    }

    // SC - 유니패스 통관접수시간
    if (result.acceptanceDate && result.acceptanceTime) {
      scRows.push({
        ...common,
        secCode: 'SC',
        localDate: toLocalDate(result.acceptanceDate),
        localTime: toLocalTime(result.acceptanceTime),
      });
    }

    // CT - 유니패스 수리시간
    if (result.clearanceDate && result.clearanceTime) {
      ctRows.push({
        ...common,
        secCode: 'CT',
        localDate: toLocalDate(result.clearanceDate),
        localTime: toLocalTime(result.clearanceTime),
      });
    }
  }

  // 각 그룹 내 정렬 (SystemLoadID/BL번호 기준)
  drRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  scRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  ctRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // 마일스톤 순서대로 합치기
  const allRows = [...drRows, ...scRows, ...ctRows];

  // CSV 생성
  const headers = [
    'BrokerName', 'CarrierCode', 'SystemLoadID', 'TrackingNumber', 'SECCode',
    'LOCALDATE', 'LOCALTIME', 'City', 'STATE', 'COUNTRY'
  ];

  let csvContent = headers.join(',') + '\n';

  for (const row of allRows) {
    const csvRow = [
      escapeCsvValue(row.brokerName),
      escapeCsvValue(row.carrierCode),
      escapeCsvValue(row.systemLoadId),
      escapeCsvValue(row.trackingNumber),
      escapeCsvValue(row.secCode),
      escapeCsvValue(row.localDate),
      escapeCsvValue(row.localTime),
      escapeCsvValue(row.city),
      escapeCsvValue(row.state),
      escapeCsvValue(row.country)
    ];
    csvContent += csvRow.join(',') + '\n';
  }

  const fileName = `milestone_v2_${new Date().toISOString().split('T')[0]}.csv`;

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

  return csvContent;
});
