<template>
  <div>
    <div class="page-header mb-8">
      <h1 class="page-title">엑셀 필터링</h1>
      <p class="page-subtitle">대용량 엑셀 파일에서 특정 열 기준으로 원하는 행만 추출하는 프로그램입니다.</p>
    </div>

    <!-- 프로그램 다운로드 -->
    <div class="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="text-lg font-bold text-blue-800">프로그램 다운로드</p>
        <a
          href="/FU필터링.zip"
          download
          class="btn btn-primary btn-lg gap-2 shrink-0"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          다운로드 (ZIP)
        </a>
      </div>
      <p class="text-sm text-blue-600">PC에서 직접 실행하는 프로그램입니다. 인터넷 연결 없이, 파일 크기 제한 없이 처리 가능합니다.</p>
    </div>

    <!-- 사용 방법 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">사용 방법</h3>
      </div>
      <div class="px-6 py-5 space-y-6 text-sm text-gray-700">
        <!-- 준비물 -->
        <div>
          <h4 class="font-bold text-gray-900 mb-2">준비물</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>FU필터링.exe</strong> — 위에서 다운로드한 프로그램 (ZIP 압축 해제)</li>
            <li><strong>원본.xlsx</strong> — 필터링할 대용량 엑셀 (파일명을 <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">원본.xlsx</code>로 변경)</li>
            <li><strong>필터.xlsx</strong> — A열에 필터링 코드 목록 (파일명을 <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">필터.xlsx</code>로 변경, 헤더 없이)</li>
          </ul>
        </div>

        <!-- 단계 -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3">실행 단계</h4>
          <div class="space-y-4">
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p class="font-semibold">폴더 만들기</p>
                <p class="text-gray-500">바탕화면 등 아무 곳에 새 폴더를 하나 만듭니다.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p class="font-semibold">파일 3개 넣기</p>
                <p class="text-gray-500">FU필터링.exe, 원본.xlsx, 필터.xlsx를 같은 폴더에 넣습니다.</p>
                <div class="mt-2 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600">
                  📁 폴더<br>
                  &nbsp;&nbsp;├── FU필터링.exe<br>
                  &nbsp;&nbsp;├── 원본.xlsx<br>
                  &nbsp;&nbsp;└── 필터.xlsx
                </div>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p class="font-semibold">FU필터링.exe 더블클릭</p>
                <p class="text-gray-500">검은 창이 열립니다. (Windows 보안 경고가 뜨면 "추가 정보" → "실행" 클릭)</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <p class="font-semibold">열 이름 입력</p>
                <p class="text-gray-500">"필터링 기준 열 이름을 입력하세요" 라고 나오면 열 이름을 입력하고 Enter를 누르세요. (예: FU)</p>
                <p class="text-gray-400 text-xs mt-1">그냥 Enter만 누르면 기본값 "FU"로 진행됩니다.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <div>
                <p class="font-semibold">처리 완료 대기</p>
                <p class="text-gray-500">진행률이 표시됩니다. 파일이 크면 몇 분 걸릴 수 있으니 <strong>검은 창을 닫지 말고</strong> 기다려주세요.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="flex-shrink-0 w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">6</span>
              <div>
                <p class="font-semibold">결과 확인</p>
                <p class="text-gray-500">"완료!" 메시지가 나오면, 같은 폴더에 <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">결과.xlsx</code> 파일이 생성되어 있습니다.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 주의사항 -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 class="font-bold text-yellow-800 mb-2">주의사항</h4>
          <ul class="list-disc pl-5 space-y-1 text-yellow-700 text-xs">
            <li>파일명을 반드시 <strong>원본.xlsx</strong>, <strong>필터.xlsx</strong>로 맞춰주세요</li>
            <li>3개 파일이 <strong>같은 폴더</strong>에 있어야 합니다</li>
            <li>처리 중 <strong>검은 창을 닫지 마세요</strong> (파일이 크면 몇 분 걸릴 수 있음)</li>
            <li>기존 결과.xlsx가 있으면 덮어씁니다</li>
            <li>원본 파일은 절대 수정되지 않습니다</li>
          </ul>
        </div>

        <!-- 필터링 기준 -->
        <div>
          <h4 class="font-bold text-gray-900 mb-2">필터링 기준</h4>
          <ul class="list-disc pl-5 space-y-1">
            <li>원본 엑셀의 <strong>헤더(1행)</strong>에서 "FU" 열을 자동으로 찾습니다</li>
            <li>필터 엑셀의 <strong>A열</strong>에 있는 코드와 일치하는 행만 추출합니다</li>
            <li>중복 행도 모두 포함됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
