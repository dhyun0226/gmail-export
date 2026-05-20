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
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.file'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

// refresh_token 까지 같이 넘기면 googleapis 가 access_token 만료 시 자동 재발급한다.
// 없이 호출하면 기존 동작 유지 (1시간 만료 후 401).
export async function getGmailClient(accessToken: string, refreshToken?: string) {
  const auth = getGoogleAuthClient();
  auth.setCredentials({
    access_token: accessToken,
    ...(refreshToken ? { refresh_token: refreshToken } : {})
  });

  return google.gmail({ version: 'v1', auth });
}

export async function getDriveClient(accessToken: string, refreshToken?: string) {
  const auth = getGoogleAuthClient();
  auth.setCredentials({
    access_token: accessToken,
    ...(refreshToken ? { refresh_token: refreshToken } : {})
  });

  return google.drive({ version: 'v3', auth });
}