import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { useRoute } from 'vitepress'
import { h, onMounted, watch } from 'vue'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DownloadCards from './DownloadCards.vue'
import HomeStage from './HomeStage.vue'
import PreviewBanner from './PreviewBanner.vue'
import './style.css'

// With 44 pages the sidebar is taller than any screen, and it opens at the top whichever page you are on.
function revealCurrentPage() {
  const sidebar = document.querySelector('.VPSidebar')
  const current = sidebar?.querySelector('.is-active')
  if (!sidebar || !current) return
  const area = sidebar.getBoundingClientRect()
  const item = current.getBoundingClientRect()
  if (item.top < area.top + 72 || item.bottom > area.bottom - 24) {
    sidebar.scrollTop += item.top - area.top - area.height / 2
  }
}

// VitePress marks the active item after the page renders, so this has to run behind it.
const revealSoon = () => setTimeout(revealCurrentPage, 150)

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h(PreviewBanner),
    'home-hero-before': () => h(HomeStage),
  }),
  enhanceApp({ app }) {
    app.component('DownloadCards', DownloadCards)
    enhanceAppWithTabs(app)
  },
  setup() {
    const route = useRoute()
    onMounted(revealSoon)
    watch(() => route.path, revealSoon)
  },
} satisfies Theme
