<script setup lang="ts">
// The home page's hero: a phone that works, beside the way to get the real one.
//
// Reikai is a sideloaded APK with no store listing, so the page asks for a lot of trust before a
// visitor has seen anything run. The demo answers that with the app's own screens, real ones from
// the README showcase stills (docs/dev/readme-showcase.md in the app repo), wired together with
// tap targets. Screens the stills do not cover have no target, and a tap there shows what does.
//
// Every target is a percentage of the screen, so a re-captured still only moves numbers in SCREENS.
// The stage takes its colour from the screen on it, as the app does from a series' cover.

import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue'
import { withBase } from 'vitepress'
import { data as releases } from './release.data'
import { size, universal } from './release-assets'

type ScreenId =
  | 'library-manga' | 'library-novels' | 'library-all'
  | 'detail-manga' | 'detail-novel'
  | 'reader-manga' | 'reader-novel'
  | 'history'

type Box = [left: number, top: number, width: number, height: number]

interface Target {
  label: string
  box: Box
  /** Where it leads. Left out, it goes back the way the visitor came. */
  to?: ScreenId
  /** A tab or chip: replaces the screen rather than stacking on it. */
  swap?: boolean
  /** The one target worth pointing at on this screen. */
  hint?: boolean
  /** Said on the screen, for a target that covers all of it and so has nothing to point at. */
  caption?: string
}

type Kind = 'all' | 'manga' | 'novels'

interface Screen {
  title: string
  /** The content type on the screen. History shows them together, so it has none. */
  kind?: Kind
  alt: string
  /** The stage colour, as OKLCH chroma and hue. */
  tint: [chroma: number, hue: number]
  targets: Target[]
}

// The chips and tabs are wider than the drawn control, so they stay tappable on a small phone.
const chip = (x: number, width: number, to: ScreenId, label: string, hint = false): Target =>
  ({ label, box: [x, 11.6, width, 5.8], to, swap: true, hint })
const LIBRARY_TAB: Target = { label: 'Open Library', box: [0, 90, 20, 8], to: 'library-all', swap: true }
const HISTORY_TAB: Target = { label: 'Open History', box: [39.4, 90, 20, 8], to: 'history', swap: true }
const BACK: Target = { label: 'Go back', box: [0, 5.6, 13, 5.8] }
const RESUME = (to: ScreenId): Target =>
  ({ label: 'Resume reading', box: [68.8, 90, 28, 6.4], to, hint: true })

// The reader stills have no chrome, so a visitor needs telling how to leave.
const LEAVE_READER: Target = { label: 'Leave the reader', box: [0, 0, 100, 100], caption: 'Tap to go back' }

const chips = [
  chip(3.6, 11, 'library-all', 'Show all'),
  chip(16.4, 17, 'library-manga', 'Show manga'),
  chip(35.2, 17, 'library-novels', 'Show novels'),
]

