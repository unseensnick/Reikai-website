<script setup lang="ts">
// Download cards. Same job as Mihon's, deliberately not the same page.
//
// What is different, and why:
//  - The per-architecture APKs are here rather than only on the release page. Mihon sends you to
//    GitHub for them; a user who knows they want arm64 should not have to leave.
//  - Each asset shows its size, because the universal build is roughly three times an ABI-specific
//    one and nothing on the page said so.
//  - No donation line and no contributor avatars: this is a one-person fork and neither is honest.
//
// The facts sit in labelled slots rather than a sentence. A run-on grey line reads as decoration and
// gets skipped, which is how the version and the release date used to be missed on this page.

import { computed, ref } from 'vue'
// A hand-written href in a Vue template is the one place VitePress does not prefix the site's
// base for you, so this link goes through withBase or it 404s on a project page.
import { withBase } from 'vitepress'
import { data as releases } from './release.data'

const props = withDefaults(defineProps<{ group?: 'primary' | 'other' }>(), { group: 'primary' })

const expanded = ref<string | null>(null)

interface Channel {
  id: string
  title: string
  description: string
  note?: string
  release: typeof releases.stable
  /** Card accent. Stable reads as the recommended one, nightly as the one to think about first. */
  tone: 'brand' | 'warn' | 'plain'
  /** Which build of that release the card offers. */
  flavour: 'standard' | 'foss'
  icon: 'mark' | 'nightly' | 'foss'
}

const channels = computed<Channel[]>(() => {
  const stable: Channel = {
    id: 'stable',
    title: 'Stable',
    description: 'Recommended for most people. Released when a version is finished.',
    note: 'Requires Android 8.0 or higher',
    release: releases.stable,
    tone: 'brand',
    flavour: 'standard',
    icon: 'mark',
  }
  const nightly: Channel = {
    id: 'nightly',
    title: 'Nightly',
    description: 'Built from the working branch. New things arrive first and break first.',
    note: 'Installs alongside a stable build',
    release: releases.nightly,
    tone: 'warn',
    flavour: 'standard',
    icon: 'nightly',
  }
  // Same release as Stable, different build. It is listed as its own channel rather than as a link
  // on the Stable card because choosing it is the same kind of decision as choosing Nightly: it
  // installs as a separate app, so moving to or from it costs a backup and restore.
  const foss: Channel = {
    id: 'foss',
    title: 'FOSS',
    description: 'No crash reporting or analytics compiled in. Built from source, nothing else added.',
    note: 'Installs as a separate app',
    release: releases.stable,
    tone: 'plain',
    flavour: 'foss',
    icon: 'foss',
  }
  return props.group === 'primary' ? [stable] : [nightly, foss]
})

/** The notes shown under the Stable card. Nightly's notes are a per-build diff and belong on GitHub. */
const latest = computed(() => (props.group === 'primary' ? releases.stable : null))

// Identify a build by what it is NOT, rather than by its name. The channels name their files
// differently, `reikai-v0.3.1.apk` for stable and `reikai-r1535.apk` for nightly, so matching the
// version shape picked the wrong asset for one of them. Absence of an ABI token is true for both.
const ABI = /(arm64-v8a|armeabi-v7a|x86_64|x86)/i

// A release ships the FOSS build beside the ordinary one, and it carries no ABI token either, so
// the rule above matched both and took whichever GitHub happened to list first. That silently
// served FOSS as the Stable download, which is a different app: it installs alongside rather than
// over, so moving off it costs a backup and restore. Every card now names the flavour it wants.
const FOSS = /-foss[-.]/i

function universal(release: Channel['release'], flavour: Channel['flavour']) {
  if (!release) return null
  return release.assets.find(
    a => a.name.endsWith('.apk') && !ABI.test(a.name) && FOSS.test(a.name) === (flavour === 'foss'),
  ) ?? null
}

