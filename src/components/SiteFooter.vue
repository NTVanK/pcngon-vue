<script setup lang="ts">
import { computed } from 'vue'
import { state, rootCategories, pageBySlug } from '../store'

const cats = computed(() => rootCategories.value)
const directRoutes: Record<string, string> = {
  'lien-he': '/lien-he',
  'tin-tuc': '/tin-tuc',
  'san-pham': '/san-pham',
}

function internalTo(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith('pcngon.vn')) return null
    const slug = u.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() || ''
    if (!slug) return '/'
    if (directRoutes[slug]) return directRoutes[slug]
    if (pageBySlug.value[slug]) return `/trang/${slug}`
    return null
  } catch {
    return null
  }
}
</script>

<template>
  <footer v-if="state.site && state.contact && state.nav" class="site-footer">
    <div class="footer-cta-banner">
      <div class="container footer-cta-inner">
        <div class="footer-cta-copy">
          <span class="eyebrow-pill">HỖ TRỢ KỸ THUẬT &amp; BUILD CẤU HÌNH</span>
          <h3>Cần tư vấn Mini PC, Case ITX hay giải pháp Dock eGPU?</h3>
          <p>Đội ngũ kỹ thuật PCNGON sẵn sàng tư vấn cấu hình tối ưu hiệu năng và chi phí cho nhu cầu của bạn.</p>
        </div>
        <div class="footer-cta-actions">
          <a class="btn primary btn-pill" :href="state.contact.zalo_oa.url" target="_blank" rel="noopener">
            Chat Zalo OA ngay
          </a>
          <a class="btn btn-dark-outline btn-pill" :href="`tel:${state.contact.hotline.replace(/\s/g, '')}`">
            Hotline {{ state.contact.hotline }}
          </a>
        </div>
      </div>
    </div>

    <div class="footer-grid">
      <div class="fcol fcol-brand">
        <div class="flogo-wrap">
          <img class="flogo" :src="state.site.logo_url" alt="PCNGON" height="42" />
          <span class="flogo-badge">OFFICIAL</span>
        </div>
        <p class="fslogan">{{ state.site.slogan }}</p>
        <div class="fcontact-cards">
          <div class="fcontact-item">
            <span class="fcontact-label">Kho hàng</span>
            <p>{{ state.contact.address.full_address }} · <a :href="state.contact.address.map_url" target="_blank" rel="noopener">Bản đồ →</a></p>
          </div>
          <div class="fcontact-item">
            <span class="fcontact-label">Liên hệ trực tiếp</span>
            <p>
              <a :href="`tel:${state.contact.hotline.replace(/\s/g, '')}`">{{ state.contact.hotline }}</a>
              · <a :href="`mailto:${state.contact.email}`">{{ state.contact.email }}</a>
            </p>
          </div>
        </div>
      </div>

      <div class="fcol">
        <h4>Hệ sinh thái sản phẩm</h4>
        <ul>
          <li v-for="c in cats" :key="c.id">
            <RouterLink :to="`/danh-muc/${c.slug}`">{{ c.name }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="fcol">
        <h4>Hỗ trợ khách hàng</h4>
        <ul>
          <li v-for="i in state.nav.footer_customer_support.slice(0, 8)" :key="i.url">
            <RouterLink v-if="internalTo(i.url)" :to="internalTo(i.url)!">{{ i.title }}</RouterLink>
            <a v-else :href="i.url" target="_blank" rel="noopener">{{ i.title }}</a>
          </li>
        </ul>
      </div>

      <div class="fcol">
        <h4>Chính sách &amp; Bảo hành</h4>
        <ul>
          <li v-for="i in state.nav.footer_policies.slice(0, 8)" :key="i.url">
            <RouterLink v-if="internalTo(i.url)" :to="internalTo(i.url)!">{{ i.title }}</RouterLink>
            <a v-else :href="i.url" target="_blank" rel="noopener">{{ i.title }}</a>
          </li>
        </ul>
      </div>

      <div class="fcol">
        <h4>Kênh mua sắm &amp; Cộng đồng</h4>
        <ul class="social">
          <li><a :href="state.contact.e_commerce.shopee_official" target="_blank" rel="noopener">Shopee Official Store ↗</a></li>
          <li><a :href="state.contact.e_commerce.lazada" target="_blank" rel="noopener">Lazada Mall / Store ↗</a></li>
          <li><a :href="state.contact.social_channels.facebook" target="_blank" rel="noopener">Facebook Fanpage ↗</a></li>
          <li><a :href="state.contact.social_channels.youtube" target="_blank" rel="noopener">YouTube Channel ↗</a></li>
          <li><a :href="state.contact.social_channels.tiktok" target="_blank" rel="noopener">TikTok Official ↗</a></li>
          <li><a :href="state.contact.social_channels.instagram" target="_blank" rel="noopener">Instagram ↗</a></li>
        </ul>
      </div>
    </div>

    <div class="fbot">
      <div class="fbot-left">
        <p><strong>{{ state.site.company.name }}</strong> · Mã số thuế: {{ state.site.company.tax_code }}</p>
        <p>Giá và tồn kho trên website mang tính tham khảo. Vui lòng liên hệ CSKH để được báo giá chính xác nhất.</p>
      </div>
      <div class="fbot-badges">
        <span class="fbot-pill">CHÍNH HÃNG 100%</span>
        <span class="fbot-pill">SHIP COD TOÀN QUỐC</span>
        <span class="fbot-pill">HỖ TRỢ KỸ THUẬT TRỌN ĐỜI</span>
      </div>
    </div>
  </footer>
</template>
