<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPost } from '../store'

const route = useRoute()
const post = ref<Awaited<ReturnType<typeof getPost>> | null>(null)

watch(() => route.params.slug, async (slug) => {
  post.value = null
  const p = await getPost(slug as string)
  post.value = p
  document.title = p.title + ' - PCNGON'
}, { immediate: true })
</script>

<template>
  <div class="container">
    <nav v-if="post" class="crumbs">
      <ol>
        <li><RouterLink to="/">Trang chủ</RouterLink></li>
        <li><RouterLink to="/tin-tuc">Tin tức</RouterLink></li>
        <li>{{ post.title }}</li>
      </ol>
    </nav>

    <article v-if="post" class="post-full">
      <h1>{{ post.title }}</h1>
      <div class="pdate">{{ post.date }}</div>
      <img v-if="post.img" class="post-cover" :src="post.img" :alt="post.title" />
      <div class="prose" v-html="post.html" />
    </article>
  </div>
</template>