const SCREENS: Record<ScreenId, Screen> = {
  'library-manga': {
    kind: 'manga',
    title: 'Library, manga',
    alt: 'The Reikai library showing manga covers grouped into categories',
    tint: [0.045, 300],
    targets: [
      ...chips,
      { label: 'Open The Eminence in Shadow', box: [34.8, 24.5, 30, 24.2], to: 'detail-manga', hint: true },
      HISTORY_TAB,
    ],
  },
  'library-novels': {
    kind: 'novels',
    title: 'Library, novels',
    alt: 'The same library showing light novels, in the same layout as the manga',
    tint: [0.04, 220],
    targets: [
      ...chips,
      { label: 'Open Shadow Slave', box: [34.8, 56.3, 30, 22.3], to: 'detail-novel', hint: true },
      HISTORY_TAB,
    ],
  },
  'library-all': {
    kind: 'all',
    title: 'Library, manga and novels together',
    alt: 'The library showing manga and novels mixed in one list',
    tint: [0.035, 260],
    targets: [
      ...chips,
      { label: 'Open The Eminence in Shadow', box: [2.7, 50.2, 30, 24.2], to: 'detail-manga', hint: true },
      HISTORY_TAB,
    ],
  },
  'detail-manga': {
    kind: 'manga',
    title: 'The Eminence in Shadow',
    alt: 'A manga page with its sources listed as chips, a row of related titles and the chapter list',
    tint: [0.055, 22],
    targets: [BACK, RESUME('reader-manga')],
  },
  'detail-novel': {
    kind: 'novels',
    title: 'Shadow Slave',
    alt: 'A novel page with three sources listed as chips above one chapter list',
    tint: [0.02, 240],
    targets: [BACK, RESUME('reader-novel')],
  },
  'reader-manga': {
    kind: 'manga',
    title: 'Reading a manga chapter',
    alt: 'A manga page open in the reader',
    tint: [0.012, 280],
    targets: [LEAVE_READER],
  },
  'reader-novel': {
    kind: 'novels',
    title: 'Reading a novel chapter',
    alt: 'A novel chapter open in the same reader, as text',
    tint: [0.025, 275],
    targets: [LEAVE_READER],
  },
  history: {
    title: 'History',
    alt: 'Reading history with manga and novels in one list',
    tint: [0.05, 262],
    targets: [
      { label: 'Resume Shadow Slave', box: [0, 21.8, 82, 8.6], to: 'reader-novel' },
      { label: 'Resume The Eminence in Shadow', box: [0, 31.6, 82, 8.8], to: 'reader-manga', hint: true },
      LIBRARY_TAB,
    ],
  },
}

interface Link {
  text: string
  href: string
}

// A stop says what it covers per content type, and a type it does not cover has no entry. The tour
// hides the stop for that type rather than pointing at something the app does not have.
interface Stop {
  id: string
  title: string
  body: Partial<Record<Kind, string>>
  link: { all: Link } & Partial<Record<Kind, Link>>
  screens: Partial<Record<Kind, ScreenId>>
  /** What Back returns through when the tour jumped straight to this stop. */
  trail: Partial<Record<ScreenId, ScreenId[]>>
  /** The part of a screen the stop is about. */
  rings?: Partial<Record<ScreenId, Box>>
}

const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'all', label: 'All' },
  { kind: 'manga', label: 'Manga' },
  { kind: 'novels', label: 'Novels' },
]
const LIBRARY: Record<Kind, ScreenId> = { all: 'library-all', manga: 'library-manga', novels: 'library-novels' }
const SOURCE_CHIPS: Box = [2.6, 50, 90, 4.4]

