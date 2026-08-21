<script setup lang="ts">
// Download cards. Same job as Mihon's, deliberately not the same page.
//
// What is different, and why:
//  - The per-architecture APKs are here rather than only on the release page. Mihon sends you to
//    GitHub for them; a user who knows they want arm64 should not have to leave.
//  - Each asset shows its size, because the universal build is roughly three times an ABI-specific
//    one and nothing on the page said so.
//  - No donation line and no contributor avatars: this is a one-person fork and neither is honest.

import { computed, ref } from 'vue'
import { data as releases } from './release.data'

const props = withDefaults(defineProps<{ group?: 'primary' | 'other' }>(), { group: 'primary' })

const expanded = ref<string | null>(null)

interface Channel {
  id: string
  title: string
  description: string
  note?: string
  release: typeof releases.stable
  primary: boolean
}

const channels = computed<Channel[]>(() => {
  const stable: Channel = {
    id: 'stable',
    title: 'Stable',
    description: 'Recommended for most people. Released when a version is finished.',
    note: 'Requires Android 8.0 or higher.',
    release: releases.stable,
    primary: true,
  }
  const nightly: Channel = {
    id: 'nightly',
    title: 'Nightly',
    description: 'Built from the working branch. New things arrive first and break first.',
    note: 'Installs alongside a stable build, so you can run both.',
    release: releases.nightly,
    primary: false,
  }
  return props.group === 'primary' ? [stable] : [nightly]
})

// Identify the universal build by what it is NOT, rather than by its name. The two channels name
// their files differently, `reikai-v0.3.1.apk` for stable and `reikai-r1535.apk` for nightly, so
// matching the version shape picked the wrong asset for one of them and fell through to whichever
// APK GitHub happened to list first. Absence of an ABI token is true for both.
const ABI = /(arm64-v8a|armeabi-v7a|x86_64|x86)/i

function universal(release: Channel['release']) {
  if (!release) return null
  return release.assets.find(a => a.name.endsWith('.apk') && !ABI.test(a.name))
    ?? release.assets.find(a => a.name.endsWith('.apk'))
    ?? null
}

function architectures(release: Channel['release']) {
  if (!release) return []
  return release.assets
    .filter(a => a.name.endsWith('.apk') && ABI.test(a.name))
    .map(a => ({
      label: (a.name.match(ABI)?.[0] ?? a.name).toLowerCase(),
      url: a.browser_download_url,
      size: `${(a.size / 1024 / 1024).toFixed(0)} MB`,
    }))
}

function size(bytes?: number) {
  return bytes ? `${(bytes / 1024 / 1024).toFixed(0)} MB` : ''
}

function released(iso: string | null | undefined) {
  if (!iso) return 'unknown'
  const days = Math.round((Date.now() - Date.parse(iso)) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <div class="rk-dl">
    <section
      v-for="channel in channels"
      :key="channel.id"
      class="rk-card"
      :class="{ primary: channel.primary }"
    >
      <div class="rk-top">
        <div class="rk-id">
          <h3 class="rk-title">
            {{ channel.title }}
            <span class="rk-version">{{ channel.release?.tagName ?? 'unavailable' }}</span>
          </h3>
          <p class="rk-desc">{{ channel.description }}</p>
        </div>

        <a
          v-if="universal(channel.release)"
          class="rk-get"
          :class="{ primary: channel.primary }"
          :href="universal(channel.release)!.browser_download_url"
        >
          Download
          <span class="rk-get-sub">{{ size(universal(channel.release)!.size) }}</span>
        </a>
        <a v-else class="rk-get" :href="`https://github.com/unseensnick/Reikai/releases`">
          Releases on GitHub
        </a>
      </div>

      <div class="rk-meta">
        <span>Released {{ released(channel.release?.publishedAt) }}</span>
        <span v-if="channel.note" class="rk-note">{{ channel.note }}</span>
        <a v-if="channel.release" class="rk-notes-link" :href="channel.release.htmlUrl">Release page</a>
      </div>

      <div v-if="architectures(channel.release).length" class="rk-arch">
        <button class="rk-arch-toggle" type="button" @click="toggle(channel.id)">
          {{ expanded === channel.id ? 'Hide' : 'Show' }} per-architecture builds
        </button>
        <div v-if="expanded === channel.id">
          <p class="rk-arch-hint">
            The download above works on every device. These are smaller if you know your device's
            architecture.
          </p>
          <div class="rk-arch-list">
            <a
              v-for="arch in architectures(channel.release)"
              :key="arch.label"
              class="rk-arch-item"
              :href="arch.url"
            >
              <span class="rk-arch-name">{{ arch.label }}</span>
              <span class="rk-arch-size">{{ arch.size }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rk-dl { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }

.rk-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 20px 22px;
  background: var(--vp-c-bg-soft);
}
.rk-card.primary {
  border-color: var(--vp-c-brand-3);
  background: linear-gradient(180deg, var(--vp-c-brand-soft), var(--vp-c-bg-soft) 70%);
}

.rk-top { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.rk-id { flex: 1 1 240px; }
.rk-title { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: baseline; gap: 10px; }
.rk-version { font-size: 14px; font-weight: 500; color: var(--vp-c-text-2); }
.rk-desc { margin: 4px 0 0; color: var(--vp-c-text-2); font-size: 14px; }

.rk-get {
  display: inline-flex; flex-direction: column; align-items: center;
  padding: 10px 22px; border-radius: 10px; text-decoration: none; white-space: nowrap;
  font-weight: 600; font-size: 15px;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-1);
}
.rk-get.primary { background: var(--vp-c-brand-3); color: #fff; }
.rk-get-sub { font-size: 11px; font-weight: 500; opacity: 0.8; }

.rk-meta {
  display: flex; flex-wrap: wrap; gap: 14px; align-items: center;
  margin-top: 14px; font-size: 13px; color: var(--vp-c-text-3);
}
.rk-note { color: var(--vp-c-text-3); }
.rk-notes-link { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 500; }

.rk-arch { margin-top: 14px; border-top: 1px solid var(--vp-c-divider); padding-top: 12px; }
.rk-arch-toggle {
  background: none; border: 0; padding: 0; cursor: pointer;
  color: var(--vp-c-brand-1); font-size: 13px; font-weight: 500;
}
.rk-arch-hint { margin: 10px 0; font-size: 13px; color: var(--vp-c-text-3); }
/* One row of chips under the hint. They stay on a line at any sensible width, and wrap rather than
   overflow on a narrow phone. */
.rk-arch-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.rk-arch-item {
  display: inline-flex; align-items: baseline; gap: 8px;
  padding: 7px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  text-decoration: none; color: var(--vp-c-text-1); font-size: 13px;
}
.rk-arch-item:hover { border-color: var(--vp-c-brand-1); }
.rk-arch-name { font-family: var(--vp-font-family-mono); }
.rk-arch-size { color: var(--vp-c-text-3); }
</style>
