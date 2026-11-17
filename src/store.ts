import { reactive, computed } from 'vue'
import type {
  Product, ProductDetail, Category, Post, PageIndexItem, PageDetail,
  SiteInfo, Contact, Navigation, Homepage,
} from './types'

const BASE = import.meta.env.BASE_URL + 'data/'

async function get<T>(file: string): Promise<T> {
  const res = await fetch(BASE + file)
  if (!res.ok) throw new Error('Cannot load ' + file)
  return res.json()
}

export const state = reactive({
  site: null as SiteInfo | null,
  contact: null as Contact | null,
  nav: null as Navigation | null,
  home: null as Homepage | null,
  products: [] as Product[],
  categories: [] as Category[],
  posts: [] as Post[],
  pages: [] as PageIndexItem[],
  loaded: false,
})

export async function loadAll() {
  if (state.loaded) return
  const [site, contact, nav, home, products, categories, posts, pages] = await Promise.all([
    get<SiteInfo>('site.json'),
    get<Contact>('contact.json'),
    get<Navigation>('navigation.json'),
    get<Homepage>('homepage.json'),
    get<Product[]>('products.json'),
    get<Category[]>('categories.json'),
    get<Post[]>('posts.json'),
    get<PageIndexItem[]>('pages.json'),
  ])
  state.site = site
  state.contact = contact
  state.nav = nav
  state.home = home
  products.forEach((p) => {
    if (!p.brand || !p.brand.trim()) {
      const detected = detectKnownBrand(p.name)
      if (detected) p.brand = detected
    }
  })
  state.products = products
  state.categories = categories
  state.posts = posts
  state.pages = pages
  state.loaded = true
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return get<ProductDetail>('products/' + slug + '.json')
}

export async function getPost(slug: string) {
  return get<{
    slug: string; title: string; date: string; excerpt: string; img: string
    html: string; imgs: string[]
  }>('posts/' + slug + '.json')
}

export async function getPage(slug: string): Promise<PageDetail> {
  return get<PageDetail>('pages/' + slug + '.json')
}

export const pageBySlug = computed(() => {
  const m: Record<string, PageIndexItem> = {}
  state.pages.forEach((p) => (m[p.slug] = p))
  return m
})

// --- derived helpers

export const catBySlug = computed(() => {
  const m: Record<string, Category> = {}
  state.categories.forEach((c) => (m[c.slug] = c))
  return m
})

export const catById = computed(() => {
  const m: Record<number, Category> = {}
  state.categories.forEach((c) => (m[c.id] = c))
  return m
})

export const rootCategories = computed(() =>
  state.categories.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name, 'vi')),
)

/** Products in a category, including all descendants. */
export function productsInCategory(id: number): Product[] {
  const ids = new Set<number>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const c of state.categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return state.products.filter((p) => p.catIds.some((cid) => ids.has(cid)))
}

export function formatVnd(n: number): string {
  if (!n) return ''
  return n.toLocaleString('vi-VN') + ' ₫'
}

export function normalize(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const KNOWN_BRANDS = [
  'Minisforum', 'Beelink', 'Aoostar', 'OneXPlayer', 'GMKtec', 'GPD', 'AYANEO',
  'FEVM', 'GIGABYTE', 'ASUS', 'ROG', 'MSI', 'ASRock', 'Peladn', 'ADT-Link',
  'Jonsbo', 'DeepCool', 'Thermalright', 'Noctua', 'Lian Li', 'Cooler Master',
  'Corsair', 'NZXT', 'Fractal', 'Phanteks', 'SilverStone', 'Chieftec',
  'Metalfish', 'Shiny Snake', 'Acasis', 'UGREEN', 'ORICO', 'Synology',
  'TerraMaster', 'Intel', 'AMD', 'NVIDIA', 'Zotac', 'Colorful', 'GALAX',
  'Sapphire', 'PowerColor', 'XFX', 'Crucial', 'Samsung', 'Kingston', 'Lexar',
  'WD', 'Seagate', 'OSMETA', 'EXP GDC', 'TH3P4G3',
]

export function detectKnownBrand(name: string): string {
  const lower = (name || '').toLowerCase()
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) return b
  }
  return ''
}

export function getProductBrand(p: { name: string; brand?: string; cats?: string[] }): string {
  if (p.brand && p.brand.trim()) return p.brand.trim()
  const detected = detectKnownBrand(p.name)
  if (detected) return detected
  return p.cats?.[0] || 'PCNGON'
}

const SPEC_PATTERNS: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { re: /\b(ryzen\s*(?:ai\s*(?:max\+?\s*)?\d+|9|7|5|3)(?:\s+\d{4}[a-z]{0,2})?)/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(core\s+ultra\s+\d+(?:\s+\d{3}[a-z]*)?|i[3579][-\s]\d{4,5}[a-z]{0,2})/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(rtx\s*\d{4}(?:\s*ti|\s*super|\s*m)?|rx\s*\d{4}[a-z]*(?:\s*xt)?)/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(oculink)\b/i, label: () => 'OCuLink' },
  { re: /\b(thunderbolt\s*[345]|tb[345])\b/i, label: (m) => m[1].replace(/tb/i, 'Thunderbolt ') },
  { re: /\b(usb4|80gbps|40gbps)\b/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(pcie\s*[45]\.0(?:\s*x\d+)?)\b/i, label: (m) => m[1].toUpperCase().replace(/\s+/g, ' ') },
  { re: /\b(ddr5|ddr4|gddr6x?|lpddr5x?)\b/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(\d+\s*gb|\d+\s*tb)\b/i, label: (m) => m[1].toUpperCase().replace(/\s+/g, '') },
  { re: /\b(mini[-\s]?itx|itx|sfx(?:-l)?|matx|m-atx)\b/i, label: (m) => m[1].toUpperCase() },
  { re: /\b(nvme|m\.2|u\.2|nas|10gbe|2\.5g)\b/i, label: (m) => m[1].toUpperCase() },
]

export function extractSpecChips(name: string, max = 3): string[] {
  const chips: string[] = []
  const seen = new Set<string>()
  for (const { re, label } of SPEC_PATTERNS) {
    const m = name.match(re)
    if (m) {
      const val = label(m).trim()
      const key = val.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        chips.push(val)
        if (chips.length >= max) break
      }
    }
  }
  return chips
}