const STOPS: Stop[] = [
  {
    id: 'library',
    title: 'Manga and novels in one library',
    body: {
      all: 'Manga and novels share one library screen, and a chip shows either type or everything together. Categories, search and tracking work the same for each.',
      manga: 'Your manga, in the categories you set up, with search, tracking and updates. The chip keeps novels out of the way until you want them.',
      novels: 'Light novels get the same library as manga, with the same categories, search and tracking. The chip keeps manga out of the way until you want it.',
    },
    link: { all: { text: 'Get started', href: '/docs/guides/getting-started' } },
    screens: LIBRARY,
    trail: {},
  },
  {
    id: 'sources',
    title: 'One series, however many sources',
    body: {
      all: 'A series followed on several sites can be one card with a source switcher. Reikai offers to group a same-titled series as you add it, and you can merge and split by hand.',
      manga: 'A manga on four sites can be one card with a source switcher and one chapter list. Reikai offers to group a same-titled series as you add it, and you can merge and split by hand.',
      novels: 'A novel on three sites can be one card with a source switcher and one chapter list. Reikai offers to group a same-titled series as you add it, and you can merge and split by hand.',
    },
    link: { all: { text: 'How grouping works', href: '/docs/multi-source' } },
    screens: { all: 'detail-manga', manga: 'detail-manga', novels: 'detail-novel' },
    trail: { 'detail-novel': ['library-novels'], 'detail-manga': ['library-manga'] },
    rings: { 'detail-novel': SOURCE_CHIPS, 'detail-manga': [2.6, 50, 63, 4.4] },
  },
  {
    id: 'suggestions',
    title: 'Suggestions ranked by what you read',
    body: {
      all: 'By default, every manga carries a row of similar titles. Let Reikai pull your tracker library and it reorders that row toward the genres you have tracked. Novels have no equivalent yet.',
      manga: 'By default, every manga carries a row of similar titles. Let Reikai pull your tracker library and it reorders that row toward the genres you have tracked.',
    },
    link: { all: { text: 'How the taste profile works', href: '/docs/related-mangas#your-taste-profile' } },
    screens: { all: 'detail-manga', manga: 'detail-manga' },
    trail: { 'detail-manga': ['library-manga'] },
    rings: { 'detail-manga': [1.4, 55.4, 97.2, 28.4] },
  },
  {
    id: 'reader',
    title: 'One reader for pictures and prose',
    body: {
      all: 'Manga and novels open in the same reader, each with settings of its own.',
      manga: 'Read manga paged or as a long strip, with the settings you know from Mihon.',
      novels: 'Novels open in the same reader as manga, drawn as text. Scroll or turn pages, have it read aloud, and pick your own fonts.',
    },
    link: {
      all: { text: 'Manga reader settings', href: '/docs/guides/reader-settings' },
      novels: { text: 'Read about the novel reader', href: '/docs/novel-reader' },
    },
    screens: { all: 'reader-manga', manga: 'reader-manga', novels: 'reader-novel' },
    trail: {
      'reader-novel': ['library-novels', 'detail-novel'],
      'reader-manga': ['library-manga', 'detail-manga'],
    },
  },
  {
    id: 'history',
    title: 'Everything you read, in one history',
    body: {
      all: 'Manga and light novels sit together in History and Updates, with chips to narrow them.',
      manga: 'History and Updates list manga and novels together, and a chip narrows either one to manga.',
      novels: 'History and Updates list manga and novels together, and a chip narrows either one to novels.',
    },
    link: { all: { text: 'How Recents works', href: '/docs/recents' } },
    screens: { all: 'history', manga: 'history', novels: 'history' },
    trail: {},
  },
]

const inStop = (item: Stop, id: ScreenId) => Object.values(item.screens).includes(id)

const screen = ref<ScreenId>('library-all')
const kind = ref<Kind>('all')
const trail = ref<ScreenId[]>([])
const stop = shallowRef(STOPS[0])
const motion = ref<'fade' | 'push' | 'pop'>('fade')
const stops = computed(() => STOPS.filter(item => item.screens[kind.value]))

const current = computed(() => SCREENS[screen.value])
const ring = computed(() => stop.value.rings?.[screen.value])
const stageStyle = computed(() => ({
  '--tint-c': current.value.tint[0],
  '--tint-h': current.value.tint[1],
}))

const taps = ref(0)
const showHints = computed(() => taps.value < 4)
const revealTargets = ref(false)

const stillSrc = (id: ScreenId) => withBase(`/home/demo/${id}.webp`)

// Each promise resolves to its image, which keeps the decoded picture alive for the swap. A failed
// fetch resolves too, so a missing still shows its alt text rather than freezing the phone.
const stills = new Map<ScreenId, Promise<HTMLImageElement>>()
function load(id: ScreenId) {
  if (!stills.has(id)) {
    const image = new Image()
    image.src = stillSrc(id)
    stills.set(id, image.decode().then(() => image, () => image))
  }
  return stills.get(id)!
}

// Longer than the slide, so a double tap cannot land on a target of the screen it just opened. The
// reader's covers the whole screen, which is how Resume used to bounce straight back out.
const SETTLE_MS = 400
let settledAt = 0
let latest = 0
const busy = ref(false)

// The old screen stays until the new one can be painted, so a slow connection never shows a gap.
async function show(to: ScreenId, how: typeof motion.value, path: ScreenId[], restoreFocus = false) {
  const ticket = ++latest
  busy.value = true
  await load(to)
  if (ticket !== latest) return
  busy.value = false
  settledAt = performance.now() + SETTLE_MS
  motion.value = how
  screen.value = to
  trail.value = path
  // A library chip always sets the type. Elsewhere All stays All, since a series has to be one or the
  // other and the tour's All copy covers it.
  const onScreen = SCREENS[to].kind
  if (onScreen && (to === LIBRARY[onScreen] || kind.value !== 'all')) kind.value = onScreen
  if (!inStop(stop.value, to)) stop.value = STOPS.find(item => inStop(item, to))!
  // The button a keyboard user pressed has just gone, which would drop them at the top of the page.
  if (restoreFocus) {
    await nextTick()
    phone.value?.querySelector('button')?.focus()
  }
}

