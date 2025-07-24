# 🧩 컴포넌트 리팩토링 가이드

## 1. 사전 준비

### 1.1 도메인 폴더 구조 생성
```bash
# 기본 도메인 구조 생성
domains/
├── {domainName}/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── index.ts
```

### 1.2 체크포인트 초기화
- CP-C001: 도메인 폴더 생성 완료
- CP-C002: 컴포넌트 이동 시작
- CP-C003: Import 경로 업데이트
- CP-C004: 인덱스 파일 생성

## 2. 컴포넌트 분석 및 분류

### 2.1 React 컴포넌트 분석
```typescript
// 컴포넌트 타입 분류
interface ComponentAnalysis {
  name: string;
  path: string;
  type: 'page' | 'container' | 'presentational' | 'compound';
  domain: string;
  dependencies: {
    internal: string[];  // 프로젝트 내부
    external: string[];  // 외부 라이브러리
  };
  props: string[];
  hooks: string[];
  hasStyles: boolean;
  hasTests: boolean;
}
```

### 2.2 Vue3 컴포넌트 분석
```typescript
// Vue 컴포넌트 구조
interface VueComponentAnalysis {
  name: string;
  path: string;
  type: 'SFC' | 'TSX';
  domain: string;
  setup: {
    composables: string[];
    props: string[];
    emits: string[];
  };
  style: {
    scoped: boolean;
    lang: 'css' | 'scss' | 'less';
  };
}
```

## 3. 도메인별 컴포넌트 이동

### 3.1 User 도메인 컴포넌트 이동
```typescript
// 이동 대상 컴포넌트
const userComponents = [
  'UserProfile',
  'UserAvatar', 
  'LoginForm',
  'RegisterForm',
  'UserSettings',
  'PasswordReset'
];

// 이동 실행
userComponents.forEach(comp => {
  // 1. 컴포넌트 파일 복사
  copy({
    from: `src/components/${comp}.tsx`,
    to: `domains/user/components/${comp}.tsx`
  });
  
  // 2. 스타일 파일 복사 (있는 경우)
  if (exists(`src/components/${comp}.module.css`)) {
    copy({
      from: `src/components/${comp}.module.css`,
      to: `domains/user/components/${comp}.module.css`
    });
  }
  
  // 3. 테스트 파일 복사 (있는 경우)
  if (exists(`src/components/${comp}.test.tsx`)) {
    copy({
      from: `src/components/${comp}.test.tsx`,
      to: `domains/user/components/${comp}.test.tsx`
    });
  }
});
```

### 3.2 컴포넌트 내부 Import 경로 수정
```typescript
// 변경 전
import { Button } from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { UserApi } from '../../../api/userApi';

// 변경 후
import { Button } from '@/common/components/Button';
import { useAuth } from '@/domains/user/hooks/useAuth';
import { UserApi } from '@/domains/user/services/userApi';
```

## 4. 복합 컴포넌트 처리

### 4.1 Compound Component 패턴
```typescript
// 복합 컴포넌트 예시: Form 컴포넌트
domains/user/components/UserForm/
├── index.ts
├── UserForm.tsx
├── UserFormField.tsx
├── UserFormSubmit.tsx
└── UserForm.module.css

// index.ts
export { UserForm } from './UserForm';
export { UserFormField } from './UserFormField';
export { UserFormSubmit } from './UserFormSubmit';
```

### 4.2 컨테이너/프레젠테이션 분리
```typescript
// Container Component
// domains/user/components/UserProfileContainer.tsx
import { useUser } from '../hooks/useUser';
import { UserProfile } from './UserProfile';

export const UserProfileContainer = () => {
  const { user, loading, error } = useUser();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <UserProfile user={user} />;
};

// Presentation Component
// domains/user/components/UserProfile.tsx
interface UserProfileProps {
  user: User;
}

export const UserProfile: FC<UserProfileProps> = ({ user }) => {
  return (
    <div className={styles.profile}>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

## 5. 공통 컴포넌트 추출

### 5.1 공통 컴포넌트 식별
```typescript
// 도메인 간 사용 빈도 분석
const componentUsage = {
  'Button': ['user', 'product', 'order'],  // 3개 도메인
  'Modal': ['user', 'product'],             // 2개 도메인
  'Table': ['order', 'admin'],              // 2개 도메인
  'UserAvatar': ['user'],                   // 1개 도메인
};

