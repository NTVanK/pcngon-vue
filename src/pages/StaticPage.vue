<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPage } from '../store'
import type { PageDetail } from '../types'

const route = useRoute()
const page = ref<PageDetail | null>(null)
const notFound = ref(false)

watch(() => route.params.slug, async (slug) => {
  page.value = null
  notFound.value = false
  try {
    const p = await getPage(slug as string)
    page.value = p
    document.title = p.title + ' - PCNGON'
  } catch {
    notFound.value = true
    document.title = 'Không tìm thấy trang - PCNGON'
  }
}, { immediate: true })
</script>

<template>
  <div class="container">
    <template v-if="page">
      <nav class="crumbs">
        <ol>
          <li><RouterLink to="/">Trang chủ</RouterLink></li>
          <li>{{ page.title }}</li>
        </ol>
      </nav>

      <article class="post-full">
        <h1>{{ page.title }}</h1>
        <div class="prose" v-html="page.html" />
      </article>
    </template>

    <div v-else-if="notFound" class="boot">
      <p>Trang bạn tìm không tồn tại.</p>
      <RouterLink to="/" class="btn">Về trang chủ</RouterLink>
    </div>
  </div>
</template>