function follow(target: Target, event: MouseEvent) {
  if (performance.now() < settledAt) return
  interacted()
  taps.value++
  const byKeyboard = event.detail === 0
  if (!target.to) show(trail.value.at(-1) ?? LIBRARY[kind.value], 'pop', trail.value.slice(0, -1), byKeyboard)
  else if (target.swap) show(target.to, 'fade', [], byKeyboard)
  else show(target.to, 'push', [...trail.value, screen.value], byKeyboard)
}

function pickKind(next: Kind) {
  kind.value = next
  const open = stop.value.screens[next] ? stop.value : STOPS[0]
  // All has no screen of its own past the library, so a series already open stays open.
  openStop(open, next === 'all' && inStop(open, screen.value) ? screen.value : open.screens[next]!)
}

function openStop(next: Stop, to = next.screens[kind.value]!) {
  interacted()
  stop.value = next
  const path = (next.trail[to] ?? []).map(id => (SCREENS[id].kind && id.startsWith('library') ? LIBRARY[kind.value] : id))
  if (to === screen.value) trail.value = path
  else show(to, 'fade', path)
  // Under a stacked layout the phone can be above the fold by the time a stop is picked.
  if (matchMedia('(max-width: 719px)').matches) phone.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

// A tap on nothing is the visitor asking what works. Answer with the targets, as a prototype does.
let revealTimer: ReturnType<typeof setTimeout>
function missed(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button')) return
  interacted()
  revealTargets.value = true
  clearTimeout(revealTimer)
  revealTimer = setTimeout(() => (revealTargets.value = false), 900)
}

// A still picture of a phone looks like every other screenshot, so the first thing the page does
// is tap each chip once, showing the three views and the tour following them. Nothing moves again
// unless the visitor moves it.
const GHOST_TAPS: { left: number; to: ScreenId }[] = [
  { left: 24.85, to: 'library-manga' },
  { left: 43.7, to: 'library-novels' },
  { left: 9.1, to: 'library-all' },
]
const ghostLeft = ref<number | null>(null)
const touring = ref(false)
let ghostTimer: ReturnType<typeof setTimeout>
function interacted() {
  clearTimeout(ghostTimer)
  ghostLeft.value = null
  touring.value = false
}

function ghostTap(index: number) {
  const tap = GHOST_TAPS[index]
  if (!tap) {
    touring.value = false
    return
  }
  touring.value = true
  ghostLeft.value = tap.left
  ghostTimer = setTimeout(() => {
    ghostLeft.value = null
    show(tap.to, 'fade', [])
    ghostTimer = setTimeout(() => ghostTap(index + 1), 800)
  }, 700)
}

const phone = useTemplateRef<HTMLElement>('phone')
const cta = useTemplateRef<HTMLElement>('cta')

// An Android visitor can install from right here, so the button hands over the file itself, the
// universal build because it runs on every device. Everyone else goes to the download page.
const platform = ref<'android' | 'ios' | 'other'>('other')
const started = ref(false)
const stable = releases.stable
const apk = universal(stable, 'standard')
const direct = computed(() => platform.value === 'android' && apk !== null)
const href = computed(() => (direct.value ? apk!.browser_download_url : withBase('/download/')))
const facts = computed(() => (stable && apk ? `${stable.tagName}, ${size(apk.size)}, Android 8 or newer` : 'Android 8 or newer'))

// The bar takes over from the hero's button once that scrolls away, and gets out of the footer's way.
const ctaOnScreen = ref(true)
const footerOnScreen = ref(false)
const showBar = computed(() => platform.value === 'android' && !ctaOnScreen.value && !footerOnScreen.value)
let observer: IntersectionObserver | undefined

onMounted(() => {
  const ua = navigator.userAgent
  platform.value = /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'other'

  const footer = document.querySelector('.VPFooter')
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === cta.value) ctaOnScreen.value = entry.isIntersecting
      else footerOnScreen.value = entry.isIntersecting
    }
  })
  observer.observe(cta.value!)
  if (footer) observer.observe(footer)

  // Fetched once the page has settled, so the first tap does not land on an empty screen.
  setTimeout(() => {
    for (const id of Object.keys(SCREENS) as ScreenId[]) load(id)
  }, 1200)

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ghostTimer = setTimeout(() => ghostTap(0), 1800)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(ghostTimer)
  clearTimeout(revealTimer)
})

