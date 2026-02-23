<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">환율 조회</h1>
      <p class="page-subtitle">유니패스 기준 환율 정보를 조회합니다.</p>
    </div>
    <ExchangeRateTab />
  </div>
</template>

<script setup lang="ts">
import ExchangeRateTab from '~/components/ExchangeRateTab.vue';
</script>
