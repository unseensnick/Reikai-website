<script setup lang="ts">
// Tells a reader of the /preview/ docs that they describe the nightly build, with a link to the same
// page in the stable docs. Only the preview build sets `theme.preview`, so the stable site never
// renders it.
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const { theme, site } = useData()
const route = useRoute()

const stableUrl = computed(() => {
  const path = route.path.startsWith(site.value.base) ? route.path.slice(site.value.base.length) : route.path
  return `https://reikai.app/${path.replace(/^\//, '')}`
})
</script>

<template>
  <div v-if="theme.preview" class="preview-banner">
    These docs describe the <strong>Nightly</strong> build, so they include changes not in a stable
    release yet. <a :href="stableUrl">Read this page for the stable release</a>.
  </div>
</template>

<style scoped>
.preview-banner {
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: var(--vp-c-warning-1);
  background-color: var(--vp-c-warning-soft);
}

.preview-banner a {
  color: inherit;
  text-decoration: underline;
}
</style>
