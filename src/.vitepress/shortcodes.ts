// Two shortcodes for naming in-app UI from a doc.
//
// `<nav to="...">` renders a navigation path as a chain of labelled chips, so a doc can write
// `<nav to="tracking">` and get "More -> Settings -> Tracking".
//
// `<icon name="...">` renders ONE chip for a control that ships as an icon with no text label next
// to it. Reikai has several: the library selection bar draws every action as a bare icon (its title
// is only the accessibility label), so a doc that writes "tap **Merge**" sends the reader hunting
// for a word that is never on screen. The chip shows the glyph they can actually match.
//
// Mechanism and icon paths ported from Mihon's website (MPL-2.0,
// https://github.com/mihonapp/website, .vitepress/config/shortcodes.ts). The map below is Reikai's
// own, because the navigation genuinely differs: Reikai's Updates and History can be one combined
// Recents tab or two separate tabs depending on a setting, and it has entries Mihon does not.

const icons = {
  about: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
  advanced: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" /></svg>',
  appearance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2C17.5,2 22,6 22,11A6,6 0 0,1 16,17H14.2C13.9,17 13.7,17.2 13.7,17.5C13.7,17.6 13.8,17.7 13.8,17.8C14.2,18.3 14.4,18.9 14.4,19.5C14.5,20.9 13.4,22 12,22M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C12.3,20 12.5,19.8 12.5,19.5C12.5,19.3 12.4,19.2 12.4,19.1C12,18.6 11.8,18.1 11.8,17.5C11.8,16.1 12.9,15 14.3,15H16A4,4 0 0,0 20,11C20,7.1 16.4,4 12,4M6.5,10C7.3,10 8,10.7 8,11.5C8,12.3 7.3,13 6.5,13C5.7,13 5,12.3 5,11.5C5,10.7 5.7,10 6.5,10M9.5,6C10.3,6 11,6.7 11,7.5C11,8.3 10.3,9 9.5,9C8.7,9 8,8.3 8,7.5C8,6.7 8.7,6 9.5,6M14.5,6C15.3,6 16,6.7 16,7.5C16,8.3 15.3,9 14.5,9C13.7,9 13,8.3 13,7.5C13,6.7 13.7,6 14.5,6M17.5,10C18.3,10 19,10.7 19,11.5C19,12.3 18.3,13 17.5,13C16.7,13 16,12.3 16,11.5C16,10.7 16.7,10 17.5,10Z" /></svg>',
  browse: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7,17L10.2,10.2L17,7L13.8,13.8L7,17M12,11.1A0.9,0.9 0 0,0 11.1,12A0.9,0.9 0 0,0 12,12.9A0.9,0.9 0 0,0 12.9,12A0.9,0.9 0 0,0 12,11.1M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" /></svg>',
  categories: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z" /></svg>',
  download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13,5V11H14.17L12,13.17L9.83,11H11V5H13M15,3H9V9H5L12,16L19,9H15V3M19,18H5V20H19V18Z" /></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" /></svg>',
  history: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" /></svg>',
  incognito: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3,10C2.76,10 2.55,10.09 2.41,10.25C2.27,10.4 2.21,10.62 2.24,10.86L2.74,13.85C2.82,14.5 3.4,15 4,15H7C7.64,15 8.36,14.44 8.5,13.82L9.56,10.63C9.6,10.5 9.57,10.31 9.5,10.19C9.39,10.07 9.22,10 9,10H3M7,17H4C2.38,17 0.96,15.74 0.76,14.14L0.26,11.15C0.15,10.3 0.39,9.5 0.91,8.92C1.43,8.34 2.19,8 3,8H9C9.83,8 10.58,8.35 11.06,8.96C11.17,9.11 11.27,9.27 11.35,9.45C11.78,9.36 12.22,9.36 12.64,9.45C12.72,9.27 12.82,9.11 12.94,8.96C13.41,8.35 14.16,8 15,8H21C21.81,8 22.57,8.34 23.09,8.92C23.6,9.5 23.84,10.3 23.74,11.11L23.23,14.18C23.04,15.74 21.61,17 20,17H17C15.44,17 13.92,15.81 13.54,14.3L12.64,11.59C12.26,11.31 11.73,11.31 11.35,11.59L10.43,14.37C10.07,15.82 8.56,17 7,17M15,10C14.78,10 14.61,10.07 14.5,10.19C14.42,10.31 14.4,10.5 14.45,10.7L15.46,13.75C15.64,14.44 16.36,15 17,15H20C20.59,15 21.18,14.5 21.25,13.89L21.76,10.82C21.79,10.62 21.73,10.4 21.59,10.25C21.45,10.09 21.24,10 21,10H15Z" /></svg>',
  library: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 20H18V22H4C2.9 22 2 21.1 2 20V6H4V20M22 4V16C22 17.1 21.1 18 20 18H8C6.9 18 6 17.1 6 16V4C6 2.9 6.9 2 8 2H20C21.1 2 22 2.9 22 4M20 4H8V16H20V4M18 6H13V13L15.5 11.5L18 13V6Z" /></svg>',
  more: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z" /></svg>',
  overflow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>',
  reader: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,4H3A2,2 0 0,0 1,6V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V6A2,2 0 0,0 21,4M3,19V6H11V19H3M21,19H13V6H21V19M14,9.5H20V11H14V9.5M14,12H20V13.5H14V12M14,14.5H20V16H14V14.5Z" /></svg>',
  security: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,12H19C18.47,16.11 15.72,19.78 12,20.92V12H5V6.3L12,3.19M12,1L3,5V11C3,16.55 6.84,21.73 12,23C17.16,21.73 21,16.55 21,11V5L12,1Z" /></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>',
  statistics: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m105-233-65-47 200-320 120 140 160-260 109 163q-23 1-43.5 5.5T545-539l-22-33-152 247-121-141-145 233ZM863-40 738-165q-20 14-44.5 21t-50.5 7q-75 0-127.5-52.5T463-317q0-75 52.5-127.5T643-497q75 0 127.5 52.5T823-317q0 26-7 50.5T795-221L920-97l-57 57ZM643-217q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm89-320q-19-8-39.5-13t-42.5-6l205-324 65 47-188 296Z"/></svg>',
  storage: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M120-160v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80-440v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80 280v-160h720v160H120Zm80-40h80v-80h-80v80Z"/></svg>',
  tracking: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z" /></svg>',
  updates: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23,12L20.56,14.78L20.9,18.46L17.29,19.28L15.4,22.46L12,21L8.6,22.47L6.71,19.29L3.1,18.47L3.44,14.78L1,12L3.44,9.21L3.1,5.53L6.71,4.72L8.6,1.54L12,3L15.4,1.54L17.29,4.72L20.9,5.54L20.56,9.22L23,12M20.33,12L18.5,9.89L18.74,7.1L16,6.5L14.58,4.07L12,5.18L9.42,4.07L8,6.5L5.26,7.09L5.5,9.88L3.67,12L5.5,14.1L5.26,16.9L8,17.5L9.42,19.93L12,18.81L14.58,19.92L16,17.5L18.74,16.89L18.5,14.1L20.33,12M11,15H13V17H11V15M11,7H13V13H11V7" /></svg>',
  webview: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z"/></svg>',
  merge: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m256-120-56-56 193-194q23-23 35-52t12-61v-204l-64 63-56-56 160-160 160 160-56 56-64-63v204q0 32 12 61t35 52l193 194-56 56-224-224-224 224Z"/></svg>',
  split: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-160v-304L240-664v104h-80v-240h240v80H296l224 224v336h-80Zm154-376-58-58 128-126H560v-80h240v240h-80v-104L594-536Z"/></svg>',
  filter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"/></svg>',
}

