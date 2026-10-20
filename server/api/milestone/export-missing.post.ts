import { defineEventHandler, readBody, createError, setHeader } from 'h3';
import ExcelJS from 'exceljs';
import { calculateNextMissingTag } from '../../utils/milestoneProcessor';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const items = body.items || body.data;

  if (!items || !Array.isArray(items)) {
    throw createError({
      statusCode: 400,
      statusMessage: '데이터가 전달되지 않았습니다.'
    });
  }

  // 오늘 조회 후에도 여전히 누락된 건들만 필터링
  const missingRows: Array<{
    blNumber: string;
    missingTag: string;
    missingDescription: string;
    trackingNumber: string;
    emailDateTime: string;
    type: string;
    subject: string;
  }> = [];

  for (const item of items) {
    if (!item.blNumber) continue;

    const nextTag = item.nextMissingTag ?? calculateNextMissingTag(item);
    if (!nextTag) continue; // 완료된 건은 제외

    const missingDescription = nextTag === 'SC,CT' ? '신고/수리 누락 (SC,CT)' : '수리 누락 (CT)';
    const type = item.isUps ? 'UPS' : '일반';
    const emailDateTime = item.emailDateTimeDisplay || (item.emailDate ? `${item.emailDate} ${item.emailTime}` : '');

    missingRows.push({
      blNumber: item.blNumber,
      missingTag: nextTag,
      missingDescription,
      trackingNumber: item.trackingNumber || '',
      emailDateTime,
      type,
      subject: item.subject || ''
    });
  }

  if (missingRows.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '누락된 마일스톤(신고/수리 미완료) 건이 없습니다.'
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('전일누락건_재조회용');

  // 컬럼 정의 (다음날 재업로드 시 시스템이 인식할 수 있는 최적 구조)
  worksheet.columns = [
    { header: 'B/L 번호', key: 'blNumber', width: 22 },
    { header: '누락항목 (재조회 태그)', key: 'missingTag', width: 22 },
    { header: '누락 상세', key: 'missingDescription', width: 24 },
    { header: 'Tracking 번호', key: 'trackingNumber', width: 24 },
    { header: '메일 수신일시', key: 'emailDateTime', width: 20 },
    { header: '구분', key: 'type', width: 12 },
    { header: '메일 제목 / 화물 정보', key: 'subject', width: 45 }
  ];

  // 헤더 스타일 (오렌지/앰버 톤으로 누락건임을 명확히 표시)
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FF78350F' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFDE68A' } // 연한 앰버색
  };

  for (const row of missingRows) {
    worksheet.addRow(row);
  }

  // 테두리 설정
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const todayStr = new Date().toISOString().split('T')[0];
  const fileName = `missing_milestones_${todayStr}.xlsx`;

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

  return buffer;
});
