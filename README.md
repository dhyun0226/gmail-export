# Gmail Export to Excel

구글 메일을 조회하고 엑셀 파일로 다운로드할 수 있는 웹 애플리케이션입니다.

## 기능

- Google OAuth2 로그인
- 기간별 메일 조회
- 엑셀 파일 다운로드 (제목, 날짜, 시간)
- 한국 시간대(KST) 자동 변환

## 설치 방법

1. 의존성 설치
```bash
npm install
```

2. 환경변수 설정
`.env.example`을 `.env`로 복사하고 Google OAuth2 정보를 입력합니다.
```bash
cp .env.example .env
```

3. Google Cloud Console 설정
   - [Google Cloud Console](https://console.cloud.google.com/)에 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - API 및 서비스 > 사용자 인증 정보로 이동
   - OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI에 다음 추가:
     - 개발: `http://localhost:3000/api/auth/callback`
     - 배포: `https://your-domain.vercel.app/api/auth/callback`
   - Gmail API 활성화

4. 개발 서버 실행
```bash
npm run dev
```

## Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경변수 설정:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (배포 URL로 변경)
   - `PUBLIC_APP_URL` (배포 URL로 변경)
4. 배포 완료

## 사용 방법

1. 구글 로그인
2. 기간 선택 (시작일, 종료일)
3. 메일 조회
4. 엑셀 다운로드

## 기술 스택

- Nuxt 3
- Vue 3 Composition API
- Tailwind CSS
- Google OAuth2
- Gmail API
- ExcelJS