interface NavEntry {
  name: string
  icon?: string
  /** Renders the parent's chip before this one, so a path reads left to right. */
  under?: string
}

const navigation: Record<string, NavEntry> = {
  // Bottom navigation. Reikai can show one combined Recents tab or separate Updates and History
  // tabs, so all three exist and a doc picks whichever it actually means.
  'main_library': { name: 'Library', icon: icons.library },
  'main_recents': { name: 'Recents', icon: icons.updates },
  'main_updates': { name: 'Updates', icon: icons.updates },
  'main_history': { name: 'History', icon: icons.history },
  'main_browse': { name: 'Browse', icon: icons.browse },
  'main_more': { name: 'More', icon: icons.more },

  // Browse
  'sources': { name: 'Sources', under: 'main_browse' },
  'extensions': { name: 'Extensions', under: 'main_browse' },
  'migrate': { name: 'Migrate', under: 'main_browse' },

  // More
  'downloaded-only': { name: 'Downloaded only', icon: icons.download, under: 'main_more' },
  'incognito-mode': { name: 'Incognito mode', icon: icons.incognito, under: 'main_more' },
  'download-queue': { name: 'Download queue', icon: icons.download, under: 'main_more' },
  'categories': { name: 'Categories', icon: icons.categories, under: 'main_more' },
  'statistics': { name: 'Statistics', icon: icons.statistics, under: 'main_more' },
  'data-and-storage': { name: 'Data and storage', icon: icons.storage, under: 'main_more' },
  'batch-add': { name: 'Batch add', icon: icons.library, under: 'main_more' },
  'settings': { name: 'Settings', icon: icons.settings, under: 'main_more' },
  'about': { name: 'About', icon: icons.about, under: 'main_more' },
  'help': { name: 'Help', icon: icons.help, under: 'main_more' },

  // Settings
  'appearance': { name: 'Appearance', icon: icons.appearance, under: 'settings' },
  'library': { name: 'Library', icon: icons.library, under: 'settings' },
  'reader': { name: 'Reader', icon: icons.reader, under: 'settings' },
  'downloads': { name: 'Downloads', icon: icons.download, under: 'settings' },
  'tracking': { name: 'Tracking', icon: icons.tracking, under: 'settings' },
  'browse': { name: 'Browse', icon: icons.browse, under: 'settings' },
  'security-and-privacy': { name: 'Security and privacy', icon: icons.security, under: 'settings' },
  'advanced': { name: 'Advanced', icon: icons.advanced, under: 'settings' },
  // A screen of its own, pushed from the Library settings. It needs an entry so a doc can render the
  // whole path as chips: half a chip chain followed by hand-typed arrows breaks colour mid-path.
  'recommendations': { name: 'Recommendations', under: 'library' },
  // Only present once adult sources are switched on, which is why the docs say so before using it.
  'e-hentai': { name: 'E-Hentai', under: 'settings' },
  'mangadex': { name: 'MangaDex', under: 'settings' },

  // Per-entry menus
  'overflow': { name: 'Overflow', icon: icons.overflow },
  'webview': { name: 'WebView', icon: icons.webview, under: 'overflow' },
  'webview-single': { name: 'WebView', icon: icons.webview },
}

