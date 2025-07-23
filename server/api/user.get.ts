export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token');
  
  if (!accessToken) {
    return { authenticated: false };
  }
  
  try {
    // Google OAuth2 API로 사용자 정보 가져오기
    const response = await $fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return {
      authenticated: true,
      user: response
    };
  } catch (error) {
    console.error('User info error:', error);
    return { authenticated: false };
  }
});