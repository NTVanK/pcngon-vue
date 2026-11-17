<script setup lang="ts">
import { ref, computed } from 'vue'
import { state } from '../store'

const q = ref('')
const page = ref(1)
const per = 12

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return state.posts
  return state.posts.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(needle))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / per)))
const visible = computed(() => filtered.value.slice((page.value - 1) * per, page.value * per))
</script>

<template>
  <div class="container">
    <div class="page-hero-banner">
      <div>
        <span class="eyebrow-pill">TECH BLOG &amp; BUILD GUIDES</span>
        <h1>Tin tức &amp; Kiến thức phần cứng</h1>
        <p>Cập nhật xu hướng Mini PC, hướng dẫn tối ưu eGPU OCuLink/USB4, kinh nghiệm lắp ráp Mini ITX SFF.</p>
      </div>
      <div class="page-hero-stat">
        <strong>{{ filtered.length }}</strong>
        <span>Bài viết</span>
      </div>
    </div>

    <section class="sec">
      <div class="shop-bar">
        <input v-model="q" type="search" placeholder="Tìm kiếm bài viết, hướng dẫn kỹ thuật..." aria-label="Tìm bài viết" @input="page = 1" />
      </div>

      <div class="blog-grid">
        <RouterLink v-for="post in visible" :key="post.id" class="blog-card" :to="`/tin-tuc/${post.slug}`">
          <div class="blog-media">
            <img :src="post.img" :alt="post.title" loading="lazy" />
            <span class="blog-tag">TECH GUIDE</span>
          </div>
          <div class="blog-body">
            <span class="pdate">{{ post.date }}</span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <span class="blog-read">Đọc bài viết →</span>
          </div>
        </RouterLink>
      </div>

      <nav v-if="totalPages > 1" class="pager">
        <button class="pg" :disabled="page === 1" @click="page--">‹</button>
        <button v-for="n in totalPages" :key="n" class="pg" :class="{ active: n === page }" @click="page = n">{{ n }}</button>
        <button class="pg" :disabled="page === totalPages" @click="page++">›</button>
      </nav>
    </section>
  </div>
</template>