// Icon-only controls, keyed by what a doc would call them. Each name is the control's accessibility
// label in the app, so it stays the word a reader hears from TalkBack even though nothing draws it.
const actions: Record<string, { name: string; icon: string }> = {
  merge: { name: 'Merge', icon: icons.merge },
  unmerge: { name: 'Unmerge', icon: icons.split },
  filter: { name: 'Filter', icon: icons.filter },
}

function chip(name: string, icon?: string): string {
  return `<span class="shortcode navigation">${icon ?? ''}<span class="name">${name}</span></span>`
}

function render(key: string): string {
  const entry = navigation[key]
  if (!entry) {
    // Loud rather than silent: a typo in a doc should be obvious on the page, not a blank.
    return `<strong style="color:var(--vp-c-danger-1)">Unknown navigation "${key}"</strong>`
  }
  const one = chip(entry.name, entry.icon)
  return entry.under ? `${render(entry.under)}${SEPARATOR}${one}` : one
}

// Mihon emits a bare " -> " between chips, which lands outside the coloured span and so renders in
// body text at body colour: the path visibly changes colour at every step. One arrow, styled with
// the chips, reads as a single path.
const SEPARATOR = '<span class="shortcode navigation separator">→</span>'

export default {
  nav: {
    render({ to }: { to: string }) {
      return render(to)
    },
  },
  icon: {
    render({ name }: { name: string }) {
      const action = actions[name]
      if (!action) {
        return `<strong style="color:var(--vp-c-danger-1)">Unknown icon "${name}"</strong>`
      }
      return chip(action.name, action.icon)
    },
  },
}
