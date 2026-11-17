<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadAll, state } from './store'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

const ready = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    await loadAll()
  } catch (e) {
    error.value = String(e)
  }
  ready.value = true
})

const route = useRoute()
const router = useRouter()
const staticTitles: Record<string, string> = {
  home: '',
  shop: 'Tất cả sản phẩm',
  posts: 'Tin tức',
  contact: 'Liên hệ',
}

watch(() => route.name, (name) => {
  const siteName = state.site?.site_name || 'PCNGON'
  const prefix = staticTitles[String(name || '')]
  if (prefix !== undefined) {
    document.title = prefix ? `${prefix} - ${siteName}` : siteName
  }
})

function onMainClick(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  const anchor = (e.target as HTMLElement | null)?.closest('a')
  if (!anchor || !anchor.closest('.prose')) return
  const href = anchor.getAttribute('href')
  if (!href || !href.startsWith('/') || href.startsWith('//')) return
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
  e.preventDefault()
  router.push(href)
}
</script>

<template>
  <div v-if="!ready" class="boot">
    <div class="spinner" />
    <p>Đang tải dữ liệu...</p>
  </div>
  <div v-else-if="error" class="boot">
    <p class="err">{{ error }}</p>
  </div>
  <template v-else>
    <SiteHeader />
    <main @click="onMainClick">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>
    <SiteFooter />
  </template>
</template>
