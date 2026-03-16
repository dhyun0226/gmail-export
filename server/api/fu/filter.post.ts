import * as XLSX from 'xlsx';
import { readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length < 2) {
    throw createError({ statusCode: 400, statusMessage: '원본 엑셀과 필터링 엑셀 두 파일이 필요합니다.' });
  }

  const originalFile = formData.find((f) => f.name === 'original');
  const filterFile = formData.find((f) => f.name === 'filter');

  if (!originalFile?.data || !filterFile?.data) {
    throw createError({ statusCode: 400, statusMessage: '파일을 찾을 수 없습니다.' });
  }

  // 필터링 엑셀 읽기: A열 코드 목록 (헤더 없음)
  const filterWorkbook = XLSX.read(filterFile.data, { type: 'buffer' });
  const filterSheet = filterWorkbook.Sheets[filterWorkbook.SheetNames[0]];
  const filterRows: any[][] = XLSX.utils.sheet_to_json(filterSheet, { header: 1 });
  const filterCodes = new Set(
    filterRows.map((row) => String(row[0] ?? '').trim()).filter((v) => v !== '')
  );

  if (filterCodes.size === 0) {
    throw createError({ statusCode: 400, statusMessage: '필터링 엑셀에 코드가 없습니다.' });
  }

  // 원본 엑셀 읽기
  const originalWorkbook = XLSX.read(originalFile.data, { type: 'buffer' });
  const originalSheet = originalWorkbook.Sheets[originalWorkbook.SheetNames[0]];
  const originalRows: any[][] = XLSX.utils.sheet_to_json(originalSheet, { header: 1 });

  if (originalRows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '원본 엑셀이 비어있습니다.' });
  }

  // 헤더에서 FU 열 찾기
  const headerRow = originalRows[0];
  const fuColIndex = headerRow.findIndex(
    (cell: any) => String(cell ?? '').trim().toUpperCase() === 'FU'
  );

  if (fuColIndex === -1) {
    throw createError({ statusCode: 400, statusMessage: '원본 엑셀에서 FU 열을 찾을 수 없습니다.' });
  }

  // 필터링: 헤더 + FU 열 값이 필터 코드에 있는 행
  const filteredRows: any[][] = [headerRow];
  for (let i = 1; i < originalRows.length; i++) {
    const row = originalRows[i];
    const fuValue = String(row[fuColIndex] ?? '').trim();
    if (filterCodes.has(fuValue)) {
      filteredRows.push(row);
    }
  }

  // 결과 엑셀 생성
  const resultWorkbook = XLSX.utils.book_new();
  const resultSheet = XLSX.utils.aoa_to_sheet(filteredRows);

  // 원본 열 너비 복사
  if (originalSheet['!cols']) {
    resultSheet['!cols'] = originalSheet['!cols'];
  }

  XLSX.utils.book_append_sheet(resultWorkbook, resultSheet, 'FU 필터링');

  const fileBuffer = XLSX.write(resultWorkbook, { type: 'buffer', bookType: 'xlsx' });
  const fileName = `FU_필터링_${new Date().toISOString().split('T')[0]}.xlsx`;

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
  setHeader(event, 'Content-Length', fileBuffer.length);

  return fileBuffer;
});
