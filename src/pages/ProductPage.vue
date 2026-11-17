<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getProduct,
  state,
  productsInCategory,
  formatVnd,
  catById,
  getProductBrand,
  extractSpecChips,
} from '../store'
import type { ProductDetail } from '../types'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const detail = ref<ProductDetail | null>(null)
const mainImg = ref('')
const variant = ref('')

watch(() => route.params.slug, async (slug) => {
  detail.value = null
  const d = await getProduct(slug as string)
  detail.value = d
  mainImg.value = d.imgs[0] || ''
  const firstVar = d.variants?.[0]?.attributes.map((a) => a.value).join(' / ') || ''
  variant.value = firstVar
  document.title = d.name + ' - PCNGON'
}, { immediate: true })

const isSale = computed(() => !!detail.value?.price && (detail.value?.regular || 0) > detail.value!.price)
const salePercent = computed(() => {
  const d = detail.value
  if (!d || !isSale.value) return 0
  return Math.round((1 - d.price / d.regular) * 100)
})
const stockLabel = computed(() => ({
  in_stock: 'Sẵn hàng tại kho',
  out_of_stock: 'Tạm hết hàng',
  contact: 'Liên hệ kiểm tra kho',
}[detail.value?.stock || 'contact']))

const brandName = computed(() => (detail.value ? getProductBrand(detail.value) : ''))
const specChips = computed(() => (detail.value ? extractSpecChips(detail.value.name, 5) : []))

const variantLabels = computed(() =>
  (detail.value?.variants || []).map((v) => v.attributes.map((a) => a.value).join(' / ')).filter(Boolean),
)

const currentImgIndex = computed(() => {
  if (!detail.value || !detail.value.imgs.length) return 0
  const idx = detail.value.imgs.indexOf(mainImg.value)
  return idx >= 0 ? idx : 0
})

function stepImg(delta: number) {
  if (!detail.value || detail.value.imgs.length < 2) return
  const len = detail.value.imgs.length
  const next = (currentImgIndex.value + delta + len) % len
  mainImg.value = detail.value.imgs[next]
}

const related = computed(() => {
  if (!detail.value) return []
  return productsInCategory(detail.value.catIds[0] || 0)
    .filter((p) => p.slug !== detail.value!.slug)
    .slice(0, 4)
})

const specRows = computed(() => Object.entries(detail.value?.specs || {}))
const hotlineHref = computed(() => `tel:${(state.contact?.hotline || '').replace(/\s/g, '')}`)
</script>

