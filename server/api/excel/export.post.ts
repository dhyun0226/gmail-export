import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = body.data;  // results 데이터 배열
  const format = body.format || 'xlsx'; // 기본값은 xlsx
  const fileData = body.fileData; // Excel 형식을 위한 base64 데이터

  if (!['xlsx', 'csv'].includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid format. Use xlsx or csv'
    });
  }

  // CSV일 때만 data 체크
  if (format === 'csv' && (!data || !Array.isArray(data))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data is required for CSV format'
    });
  }

  // Excel일 때만 fileData 체크
  if (format === 'xlsx' && !fileData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File data is required for Excel format'
    });
  }

  // 날짜/시간 파싱 함수 (YYYY-MM-DD HH:MM 형식을 YYYYMMDD, H:MM으로)
  function parseAcceptanceOrClearanceDateTime(dateStr: string, timeStr: string) {
    if (!dateStr || !timeStr || dateStr === '' || timeStr === '') {
      return null;
    }

    // dateStr: "2024-03-15" -> "20240315"
    const localDate = dateStr.replace(/-/g, '');

    // timeStr: "14:30" -> "14:30" (그대로 유지)
    const localTime = timeStr;

    return { localDate, localTime };
  }

  // 공통 데이터 생성 함수
  function generateRows(results: any[]) {
    const submittedToCustoms = [];
    const destinationCustomClearance = [];

    for (const result of results) {
      const hawbValue = result.blNumber;

      // 통관접수시간이 있으면 Submitted to Customs
      if (result.acceptanceDate && result.acceptanceTime) {
        const acceptanceDateTime = parseAcceptanceOrClearanceDateTime(result.acceptanceDate, result.acceptanceTime);
        if (acceptanceDateTime) {
          submittedToCustoms.push({
            scac: 'TC40',
            scacTracking: '',
            hawb: hawbValue,
            eidXid: '',
            milestone: 'Submitted to Customs',
            localDate: acceptanceDateTime.localDate,
            localTime: acceptanceDateTime.localTime,
            podSignature: '',
            city: 'Incheon',
            state: '',
            country: 'KR',
            gmtOffset: '+9:00',
            sortKey: hawbValue
          });
        }
      }

      // 수리시간이 있으면 Destination Custom Clearance
      if (result.clearanceDate && result.clearanceTime) {
        const clearanceDateTime = parseAcceptanceOrClearanceDateTime(result.clearanceDate, result.clearanceTime);
        if (clearanceDateTime) {
          destinationCustomClearance.push({
            scac: 'TC40',
            scacTracking: '',
            hawb: hawbValue,
            eidXid: '',
            milestone: 'Destination Custom Clearance',
            localDate: clearanceDateTime.localDate,
            localTime: clearanceDateTime.localTime,
            podSignature: '',
            city: 'Incheon',
            state: '',
            country: 'KR',
            gmtOffset: '+9:00',
            sortKey: hawbValue
          });
        }
      }
    }

    // 각 마일스톤별로 HAWB(BL번호)로 정렬
    submittedToCustoms.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    destinationCustomClearance.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // 마일스톤 순서대로 합치기 (sortKey 제거)
    const rows = [
      ...submittedToCustoms.map(({ sortKey, ...row }) => row),
      ...destinationCustomClearance.map(({ sortKey, ...row }) => row)
    ];

    return rows;
  }

  if (format === 'csv') {
    // CSV 생성
    const rows = generateRows(data);

    // CSV 문자열 생성 함수
    function escapeCsvValue(value: string) {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }

    // 헤더 생성
    const headers = [
      'SCAC', 'SCAC TRACKING#', 'HAWB', 'EID/XID', 'MILESTONE',
      'LOCAL DATE', 'LOCAL TIME', 'POD Signature', 'CITY', 'STATE',
      'COUNTRY', 'GMT OFFSET'
    ];

    let csvContent = headers.join(',') + '\n';

    // 데이터 행 생성
    for (const row of rows) {
      const csvRow = [
        escapeCsvValue(row.scac),
        escapeCsvValue(row.scacTracking),
        escapeCsvValue(row.hawb),
        escapeCsvValue(row.eidXid),
        escapeCsvValue(row.milestone),
        escapeCsvValue(row.localDate),
        escapeCsvValue(row.localTime),
        escapeCsvValue(row.podSignature),
        escapeCsvValue(row.city),
        escapeCsvValue(row.state),
        escapeCsvValue(row.country),
        escapeCsvValue(row.gmtOffset)
      ];
      csvContent += csvRow.join(',') + '\n';
    }

    // 파일명 생성
    const fileName = `unipass_export_${new Date().toISOString().split('T')[0]}.csv`;

    // 응답 헤더 설정
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

    return csvContent;

  } else {
    // Excel 다운로드 (기존 download.post.ts 로직)
    // Base64 디코딩
    const fileBuffer = Buffer.from(fileData, 'base64');
    const fileName = `unipass_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // 응답 헤더 설정
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    setHeader(event, 'Content-Length', fileBuffer.length.toString());

    return fileBuffer;
  }
});