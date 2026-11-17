import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
  { path: '/san-pham', name: 'shop', component: () => import('./pages/ShopPage.vue') },
  { path: '/san-pham/:slug', name: 'product', component: () => import('./pages/ProductPage.vue') },
  { path: '/danh-muc/:slug', name: 'category', component: () => import('./pages/CategoryPage.vue') },
  { path: '/tin-tuc', name: 'posts', component: () => import('./pages/PostsPage.vue') },
  { path: '/tin-tuc/:slug', name: 'post', component: () => import('./pages/PostPage.vue') },
  { path: '/trang/:slug', name: 'page', component: () => import('./pages/StaticPage.vue') },
  { path: '/lien-he', name: 'contact', component: () => import('./pages/ContactPage.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('./pages/NotFoundPage.vue') },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
