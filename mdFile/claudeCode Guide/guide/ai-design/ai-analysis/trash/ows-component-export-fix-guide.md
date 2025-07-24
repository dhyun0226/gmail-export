# OWS 컴포넌트 Export 수정 가이드

## 🔴 현재 이슈: OwInput 컴포넌트 Export 누락

### 문제 상황
- **파일 위치**: `/mnt/c/bj-project/ows-master/packages/main/src/components/OwInput/OwInput.vue`
- **문제**: 파일은 존재하지만 `components/index.ts`에서 export되지 않음
- **영향**: AI가 OwInput을 사용하도록 코드를 생성해도 실제로 import할 수 없음

### 수정 방법

#### 1. components/index.ts 파일 수정

**파일 경로**: `/mnt/c/bj-project/ows-master/packages/main/src/components/index.ts`

**수정 내용**: 다음 라인 추가
```typescript
export { default as OwInput } from './OwInput/OwInput.vue';
```

**전체 수정 예시**:
```typescript
// ... 기존 imports ...

export { default as OwStateFilter } from './Filter/OwStateFilter.vue';
export { default as OwStateRadio } from './Filter/OwStateRadio.vue';

// OwInput export 추가
export { default as OwInput } from './OwInput/OwInput.vue';

export { default as OwCalendar } from './OwCalendar/OwCalendar.vue';
// ... 나머지 exports ...
```

#### 2. src/index.ts 파일 수정

**파일 경로**: `/mnt/c/bj-project/ows-master/packages/main/src/index.ts`

**수정 내용**: GlobalComponents 인터페이스에 OwInput 추가
```typescript
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    OwInput: typeof Components.OwInput;  // 이 라인 추가
    OwStateFilter: typeof Components.OwStateFilter;
    // ... 나머지 컴포넌트들 ...
  }
}
```

### 검증 방법

수정 후 다음과 같이 테스트:

```vue
<template>
  <OwInput 
    v-model="testValue" 
    placeholder="테스트 입력"
  />
</template>

<script setup>
import { ref } from 'vue';
import { OwInput } from '@ows/ui';

const testValue = ref('');
</script>
```

### AI 가이드라인 업데이트

수정 완료 후:
1. OwInput을 정상적으로 사용 가능
2. AI는 다음과 같이 import 가능:
   ```javascript
   import { OwInput } from '@ows/ui';
   ```

### 임시 해결책 (수정 전)

Export가 수정되기 전까지는 직접 경로로 import:
```javascript
// 임시 방법 (권장하지 않음)
import OwInput from '@ows/ui/src/components/OwInput/OwInput.vue';

// 또는 B-Form-Input 사용
import { BFormInput } from 'bootstrap-vue-next';
```

## 📋 체크리스트

- [ ] `components/index.ts`에 OwInput export 추가
- [ ] `src/index.ts`의 GlobalComponents에 OwInput 타입 추가
- [ ] 빌드 및 테스트 수행
- [ ] AI 가이드 문서에서 OwInput 사용 가능 표시

## 🔧 관련 파일 목록

1. `/packages/main/src/components/index.ts` - export 추가 필요
2. `/packages/main/src/index.ts` - 타입 정의 추가 필요
3. `/packages/main/src/components/OwInput/OwInput.vue` - 컴포넌트 파일 (정상)
4. `/packages/main/src/types/OwInput.ts` - 타입 정의 파일 (정상)

---

이 수정을 완료하면 OwInput 컴포넌트를 다른 OWS 컴포넌트들과 동일하게 사용할 수 있습니다.