// No per-architecture FOSS builds are published, so that card offers none rather than falling
// through to the ordinary ones, which would hand out a different app than the card promises.
function architectures(release: Channel['release'], flavour: Channel['flavour']) {
  if (!release || flavour === 'foss') return []
  return release.assets
    .filter(a => a.name.endsWith('.apk') && ABI.test(a.name) && !FOSS.test(a.name))
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
      :class="channel.tone"
    >
      <div class="rk-top">
        <span class="rk-badge" :class="channel.tone" aria-hidden="true">
          <span v-if="channel.icon === 'mark'" class="rk-badge-mark" />
          <svg v-else-if="channel.icon === 'nightly'" viewBox="0 -960 960 960" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm80-120h400L544-400H416L280-240Z"/>
          </svg>
          <svg v-else viewBox="0 -960 960 960" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"/>
          </svg>
        </span>

        <div class="rk-id">
          <h3 class="rk-title">{{ channel.title }}</h3>
          <p class="rk-desc">{{ channel.description }}</p>
        </div>

        <dl class="rk-facts">
          <div class="rk-fact">
            <dt>Version</dt>
            <dd class="rk-strong">{{ channel.release?.tagName ?? 'unavailable' }}</dd>
          </div>
          <div class="rk-fact">
            <dt>Released</dt>
            <dd>{{ released(channel.release?.publishedAt) }}</dd>
          </div>
          <div v-if="universal(channel.release, channel.flavour)" class="rk-fact">
            <dt>Size</dt>
            <dd>{{ size(universal(channel.release, channel.flavour)!.size) }}</dd>
          </div>
        </dl>

        <a
          v-if="universal(channel.release, channel.flavour)"
          class="rk-get"
          :class="channel.tone"
          :href="universal(channel.release, channel.flavour)!.browser_download_url"
        >Download</a>
        <a v-else class="rk-get" href="https://github.com/unseensnick/Reikai/releases">
          Releases on GitHub
        </a>
      </div>

      <div class="rk-meta">
        <span v-if="channel.note">{{ channel.note }}</span>
        <a v-if="channel.release" class="rk-notes-link" :href="channel.release.htmlUrl">Release page</a>
        <button
          v-if="architectures(channel.release, channel.flavour).length"
          class="rk-arch-toggle"
          type="button"
          @click="toggle(channel.id)"
        >
          {{ expanded === channel.id ? 'Hide' : 'Show' }} per-architecture builds
        </button>
      </div>

      <div v-if="expanded === channel.id" class="rk-arch">
        <p class="rk-arch-hint">
          The download above works on every device. These are smaller if you know your device's
          architecture.
        </p>
        <div class="rk-arch-list">
          <a
            v-for="arch in architectures(channel.release, channel.flavour)"
            :key="arch.label"
            class="rk-arch-item"
            :href="arch.url"
          >
            <span class="rk-arch-name">{{ arch.label }}</span>
            <span class="rk-arch-size">{{ arch.size }}</span>
          </a>
        </div>
      </div>
    </section>

    <section
      v-if="latest && (latest.summary.shown || latest.summary.highlights.length || latest.summary.alerts.length)"
      class="rk-card rk-log"
    >
      <h3 class="rk-log-title">
        What's new
        <span class="rk-log-version">{{ latest.tagName }}</span>
      </h3>

      <div
        v-for="(alert, i) in latest.summary.alerts"
        :key="`alert-${i}`"
        class="rk-alert"
        :class="alert.kind"
      >
        <p class="rk-alert-kind">{{ alert.kind }}</p>
        <p class="rk-alert-text">{{ alert.text }}</p>
      </div>

      <p v-for="(para, i) in latest.summary.highlights" :key="`hl-${i}`" class="rk-log-para">
        {{ para }}
      </p>

      <div v-for="section in latest.summary.sections" :key="section.title" class="rk-log-section">
        <h4 v-if="section.title" class="rk-log-heading">{{ section.title }}</h4>
        <ul class="rk-log-items">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </div>

      <p class="rk-log-more">
        <template v-if="latest.summary.highlights.length && latest.summary.total">
          {{ latest.summary.total }} changes in this release.
        </template>
        <template v-else-if="latest.summary.total > latest.summary.shown">
          {{ latest.summary.total - latest.summary.shown }} more in this release.
        </template>
        <a :href="withBase('/changelogs/')">Read the full changelog</a>
      </p>
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
.rk-card.brand {
  border-color: var(--vp-c-brand-3);
  background: linear-gradient(180deg, var(--vp-c-brand-soft), var(--vp-c-bg-soft) 70%);
}
/* Nightly is amber for the same reason Mihon's is: it is the one that can break, and the colour
   says so before the description does. */
.rk-card.warn {
  border-color: var(--vp-c-warning-3);
  background: linear-gradient(180deg, var(--vp-c-warning-soft), var(--vp-c-bg-soft) 70%);
}

.rk-top { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; }
.rk-id { flex: 1 1 200px; }

/* A round mark per channel, so the two cards are told apart before either is read. Reikai's own
   icon goes in as a CSS mask rather than an <img>: it then takes the badge's colour and needs no
   second file for the light theme. The mask is the monochrome mark, not the colour favicon: a mask
   reads only alpha, so a full-colour icon would fill the badge as a solid silhouette. */
.rk-badge {
  display: grid; place-items: center; flex: 0 0 auto;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-1);
}
/* Stable's badge is the larger one, the same way Mihon sizes its recommended card up. */
.rk-badge.brand {
  width: 64px; height: 64px;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
}
.rk-badge.warn { background: var(--vp-c-warning-soft); color: var(--vp-c-warning-1); }
.rk-badge-mark {
  width: 38px; height: 38px; background: currentColor;
  mask: url('/mark.svg') center / contain no-repeat;
}
.rk-title { margin: 0; font-size: 20px; font-weight: 700; line-height: 1.2; }
.rk-desc { margin: 4px 0 0; color: var(--vp-c-text-2); font-size: 14px; }

