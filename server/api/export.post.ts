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
    { header: 'B/L 번호', key: 'blNumber', width: 25 },
    { header: '제목', key: 'subject', width: 50 },
    { header: '날짜', key: 'date', width: 15 },
    { header: '시간', key: 'time', width: 10 }
  ];
  
  // 헤더 스타일
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // 데이터 추가
  emails.forEach(email => {
    worksheet.addRow({
      blNumber: email.blNumber,
      subject: email.subject,
      date: email.date,
      time: email.time
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