---
layout: home

hero:
  name: Reikai
  text: One library for manga and light novels
  tagline: A free and open source reader for Android, built on Mihon.
  image:
    src: /home/libraries.webp
    alt: The Reikai library, showing the manga tab and the novels tab side by side
  actions:
    - theme: brand
      text: Download
      link: /download/
    - theme: alt
      text: Read the docs
      link: /docs/guides/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/unseensnick/Reikai

features:
  - title: Novels sit in the same library
    details: Manga and novels share one library screen, with a chip to show either type or both. Categories, search, history and tracking work the same on each, while the two readers are built separately for what they render.
    icon: <svg viewBox="0 -960 960 960" width="24" height="24" fill="var(--vp-c-indigo-2)" xmlns="http://www.w3.org/2000/svg"><path d="M560-564v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-600q-38 0-73 9.5T560-564Zm0 220v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-380q-38 0-73 9t-67 27Zm0-110v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-490q-38 0-73 9.5T560-454ZM260-320q47 0 91.5 10.5T440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6Zm260 42q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-396q-33-14-68.5-21t-71.5-7q-47 0-93 12t-87 36v394Zm-40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740q51-30 106.5-45T700-800q52 0 102 12t96 36q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59ZM280-494Z"/></svg>
    link: /docs/guides/getting-started
    linkText: Get started
  - title: One series, however many sources
    details: A novel followed on two sites, or a manga on four, is one card with a source switcher. Merge and split by hand when the titles do not match, then read the group as a single chapter list.
    icon: <svg viewBox="0 -960 960 960" width="24" height="24" fill="var(--vp-c-green-2)" xmlns="http://www.w3.org/2000/svg"><path d="M440-160v-326L336-382l-56-58 200-200 200 200-56 58-104-104v326h-80ZM160-600v-120q0-33 23.5-56.5T240-800h480q33 0 56.5 23.5T800-720v120h-80v-120H240v120h-80Z"/></svg>
    link: /docs/multi-source
    linkText: How grouping works
  - title: Suggestions ranked by what you read
    details: Every entry carries a row of similar titles under its description. Reikai reorders that row from the tags on everything you have tracked, so the front of it comes out of your own library.
    icon: <svg viewBox="0 -960 960 960" width="24" height="24" fill="var(--vp-c-yellow-2)" xmlns="http://www.w3.org/2000/svg"><path d="m105-233-65-47 200-320 120 140 160-260 109 163q-23 1-43.5 5.5T545-539l-22-33-152 247-121-141-145 233ZM863-40 738-165q-20 14-44.5 21t-50.5 7q-75 0-127.5-52.5T463-317q0-75 52.5-127.5T643-497q75 0 127.5 52.5T823-317q0 26-7 50.5T795-221L920-97l-57 57ZM643-217q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm89-320q-19-8-39.5-13t-42.5-6l205-324 65 47-188 296Z"/></svg>
    link: /docs/related-mangas#your-taste-profile
    linkText: How the taste profile works
  - title: A blocked source, working again
    details: When a source hides behind a Cloudflare challenge the in-app browser cannot clear, Reikai hands that request to a proxy running on your own machine. Off by default, and only the challenges that get that far ever reach it.
    icon: <svg viewBox="0 -960 960 960" width="24" height="24" fill="var(--vp-c-purple-2)" xmlns="http://www.w3.org/2000/svg"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z"/></svg>
    link: /docs/flaresolverr
    linkText: Set up a proxy
---

<div style="max-width: 720px; margin: 3rem auto 0; padding: 0 1.5rem;">

## About

Reikai (霊界, "spirit world") is built on [Mihon](https://mihon.app), which it takes the core reader
from, and started as a fork of [Yōkai](https://mihon.app/forks/Yokai/) before moving across. See
[Related apps](/related/) for the rest of that family.

It is built first for one person's daily reading, so the feature set follows one person's taste and
releases arrive when they arrive. Everything above is real and documented; nothing is a roadmap
promise.

The [documentation](/docs/guides/getting-started) covers both halves: the reading experience
inherited from Mihon, in guides adapted from theirs, and what Reikai adds, which is written down
nowhere else.

</div>