/* The facts a chooser actually compares, each one labelled so the eye lands on the value rather
   than reading a sentence to find it. */
.rk-facts { display: flex; gap: 24px; margin: 0; flex: 0 1 auto; }
.rk-fact { margin: 0; }
.rk-fact dt {
  margin: 0; font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--vp-c-text-3);
}
.rk-fact dd { margin: 2px 0 0; font-size: 15px; color: var(--vp-c-text-1); }
.rk-fact dd.rk-strong { font-weight: 700; }

.rk-get {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 26px; border-radius: 10px; text-decoration: none; white-space: nowrap;
  font-weight: 600; font-size: 15px;
  background: var(--vp-c-default-soft); color: var(--vp-c-text-1);
}
.rk-get.brand { background: var(--vp-c-brand-3); color: #fff; }
.rk-get.warn { background: var(--vp-c-warning-3); color: var(--vp-c-text-1); }

.rk-meta {
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--vp-c-divider);
  font-size: 13px; color: var(--vp-c-text-3);
}
.rk-notes-link { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 500; }
.rk-arch-toggle {
  background: none; border: 0; padding: 0; cursor: pointer;
  color: var(--vp-c-brand-1); font-size: 13px; font-weight: 500;
}

.rk-arch { margin-top: 12px; }
.rk-arch-hint { margin: 0 0 10px; font-size: 13px; color: var(--vp-c-text-3); }
/* One row of chips under the hint. They stay on a line at any sensible width, and wrap rather than
   overflow on a narrow phone. */
.rk-arch-list { display: flex; flex-wrap: wrap; gap: 8px; }
.rk-arch-item {
  display: inline-flex; align-items: baseline; gap: 8px;
  padding: 7px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px;
  text-decoration: none; color: var(--vp-c-text-1); font-size: 13px;
}
.rk-arch-item:hover { border-color: var(--vp-c-brand-1); }
.rk-arch-name { font-family: var(--vp-font-family-mono); }
.rk-arch-size { color: var(--vp-c-text-3); }

.rk-log-title {
  margin: 0; font-size: 17px; font-weight: 700;
  display: flex; align-items: baseline; gap: 10px;
}
.rk-log-version { font-size: 13px; font-weight: 500; color: var(--vp-c-text-3); }
.rk-log-section { margin-top: 14px; }
.rk-log-heading {
  margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--vp-c-text-3);
}
.rk-log-items { margin: 6px 0 0; padding-left: 20px; }
.rk-log-items li { font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); }
.rk-log-more {
  margin: 16px 0 0; padding-top: 12px; border-top: 1px solid var(--vp-c-divider);
  font-size: 13px; color: var(--vp-c-text-3);
}
.rk-log-more a { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 500; }

/* The Highlights block, when a release opens with one. Prose rather than a list, because that is
   what it is: the release explaining itself before the 300-entry changelog does. */
.rk-log-para { margin: 0 0 10px; line-height: 1.6; }

/* GitHub callouts from the notes. The same five colours the app's reader draws them in, so a
   warning looks like the same warning in both places. */
.rk-alert {
  border-left: 3px solid var(--rk-alert);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0 0 12px;
  background: color-mix(in srgb, var(--rk-alert) 10%, transparent);
}
.rk-alert.note { --rk-alert: #0969da; }
.rk-alert.tip { --rk-alert: #1a7f37; }
.rk-alert.important { --rk-alert: #8250df; }
.rk-alert.warning { --rk-alert: #9a6700; }
.rk-alert.caution { --rk-alert: #cf222e; }
.dark .rk-alert.note { --rk-alert: #4493f8; }
.dark .rk-alert.tip { --rk-alert: #3fb950; }
.dark .rk-alert.important { --rk-alert: #ab7df8; }
.dark .rk-alert.warning { --rk-alert: #d29922; }
.dark .rk-alert.caution { --rk-alert: #f85149; }
.rk-alert-kind {
  margin: 0 0 2px; font-size: 13px; font-weight: 600;
  text-transform: capitalize; color: var(--rk-alert);
}
.rk-alert-text { margin: 0; line-height: 1.6; }

@media (max-width: 640px) {
  .rk-top { gap: 14px; }
  .rk-facts { flex: 1 1 100%; gap: 20px; }
  .rk-get { flex: 1 1 100%; }
}
</style>