const boxStyle = ([left, top, width, height]: Box) => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
})
</script>

<template>
  <section class="stage" :style="stageStyle">
    <div class="stage-grid">
      <div class="pitch">
        <h1 class="headline">
          <span class="visually-hidden">Reikai: </span>One library for manga and light novels
        </h1>
        <p class="tagline">A free and open source reader for Android, built on Mihon.</p>

        <div ref="cta" class="actions">
          <a class="get" :href="href" @click="started = direct">
            <span class="get-label">Download for Android</span>
            <span class="get-facts">{{ facts }}</span>
          </a>
          <a v-if="direct" class="quiet-link" :href="withBase('/download/')">Other builds</a>
          <a v-else class="quiet-link" href="https://github.com/unseensnick/Reikai">Source on GitHub</a>
        </div>

        <p v-if="started" class="note" role="status">
          When it finishes, open the file. If Android asks, allow your browser to install apps.
        </p>
        <p v-else-if="platform === 'ios'" class="note">
          Reikai is Android only. There is no iPhone or iPad version.
        </p>

        <div class="scan">
          <img :src="withBase('/home/download-qr.svg')" alt="" width="84" height="84">
          <p>On a computer? Scan this to get it on your phone.</p>
        </div>

        <p class="switch">
          Coming from Mihon or a fork?
          <a :href="withBase('/docs/before-you-upgrade')">Your backup restores here.</a>
        </p>
      </div>

      <div ref="phone" class="phone" :data-reveal="revealTargets || undefined">
        <div class="glass" role="group" aria-label="A working demo of the Reikai app" @click="missed">
          <Transition :name="motion">
            <img
              :key="screen"
              class="still"
              :src="stillSrc(screen)"
              :alt="current.alt"
              width="640"
              height="1425"
              decoding="sync"
              fetchpriority="high"
            >
          </Transition>

          <Transition name="ring">
            <div v-if="ring" :key="`ring-${screen}`" class="ring" :style="boxStyle(ring)" />
          </Transition>

          <button
            v-for="target in current.targets"
            :key="`${screen}-${target.label}`"
            type="button"
            class="target"
            :class="{ fill: target.caption }"
            :style="boxStyle(target.box)"
            :aria-label="target.label"
            @click="follow(target, $event)"
          >
            <span v-if="target.hint && showHints && !touring" class="hint" />
            <span v-if="target.caption" class="caption">{{ target.caption }}</span>
          </button>

          <span v-if="ghostLeft !== null" class="ghost-tap" :style="{ left: `${ghostLeft}%` }" aria-hidden="true" />
          <span v-if="busy" class="spinner" aria-hidden="true" />
        </div>
        <p class="visually-hidden" aria-live="polite">Now showing: {{ current.title }}</p>
      </div>

      <div class="tour">
        <h2 class="tour-title">Try it before you install</h2>
        <p class="tour-lead">Those are the app's real screens. Tap the phone, or jump to a stop.</p>
        <div class="flip" role="group" aria-label="Content type">
          <button
            v-for="option in KINDS"
            :key="option.kind"
            type="button"
            :aria-pressed="kind === option.kind"
            @click="pickKind(option.kind)"
          >
            {{ option.label }}
          </button>
        </div>

        <ol class="stops">
          <li v-for="item in stops" :key="item.id" class="stop" :class="{ open: item === stop }">
            <button
              type="button"
              class="stop-head"
              :aria-expanded="item === stop"
              @click="openStop(item)"
            >
              {{ item.title }}
            </button>
            <div class="stop-fold">
              <div class="stop-body">
                <p>{{ item.body[kind] }}</p>
                <a :href="withBase((item.link[kind] ?? item.link.all).href)">{{ (item.link[kind] ?? item.link.all).text }}</a>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <Transition name="bar">
      <div v-show="showBar" class="bar">
        <a class="get" :href="href" @click="started = direct">
          <span class="get-label">Download for Android</span>
          <span class="get-facts">{{ facts }}</span>
        </a>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
