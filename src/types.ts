export interface Product {
  id: number
  slug: string
  name: string
  brand: string
  cats: string[]
  catIds: number[]
  price: number
  regular: number
  priceText: string
  stock: 'in_stock' | 'out_of_stock' | 'contact'
  badges: string[]
  img: string
  imgs: string[]
  url: string
}

export interface ProductDetail extends Omit<Product, 'badges' | 'img'> {
  sku: string | null
  variants: { name: string; attributes: { name: string; value: string }[] }[]
  specs: Record<string, string>
  warranty: string
  html: string
}

export interface Category {
  id: number
  slug: string
  name: string
  parentId: number | null
  parentSlug: string | null
  children: number[]
  count: number
  desc: string
}

export interface Post {
  id: number
  slug: string
  title: string
  date: string
  excerpt: string
  img: string
  url: string
}

export interface PageIndexItem {
  id: number
  slug: string
  title: string
  group: string
}

export interface PageDetail extends PageIndexItem {
  html: string
}

export interface SiteInfo {
  site_name: string
  slogan: string
  seo_description: string
  url: string
  logo_url: string
  favicon_url: string
  notice_banner: { text: string; action: string }
  company: Record<string, string>
}

export interface Contact {
  hotline: string
  zalo_oa: { name: string; url: string }
  email: string
  social_channels: Record<string, string>
  e_commerce: Record<string, string>
  communities: { name: string; url: string; platform: string }[]
  address: { full_address: string; map_url: string; type: string }
}

export interface Navigation {
  header_nav: { title: string; url: string; badge?: string }[]
  category_menu: { title: string; url: string; slug: string }[]
  footer_customer_support: { title: string; url: string }[]
  footer_policies: { title: string; url: string }[]
}

export interface Homepage {
  sections: {
    id: string
    type: string
    title?: string
    items?: { title: string; description: string; image_desktop: string; link: string }[]
    categories?: { slug: string; name: string; image: string }[]
    category_slug?: string
  }[]
}
