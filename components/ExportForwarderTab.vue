<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header / Info Bar -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📦</span> 수출 포워더 데일리 검증
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          앤컴 수출데이터의 계약번호1(BD열) 포워더 코드와 DAILY 양식 시트별 인보이스를 1:1 대조하여 일치 여부를 검증합니다.
        </p>
      </div>
      <div v-if="result" class="flex items-center gap-2">
        <button
          @click="downloadExcel"
          :disabled="downloading"
          class="btn btn-primary btn-md flex items-center gap-2 shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ downloading ? '엑셀 생성 중...' : '검증 결과 엑셀 다운로드' }}</span>
        </button>
        <button @click="resetAll" class="btn btn-ghost btn-md text-gray-500">
          다시 하기
        </button>
      </div>
    </div>

    <!-- Upload Zones (2-Column Grid) -->
    <div v-if="!processing && !result" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 1. 앤컴 수출데이터 파일 (File 1) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            1. 앤컴 수출데이터 파일 <span class="text-red-500 text-xs font-semibold">(필수)</span>
          </label>
          <span class="text-xs text-gray-400">예: 수출데이터 1102.xls</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!exportFile"
          @drop.prevent="handleExportDrop"
          @dragover.prevent="isDraggingExport = true"
          @dragleave.prevent="isDraggingExport = false"
          @click="$refs.exportFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition-all p-5 text-center',
            isDraggingExport ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          ]"
        >
          <input
            ref="exportFileInput"
            type="file"
            accept=".xlsx,.xls"
            @change="handleExportSelect"
            class="hidden"
          />
          <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">앤컴 수출데이터 파일 선택 또는 드래그</p>
          <p class="text-xs text-gray-500 mt-1">AZ열: 인보이스 번호 / BD열: 계약번호1(포워더/...) / 신고번호</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-emerald-200 bg-emerald-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 break-all">{{ exportFile.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatFileSize(exportFile.size) }}</p>
              </div>
            </div>
            <button @click="exportFile = null" class="btn btn-ghost btn-sm text-gray-400 hover:text-red-500">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-emerald-800 mt-3 bg-emerald-100/70 py-1.5 px-2.5 rounded-lg">
            ✔ BD열의 계약번호1 앞자리(예: DHL, DGF 등)를 추출하여 비교합니다.
          </p>
        </div>
      </div>

      <!-- 2. 수출 포워더 검증 DAILY 양식 파일 (File 2) -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            2. 수출 포워더 검증 DAILY 양식 파일 <span class="text-red-500 text-xs font-semibold">(필수)</span>
          </label>
          <span class="text-xs text-gray-400">예: 수출 포워더 검증 DAILY 양식_261102.xlsx</span>
        </div>

        <!-- Zone: Not Uploaded -->
        <div
          v-if="!dailyFile"
          @drop.prevent="handleDailyDrop"
          @dragover.prevent="isDraggingDaily = true"
          @dragleave.prevent="isDraggingDaily = false"
          @click="$refs.dailyFileInput?.click()"
          :class="[
            'upload-zone flex-1 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition-all p-5 text-center',
            isDraggingDaily ? 'border-blue-500 bg-blue-50/60' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          ]"
        >
          <input
            ref="dailyFileInput"
            type="file"
            accept=".xlsx,.xls"
            @change="handleDailySelect"
            class="hidden"
          />
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800">DAILY 양식 엑셀 파일 선택 또는 드래그</p>
          <p class="text-xs text-gray-500 mt-1">각 시트명 = 포워더 (DGF, DHL, CNW, MORRISON 등) / A열: 인보이스</p>
        </div>

        <!-- Card: Uploaded -->
        <div v-else class="card p-4 flex-1 flex flex-col justify-between border-blue-200 bg-blue-50/30">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 break-all">{{ dailyFile.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ formatFileSize(dailyFile.size) }}</p>
              </div>
            </div>
            <button @click="dailyFile = null" class="btn btn-ghost btn-sm text-gray-400 hover:text-red-500">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-blue-800 mt-3 bg-blue-100/70 py-1.5 px-2.5 rounded-lg">
            ✔ 시트별 인보이스 목록을 읽어 앤컴 수출데이터와 대조합니다.
          </p>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div v-if="!processing && !result" class="mb-8">
      <button
        @click="startVerification"
        :disabled="!exportFile || !dailyFile"
        class="btn btn-primary btn-lg w-full py-4 text-base font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
      >
        포워더 데일리 검증 시작 (개수 검증 / 계약번호 오류 / 불일치 확인)
      </button>
    </div>

    <!-- Processing State -->
    <div v-if="processing" class="card p-12 text-center mb-8">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-base font-bold text-gray-900 mb-1">두 엑셀 파일을 대조하여 포워더를 검증 중입니다...</p>
      <p class="text-xs text-gray-500">계약번호1(/) 파싱, 시트별 인보이스 대조, 건수 차이 및 불일치를 계산하고 있습니다.</p>
    </div>

    <!-- ======================================================== -->
    <!-- Verification Results Display -->
    <!-- ======================================================== -->
    <div v-if="result" class="space-y-8 mb-12">
      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- 1. 총 건수 -->
        <div class="card p-4 bg-slate-50 border-slate-200">
          <p class="text-xs font-semibold text-slate-500">총 데이터 건수</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">{{ result.totalExportRows }}</span>
            <span class="text-xs text-slate-500">수출 / {{ result.totalDailyRows }} DAILY</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">대조된 인보이스</p>
        </div>

        <!-- 2. 포워더 일치 -->
        <div class="card p-4 bg-emerald-50/60 border-emerald-200">
          <p class="text-xs font-semibold text-emerald-700">포워더 정상 일치</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-emerald-800">{{ result.matchedInvoicesCount }}</span>
            <span class="text-xs text-emerald-600">건</span>
          </div>
          <p class="text-[11px] text-emerald-600/80 mt-1">양쪽 모두 포워더 일치</p>
        </div>

        <!-- 3. 계약번호 형식 오류 -->
        <div :class="['card p-4 border', result.counts.contractErrorCount > 0 ? 'bg-red-50/60 border-red-300' : 'bg-slate-50 border-slate-200']">
          <p :class="['text-xs font-semibold', result.counts.contractErrorCount > 0 ? 'text-red-700' : 'text-slate-500']">
            계약번호1 오류 (BD열)
          </p>
          <div class="mt-1 flex items-baseline gap-2">
            <span :class="['text-2xl font-bold', result.counts.contractErrorCount > 0 ? 'text-red-700' : 'text-slate-900']">
              {{ result.counts.contractErrorCount }}
            </span>
            <span :class="['text-xs', result.counts.contractErrorCount > 0 ? 'text-red-600' : 'text-slate-500']">건</span>
          </div>
          <p :class="['text-[11px] mt-1', result.counts.contractErrorCount > 0 ? 'text-red-600 font-medium' : 'text-slate-400']">
            {{ result.counts.contractErrorCount > 0 ? '신고번호 확인 필요' : '형식 오류 없음' }}
          </p>
        </div>

        <!-- 4. 포워더 불일치 / 누락 -->
        <div :class="['card p-4 border', (result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount) > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200']">
          <p :class="['text-xs font-semibold', (result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount) > 0 ? 'text-amber-800' : 'text-slate-500']">
            불일치 및 누락 합계
          </p>
          <div class="mt-1 flex items-baseline gap-2">
            <span :class="['text-2xl font-bold', (result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount) > 0 ? 'text-amber-700' : 'text-slate-900']">
              {{ result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount }}
            </span>
            <span :class="['text-xs', (result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount) > 0 ? 'text-amber-600' : 'text-slate-500']">건</span>
          </div>
          <p :class="['text-[11px] mt-1', (result.counts.mismatchCount + result.counts.missingInDailyCount + result.counts.missingInExportCount) > 0 ? 'text-amber-700' : 'text-slate-400']">
            불일치 {{ result.counts.mismatchCount }} / 누락 {{ result.counts.missingInDailyCount + result.counts.missingInExportCount }}
          </p>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- RESULT 1: 포워더별 개수 검증 -->
      <!-- ======================================================== -->
      <div class="card p-6 border-gray-200 shadow-sm bg-white">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
              <h3 class="text-base font-bold text-gray-900">포워더별 개수 검증</h3>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              각각 포워더별로 신고된 인보이스가 맞는지 1번(수출데이터)과 2번(DAILY양식)의 데이터 건수를 비교합니다.
            </p>
          </div>
          <span :class="[
            'text-xs px-2.5 py-1 rounded-full font-semibold',
            result.totalComparison.isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          ]">
            {{ result.totalComparison.isMatch ? '전체 총계 일치' : '건수 차이 발생' }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-gray-50 text-gray-600 border-y border-gray-200">
              <tr>
                <th class="py-3 px-4 text-center font-bold">포워더명</th>
                <th class="py-3 px-4 text-right font-bold">1번 수출데이터 건수</th>
                <th class="py-3 px-4 text-right font-bold">2번 DAILY 양식 건수</th>
                <th class="py-3 px-4 text-right font-bold">차이 (수출 - DAILY)</th>
                <th class="py-3 px-4 text-center font-bold">검증 결과</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in result.forwarderCounts"
                :key="item.forwarder"
                :class="!item.isMatch ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'"
              >
                <td class="py-3 px-4 text-center font-bold text-gray-900">
                  {{ item.forwarder }}
                </td>
                <td class="py-3 px-4 text-right font-mono font-medium text-gray-800">
                  {{ item.exportCount }}건
                </td>
                <td class="py-3 px-4 text-right font-mono font-medium text-gray-800">
                  {{ item.dailyCount }}건
                </td>
                <td class="py-3 px-4 text-right font-mono font-bold" :class="item.diff !== 0 ? 'text-red-600' : 'text-gray-500'">
                  {{ item.diff > 0 ? `+${item.diff}` : item.diff }}
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    v-if="item.isMatch"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800"
                  >
                    ✔ 일치
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800"
                  >
                    ✕ 불일치 ({{ item.diff > 0 ? `수출 ${item.diff}건 초과` : `DAILY ${Math.abs(item.diff)}건 초과` }})
                  </span>
                </td>
              </tr>
            </tbody>
            <!-- Footer: Total Row -->
            <tfoot class="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
              <tr>
                <td class="py-3.5 px-4 text-center">합계</td>
                <td class="py-3.5 px-4 text-right font-mono">{{ result.totalComparison.totalExportCount }}건</td>
                <td class="py-3.5 px-4 text-right font-mono">{{ result.totalComparison.totalDailyCount }}건</td>
                <td class="py-3.5 px-4 text-right font-mono" :class="result.totalComparison.diff !== 0 ? 'text-red-600' : 'text-gray-800'">
                  {{ result.totalComparison.diff > 0 ? `+${result.totalComparison.diff}` : result.totalComparison.diff }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
                      result.totalComparison.isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ result.totalComparison.isMatch ? '전체 일치' : '불일치' }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div
          v-if="result.duplicateInvoices && result.duplicateInvoices.length"
          class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
        >
          <p class="font-semibold mb-1">
            ※ 수출데이터 건수는 인보이스 기준입니다. 한 인보이스에 신고번호가 여러 개인 {{ result.duplicateInvoices.length }}건은 1건으로 집계했습니다.
          </p>
          <ul class="list-disc pl-5 space-y-0.5">
            <li v-for="d in result.duplicateInvoices" :key="d.forwarder + d.invNo" class="font-mono">
              {{ d.invNo }} ({{ d.forwarder }}) — 신고번호 {{ d.count }}건: {{ d.dclNos.join(', ') }}
            </li>
          </ul>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- RESULT 2: 계약번호 형식 오류 검증 -->
      <!-- ======================================================== -->
      <div class="card p-6 border-gray-200 shadow-sm bg-white">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
              <h3 class="text-base font-bold text-gray-900">계약번호1 형식 오류 검증 (BD열)</h3>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              1번 수출데이터 BD열 계약번호1이 <code class="bg-gray-100 px-1 py-0.5 rounded text-gray-700">포워더/...</code> 형식이 아닌 건을 점검합니다.
            </p>
          </div>
          <span :class="[
            'text-xs px-2.5 py-1 rounded-full font-semibold',
            result.contractFormatErrors.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          ]">
            {{ result.contractFormatErrors.length === 0 ? '오류 없음' : `${result.contractFormatErrors.length}건 오류 발생` }}
          </span>
        </div>

        <!-- No Errors State -->
        <div v-if="result.contractFormatErrors.length === 0" class="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-sm font-bold text-emerald-900">계약번호 형식 오류가 없습니다.</p>
          <p class="text-xs text-emerald-700 mt-0.5">모든 행의 계약번호1(BD열)이 정상적인 포워더 구분자(/) 형식을 갖추고 있습니다.</p>
        </div>

        <!-- Error List Table -->
        <div v-else class="overflow-x-auto">
          <div class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span>아래 <strong>신고번호</strong>의 계약번호1 형식(BD열)을 수정해야 포워더를 정상 인식할 수 있습니다:</span>
          </div>

          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-red-50 text-red-900 border-y border-red-200">
              <tr>
                <th class="py-3 px-3 text-center w-14 font-bold">No</th>
                <th class="py-3 px-4 font-bold">신고번호 (확인 필요)</th>
                <th class="py-3 px-4 font-bold">인보이스 번호</th>
                <th class="py-3 px-4 font-bold">계약번호1 입력값 (BD열)</th>
                <th class="py-3 px-4 font-bold">오류 사유</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-red-100 bg-red-50/20">
              <tr v-for="(err, idx) in result.contractFormatErrors" :key="idx" class="hover:bg-red-50/50">
                <td class="py-3 px-3 text-center text-xs text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3 px-4 font-mono font-bold text-red-700">
                  <span class="bg-red-100 px-2 py-0.5 rounded">{{ err.dclNo }}</span>
                </td>
                <td class="py-3 px-4 font-mono text-gray-800">{{ err.invNo }}</td>
                <td class="py-3 px-4 font-mono text-gray-600">
                  {{ err.rawContract || '(공란)' }}
                </td>
                <td class="py-3 px-4 text-xs font-semibold text-red-600">
                  {{ err.reason }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- RESULT 3: 포워더 불일치 및 누락 검증 -->
      <!-- ======================================================== -->
      <div class="card p-6 border-gray-200 shadow-sm bg-white">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-gray-100 gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
              <h3 class="text-base font-bold text-gray-900">포워더 불일치 및 누락 검증</h3>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              1번 수출데이터와 2번 DAILY 양식 간에 포워더가 다르거나 한쪽에만 존재하는 인보이스를 추적합니다.
            </p>
          </div>

          <!-- Filter Pill Tabs -->
          <div class="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
            <button
              @click="discrepancyFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-md transition-all', discrepancyFilter === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700']"
            >
              전체 ({{ result.discrepancies.length }})
            </button>
            <button
              @click="discrepancyFilter = 'MISMATCH'"
              :class="['px-2.5 py-1 rounded-md transition-all', discrepancyFilter === 'MISMATCH' ? 'bg-white shadow-sm text-rose-700' : 'text-gray-500 hover:text-gray-700']"
            >
              포워더 불일치 ({{ result.counts.mismatchCount }})
            </button>
            <button
              @click="discrepancyFilter = 'MISSING_IN_DAILY'"
              :class="['px-2.5 py-1 rounded-md transition-all', discrepancyFilter === 'MISSING_IN_DAILY' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700']"
            >
              DAILY 누락 ({{ result.counts.missingInDailyCount }})
            </button>
            <button
              @click="discrepancyFilter = 'MISSING_IN_EXPORT'"
              :class="['px-2.5 py-1 rounded-md transition-all', discrepancyFilter === 'MISSING_IN_EXPORT' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              수출데이터 누락 ({{ result.counts.missingInExportCount }})
            </button>
          </div>
        </div>

        <!-- Perfect Match State -->
        <div v-if="filteredDiscrepancies.length === 0 && result.discrepancies.length === 0" class="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-sm font-bold text-emerald-900">포워더 불일치 및 누락 인보이스가 없습니다.</p>
          <p class="text-xs text-emerald-700 mt-0.5">양쪽 파일의 모든 인보이스와 포워더가 100% 완벽히 일치합니다.</p>
        </div>

        <!-- Filter Empty State -->
        <div v-else-if="filteredDiscrepancies.length === 0" class="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-500">
          선택한 필터 조건에 해당하는 항목이 없습니다.
        </div>

        <!-- Discrepancies Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-gray-50 text-gray-600 border-y border-gray-200">
              <tr>
                <th class="py-3 px-3 text-center w-14 font-bold">No</th>
                <th class="py-3 px-4 font-bold text-center">구분</th>
                <th class="py-3 px-4 font-bold">인보이스 번호</th>
                <th class="py-3 px-4 font-bold">신고번호</th>
                <th class="py-3 px-4 font-bold text-center">1번 수출데이터 포워더</th>
                <th class="py-3 px-4 font-bold text-center">2번 DAILY양식 포워더</th>
                <th class="py-3 px-4 font-bold">계약번호1 원문</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(item, idx) in filteredDiscrepancies"
                :key="`${item.invNo}-${idx}`"
                :class="[
                  item.type === 'MISMATCH' ? 'bg-rose-50/50' : (item.type === 'MISSING_IN_DAILY' ? 'bg-amber-50/30' : 'bg-blue-50/30'),
                  'hover:bg-gray-100/60'
                ]"
              >
                <td class="py-3 px-3 text-center text-xs text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="py-3 px-4 text-center">
                  <span
                    v-if="item.type === 'MISMATCH'"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800"
                  >
                    포워더 불일치
                  </span>
                  <span
                    v-else-if="item.type === 'MISSING_IN_DAILY'"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"
                  >
                    DAILY 누락
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"
                  >
                    수출데이터 누락
                  </span>
                </td>
                <td class="py-3 px-4 font-mono font-bold text-gray-900">
                  {{ item.invNo }}
                </td>
                <td class="py-3 px-4 font-mono text-gray-700 text-xs">
                  {{ item.dclNo }}
                </td>
                <td class="py-3 px-4 text-center font-bold font-mono" :class="item.type === 'MISMATCH' ? 'text-rose-700' : 'text-gray-800'">
                  <span class="bg-gray-100 px-2 py-0.5 rounded">{{ item.exportForwarder }}</span>
                </td>
                <td class="py-3 px-4 text-center font-bold font-mono" :class="item.type === 'MISMATCH' ? 'text-blue-700' : 'text-gray-800'">
                  <span class="bg-gray-100 px-2 py-0.5 rounded">{{ item.dailyForwarder }}</span>
                </td>
                <td class="py-3 px-4 font-mono text-xs text-gray-500">
                  {{ item.rawContract || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ForwarderVerificationResult } from '~/server/utils/exportForwarderProcessor';

const exportFile = ref<File | null>(null);
const dailyFile = ref<File | null>(null);

const isDraggingExport = ref(false);
const isDraggingDaily = ref(false);

const processing = ref(false);
const downloading = ref(false);
const result = ref<ForwarderVerificationResult | null>(null);

const discrepancyFilter = ref<'ALL' | 'MISMATCH' | 'MISSING_IN_DAILY' | 'MISSING_IN_EXPORT'>('ALL');

const emit = defineEmits<{
  error: [message: string];
}>();

const filteredDiscrepancies = computed(() => {
  if (!result.value?.discrepancies) return [];
  if (discrepancyFilter.value === 'ALL') return result.value.discrepancies;
  return result.value.discrepancies.filter((d) => d.type === discrepancyFilter.value);
});

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// File validation
const validateExcelFile = (file: File): boolean => {
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!['.xlsx', '.xls'].includes(ext)) {
    emit('error', '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
    return false;
  }
  if (file.size > 30 * 1024 * 1024) {
    emit('error', '파일 크기는 30MB 이하여야 합니다.');
    return false;
  }
  return true;
};

// Handlers for Export File (1)
const handleExportDrop = (e: DragEvent) => {
  isDraggingExport.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && validateExcelFile(files[0])) {
    exportFile.value = files[0];
  }
};

const handleExportSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0 && validateExcelFile(files[0])) {
    exportFile.value = files[0];
  }
};

// Handlers for DAILY File (2)
const handleDailyDrop = (e: DragEvent) => {
  isDraggingDaily.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && validateExcelFile(files[0])) {
    dailyFile.value = files[0];
  }
};

const handleDailySelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0 && validateExcelFile(files[0])) {
    dailyFile.value = files[0];
  }
};

// Start Verification
const startVerification = async () => {
  if (!exportFile.value || !dailyFile.value) {
    emit('error', '앤컴 수출데이터 파일과 DAILY 양식 파일을 모두 업로드해 주세요.');
    return;
  }

  processing.value = true;
  result.value = null;

  try {
    const formData = new FormData();
    formData.append('exportFile', exportFile.value);
    formData.append('dailyFile', dailyFile.value);

    const response = await $fetch<any>('/api/export-forwarder/process', {
      method: 'POST',
      body: formData
    });

    result.value = response;
  } catch (err: any) {
    console.error('Verification error:', err);
    emit('error', err.data?.statusMessage || err.message || '검증 처리 중 오류가 발생했습니다.');
  } finally {
    processing.value = false;
  }
};

// Download Excel Report
const downloadExcel = async () => {
  if (!result.value) return;

  downloading.value = true;
  try {
    const response = await $fetch('/api/export-forwarder/download', {
      method: 'POST',
      body: { data: result.value },
      responseType: 'blob'
    });

    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `수출_포워더_검증결과_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Download error:', err);
    emit('error', '엑셀 다운로드 중 오류가 발생했습니다.');
  } finally {
    downloading.value = false;
  }
};

const resetAll = () => {
  exportFile.value = null;
  dailyFile.value = null;
  result.value = null;
  processing.value = false;
  discrepancyFilter.value = 'ALL';
};
</script>
