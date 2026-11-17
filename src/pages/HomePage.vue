<script setup lang="ts">
import { computed } from 'vue'
import { state, productsInCategory, catBySlug } from '../store'
import HeroSlider from '../components/HeroSlider.vue'
import ProductCard from '../components/ProductCard.vue'

const hero = computed(() => state.home?.sections.find((s) => s.type === 'banner_slider')?.items || [])
const catGrid = computed(() => state.home?.sections.find((s) => s.type === 'category_grid')?.categories || [])

const showcases = computed(() =>
  (state.home?.sections || [])
    .filter((s) => s.type === 'product_showcase')
    .map((s) => ({
      title: s.title || '',
      slug: s.category_slug || '',
      items: s.category_slug ? productsInCategory(catBySlug.value[s.category_slug]?.id || 0).slice(0, 8) : [],
    }))
    .filter((s) => s.items.length),
)

const latestPosts = computed(() => state.posts.slice(0, 3))
</script>

<template>
  <div v-if="state.home">
    <HeroSlider :items="hero" />

    <div class="container">
      <section class="sec">
        <div class="sec-head"><h2>Danh mục nổi bật</h2></div>
        <div class="cat-grid">
          <RouterLink v-for="c in catGrid" :key="c.slug" class="cat-card" :to="`/danh-muc/${c.slug}`">
            <div class="cat-media"><img :src="c.image" :alt="c.name" loading="lazy" /></div>
            <span>{{ c.name }} <i aria-hidden="true">→</i></span>
          </RouterLink>
        </div>
      </section>

      <section v-for="s in showcases" :key="s.slug" class="sec">
        <div class="sec-head"><h2>{{ s.title }}</h2></div>
        <div class="grid">
          <ProductCard v-for="p in s.items" :key="p.id" :p="p" />
        </div>
        <div class="sec-foot">
          <RouterLink class="btn" :to="`/danh-muc/${s.slug}`">Xem tất cả</RouterLink>
        </div>
      </section>
    </div>

    <section class="trust">
      <div class="container trust-grid">
        <div><strong>Giao hàng toàn quốc</strong><span>COD &amp; chuyển khoản</span></div>
        <div><strong>Hàng chính hãng</strong><span>Bảo hành theo nhà sản xuất</span></div>
        <div><strong>Tư vấn cấu hình</strong><span>Mini ITX · Mini PC · eGPU</span></div>
        <div><strong>Hỗ trợ nhanh</strong><span>Zalo &amp; Hotline {{ state.contact?.hotline }}</span></div>
      </div>
    </section>

    <div class="container">
      <section class="sec">
        <div class="sec-head"><h2>Tin tức &amp; kinh nghiệm</h2></div>
        <div class="blog-grid">
          <RouterLink v-for="post in latestPosts" :key="post.id" class="blog-card" :to="`/tin-tuc/${post.slug}`">
            <div class="blog-media"><img :src="post.img" :alt="post.title" loading="lazy" /></div>
            <h3>{{ post.title }}</h3>
            <span class="pdate">{{ post.date }}</span>
            <p>{{ post.excerpt }}</p>
          </RouterLink>
        </div>
        <div class="sec-foot">
          <RouterLink class="btn" to="/tin-tuc">Xem tất cả bài viết</RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>
