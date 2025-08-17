import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const emails = body.emails;
  
  if (!emails || !Array.isArray(emails)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Emails data is required'
    });
  }
  
  // 엑셀 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Gmail Export');
  
  // 헤더 설정
  worksheet.columns = [
    { header: '제목', key: 'subject', width: 50 },
    { header: 'B/L 번호', key: 'blNumber', width: 25 },
    { header: 'Tracking 번호', key: 'trackingNumber', width: 25 },
    { header: '통관접수시간', key: 'acceptanceTime', width: 20 },
    { header: '수리시간', key: 'clearanceTime', width: 20 },
    { header: '메일 수신날짜', key: 'date', width: 15 },
    { header: '메일 수신시간', key: 'time', width: 10 }
  ];
  
  // 헤더 스타일
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // 데이터 추가 및 제목 병합 처리
  let currentRow = 2; // 헤더 다음 행부터 시작
  let i = 0;
  
  while (i < emails.length) {
    const currentEmail = emails[i];
    let rowCount = 1;
    
    // 같은 제목이 연속으로 나오는 개수 계산
    while (i + rowCount < emails.length && 
           emails[i + rowCount].subject === currentEmail.subject) {
      rowCount++;
    }
    
    // 첫 번째 행 추가
    worksheet.addRow({
      subject: currentEmail.subject,
      blNumber: currentEmail.blNumber,
      trackingNumber: currentEmail.trackingNumber || 'N/A',
      acceptanceTime: currentEmail.acceptanceTime || '-',
      clearanceTime: currentEmail.clearanceTime || '-',
      date: currentEmail.date,
      time: currentEmail.time
    });
    
    // 나머지 같은 제목의 행들 추가 (제목 비움)
    for (let j = 1; j < rowCount; j++) {
      const email = emails[i + j];
      worksheet.addRow({
        subject: '', // 제목은 비워둠
        blNumber: email.blNumber,
        trackingNumber: email.trackingNumber || 'N/A',
        acceptanceTime: email.acceptanceTime || '-',
        clearanceTime: email.clearanceTime || '-',
        date: email.date,
        time: email.time
      });
    }
    
    // 제목 셀 병합 (rowCount가 1보다 큰 경우만)
    if (rowCount > 1) {
      worksheet.mergeCells(`A${currentRow}:A${currentRow + rowCount - 1}`);
      const mergedCell = worksheet.getCell(`A${currentRow}`);
      mergedCell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
    
    currentRow += rowCount;
    i += rowCount;
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
  
  // 파일명 생성 (현재 날짜 포함)
  const fileName = `gmail_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // 응답 헤더 설정
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
  
  return buffer;
});