<template>
  <div class="container">
    <nav v-if="detail" class="crumbs">
      <ol>
        <li><RouterLink to="/">Trang chủ</RouterLink></li>
        <li v-for="cid in detail.catIds" :key="cid">
          <RouterLink v-if="catById[cid]" :to="`/danh-muc/${catById[cid].slug}`">{{ catById[cid].name }}</RouterLink>
        </li>
        <li>{{ detail.name }}</li>
      </ol>
    </nav>

    <div v-if="!detail" class="boot"><div class="spinner" /></div>

    <div v-else class="product">
      <div class="gallery">
        <div class="gmain">
          <img :src="mainImg" :alt="detail.name" />
          <template v-if="detail.imgs.length > 1">
            <button type="button" class="gnav prev" aria-label="Ảnh trước" @click="stepImg(-1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <button type="button" class="gnav next" aria-label="Ảnh tiếp theo" @click="stepImg(1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6" /></svg>
            </button>
            <span class="gcount">{{ currentImgIndex + 1 }} / {{ detail.imgs.length }}</span>
          </template>
        </div>

        <div v-if="detail.imgs.length > 1" class="thumbs">
          <button
            v-for="(u, n) in detail.imgs"
            :key="n"
            type="button"
            class="thumb"
            :class="{ active: mainImg === u }"
            :aria-label="`Ảnh ${n + 1}`"
            @click="mainImg = u"
          >
            <img :src="u" :alt="`${detail.name} ${n + 1}`" loading="lazy" />
          </button>
        </div>
      </div>

      <div class="pinfo">
        <div class="pmeta-row">
          <span v-if="brandName" class="pvendor-badge">{{ brandName }}</span>
          <span class="pstock" :class="detail.stock">
            <i aria-hidden="true" />
            {{ stockLabel }}
          </span>
          <span class="psku">SKU: {{ detail.sku || detail.id }}</span>
        </div>

        <h1>{{ detail.name }}</h1>

        <div v-if="specChips.length" class="p-spec-chips">
          <span v-for="chip in specChips" :key="chip" class="spec-chip">{{ chip }}</span>
        </div>

        <div class="p-price-box">
          <div class="price price-lg" :class="{ 'price-sale': isSale }">
            <template v-if="detail.price">
              <span class="price-item">{{ formatVnd(detail.price) }}</span>
              <s v-if="isSale" class="price-regular">{{ formatVnd(detail.regular) }}</s>
              <span v-if="isSale" class="badge sale inline">Tiết kiệm {{ salePercent }}%</span>
            </template>
            <span v-else class="price-item price-contact">{{ detail.priceText || 'Liên hệ báo giá' }}</span>
          </div>
          <p class="ptax">Giá linh kiện có thể biến động theo thị trường. Liên hệ CSKH để nhận ưu đãi tốt nhất hôm nay.</p>
        </div>

        <div v-if="variantLabels.length" class="variant-picker">
          <span class="vlabel">Cấu hình / Phiên bản<template v-if="variant">: <b>{{ variant }}</b></template></span>
          <div class="pills">
            <button
              v-for="v in variantLabels"
              :key="v"
              type="button"
              class="pill"
              :class="{ active: variant === v }"
              @click="variant = v"
            >
              {{ v }}
            </button>
          </div>
        </div>

        <div class="pbuttons">
          <a class="btn primary btn-block btn-lg" :href="state.contact?.zalo_oa.url" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            </svg>
            Tư vấn &amp; Đặt hàng qua Zalo OA
          </a>
          <div class="pbuttons-row">
            <a class="btn btn-block" :href="state.contact?.e_commerce.shopee_official" target="_blank" rel="noopener">
              Mua trên Shopee Official ↗
            </a>
            <a class="btn btn-block" :href="hotlineHref">
              Gọi {{ state.contact?.hotline }}
            </a>
          </div>
        </div>

        <div class="p-guarantees">
          <div class="pg-item">
            <strong>Cam kết chính hãng</strong>
            <span>Đầy đủ phụ kiện NSX</span>
          </div>
          <div class="pg-item">
            <strong>Ship COD toàn quốc</strong>
            <span>Đồng kiểm khi nhận hàng</span>
          </div>
          <div class="pg-item">
            <strong>Hỗ trợ kỹ thuật 1-1</strong>
            <span>Tư vấn lắp đặt &amp; tối ưu</span>
          </div>
        </div>

        <div class="accordion">
          <details v-if="specRows.length" open>
            <summary>Thông số kỹ thuật chi tiết</summary>
            <table class="specs">
              <tbody>
                <tr v-for="[k, v] in specRows" :key="k"><th>{{ k }}</th><td>{{ v }}</td></tr>
              </tbody>
            </table>
          </details>
          <details open>
            <summary>Chính sách bảo hành</summary>
            <p>{{ detail.warranty || 'Bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất.' }}</p>
            <RouterLink to="/trang/chinh-sach-bao-hanh">Xem chi tiết quy định bảo hành →</RouterLink>
          </details>
          <details>
            <summary>Vận chuyển &amp; Đổi trả</summary>
            <p>Giao hàng toàn quốc, hỗ trợ thanh toán COD hoặc chuyển khoản. Được kiểm tra ngoại quan trước khi thanh toán.</p>
            <div class="acc-links">
              <RouterLink to="/trang/chinh-sach-van-chuyen">Chính sách vận chuyển →</RouterLink>
              <RouterLink to="/trang/chinh-sach-tra-hang-va-hoan-tien">Chính sách đổi trả →</RouterLink>
            </div>
          </details>
        </div>
      </div>
    </div>

    <section v-if="detail && detail.html" class="sec">
      <div class="p-desc-card">
        <div class="sec-head">
          <div>
            <span class="sec-eyebrow">PRODUCT OVERVIEW</span>
            <h2>Đánh giá &amp; Mô tả chi tiết</h2>
          </div>
        </div>
        <div class="prose" v-html="detail.html" />
      </div>
    </section>

    <section v-if="related.length" class="sec">
      <div class="sec-head">
        <div>
          <span class="sec-eyebrow">RECOMMENDED HARDWARE</span>
          <h2>Sản phẩm cùng phân khúc</h2>
        </div>
      </div>
      <div class="grid">
        <ProductCard v-for="p in related" :key="p.id" :p="p" />
      </div>
    </section>
  </div>
</template>
