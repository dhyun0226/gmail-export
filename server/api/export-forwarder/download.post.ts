import { defineEventHandler, readBody, createError, setHeader } from 'h3';
import ExcelJS from 'exceljs';
import type { ForwarderVerificationResult } from '../../utils/exportForwarderProcessor';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = body.data as ForwarderVerificationResult;

  if (!data || !data.forwarderCounts) {
    throw createError({
      statusCode: 400,
      statusMessage: '검증 결과 데이터가 전달되지 않았습니다.'
    });
  }

  const workbook = new ExcelJS.Workbook();
  const dateStr = new Date().toISOString().split('T')[0];

  // ==========================================
  // Sheet 1: (1) 포워더별 개수 검증
  // ==========================================
  const ws1 = workbook.addWorksheet('포워더별 개수 검증');
  ws1.columns = [
    { header: '포워더명', key: 'forwarder', width: 20 },
    { header: '1번 수출데이터 건수', key: 'exportCount', width: 22 },
    { header: '2번 DAILY 양식 건수', key: 'dailyCount', width: 22 },
    { header: '차이 (수출 - DAILY)', key: 'diff', width: 22 },
    { header: '검증 결과', key: 'status', width: 16 }
  ];

  ws1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws1.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };
  ws1.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  for (const item of data.forwarderCounts) {
    const row = ws1.addRow({
      forwarder: item.forwarder,
      exportCount: item.exportCount,
      dailyCount: item.dailyCount,
      diff: item.diff,
      status: item.isMatch ? '일치' : '불일치'
    });

    row.getCell('forwarder').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('exportCount').alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('dailyCount').alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('diff').alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };

    if (!item.isMatch) {
      row.getCell('status').font = { bold: true, color: { argb: 'FFE11D48' } };
      row.getCell('diff').font = { bold: true, color: { argb: 'FFE11D48' } };
    } else {
      row.getCell('status').font = { color: { argb: 'FF059669' } };
    }
  }

  // 합계 행
  const totalRow = ws1.addRow({
    forwarder: '합계',
    exportCount: data.totalComparison.totalExportCount,
    dailyCount: data.totalComparison.totalDailyCount,
    diff: data.totalComparison.diff,
    status: data.totalComparison.isMatch ? '전체 일치' : '전체 불일치'
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }
  };
  totalRow.getCell('forwarder').alignment = { vertical: 'middle', horizontal: 'center' };
  totalRow.getCell('exportCount').alignment = { vertical: 'middle', horizontal: 'right' };
  totalRow.getCell('dailyCount').alignment = { vertical: 'middle', horizontal: 'right' };
  totalRow.getCell('diff').alignment = { vertical: 'middle', horizontal: 'right' };
  totalRow.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };

  // 중복 인보이스 안내 (인보이스 기준 집계)
  if (Array.isArray(data.duplicateInvoices) && data.duplicateInvoices.length > 0) {
    ws1.addRow([]);
    ws1.addRow([`※ 수출데이터 건수는 인보이스 기준 (신고번호 여러 개인 인보이스 ${data.duplicateInvoices.length}건은 1건으로 집계)`]).font = { bold: true, color: { argb: 'FFB45309' } };
    for (const d of data.duplicateInvoices) {
      ws1.addRow([`${d.invNo} (${d.forwarder}) - 신고번호 ${d.count}건: ${d.dclNos.join(', ')}`]);
    }
  }

  applyBorders(ws1);

  // ==========================================
  // Sheet 2: (2) 계약번호 오류 목록
  // ==========================================
  const ws2 = workbook.addWorksheet('계약번호 오류 검증');
  ws2.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: '신고번호', key: 'dclNo', width: 24 },
    { header: '인보이스 번호', key: 'invNo', width: 20 },
    { header: '계약번호1 입력값 (BD열)', key: 'contract', width: 30 },
    { header: '오류 사유', key: 'reason', width: 25 }
  ];

  ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws2.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' } // Red 600
  };
  ws2.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  if (data.contractFormatErrors.length === 0) {
    const row = ws2.addRow({
      no: '-',
      dclNo: '오류 없음',
      invNo: '-',
      contract: '-',
      reason: '모든 행의 계약번호1이 정상적인 포워더/형식입니다.'
    });
    row.getCell('dclNo').font = { bold: true, color: { argb: 'FF059669' } };
  } else {
    data.contractFormatErrors.forEach((err, idx) => {
      const row = ws2.addRow({
        no: idx + 1,
        dclNo: err.dclNo,
        invNo: err.invNo,
        contract: err.rawContract,
        reason: err.reason
      });
      row.getCell('no').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('dclNo').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('invNo').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('reason').font = { color: { argb: 'FFDC2626' } };
    });
  }

  applyBorders(ws2);

  // ==========================================
  // Sheet 3: (3) 포워더 불일치 및 누락
  // ==========================================
  const ws3 = workbook.addWorksheet('포워더 불일치 및 누락');
  ws3.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: '구분 (유형)', key: 'typeLabel', width: 18 },
    { header: '인보이스 번호', key: 'invNo', width: 20 },
    { header: '신고번호', key: 'dclNo', width: 24 },
    { header: '1번(수출데이터) 포워더', key: 'exportForwarder', width: 24 },
    { header: '2번(DAILY양식) 포워더', key: 'dailyForwarder', width: 24 },
    { header: '계약번호1 원문', key: 'rawContract', width: 30 }
  ];

  ws3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD97706' } // Amber 600
  };
  ws3.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  if (data.discrepancies.length === 0) {
    const row = ws3.addRow({
      no: '-',
      typeLabel: '정상',
      invNo: '불일치 없음',
      dclNo: '-',
      exportForwarder: '-',
      dailyForwarder: '-',
      rawContract: '모든 인보이스의 포워더가 완벽히 일치합니다.'
    });
    row.getCell('invNo').font = { bold: true, color: { argb: 'FF059669' } };
  } else {
    data.discrepancies.forEach((item, idx) => {
      const row = ws3.addRow({
        no: idx + 1,
        typeLabel: item.typeLabel,
        invNo: item.invNo,
        dclNo: item.dclNo,
        exportForwarder: item.exportForwarder,
        dailyForwarder: item.dailyForwarder,
        rawContract: item.rawContract || '-'
      });

      row.getCell('no').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('typeLabel').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('invNo').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('dclNo').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('exportForwarder').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('dailyForwarder').alignment = { vertical: 'middle', horizontal: 'center' };

      if (item.type === 'MISMATCH') {
        row.getCell('typeLabel').font = { bold: true, color: { argb: 'FFE11D48' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
      } else if (item.type === 'MISSING_IN_DAILY') {
        row.getCell('typeLabel').font = { bold: true, color: { argb: 'FFD97706' } };
      } else {
        row.getCell('typeLabel').font = { bold: true, color: { argb: 'FF2563EB' } };
      }
    });
  }

  applyBorders(ws3);

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `export_forwarder_verification_${dateStr}.xlsx`;

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

  return buffer;
});

function applyBorders(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
  });
}
