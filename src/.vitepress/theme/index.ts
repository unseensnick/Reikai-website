import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DownloadCards from './DownloadCards.vue'
import HomeStage from './HomeStage.vue'
import PreviewBanner from './PreviewBanner.vue'
import './style.css'

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
} satisfies Theme
