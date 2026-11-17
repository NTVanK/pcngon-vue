<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../types'
import { formatVnd, getProductBrand, extractSpecChips } from '../store'

const props = defineProps<{ p: Product }>()

const isSale = computed(() => props.p.price > 0 && props.p.regular > props.p.price)
const salePercent = computed(() => {
  if (!isSale.value) return 0
  return Math.max(1, Math.round((1 - props.p.price / props.p.regular) * 100))
})
const isOut = computed(() => props.p.stock === 'out_of_stock' || props.p.badges.includes('Hết hàng'))
const isNew = computed(() => props.p.badges.includes('Mới'))
const hoverImg = computed(() => props.p.imgs.find((u) => u && u !== props.p.img) || '')
const brandLabel = computed(() => getProductBrand(props.p))
const specChips = computed(() => extractSpecChips(props.p.name, 3))
</script>

<template>
  <article class="card" :class="{ 'has-hover': hoverImg, 'is-out': isOut }">
    <RouterLink class="card-media" :to="`/san-pham/${p.slug}`" :aria-label="p.name">
      <img class="img-main" :src="p.img" :alt="p.name" loading="lazy" width="400" height="400" />
      <img v-if="hoverImg" class="img-hover" :src="hoverImg" alt="" loading="lazy" width="400" height="400" />

      <div class="card-badges">
        <span v-if="isOut" class="badge out">Hết hàng</span>
        <span v-else-if="isSale" class="badge sale">-{{ salePercent }}%</span>
        <span v-else-if="isNew" class="badge new">Mới</span>
      </div>

      <span v-if="!isOut" class="card-stock-pill" title="Sẵn sàng giao hàng">
        <i /> Sẵn hàng
      </span>

      <div class="card-quick-bar">
        <span>Xem chi tiết cấu hình</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </RouterLink>

    <div class="card-info">
      <div class="card-meta">
        <span class="card-vendor">{{ brandLabel }}</span>
        <span v-if="p.cats[0] && p.cats[0].toLowerCase() !== brandLabel.toLowerCase()" class="card-cat-tag">
          {{ p.cats[0] }}
        </span>
      </div>

      <h3 class="card-title">
        <RouterLink :to="`/san-pham/${p.slug}`">{{ p.name }}</RouterLink>
      </h3>

      <div v-if="specChips.length" class="card-specs">
        <span v-for="chip in specChips" :key="chip" class="spec-chip">{{ chip }}</span>
      </div>

      <div class="card-foot">
        <div class="price" :class="{ 'price-sale': isSale }">
          <template v-if="p.price">
            <span class="price-item">{{ formatVnd(p.price) }}</span>
            <s v-if="isSale" class="price-regular">{{ formatVnd(p.regular) }}</s>
          </template>
          <span v-else class="price-item price-contact">{{ p.priceText || 'Liên hệ báo giá' }}</span>
        </div>

        <RouterLink class="card-arrow-btn" :to="`/san-pham/${p.slug}`" :aria-label="`Mua ${p.name}`">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </div>
    </div>
  </article>
</template>