/* Lightness comes from the theme and hue from the screen on the phone, so the room changes with
   what is being looked at. Colour here means "where you are", never decoration. */
.stage {
  --ink: oklch(0.95 0.008 var(--tint-h));
  --stage: oklch(0.955 calc(var(--tint-c) * 0.45) var(--tint-h));
  --line: oklch(0.5 0.02 var(--tint-h) / 0.22);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  background-color: var(--stage);
  transition: background-color 0.7s var(--ease);
}
.dark .stage {
  --stage: oklch(0.2 var(--tint-c) var(--tint-h));
}

.stage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'pitch' 'phone' 'tour';
  gap: 36px;
  max-width: 1360px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

/* The pitch */
.pitch { grid-area: pitch; }
.headline {
  font-size: clamp(36px, 10.4vw, 66px);
  line-height: 1.04;
  letter-spacing: -0.035em;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-wrap: balance;
}
.tagline {
  margin-top: 14px;
  font-size: clamp(17px, 1.5vw, 20px);
  line-height: 1.45;
  color: var(--vp-c-text-2);
  max-width: 30ch;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin-top: 24px;
}
.get {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60px;
  padding: 9px 26px 10px;
  border-radius: 10px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  transition: background-color 0.2s;
}
.get:hover { background: var(--vp-button-brand-hover-bg); }
.get:active { background: var(--vp-button-brand-active-bg); }
.get-label { font-size: 17px; font-weight: 700; line-height: 1.3; }
.get-facts { font-size: 13px; line-height: 1.3; opacity: 0.86; font-variant-numeric: tabular-nums; }
.quiet-link,
.switch a,
.stop-body a {
  color: var(--vp-c-text-1);
  text-decoration: underline;
  text-decoration-color: var(--line);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s;
}
.quiet-link { display: inline-block; padding: 12px 0; font-size: 15px; font-weight: 500; }
.quiet-link:hover,
.switch a:hover,
.stop-body a:hover { text-decoration-color: currentColor; }

.note {
  margin-top: 12px;
  max-width: 38ch;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

/* Only a computer needs a way to reach the phone. Hover is the tell: a tablet can install directly. */
.scan { display: none; }
.scan p { font-size: 14px; line-height: 1.45; color: var(--vp-c-text-2); max-width: 22ch; }
.scan img { border-radius: 8px; }
@media (min-width: 960px) and (hover: hover) {
  .scan { display: flex; align-items: center; gap: 14px; margin-top: 32px; }
}

.switch {
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  max-width: 36ch;
}

/* The phone. Sized from the viewport's height on a desktop, so all of it fits without a scroll. */
.phone {
  grid-area: phone;
  justify-self: center;
  width: min(80vw, 340px);
  scroll-margin-top: calc(var(--vp-nav-height) + 12px);
  padding: 7px;
  border-radius: 34px;
  background: oklch(0.15 0.008 var(--tint-h));
  box-shadow:
    0 0 0 1px oklch(0.42 0.015 var(--tint-h)),
    0 30px 60px -24px oklch(0.1 0.04 var(--tint-h) / 0.7);
  transition: box-shadow 0.7s var(--ease);
}
.glass {
  position: relative;
  aspect-ratio: 640 / 1425;
  overflow: hidden;
  border-radius: 28px;
  background: oklch(0.27 0.02 262);
  -webkit-tap-highlight-color: transparent;
}
/* Transparent so a first load does not show the alt text; a screen reader still gets it. */
.still {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: transparent;
}
.target, .ring, .ghost-tap, .spinner { z-index: 3; }

.target {
  position: absolute;
  padding: 0;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.3s, box-shadow 0.3s;
}
/* Not on the reader, whose target is the whole screen, and not on touch, where hover sticks. */
@media (hover: hover) {
  .target:not(.fill):hover { background-color: oklch(0.95 0.01 262 / 0.1); }
}
.target:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: -2px; }
.phone[data-reveal] .target {
  background-color: oklch(0.72 0.1 275 / 0.28);
  box-shadow: inset 0 0 0 1.5px oklch(0.82 0.1 275 / 0.9);
}

