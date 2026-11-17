<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state, rootCategories } from '../store'
import { theme, toggleTheme } from '../theme'

const router = useRouter()
const route = useRoute()
const q = ref('')
const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const cats = computed(() => rootCategories.value)

async function openSearch() {
  searchOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

function submit() {
  if (!q.value.trim()) return
  router.push({ path: '/san-pham', query: { q: q.value.trim() } })
  q.value = ''
  searchOpen.value = false
}

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  searchOpen.value = false
})
</script>

<template>
  <div v-if="state.site" class="announcement">
    <div class="container announcement-inner">
      <div class="announcement-left">
        <span class="announcement-badge">
          <span class="pulse-dot" />
          PCNGON STORE
        </span>
        <span class="announcement-text">{{ state.site.notice_banner.text }}</span>
      </div>
      <div class="announcement-right">
        <a v-if="state.contact?.hotline" :href="`tel:${state.contact.hotline.replace(/\s/g, '')}`" class="announcement-link">
          Hotline: {{ state.contact.hotline }}
        </a>
        <span class="announcement-sep">·</span>
        <a :href="state.contact?.zalo_oa.url" target="_blank" rel="noopener" class="announcement-cta">
          {{ state.site.notice_banner.action }} →
        </a>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div v-if="searchOpen" class="search-modal">
      <form class="search-field" @submit.prevent="submit">
        <svg class="search-lead-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref="searchInput"
          v-model="q"
          type="search"
          placeholder="Tìm kiếm Mini PC, Ryzen, OCuLink, Case ITX, eGPU..."
          aria-label="Tìm kiếm"
        />
        <button type="submit" class="btn primary btn-sm">Tìm kiếm</button>
      </form>
      <button class="icon-btn" aria-label="Đóng tìm kiếm" @click="searchOpen = false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <div v-else class="header-inner">
      <button class="icon-btn menu-toggle" :aria-expanded="mobileOpen" aria-label="Menu" @click="mobileOpen = !mobileOpen">
        <svg v-if="!mobileOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>

      <RouterLink to="/" class="logo">
        <img :src="state.site?.logo_url" :alt="state.site?.site_name" height="38" />
        <span class="logo-tag">MINI PC &amp; ITX LAB</span>
      </RouterLink>

      <nav class="main-nav">
        <RouterLink to="/" exact-active-class="active">Trang chủ</RouterLink>
        <RouterLink to="/san-pham" active-class="active">Cửa hàng</RouterLink>
        <RouterLink to="/tin-tuc" active-class="active">Tech Blog</RouterLink>
        <RouterLink to="/trang/chinh-sach-bao-hanh" active-class="active">Bảo hành</RouterLink>
        <RouterLink to="/lien-he" active-class="active">Liên hệ</RouterLink>
      </nav>

      <div class="header-icons">
        <form class="header-search-inline" @submit.prevent="submit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input v-model="q" type="search" placeholder="Tìm sản phẩm, cấu hình..." aria-label="Tìm nhanh" />
        </form>

        <button class="icon-btn search-trigger-mobile" aria-label="Tìm kiếm" @click="openSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </button>

        <button
          class="icon-btn"
          type="button"
          :aria-label="theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
          :title="theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <a class="header-cta-pill" :href="state.contact?.zalo_oa.url" target="_blank" rel="noopener" title="Tư vấn trực tuyến qua Zalo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
          <span>Tư vấn Zalo</span>
        </a>
      </div>
    </div>

    <div class="cat-bar-wrap" :class="{ open: mobileOpen }">
      <nav class="cat-bar">
        <RouterLink class="cat cat-all" to="/san-pham">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          Tất cả sản phẩm
        </RouterLink>
        <RouterLink v-for="c in cats" :key="c.id" class="cat" :to="`/danh-muc/${c.slug}`">
          {{ c.name }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
