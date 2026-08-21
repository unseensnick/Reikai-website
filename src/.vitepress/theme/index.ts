import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import DownloadCards from './DownloadCards.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DownloadCards', DownloadCards)
  },
} satisfies Theme
