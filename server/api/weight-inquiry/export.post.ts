import * as XLSX from 'xlsx';

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event);
  const { results } = body;

  if (!results || !Array.isArray(results) || results.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No data to export' });
  }

  const data: any[][] = [];

  // 헤더
  data.push(['메일 일자', 'HB 번호', 'MB 번호', '적하중량', '순중량', '적하중량 진행']);

  // 데이터
  for (const r of results) {
    data.push([
      r.date || '',
      r.hbNumber || '',
      r.mbNumber || '',
      r.loadingWeight || '',
      r.netWeight || '',
      r.confirmedByLoading || 'X',
    ]);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 14 },  // 메일 일자
    { wch: 18 },  // HB 번호
    { wch: 20 },  // MB 번호
    { wch: 14 },  // 적하중량
    { wch: 14 },  // 순중량
    { wch: 16 },  // 적하중량 진행
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, '중량문의');

  const fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const fileName = `중량문의_${new Date().toISOString().split('T')[0]}.xlsx`;

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
  setHeader(event, 'Content-Length', fileBuffer.length);

  return fileBuffer;
});
