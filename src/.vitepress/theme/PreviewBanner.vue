<script setup lang="ts">
// Tells a reader of the /preview/ docs that they describe the nightly build, with a link to the same
// page in the stable docs. Only the preview build sets `theme.preview`, so the stable site never
// renders it.
//
// VitePress fixes the nav and sidebar to the top of the window and only moves them down by
// --vp-layout-top-height, so the banner has to publish its own height there or the nav draws over it.
// It is fixed too, so that offset stays true while the page scrolls. The height is measured rather than
// hard-coded because the text wraps to more lines on a narrow screen.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRoute } from 'vitepress'

const { theme, site } = useData()
const route = useRoute()
const banner = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined

const stableUrl = computed(() => {
  const path = route.path.startsWith(site.value.base) ? route.path.slice(site.value.base.length) : route.path
  return `${theme.value.siteOrigin}/${path.replace(/^\//, '')}`
})

onMounted(() => {
  if (!banner.value) return
  const root = document.documentElement
  observer = new ResizeObserver(() => {
    root.style.setProperty('--vp-layout-top-height', `${banner.value?.offsetHeight ?? 0}px`)
  })
  observer.observe(banner.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div v-if="theme.preview" ref="banner" class="preview-banner">
    These docs describe the <strong>Nightly</strong> build, so they include changes not in a stable
    release yet. <a :href="stableUrl">Read this page for the stable release</a>.
  </div>
</template>

<style scoped>
.preview-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-layout-top);
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: var(--vp-c-warning-1);
  /* The soft colour is translucent, so lay it over the page background or scrolled text shows through. */
  background: linear-gradient(var(--vp-c-warning-soft), var(--vp-c-warning-soft)), var(--vp-c-bg);
}

.preview-banner a {
  color: inherit;
  text-decoration: underline;
}
</style>

<style>
/* Before the script measures it, so the first paint already leaves room for one line of banner. */
:root:has(.preview-banner) {
  --vp-layout-top-height: 36px;
}
</style>
