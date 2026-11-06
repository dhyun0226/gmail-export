import * as XLSX from 'xlsx/xlsx.mjs';

export interface ExportExcelRow {
  'HS 코드': string;
  '원산지': string;
  '포장수량': number;
  '포장단위': string;
  '거래품명(=모델명2)': string;
  '모델명': string;
  '모델명2': string;
  '수량': number | string;
  '단위': string;
  '단가': number;
  '총금액': number | string;
  '순중량': number | string;
}

export const EXPORT_EXCEL_HEADERS = [
  'HS 코드',
  '원산지',
  '포장수량',
  '포장단위',
  '거래품명(=모델명2)',
  '모델명',
  '모델명2',
  '수량',
  '단위',
  '단가',
  '총금액',
  '순중량'
] as const;

export function convertDgfWorkbookToExportRows(workbook: XLSX.WorkBook): ExportExcelRow[] {
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    return [];
  }

  // Convert sheet to 2D array (0-indexed)
  const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  const rows: ExportExcelRow[] = [];

  // DGF 열 인덱스 매핑 (0-based)
  // A=0(Item), F=5(Description of Goods), G=6(Product), H=7(Product Short Text),
  // I=8(Net Weight), L=11(Item Quantity), M=12(Unit of Measurement),
  // N=13(Value of Goods), Q=16(Commodity Code / Statistical Suffix), V=21(Ctry/Reg. of Origin)
  for (let r = 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const itemStr = row[0] != null ? String(row[0]).trim() : '';
    const descF = row[5] != null ? String(row[5]).trim() : '';
    const descH = row[7] != null ? String(row[7]).trim() : '';
    const modelG = row[6] != null ? String(row[6]).trim() : '';
    const hsCodeQ = row[16] != null ? String(row[16]).trim() : '';

    // 요약행(합계행)이나 빈 행 제외: Item 번호가 없고 품명/모델명/HS코드도 없는 행은 스킵
    if (!itemStr && !descF && !descH && !modelG && !hsCodeQ) {
      continue;
    }

    const origin = row[21] != null ? String(row[21]).trim() : '';
    const packQty = 0;
    const packUnit = 'VO';
    const desc = descF || descH;
    const model = modelG;
    const model2 = desc;
    const qtyRaw = row[11];
    const unit = row[12] != null && String(row[12]).trim() !== '' ? String(row[12]).trim() : 'EA';
    const totalAmountRaw = row[13];
    const netWeightRaw = row[8];

    const numQty = parseFloat(String(qtyRaw));
    const numAmount = parseFloat(String(totalAmountRaw));
    const numWeight = parseFloat(String(netWeightRaw));

    const qty = !isNaN(numQty) ? numQty : (qtyRaw ?? 0);
    const totalAmount = !isNaN(numAmount) ? numAmount : (totalAmountRaw ?? 0);
    const netWeight = !isNaN(numWeight) ? numWeight : (netWeightRaw ?? 0);

    const unitPrice =
      !isNaN(numQty) && numQty !== 0 && !isNaN(numAmount)
        ? Number((numAmount / numQty).toFixed(4))
        : 0;

    rows.push({
      'HS 코드': hsCodeQ,
      '원산지': origin,
      '포장수량': packQty,
      '포장단위': packUnit,
      '거래품명(=모델명2)': desc,
      '모델명': model,
      '모델명2': model2,
      '수량': qty,
      '단위': unit,
      '단가': unitPrice,
      '총금액': totalAmount,
      '순중량': netWeight
    });
  }

  return rows;
}
