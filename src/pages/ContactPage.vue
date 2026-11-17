<script setup lang="ts">
import { state } from '../store'
</script>

<template>
  <div class="container">
    <div class="page-hero-banner">
      <div>
        <span class="eyebrow-pill">CUSTOMER SUPPORT &amp; CARE</span>
        <h1>Liên hệ đội ngũ PCNGON</h1>
        <p>Tư vấn cấu hình phần cứng, hỗ trợ kỹ thuật, kiểm tra tồn kho và dịch vụ bảo hành chính hãng.</p>
      </div>
    </div>

    <section v-if="state.contact" class="sec contact">
      <div class="contact-grid">
        <div class="cbox">
          <span class="cbox-tag">HOTLINE HỖ TRỢ</span>
          <p class="big">{{ state.contact.hotline }}</p>
          <p class="cbox-desc">Tư vấn cấu hình &amp; báo giá nhanh</p>
          <a class="btn primary btn-sm btn-pill" :href="`tel:${state.contact.hotline.replace(/\s/g, '')}`">Gọi ngay →</a>
        </div>

        <div class="cbox">
          <span class="cbox-tag">ZALO OFFICIAL ACCOUNT</span>
          <p class="big">{{ state.contact.zalo_oa.name }}</p>
          <p class="cbox-desc">Phản hồi nhanh chóng trong giờ hành chính</p>
          <a class="btn primary btn-sm btn-pill" :href="state.contact.zalo_oa.url" target="_blank" rel="noopener">Chat Zalo OA ↗</a>
        </div>

        <div class="cbox">
          <span class="cbox-tag">EMAIL DOANH NGHIỆP</span>
          <p class="big cbox-email">{{ state.contact.email }}</p>
          <p class="cbox-desc">Hợp tác, báo giá số lượng &amp; hỗ trợ bảo hành</p>
          <a class="btn btn-sm btn-pill" :href="`mailto:${state.contact.email}`">Gửi Email →</a>
        </div>

        <div class="cbox">
          <span class="cbox-tag">ĐỊA CHỈ KHO HÀNG</span>
          <p class="cbox-addr">{{ state.contact.address.full_address }}</p>
          <a class="btn btn-sm btn-pill" :href="state.contact.address.map_url" target="_blank" rel="noopener">Mở Google Maps ↗</a>
        </div>
      </div>

      <div class="contact-panels">
        <div class="cnote">
          <span class="eyebrow-pill">ONLINE STORE CHÍNH THỨC</span>
          <h3>Đặt hàng trực tuyến an toàn &amp; tiện lợi</h3>
          <p>{{ state.site?.company.online_only_note }}</p>
          <div class="pcta">
            <a class="btn primary btn-pill" :href="state.contact.e_commerce.shopee_official" target="_blank" rel="noopener">Shopee Official Store ↗</a>
            <a class="btn primary btn-pill" :href="state.contact.e_commerce.lazada" target="_blank" rel="noopener">Lazada Store ↗</a>
            <a class="btn btn-pill" :href="state.contact.social_channels.facebook" target="_blank" rel="noopener">Facebook Fanpage ↗</a>
          </div>
        </div>

        <div v-if="state.contact.communities.length" class="cnote">
          <span class="eyebrow-pill">CỘNG ĐỒNG ĐAM MÊ SFF &amp; MINI PC</span>
          <h3>Tham gia cộng đồng cùng PCNGON</h3>
          <p>Giao lưu, chia sẻ kinh nghiệm build Mini ITX, tối ưu hiệu năng Mini PC và eGPU.</p>
          <ul class="pinfo-list">
            <li v-for="c in state.contact.communities" :key="c.url">
              <a :href="c.url" target="_blank" rel="noopener">{{ c.name }}</a>
              <span class="comm-badge">{{ c.platform }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
