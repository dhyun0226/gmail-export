export default defineEventHandler(async (event) => {
  // 쿠키 삭제
  deleteCookie(event, 'access_token');
  deleteCookie(event, 'refresh_token');
  
  return { success: true };
});