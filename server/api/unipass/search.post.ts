export default defineEventHandler(async (event) => {
  const { blNumber } = await readBody(event);

  if (!blNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: 'BL 번호가 필요합니다.'
    });
  }

  try {
    // TODO: 실제 유니패스 API 호출 구현
    // 현재는 더미 데이터 반환
    const dummyData = {
      blNumber: blNumber,
      productName: '전자제품',
      productCode: 'ELEC001',
      importer: '(주)테스트무역',
      reportDate: '2024-01-15',
      quantity: 100,
      unit: 'EA',
      weight: '500kg',
      customsCode: '8517.62-1000'
    };

    return {
      success: true,
      data: dummyData
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '유니패스 조회 중 오류가 발생했습니다.'
    });
  }
});