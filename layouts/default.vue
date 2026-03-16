<template>
  <div class="font-sans">
    <!-- Unauthenticated: Login card only -->
    <div v-if="!isAuthenticated" class="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div class="card-elevated max-w-md w-full p-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="Logo" class="h-10 w-10" />
          <h1 class="text-2xl font-bold text-gray-900">관세법인 정상</h1>
        </div>
        <p class="mb-8 text-sm text-gray-500">
          구글 계정으로 로그인하여 서비스를 이용하세요.
        </p>
        <button @click="login" class="btn btn-primary btn-lg w-full gap-3">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 로그인
        </button>
      </div>
    </div>

    <!-- Authenticated: Sidebar + Content -->
    <div v-else>
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" class="h-10 w-10" />
            <span class="text-lg font-bold text-gray-900">관세법인 정상</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'sidebar-link',
              isActive(item.to) && 'sidebar-link-active'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="sidebar-footer">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
            </div>
            <button @click="logout" class="btn btn-ghost btn-sm" title="로그아웃">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container mx-auto px-8 py-8 max-w-6xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, h } from 'vue';

const route = useRoute();

const isAuthenticated = ref(false);
const userEmail = ref('');
const error = ref('');

const checkAuth = async () => {
  try {
    const data = await $fetch('/api/user');
    if (data.authenticated && data.user) {
      isAuthenticated.value = true;
      userEmail.value = data.user.email;
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
};

const login = () => {
  window.location.href = '/api/auth/google';
};

const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    isAuthenticated.value = false;
    userEmail.value = '';
  } catch (err) {
    console.error('Logout error:', err);
  }
};

provide('auth', {
  isAuthenticated,
  userEmail,
  logout,
});

const isActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

// Icon components
const IconMail = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })]) };
const IconUpload = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' })]) };
const IconDoc = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })]) };
const IconChart = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) };
const IconCurrency = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]) };
const IconTruck = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' })]) };
const IconScale = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' })]) };
const IconFilter = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' })]) };

const navItems = [
  { to: '/', label: '마일스톤', icon: IconMail },
  { to: '/cargolist', label: 'Cargo List', icon: IconTruck },
  { to: '/kpi', label: 'KPI', icon: IconChart },
  { to: '/weight-inquiry', label: '중량문의', icon: IconScale },
  { to: '/exchange-rate', label: '환율', icon: IconCurrency },
  { to: '/fu', label: 'FU', icon: IconFilter },
  // { to: '/gongjusaranghae', label: '문서추출', icon: IconDoc },
];

onMounted(() => {
  checkAuth();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error')) {
    error.value = '로그인 중 오류가 발생했습니다.';
  }
});
</script>
