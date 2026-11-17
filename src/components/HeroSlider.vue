<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { catBySlug } from '../store'

const props = defineProps<{
  items: { title: string; description: string; image_desktop: string; link: string }[]
}>()

const i = ref(0)
let timer: number | undefined

function go(step: number) {
  const n = props.items.length
  if (!n) return
  i.value = (i.value + step + n) % n
}

function selectSlide(idx: number) {
  i.value = idx
  restart()
}

function restart() {
  window.clearInterval(timer)
  timer = window.setInterval(() => go(1), 6000)
}

function resolveHeroLink(url: string): string {
  try {
    const u = new URL(url)
    const slug = u.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() || ''
    if (slug && catBySlug.value[slug]) return `/danh-muc/${slug}`
  } catch {
    // ignore
  }
  return '/san-pham'
}

const slideTags = ['NEXT-GEN SFF BUILD', 'HIGH-PERFORMANCE RIG', 'HARDWARE ECOSYSTEM']

onMounted(restart)
onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <section v-if="items.length" class="hero">
    <div class="container hero-container">
      <div class="slider">
        <div v-for="(h, n) in items" :key="n" class="slide" :class="{ active: n === i }">
          <img :src="h.image_desktop" :alt="h.title" :loading="n === 0 ? 'eager' : 'lazy'" />
          <div class="slide-text">
            <div class="slide-box">
              <div class="slide-eyebrow">
                <span class="eyebrow-dot" />
                <span>{{ slideTags[n % slideTags.length] }}</span>
              </div>
              <h2>{{ h.title }}</h2>
              <p v-if="h.description">{{ h.description }}</p>
              <div class="slide-actions">
                <RouterLink class="btn primary btn-pill" :to="resolveHeroLink(h.link)">
                  Khám phá ngay
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </RouterLink>
                <RouterLink class="btn btn-glass btn-pill" to="/san-pham">
                  Xem toàn bộ cửa hàng
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <div v-if="items.length > 1" class="slider-hud">
          <div class="slider-dots" role="tablist" aria-label="Chọn slide">
            <button
              v-for="(_, idx) in items"
              :key="idx"
              type="button"
              class="slider-dot"
              :class="{ active: idx === i }"
              :aria-label="`Chuyển tới slide ${idx + 1}`"
              @click="selectSlide(idx)"
            />
          </div>
          <div class="slider-arrows">
            <button class="hud-arrow" type="button" aria-label="Slide trước" @click="go(-1); restart()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <span class="slider-count">0{{ i + 1 }} / 0{{ items.length }}</span>
            <button class="hud-arrow" type="button" aria-label="Slide sau" @click="go(1); restart()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
