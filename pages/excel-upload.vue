<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">BL 엑셀 업로드</h1>
      <p class="page-subtitle">BL번호가 포함된 엑셀 파일을 업로드하여 유니패스 조회를 수행합니다.</p>
    </div>
    <ExcelUploadTab />
  </div>
</template>

<script setup lang="ts">
import ExcelUploadTab from '~/components/ExcelUploadTab.vue';
</script>
