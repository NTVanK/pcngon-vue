<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { state, productsInCategory, catBySlug, normalize } from '../store'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const sort = ref('default')
const per = ref(24)
const page = ref(1)
const q = ref('')
const selectedBrand = ref('')

const cat = computed(() => catBySlug.value[(route.params.slug as string)])

const kids = computed(() =>
  state.categories.filter((c) => c.parentId === cat.value?.id).sort((a, b) => a.name.localeCompare(b.name, 'vi')),
)

const rawItems = computed(() => (cat.value ? productsInCategory(cat.value.id) : []))

const brandsInCat = computed(() => {
  const m: Record<string, number> = {}
  rawItems.value.forEach((p) => p.brand && (m[p.brand] = (m[p.brand] || 0) + 1))
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
})

const items = computed(() => {
  const needle = normalize(q.value.trim())
  let list = rawItems.value.filter((p) => {
    if (selectedBrand.value && p.brand !== selectedBrand.value) return false
    if (needle && normalize(`${p.name} ${p.brand}`).indexOf(needle) < 0) return false
    return true
  })
  if (sort.value === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  else if (sort.value === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
  else if (sort.value === 'stock') list = [...list].sort((a, b) => (a.stock === 'out_of_stock' ? 1 : 0) - (b.stock === 'out_of_stock' ? 1 : 0))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / per.value)))
const visible = computed(() => items.value.slice((page.value - 1) * per.value, page.value * per.value))

watch([sort, per, q, selectedBrand], () => (page.value = 1))
watch(() => route.params.slug, () => {
  page.value = 1
  q.value = ''
  selectedBrand.value = ''
  if (cat.value) document.title = `${cat.value.name} - PCNGON`
})
</script>

<template>
  <div class="container">
    <nav v-if="cat" class="crumbs">
      <ol>
        <li><RouterLink to="/">Trang chủ</RouterLink></li>
        <li v-if="cat.parentSlug">
          <RouterLink :to="`/danh-muc/${cat.parentSlug}`">{{ state.categories.find(c => c.slug === cat.parentSlug)?.name }}</RouterLink>
        </li>
        <li>{{ cat.name }}</li>
      </ol>
    </nav>

    <section v-if="cat" class="sec cat-page">
      <div class="page-hero-banner">
        <div>
          <span class="eyebrow-pill">HARDWARE SERIES</span>
          <h1>{{ cat.name }}</h1>
          <p v-if="cat.desc" class="cdesc">{{ cat.desc }}</p>
          <p v-else class="cdesc">Danh mục sản phẩm {{ cat.name }} chính hãng, tối ưu hiệu năng và độ bền tại PCNGON.</p>
        </div>
        <div class="page-hero-stat">
          <strong>{{ items.length }}</strong>
          <span>Sản phẩm</span>
        </div>
      </div>

      <div v-if="kids.length" class="subcats">
        <span class="subcats-label">Danh mục con:</span>
        <RouterLink v-for="k in kids" :key="k.id" :to="`/danh-muc/${k.slug}`">
          {{ k.name }} <span>{{ k.count }}</span>
        </RouterLink>
      </div>

      <div v-if="brandsInCat.length > 1" class="subcats">
        <span class="subcats-label">Thương hiệu:</span>
        <button type="button" class="subcat-pill" :class="{ active: !selectedBrand }" @click="selectedBrand = ''">
          Tất cả
        </button>
        <button
          v-for="b in brandsInCat.slice(0, 10)"
          :key="b.name"
          type="button"
          class="subcat-pill"
          :class="{ active: selectedBrand === b.name }"
          @click="selectedBrand = selectedBrand === b.name ? '' : b.name"
        >
          {{ b.name }} <span>{{ b.n }}</span>
        </button>
      </div>

      <div class="shop-bar">
        <input v-model="q" type="search" :placeholder="`Tìm nhanh trong ${cat.name}...`" aria-label="Tìm trong danh mục" />
        <select v-model="sort" aria-label="Sắp xếp">
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="stock">Ưu tiên: Còn hàng trước</option>
          <option value="price-asc">Giá: Thấp đến cao</option>
          <option value="price-desc">Giá: Cao đến thấp</option>
        </select>
        <select v-model.number="per" aria-label="Số sản phẩm mỗi trang">
          <option :value="24">24 / trang</option>
          <option :value="48">48 / trang</option>
          <option :value="96">96 / trang</option>
        </select>
      </div>

      <div class="grid">
        <ProductCard v-for="p in visible" :key="p.id" :p="p" />
      </div>
      <p v-if="!items.length" class="empty-note">Danh mục đang được cập nhật hoặc không có sản phẩm khớp bộ lọc.</p>

      <nav v-if="totalPages > 1" class="pager">
        <button class="pg" :disabled="page === 1" @click="page--">‹</button>
        <button v-for="n in totalPages" :key="n" class="pg" :class="{ active: n === page }" @click="page = n">{{ n }}</button>
        <button class="pg" :disabled="page === totalPages" @click="page++">›</button>
      </nav>
    </section>

    <section v-else class="sec">
      <div class="sec-head"><h1>Không tìm thấy danh mục</h1></div>
      <p class="empty-note">Danh mục này không tồn tại hoặc đã được gỡ bỏ.</p>
      <RouterLink class="btn primary btn-pill" to="/san-pham">Xem tất cả sản phẩm</RouterLink>
    </section>
  </div>
</template>
