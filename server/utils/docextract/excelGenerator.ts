import ExcelJS from 'exceljs';
import type { ExtractedDocumentData } from './types';

/**
 * 추출 결과를 엑셀 파일로 생성
 */
export async function createDocExtractExcel(
  results: ExtractedDocumentData[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('문서추출 결과');

  // 헤더 설정
  worksheet.columns = [
    { header: '순번', key: 'seq', width: 8 },
    { header: '문서종류', key: 'documentType', width: 20 },
    { header: 'BL번호', key: 'blNumber', width: 20 },
    { header: '품명', key: 'productName', width: 30 },
    { header: '수량', key: 'quantity', width: 15 },
    { header: '중량', key: 'weight', width: 15 },
    { header: '금액', key: 'amount', width: 18 },
    { header: 'HS코드', key: 'hsCode', width: 15 },
    { header: '원산지', key: 'countryOfOrigin', width: 12 },
    { header: '송하인', key: 'shipper', width: 25 },
    { header: '원본파일명', key: 'sourceFilename', width: 30 },
    { header: '추출상태', key: 'status', width: 15 }
  ];

  // 헤더 스타일
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // 데이터 추가
  results.forEach((result, index) => {
    worksheet.addRow({
      seq: index + 1,
      documentType: result.documentType || '',
      blNumber: result.blNumber || '',
      productName: result.productName || '',
      quantity: result.quantity || '',
      weight: result.weight || '',
      amount: result.amount || '',
      hsCode: result.hsCode || '',
      countryOfOrigin: result.countryOfOrigin || '',
      shipper: result.shipper || '',
      sourceFilename: result.sourceFilename || '',
      status: result.error || '성공'
    });
  });

  // 테두리 추가
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
