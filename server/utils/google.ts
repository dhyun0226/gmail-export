import { google } from 'googleapis';

export function getGoogleAuthClient() {
  const config = useRuntimeConfig();
  
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
}

export function getAuthUrl(client: any) {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

export async function getGmailClient(accessToken: string) {
  const auth = getGoogleAuthClient();
  auth.setCredentials({ access_token: accessToken });
  
  return google.gmail({ version: 'v1', auth });
}