.hint {
  position: absolute;
  top: 10%;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: oklch(0.96 0.02 275 / 0.92);
  box-shadow: 0 1px 6px oklch(0.15 0.02 275 / 0.7);
  /* Held back until the screen it sits on has finished arriving. */
  animation: appear 0.24s ease-out 0.36s both, hint 2s var(--ease) 0.6s infinite;
  pointer-events: none;
}
.hint::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid oklch(0.96 0.02 275 / 0.9);
  animation: hint-ring 2s var(--ease) infinite;
}
@keyframes appear { from { opacity: 0; } }
@keyframes hint { 50% { transform: scale(0.82); } }
@keyframes hint-ring {
  from { transform: scale(1); opacity: 0.9; }
  to { transform: scale(2.6); opacity: 0; }
}

.caption {
  position: absolute;
  left: 50%;
  bottom: 6%;
  translate: -50% 0;
  padding: 7px 13px;
  border-radius: 8px;
  background: oklch(0.93 0.012 275);
  color: oklch(0.22 0.015 275);
  box-shadow: 0 2px 10px oklch(0.1 0.01 275 / 0.5);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  animation: appear 0.3s ease-out 0.4s both;
}

/* Only reached when a screen is slow to arrive: the delay keeps a fast one from flashing it. */
.spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 3px solid oklch(0.96 0.02 275 / 0.25);
  border-top-color: oklch(0.96 0.02 275 / 0.95);
  border-radius: 50%;
  animation: appear 0.2s ease-out 0.25s both, spin 0.8s linear infinite;
  pointer-events: none;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ghost-tap {
  position: absolute;
  top: 14.5%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 50%;
  background: oklch(0.96 0.02 275 / 0.4);
  border: 2px solid oklch(0.96 0.02 275 / 0.9);
  animation: ghost 0.7s var(--ease) both;
  pointer-events: none;
}
@keyframes ghost {
  from { transform: scale(1.7); opacity: 0; }
  55% { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0.2; }
}

.ring {
  position: absolute;
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 2px oklch(0.84 0.09 275),
    0 0 0 999px oklch(0.12 0.01 275 / 0.34);
  pointer-events: none;
}
.ring-enter-active { transition: opacity 0.4s var(--ease) 0.2s; }
.ring-leave-active { transition: opacity 0.12s ease-out; }
.ring-enter-from, .ring-leave-to { opacity: 0; }

/* Moving between screens the way the app does. Two screens must never show through each other,
   since two pages of text at once reads as one garbled page: what opens slides in opaque over what
   it covers, and a tab fades out to the bare surface before the next one fades in. */
