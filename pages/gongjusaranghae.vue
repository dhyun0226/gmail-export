<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">문서추출</h1>
      <p class="page-subtitle">메일 첨부 PDF에서 문서 정보를 AI로 추출합니다.</p>
    </div>
    <DocExtractTab />
  </div>
</template>

<script setup lang="ts">
import DocExtractTab from '~/components/docextract/DocExtractTab.vue';
</script>
