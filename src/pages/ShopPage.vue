<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state, normalize } from '../store'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()

const q = ref((route.query.q as string) || '')
const cat = ref((route.query.cat as string) || '')
const brand = ref((route.query.brand as string) || '')
const stock = ref((route.query.stock as string) || '')
const sort = ref((route.query.sort as string) || 'default')
const per = ref(Number(route.query.per) || 24)
const page = ref(Number(route.query.p) || 1)
const mobileFilterOpen = ref(false)

const catOptions = computed(() => {
  const m: Record<string, number> = {}
  state.products.forEach((p) => p.cats.forEach((c) => (m[c] = (m[c] || 0) + 1)))
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
})

const brandOptions = computed(() => {
  const m: Record<string, number> = {}
  state.products.forEach((p) => p.brand && (m[p.brand] = (m[p.brand] || 0) + 1))
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
})

const stockOptions = computed(() => {
  const m: Record<string, number> = {}
  state.products.forEach((p) => (m[p.stock] = (m[p.stock] || 0) + 1))
  const label: Record<string, string> = { in_stock: 'Còn hàng', out_of_stock: 'Hết hàng', contact: 'Liên hệ' }
  return Object.entries(m).map(([k, n]) => ({ name: label[k] || k, value: k, n }))
})

const hasActiveFilters = computed(() => !!(q.value.trim() || cat.value || brand.value || stock.value))

const filtered = computed(() => {
  const needle = normalize(q.value.trim())
  let list = state.products.filter((p) => {
    if (cat.value && !p.cats.includes(cat.value)) return false
    if (brand.value && p.brand !== brand.value) return false
    if (stock.value && p.stock !== stock.value) return false
    if (needle && normalize(`${p.name} ${p.brand} ${p.cats.join(' ')}`).indexOf(needle) < 0) return false
    return true
  })
  if (sort.value === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  else if (sort.value === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
  else if (sort.value === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / per.value)))

const visible = computed(() => {
  const start = (page.value - 1) * per.value
  return filtered.value.slice(start, start + per.value)
})

watch(() => route.query.q, (newQ) => {
  if (typeof newQ === 'string' && newQ !== q.value) {
    q.value = newQ
  }
})

watch([q, cat, brand, stock, sort, per], () => {
  page.value = 1
  syncUrl()
})
watch(page, syncUrl)

function syncUrl() {
  const query: Record<string, string> = {}
  if (q.value.trim()) query.q = q.value.trim()
  if (cat.value) query.cat = cat.value
  if (brand.value) query.brand = brand.value
  if (stock.value) query.stock = stock.value
  if (sort.value !== 'default') query.sort = sort.value
  if (per.value !== 24) query.per = String(per.value)
  if (page.value > 1) query.p = String(page.value)
  router.replace({ path: '/san-pham', query })
}

function reset() {
  q.value = ''
  cat.value = ''
  brand.value = ''
  stock.value = ''
  sort.value = 'default'
  page.value = 1
}
</script>

<template>
  <div class="container">
    <div class="page-hero-banner">
      <div>
        <span class="eyebrow-pill">OFFICIAL STORE CATALOG</span>
        <h1>Tất cả sản phẩm &amp; linh kiện</h1>
        <p>Khám phá toàn bộ hệ sinh thái Mini PC, linh kiện Mini ITX, Dock eGPU OCuLink/USB4 và phụ kiện hiệu năng cao.</p>
      </div>
      <div class="page-hero-stat">
        <strong>{{ filtered.length }}</strong>
        <span>Sản phẩm hiển thị</span>
      </div>
    </div>

    <section class="sec shop">
      <div class="shop-layout">
        <aside class="filters" :class="{ open: mobileFilterOpen }">
          <div class="filters-head">
            <span>Bộ lọc phần cứng</span>
            <button v-if="hasActiveFilters" type="button" class="filter-clear-link" @click="reset">Đặt lại</button>
          </div>

          <div class="fgroup">
            <h4>Tình trạng kho</h4>
            <button :class="{ active: !stock }" @click="stock = ''">Tất cả</button>
            <button v-for="s in stockOptions" :key="s.value" :class="{ active: stock === s.value }" @click="stock = s.value">
              {{ s.name }} <span>{{ s.n }}</span>
            </button>
          </div>

          <div class="fgroup">
            <h4>Thương hiệu</h4>
            <button :class="{ active: !brand }" @click="brand = ''">Tất cả thương hiệu</button>
            <button v-for="b in brandOptions" :key="b.name" :class="{ active: brand === b.name }" @click="brand = b.name">
              {{ b.name }} <span>{{ b.n }}</span>
            </button>
          </div>

          <div class="fgroup">
            <h4>Danh mục</h4>
            <button :class="{ active: !cat }" @click="cat = ''">Tất cả danh mục</button>
            <button v-for="c in catOptions" :key="c.name" :class="{ active: cat === c.name }" @click="cat = c.name">
              {{ c.name }} <span>{{ c.n }}</span>
            </button>
          </div>

          <button class="reset" @click="reset">Xóa toàn bộ lọc</button>
        </aside>

        <div class="shop-main">
          <div class="shop-bar">
            <button type="button" class="btn filter-mobile-btn" @click="mobileFilterOpen = !mobileFilterOpen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Bộ lọc
            </button>
            <input v-model="q" type="search" placeholder="Tìm theo tên máy, CPU, GPU, thương hiệu..." aria-label="Tìm kiếm" />
            <select v-model="sort" aria-label="Sắp xếp">
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name">Tên: A - Z</option>
            </select>
            <select v-model.number="per" aria-label="Số sản phẩm mỗi trang">
              <option :value="24">24 / trang</option>
              <option :value="48">48 / trang</option>
              <option :value="96">96 / trang</option>
            </select>
          </div>

          <div v-if="hasActiveFilters" class="active-filters">
            <span v-if="cat" class="filter-chip" @click="cat = ''">Danh mục: {{ cat }} ×</span>
            <span v-if="brand" class="filter-chip" @click="brand = ''">Hãng: {{ brand }} ×</span>
            <span v-if="stock" class="filter-chip" @click="stock = ''">Kho: {{ stock }} ×</span>
            <span v-if="q" class="filter-chip" @click="q = ''">Từ khóa: "{{ q }}" ×</span>
          </div>

          <div class="grid">
            <ProductCard v-for="p in visible" :key="p.id" :p="p" />
          </div>
          <div v-if="!visible.length" class="empty-state">
            <p class="empty-note">Không tìm thấy sản phẩm phù hợp với tiêu chí lọc hiện tại.</p>
            <button type="button" class="btn primary btn-pill" @click="reset">Xóa bộ lọc</button>
          </div>

          <nav v-if="totalPages > 1" class="pager">
            <button class="pg" :disabled="page === 1" @click="page--">‹</button>
            <button v-for="n in totalPages" :key="n" class="pg" :class="{ active: n === page }" @click="page = n">
              {{ n }}
            </button>
            <button class="pg" :disabled="page === totalPages" @click="page++">›</button>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>
