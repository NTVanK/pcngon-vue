import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'
const KEY = 'pcngon-theme'

function initial(): Theme {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const theme = ref<Theme>(initial())

watch(theme, (t) => {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}, { immediate: true })

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
