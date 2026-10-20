import { defineEventHandler, readBody, createError, setHeader } from 'h3';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const items = body.items || body.emails || body.data;
  const format = body.format || 'csv';

  if (!items || !Array.isArray(items)) {
    throw createError({
      statusCode: 400,
      statusMessage: '데이터가 전달되지 않았습니다.'
    });
  }

  // 1. CSV 포맷 생성 (기존 TMS 양식)
  if (format === 'csv') {
    function escapeCsvValue(value: string | undefined | null) {
      if (!value) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const allDocsReceived: any[] = [];
    const submittedToCustoms: any[] = [];
    const destinationCustomClearance: any[] = [];

    for (const item of items) {
      if (!item.blNumber) continue;

      // UPS인 경우 Tracking 번호 대체, 없으면 BL 번호
      const hawbValue = (item.trackingNumber && item.trackingNumber.trim() && item.trackingNumber !== 'N/A')
        ? item.trackingNumber.trim()
        : item.blNumber.trim();

      const common = {
        scac: 'TC40',
        scacTracking: '',
        hawb: hawbValue,
        eidXid: '',
        podSignature: '',
        city: 'Incheon',
        state: '',
        country: 'KR',
        gmtOffset: '+9:00',
        sortKey: hawbValue
      };

      // 1) All Docs Received (메일 수신시간)
      if (item.emailDate && item.emailTime) {
        allDocsReceived.push({
          ...common,
          milestone: 'All Docs Received',
          localDate: item.emailDate,
          localTime: item.emailTime
        });
      }

      // 2) Submitted to Customs (통관접수시간)
      if (item.acceptanceDate && item.acceptanceTime) {
        submittedToCustoms.push({
          ...common,
          milestone: 'Submitted to Customs',
          localDate: item.acceptanceDate,
          localTime: item.acceptanceTime
        });
      }

      // 3) Destination Custom Clearance (수리시간)
      if (item.clearanceDate && item.clearanceTime) {
        destinationCustomClearance.push({
          ...common,
          milestone: 'Destination Custom Clearance',
          localDate: item.clearanceDate,
          localTime: item.clearanceTime
        });
      }
    }

    // HAWB 기준으로 정렬
    allDocsReceived.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    submittedToCustoms.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    destinationCustomClearance.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const allRows = [
      ...allDocsReceived,
      ...submittedToCustoms,
      ...destinationCustomClearance
    ];

    const headers = [
      'SCAC', 'SCAC TRACKING#', 'HAWB', 'EID/XID', 'MILESTONE',
      'LOCAL DATE', 'LOCAL TIME', 'POD Signature', 'CITY', 'STATE',
      'COUNTRY', 'GMT OFFSET'
    ];

    let csvContent = headers.join(',') + '\n';
    for (const row of allRows) {
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

    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `milestone_tms_${todayStr}.csv`;

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

    return csvContent;
  }

  // 2. 엑셀(XLSX) 포맷 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('마일스톤 결과');

  worksheet.columns = [
    { header: '구분', key: 'type', width: 12 },
    { header: '제목 / 화물명', key: 'subject', width: 45 },
    { header: 'B/L 번호', key: 'blNumber', width: 20 },
    { header: 'Tracking 번호', key: 'trackingNumber', width: 24 },
    { header: '메일 수신일시', key: 'emailDateTime', width: 18 },
    { header: '통관접수일시', key: 'acceptanceDateTime', width: 18 },
    { header: '수리일시', key: 'clearanceDateTime', width: 18 },
    { header: '유니패스 상태', key: 'status', width: 15 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8EEF5' }
  };

  for (const item of items) {
    const isCompleted = item.acceptanceDate && item.clearanceDate;
    const statusText = item.unipassFailed
      ? '조회 실패'
      : (isCompleted ? '완료' : (item.acceptanceDate ? '수입신고진행' : '미통관'));

    worksheet.addRow({
      type: item.isUps ? 'UPS' : '일반',
      subject: item.subject,
      blNumber: item.blNumber,
      trackingNumber: item.trackingNumber || '-',
      emailDateTime: item.emailDateTimeDisplay || `${item.emailDate} ${item.emailTime}`,
      acceptanceDateTime: item.acceptanceTimeDisplay || (item.acceptanceDate ? `${item.acceptanceDate} ${item.acceptanceTime}` : '-'),
      clearanceDateTime: item.clearanceTimeDisplay || (item.clearanceDate ? `${item.clearanceDate} ${item.clearanceTime}` : '-'),
      status: statusText
    });
  }

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const todayStr = new Date().toISOString().split('T')[0];
  const fileName = `milestone_${todayStr}.xlsx`;

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

  return buffer;
});
