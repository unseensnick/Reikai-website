---
title: Privacy policy
description: What Reikai stores, what it sends, and what you can turn off.
aside: false
pageClass: page-narrow
editLink: false
lastUpdated: false
---

# Privacy policy

Reikai has no accounts and no server of its own. Your library lives on your device, and apart from the
defaults described below, the app only talks to services you point it at.

This page describes the official builds on the [download page](/download/): Stable, Nightly and FOSS.
A build you compile yourself behaves differently where noted.

## What stays on your device

Everything that makes up your library: entries, categories, reading progress and history, downloaded
chapters, and every setting.

Backups are files on your device: the ones you make go wherever you save them, and automatic ones go to
the backups folder inside your storage folder, every 12 hours unless you change or turn that off. Reikai
never uploads them, but if a cloud app syncs the folder they sit in, it will. One backup option,
**Include sensitive settings**, adds to the file your tracker sign-ins, the bypass proxy's username and
password, and the sign-ins Reikai keeps for its built-in sources and novel plugins; automatic backups
never include it. The settings an extension or plugin keeps for itself, which can hold a username and
password, are saved whenever **Source settings** is included, which it is by default, in automatic
backups too. Treat any backup like a password.

## What leaves your device

**Sources.** Browsing, reading, downloading and checking for new chapters all mean fetching from the
site behind a source, so that site sees the requests your device makes, as any website would. Reikai
hosts no content and runs no proxy.

**Extensions and plugins are third-party code.** An extension runs inside the app with the same access
the app has. A plugin runs in a sandbox, but can still send requests to any site, along with any cookies
the app holds for that site, and can read and change what other plugins have saved, their sign-ins
included. What a given one sends, and to whom, is between you and whoever published it. Reikai does not audit them and cannot vouch for them.

**Trackers.** If you sign in to a tracking service, your reading progress goes to that service, which
is the point of tracking. It sees the entries you bind to it, plus any you add to your library from
that service's own source (a server you run, or the service's own site), which bind automatically.
Signing out stops both. The
[tracking guide](/docs/guides/tracking) lists every service supported. Three in that list, Komga,
Kavita and Suwayomi, are servers you run yourself.

**Update checks.** Each time the app starts, it asks GitHub whether a newer release exists. Nightly asks
its own preview repository. There is no switch for it. A build of your own leaves the updater out unless
you pass `-Penable-updater` or a `-Pdist` other than `local`.

## Crash reports and analytics

The standard APKs include Firebase Crashlytics and Analytics. They only start in the app as it is
published, signed with the release key, on a device with Google Play services.

::: warning Both are on by default
They are on from the first time the app opens, so a crash report or first-launch usage data can be sent
before first-run setup shows you the two switches. After that, they live in
<nav to="security-and-privacy"> under **Analytics and Crash logs**.
:::

- **Send crash logs** sends a report when the app crashes: the stack trace with its error message, plus
  device details that Google lists as things like the phone model, Android version, and free memory and
  storage. A report is tied to a random ID for this install, not to your name or any account.
- **Allow analytics** sends only what Google Analytics for Firebase collects on its own, because Reikai
  logs no events of its own and has screen tracking turned off. By Google's description, that is things
  like app opens, session length, app version, device model, Android version and a rough location worked
  out from your connection, tied to a random ID for this install. The advertising ID is not collected.

Turning a switch off stops that stream. Reikai adds nothing of its own to either one: no titles, no
library, nothing you typed. A crash report's error message is whatever the failing code wrote, though,
so now and then it includes a web address, which on some sources names the series that was open.

Both are Google services, and what they do with what they receive is governed by their own terms:
[Firebase Crashlytics](https://firebase.google.com/support/privacy) and
[Google Analytics](https://www.google.com/analytics/terms/), plus
[how Google uses data from apps that use them](https://policies.google.com/technologies/partner-sites).

If you would rather the code not be in the app at all, install the **FOSS** APK from the
[download page](/download/): it is built without telemetry, so it has nothing to switch off. It installs
as a separate app. A plain build of your own, with no `-Pinclude-telemetry` flag and no `-Pdist=github`
or `-Pdist=ci`, gives the same.

## Optional things that talk to other machines

The [related manga](/docs/related-mangas) row is on by default. To fill it, Reikai sends the title of the
manga you open, or its id on a tracker you bound it to, to the current source and to public tracker
services: AniList, MangaUpdates, Shikimori, and Jikan, an unofficial public API for MyAnimeList. It does
this without signing you in to anything. In its settings, **Show related manga** turns the whole row
off, and **Tracker recommendations** turns off the tracker part.

These are off until you set them up:

- A [Cloudflare bypass proxy](/docs/flaresolverr) routes requests through a server **you** run.
- The related manga taste profile, which reads your library from the trackers you opt in to. The profile
  is stored on your device, but the related row then uses it to send requests: it searches the current
  source for the series' genres you like most, and asks the trackers for titles like your top-rated ones.
- The built-in [adult sources](/docs/adult-sources) can back up your favorites to your account on
  that site (a one-way push, off by default).
- Browsing or adding a novel reader font from Google Fonts fetches the font list and the font from Google.
- DNS over HTTPS, in <nav to="advanced">, sends most of the site names the app looks up, manga and novel
  sources included, to the provider you pick.

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
