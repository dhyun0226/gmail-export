import * as XLSX from 'xlsx/xlsx.mjs';

// 재조회용 엑셀 다운로드.
//   - 본 처리 결과 중 "아직도 못 받은 마일스톤" 만 추려서 출력.
//   - 입력 엑셀과 동일한 와이드 포맷 (A~S 열 보존) + T 열에 누락 마커.
//   - 사용자가 이 파일을 다음날 신규 TMS 리스트 끝에 붙여넣어 재업로드 → 시스템은 T 값 보고 누락분만 재조회.
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = body.data;

  if (!data || !Array.isArray(data)) {
    throw createError({ statusCode: 400, statusMessage: 'Data is required' });
  }

  // 각 결과 행에 대해 "오늘 조회 후에도 여전히 누락된 마일스톤" 계산
  type Row = { original: any; tValue: string };
  const rowsToExport: Row[] = [];

  for (const r of data) {
    const prevTag = String(r.reFetchTag || '');
    // 어제 시점에 누락이었던(=오늘 다시 받아야 했던) 마일스톤
    const neededSc = prevTag === '' || prevTag === 'SC,CT';
    const neededCt = prevTag === '' || prevTag === 'SC,CT' || prevTag === 'CT';

    // 오늘 조회 후 실제로 받았는지
    const gotSc = !!(r.acceptanceDate && r.acceptanceTime);
    const gotCt = !!(r.clearanceDate && r.clearanceTime);

    // 오늘도 여전히 못 받은 마일스톤
    const stillMissingSc = neededSc && !gotSc;
    const stillMissingCt = neededCt && !gotCt;

    if (!stillMissingSc && !stillMissingCt) continue; // 완료된 BL — 재조회 대상 아님

    let newTag = '';
    if (stillMissingSc && stillMissingCt) newTag = 'SC,CT';
    else if (stillMissingSc) newTag = 'SC';  // 논리상 거의 발생 안하지만 안전하게 표기
    else if (stillMissingCt) newTag = 'CT';

    rowsToExport.push({ original: r.originalRow || {}, tValue: newTag });
  }

  // 입력 엑셀 헤더와 동일한 컬럼 19개 + T 열
  // 사이트 업로드 양식: A=선택, B=검증, C=작성일자, D=수입신고번호, E=거래처, F=B/L번호,
  //                   G=무역거래처, H=FILE NO, I=FILENO2, J=신고인기재란, K=특이사항,
  //                   L=해외공급자, M=해외공급자상호, N=수정자, O=수정일시, P=문서번호,
  //                   Q=저장구분, R=Load ID, S=Carrier Cod, T=재조회태그(추가)
  const headers = [
    '선택', '검증', '작성일자', '수입신고번호', '거래처', 'B/L번호',
    '무역거래처', 'FILE NO', 'FILENO2', '신고인기재란', '특이사항',
    '해외공급자', '해외공급자상호', '수정자', '수정일시', '문서번호',
    '저장구분', 'Load ID', 'Carrier Cod', '재조회'
  ];
  const colKeys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S']; // T는 별도 처리

  // AOA(Array-of-Arrays) 로 시트 구성 — 헤더 + 데이터
  const aoa: any[][] = [headers];
  for (const row of rowsToExport) {
    const orig = row.original || {};
    const dataRow = colKeys.map(k => {
      const v = orig[k];
      if (v === null || v === undefined) return '';
      return v;
    });
    dataRow.push(row.tValue);
    aoa.push(dataRow);
  }

  // 워크북 생성 — Sheet2 가 첫 시트인 입력 양식과 맞춤
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet2');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const fileName = `iteration_${new Date().toISOString().split('T')[0]}.xlsx`;
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);

  return buffer;
});
