import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const emails = body.emails;
  const format = body.format || 'xlsx'; // 기본값은 xlsx
  
  if (!emails || !Array.isArray(emails)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Emails data is required'
    });
  }
  
  if (!['xlsx', 'csv'].includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid format. Use xlsx or csv'
    });
  }
  
  // 날짜/시간 파싱 함수들
  function parseDateTime(dateTimeString: string) {
    if (!dateTimeString || dateTimeString === '-') return null;
    
    try {
      const date = new Date(dateTimeString);
      const localDate = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const localTime = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`; // H:MM
      return { localDate, localTime };
    } catch {
      return null;
    }
  }

  function parseEmailDateTime(date: string, time: string) {
    if (!date || !time) {
      return { localDate: '', localTime: '' };
    }
    
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const localTime = `${hours}:${minutes}`;
    
    return { 
      localDate: date,  // 이미 YYYYMMDD 형식
      localTime: localTime  // H:MM 형식
    };
  }

  // 공통 데이터 생성 함수
  function generateRows(emails: any[]) {
    const allDocsReceived = [];
    const submittedToCustoms = [];
    const destinationCustomClearance = [];
    
    for (const email of emails) {
      const emailDateTime = parseEmailDateTime(email.date, email.time);
      const hawbValue = (email.trackingNumber && email.trackingNumber !== 'N/A') 
        ? email.trackingNumber 
        : email.blNumber;
      
      // All Docs Received (모든 이메일에 대해)
      allDocsReceived.push({
        scac: 'TC40',
        scacTracking: '',
        hawb: hawbValue,
        eidXid: '',
        milestone: 'All Docs Received',
        localDate: emailDateTime.localDate,
        localTime: emailDateTime.localTime,
        podSignature: '',
        city: 'Incheon',
        state: '',
        country: 'KR',
        gmtOffset: '+9:00',
        sortKey: hawbValue // BL번호 또는 트래킹번호로 정렬용
      });
      
      // 통관접수시간이 있으면 Submitted to Customs
      if (email.acceptanceTime && email.acceptanceTime !== '-') {
        const acceptanceDateTime = parseDateTime(email.acceptanceTime);
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
      if (email.clearanceTime && email.clearanceTime !== '-') {
        const clearanceDateTime = parseDateTime(email.clearanceTime);
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
    
    // 각 마일스톤별로 HAWB(BL번호/트래킹번호)로 정렬
    allDocsReceived.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    submittedToCustoms.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    destinationCustomClearance.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    // 마일스톤 순서대로 합치기 (sortKey 제거)
    const rows = [
      ...allDocsReceived.map(({ sortKey, ...row }) => row),
      ...submittedToCustoms.map(({ sortKey, ...row }) => row),
      ...destinationCustomClearance.map(({ sortKey, ...row }) => row)
    ];
    
    return rows;
  }

  if (format === 'csv') {
    // CSV 생성
    const rows = generateRows(emails);
    
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
    const fileName = `gmail_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    // 응답 헤더 설정
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
    
    return csvContent;
    
  } else {
    // Excel 생성 (기존 로직)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gmail Export');
    
    // 헤더 설정
    worksheet.columns = [
      { header: 'SCAC', key: 'scac', width: 10 },
      { header: 'SCAC TRACKING#', key: 'scacTracking', width: 20 },
      { header: 'HAWB', key: 'hawb', width: 20 },
      { header: 'EID/XID', key: 'eidXid', width: 15 },
      { header: 'MILESTONE', key: 'milestone', width: 25 },
      { header: 'LOCAL DATE', key: 'localDate', width: 15 },
      { header: 'LOCAL TIME', key: 'localTime', width: 15 },
      { header: 'POD Signature', key: 'podSignature', width: 15 },
      { header: 'CITY', key: 'city', width: 15 },
      { header: 'STATE', key: 'state', width: 10 },
      { header: 'COUNTRY', key: 'country', width: 12 },
      { header: 'GMT OFFSET', key: 'gmtOffset', width: 12 }
    ];
    
    // 헤더 스타일
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // 데이터 추가
    const rows = generateRows(emails);
    for (const row of rows) {
      worksheet.addRow(row);
    }
    
    // 모든 셀에 테두리 추가
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();
    
    // 파일명 생성
    const fileName = `gmail_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // 응답 헤더 설정
    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
    
    return buffer;
  }
});