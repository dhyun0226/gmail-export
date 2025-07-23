export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  
  if (!code) {
    return sendRedirect(event, '/?error=no_code');
  }
  
  try {
    const client = getGoogleAuthClient();
    const { tokens } = await client.getToken(code);
    
    // 토큰을 세션이나 쿠키에 저장
    // 여기서는 쿠키에 저장하는 예시
    setCookie(event, 'access_token', tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24시간
    });
    
    if (tokens.refresh_token) {
      setCookie(event, 'refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30일
      });
    }
    
    return sendRedirect(event, '/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return sendRedirect(event, '/?error=auth_failed');
  }
});