// 2개 이상 도메인에서 사용 → common으로 이동
const commonComponents = Object.entries(componentUsage)
  .filter(([_, domains]) => domains.length >= 2)
  .map(([component]) => component);
```

### 5.2 공통 컴포넌트 구조
```typescript
common/components/
├── Button/
│   ├── index.ts
│   ├── Button.tsx
│   ├── Button.module.css
│   └── Button.test.tsx
├── Modal/
│   ├── index.ts
│   ├── Modal.tsx
│   └── Modal.module.css
└── Table/
    ├── index.ts
    ├── Table.tsx
    ├── TableRow.tsx
    └── Table.module.css
```

## 6. 스타일 마이그레이션

### 6.1 CSS Modules
```typescript
// 컴포넌트와 함께 이동
// 경로 수정 불필요 (상대 경로 유지)
import styles from './UserProfile.module.css';
```

### 6.2 Styled Components
```typescript
// domains/user/components/UserProfile.styles.ts
import styled from 'styled-components';

export const ProfileContainer = styled.div`
  padding: 20px;
  background: ${props => props.theme.background};
`;

export const ProfileAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
`;
```

### 6.3 Tailwind CSS
```typescript
// 클래스명은 그대로 유지
// tailwind.config.js에서 도메인 경로 추가
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './domains/**/*.{js,jsx,ts,tsx}',
  ],
};
```

## 7. 타입 정의 마이그레이션

### 7.1 컴포넌트 Props 타입
```typescript
// domains/user/types/components.ts
export interface UserProfileProps {
  user: User;
  onEdit?: () => void;
  className?: string;
}

export interface LoginFormProps {
  onSuccess: (user: User) => void;
  onError: (error: Error) => void;
}
```

### 7.2 도메인 모델 타입
```typescript
// domains/user/types/models.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## 8. 인덱스 파일 생성

### 8.1 컴포넌트 인덱스
```typescript
// domains/user/components/index.ts
export { UserProfile } from './UserProfile';
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { UserAvatar } from './UserAvatar';

// Re-export types
export type { 
  UserProfileProps,
  LoginFormProps 
} from '../types/components';
```

### 8.2 도메인 루트 인덱스
```typescript
// domains/user/index.ts
// Components
export * from './components';

// Hooks (추후 추가)
// export * from './hooks';

// Services (추후 추가)  
// export * from './services';

// Types
export * from './types/models';
export * from './types/components';
```

## 9. Import 경로 업데이트

### 9.1 자동 Import 업데이트 스크립트
```typescript
// 이전 import 패턴
const oldImports = [
  /from ['"]\.\.\/components\/UserProfile['"]/,
  /from ['"]@\/components\/UserProfile['"]/,
  /from ['"]components\/UserProfile['"]/
];

// 새로운 import
const newImport = "from '@/domains/user/components/UserProfile'";

// 파일 스캔 및 업데이트
files.forEach(file => {
  let content = readFile(file);
  oldImports.forEach(pattern => {
    content = content.replace(pattern, newImport);
  });
  writeFile(file, content);
});
```

### 9.2 VSCode 설정 업데이트
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

## 10. 검증 및 문제 해결

### 10.1 컴파일 검증
```bash
# TypeScript 컴파일 체크
tsc --noEmit

# ESLint 검사
eslint domains/ --ext .ts,.tsx

# 빌드 테스트
npm run build
```

### 10.2 일반적인 문제 해결
```typescript
// 문제: 순환 의존성
// 해결: 공통 타입을 별도 파일로 분리

// 문제: 경로 별칭 인식 실패
// 해결: tsconfig.json paths 설정 확인

// 문제: 스타일 모듈 타입 오류
// 해결: css-modules.d.ts 파일 추가
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

## 11. 진행 상황 업데이트

### 11.1 체크포인트 기록
```json
{
  "checkpoints": {
    "CP-C001": "완료 - 도메인 폴더 생성",
    "CP-C002": "완료 - User 도메인 컴포넌트 이동",
    "CP-C003": "진행중 - Import 경로 업데이트",
    "CP-C004": "대기 - 인덱스 파일 생성"
  },
  "statistics": {
    "totalComponents": 145,
    "movedComponents": 24,
    "remainingComponents": 121,
    "updatedImports": 156
  }
}
```

### 11.2 다음 단계 준비
- 컴포넌트 이동 완료 확인
- Import 경로 업데이트 완료 확인
- 빌드 및 린트 통과 확인
- 04-state-refactoring.md로 이동