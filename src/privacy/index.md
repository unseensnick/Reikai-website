---
title: Privacy policy
description: What Reikai stores, what it sends, and what you can turn off.
aside: false
pageClass: page-narrow
editLink: false
lastUpdated: false
---

# Privacy policy

Reikai has no accounts and no server of its own. Your library lives on your device, and the app only
talks to services you point it at.

This page describes the official builds from the [releases page](https://github.com/unseensnick/Reikai/releases).
A build you compile yourself behaves differently where noted.

## What stays on your device

Everything that makes up your library: entries, categories, reading progress and history, downloaded
chapters, and every setting.

Backups are files you create and keep. Nothing uploads them anywhere. One backup option,
**Include sensitive settings**, adds your tracker and source sign-ins to the file, so a backup made
with it on should be treated like a password.

## What leaves your device

**Sources.** Reading anything means fetching it, so the site behind a source sees the requests your
device makes, as any website would. Reikai hosts no content and runs no proxy.

**Extensions and plugins are third-party code with full access to the app.** What a given one sends,
and to whom, is between you and whoever published it. Reikai does not audit them and cannot vouch
for them.

**Trackers.** If you sign in to AniList, MyAnimeList, Kitsu, MangaUpdates, Shikimori or Bangumi, your
reading progress goes to that service, which is the point of tracking. Sign out and it stops.

**Update checks.** The in-app updater asks GitHub whether a newer release exists.

## Crash reports and analytics

Official builds include Firebase Crashlytics and Analytics.

::: warning Both are on by default
You are shown both switches during first-run setup, and they live in <nav to="security-and-privacy">
afterwards, under **Firebase**.
:::

- **Send crash logs** sends an anonymised report when the app crashes: the stack trace and coarse
  device details, not your library.
- **Allow analytics** sends anonymised usage data about which parts of the app get used.

Turning a switch off stops that stream. Neither carries what you read, what is in your library, or
anything you typed.

Both are Google services, and what they do with what they receive is governed by their own terms:
[Firebase Crashlytics](https://firebase.google.com/support/privacy) and
[Google Analytics](https://www.google.com/analytics/terms/), plus
[how Google uses data from apps that use them](https://policies.google.com/technologies/partner-sites).

If you would rather the code not be in the app at all, build it yourself without the
`-Pinclude-telemetry` flag: telemetry is compiled in only when that flag is passed, and the release
workflow passes it. A build without it has nothing to switch off.

## Optional things that talk to other machines

These are off until you set them up:

- A [Cloudflare bypass proxy](/docs/flaresolverr) routes requests through a server **you** run.
- The [related manga](/docs/related-mangas) row asks public tracker endpoints for recommendations,
  and, once you opt in per tracker, reads your tracker library to build a taste profile. That profile
  is stored on your device.
- The built-in [adult sources](/docs/adult-sources) can sync favorites with an account you sign in to.

## Sites this app sends you to

Sources, trackers, and links in these docs go to sites nobody here operates. Their handling of your
data is theirs to describe, and worth reading if it matters to you. That applies to tracker services
such as MyAnimeList and AniList as much as to any source.

## Changes

This page describes the app as it is now, and changes when the app does. It is versioned with the
site, so every revision is in the
[repository](https://github.com/unseensnick/Reikai-website/commits/main/src/privacy/index.md) rather
than replaced silently.

## Questions

Ask in [Q&A](https://github.com/unseensnick/Reikai/discussions/categories/q-a), or open an issue on
[the repository](https://github.com/unseensnick/Reikai/issues).
