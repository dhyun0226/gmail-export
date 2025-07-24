# src-gen - 이미지 혹은 파워포인트 기반 소스 코드 생성

이미지 혹은 파워포인트 파일을 읽어서 화면 설계서와 프로그램 설계서를 추출하고, 백엔드 소스 코드를 생성하는 명령어입니다.

## 사용법

```
/src-gen [pptx 파일 경로] [페이지 번호] [생성 옵션]
```

## 파라미터

- **pptx 파일 경로**: 파워포인트 파일 경로 (필수)
- **페이지 번호**: 추출할 슬라이드 페이지 번호 (필수)
- **생성 옵션**: 생성할 문서 타입 (선택)
  - `screen`: 화면 설계서만 생성
  - `program`: 프로그램 설계서만 생성  
  - `both`: 화면 설계서와 프로그램 설계서 모두 생성 (기본값)
  - `source`: 백엔드 소스 코드까지 생성

## 예시

```
/src-gen ./docs/design.pptx 5 screen
/src-gen ./docs/design.pptx 10-15 both
/src-gen ./docs/design.pptx 20 source
```

---

파라미터: $ARGUMENTS

먼저 python-pptx 라이브러리 설치 여부를 확인합니다:

!pip show python-pptx || echo "python-pptx가 설치되지 않았습니다. 'pip install python-pptx'로 설치해주세요."

파워포인트 파일 처리를 시작합니다:

!cd /mnt/c/guide/src-gen && python pptx_processor.py $ARGUMENTS

처리 결과를 확인합니다:

!ls -la /mnt/c/guide/src-gen/output/

생성된 설계서 파일들:
- 화면 설계서: `./output/[화면ID]_화면설계서.md`
- 프로그램 설계서: `./output/[프로그램ID]_프로그램설계서.md`

source 옵션을 선택한 경우, 다음 가이드를 참조하여 백엔드 소스 코드를 생성합니다:

@/mnt/c/guide/src-gen/backend-src-gen-guide.md
@/mnt/c/guide/src-gen/develop.md
