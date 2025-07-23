export default defineEventHandler(async (event) => {
  const client = getGoogleAuthClient();
  const authUrl = getAuthUrl(client);
  
  return sendRedirect(event, authUrl);
});