.fade-leave-active { transition: opacity 0.09s ease-in; }
.fade-enter-active { transition: opacity 0.21s ease-out 0.09s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.push-enter-active, .push-leave-active,
.pop-enter-active, .pop-leave-active { transition: transform 0.36s var(--ease); }
.push-enter-active, .pop-leave-active {
  z-index: 2;
  box-shadow: 0 0 28px oklch(0.1 0.01 262 / 0.55);
}
.push-enter-from, .pop-leave-to { transform: translateX(100%); }
.push-leave-to, .pop-enter-from { transform: translateX(-22%); }

/* The tour */
.tour { grid-area: tour; }
.tour-title {
  font-size: 22px;
  line-height: 1.25;
  letter-spacing: -0.015em;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tour-lead {
  margin-top: 6px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.stops {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--line);
}
.stop { border-bottom: 1px solid var(--line); }
.stop-head {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 12px 0;
  text-align: left;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.2s;
}
.stop-head:hover,
.stop.open .stop-head { color: var(--vp-c-text-1); }
.stop.open .stop-head { font-weight: 600; }
.stop-fold {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition: grid-template-rows 0.34s var(--ease), visibility 0.34s;
}
.stop.open .stop-fold { grid-template-rows: 1fr; visibility: visible; }
.stop-body {
  min-height: 0;
  overflow: hidden;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}
.stop-body p { margin-bottom: 8px; }
.stop-body a { display: inline-block; padding: 4px 0 14px; font-weight: 500; font-size: 14px; }

.flip { display: flex; gap: 6px; margin-top: 14px; }
.flip button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: background-color 0.2s, color 0.2s;
}
.flip button[aria-pressed='true'] {
  background: var(--vp-c-text-1);
  border-color: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}

/* An Android visitor keeps the button in reach once the hero's has scrolled off. */
.bar {
  position: fixed;
  z-index: 20;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
}
.bar .get { display: flex; align-items: center; min-height: 56px; padding: 7px 16px; }
.bar-enter-active, .bar-leave-active { transition: transform 0.3s var(--ease); }
.bar-enter-from, .bar-leave-to { transform: translateY(100%); }

/* Tablet: the phone takes a side and the words stack beside it. */
@media (min-width: 720px) {
  .stage-grid {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'pitch phone' 'tour phone';
    grid-template-rows: auto 1fr;
    gap: 32px 48px;
    padding: 48px 32px 64px;
  }
  .phone { width: min(44vw, 340px); align-self: start; }
  .headline { font-size: clamp(38px, 6vw, 66px); }
}

/* VitePress draws the nav transparent over the top of a home page from this width, so the stage has
   to run under it or the nav sits on a band of plain page. */
@media (min-width: 960px) {
  .stage {
    margin-top: calc(var(--vp-nav-height) * -1);
    padding-top: var(--vp-nav-height);
  }
}

/* Desktop: one viewport, three columns, with the phone as tall as the window allows. */
@media (min-width: 1100px) {
  .stage-grid {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 0.86fr);
    grid-template-areas: 'pitch phone tour';
    grid-template-rows: auto;
    align-items: center;
    gap: clamp(32px, 4.4vw, 72px);
    min-height: calc(100svh - var(--vp-nav-height));
    padding: 12px 40px 28px;
  }
  .phone {
    width: auto;
    height: clamp(560px, calc(100svh - var(--vp-nav-height) - 40px), 800px);
    aspect-ratio: 654 / 1439;
    align-self: center;
  }
  .glass { height: 100%; }
  /* Tall enough for the longest open stop, so opening one does not re-centre the whole column. */
  .tour { min-height: 470px; }
  .bar { display: none; }
}

/* Ultrawide: the hero grows with the docs' size steps rather than sitting small in the middle. */
@media (min-width: 2200px) {
  .stage-grid {
    zoom: 1.3;
    max-width: 1560px;
    min-height: calc((100svh - var(--vp-nav-height)) / 1.3);
  }
  .phone { height: calc((100svh - var(--vp-nav-height) - 52px) / 1.3); max-height: 860px; }
}
@media (min-width: 3000px) {
  .stage-grid {
    zoom: 1.6;
    max-width: 1720px;
    min-height: calc((100svh - var(--vp-nav-height)) / 1.6);
  }
  .phone { height: calc((100svh - var(--vp-nav-height) - 64px) / 1.6); }
}

@media (prefers-reduced-motion: reduce) {
  .stage, .phone, .stop-fold { transition: none; }
  .hint, .hint::after, .caption, .spinner { animation: none; }
  .fade-enter-active, .fade-leave-active,
  .push-enter-active, .push-leave-active,
  .pop-enter-active, .pop-leave-active,
  .ring-enter-active, .ring-leave-active,
  .bar-enter-active, .bar-leave-active { transition: none; }
}
</style>
