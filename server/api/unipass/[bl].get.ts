export default defineEventHandler(async (event) => {
  const bl = getRouterParam(event, 'bl');
  const query = getQuery(event);
  const blYear = query.year as string || new Date().getFullYear().toString();
  
  if (!bl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'BL number is required'
    });
  }
  
  try {
    // Unipass API 호출
    const apiUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo`;
    const params = new URLSearchParams({
      crkyCn: 'u200k223c072x041e040i000b0',
      blYy: blYear,
      hblNo: bl
    });
    
    const response = await $fetch(`${apiUrl}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return {
      bl,
      year: blYear,
      data: response
    };
    
  } catch (error: any) {
    console.error('Unipass API error:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Unipass data: ${error.message}`
    });
  }
});