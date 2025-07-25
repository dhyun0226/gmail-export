<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 공통 네비게이션 (로그인 상태이거나 테스트 페이지일 때 표시) -->
    <div v-if="isAuthenticated || $route.path === '/bl-test'" class="bg-white shadow mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8 h-16 items-center">
          <nuxt-link 
            to="/"
            class="text-gray-900 hover:text-blue-600 font-medium px-3 py-2 rounded-md text-sm"
            :class="{ 'bg-blue-50 text-blue-700': $route.path === '/' }"
          >
            이메일 내보내기
          </nuxt-link>
          <nuxt-link 
            to="/bl-management"
            class="text-gray-900 hover:text-blue-600 font-medium px-3 py-2 rounded-md text-sm"
            :class="{ 'bg-blue-50 text-blue-700': $route.path === '/bl-management' }"
          >
            BL 번호 관리
          </nuxt-link>
          <nuxt-link 
            to="/bl-test"
            class="text-gray-900 hover:text-blue-600 font-medium px-3 py-2 rounded-md text-sm"
            :class="{ 'bg-blue-50 text-blue-700': $route.path === '/bl-test' }"
          >
            BL 추출 테스트
          </nuxt-link>
        </div>
      </div>
    </div>
    
    <!-- 페이지 콘텐츠 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);

// 사용자 정보 확인
const checkAuth = async () => {
  try {
    const data = await $fetch('/api/user');
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
};

onMounted(() => {
  checkAuth();
});
</script>