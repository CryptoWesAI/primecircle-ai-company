# The Observatory as an app

Since 8 September 2026 the site installs on a phone's home screen and can
send notifications. Nothing new runs on the phone beyond the page itself: a
web app manifest, a service worker, and the board's push endpoints.

## Install

- Android, Chrome: open the site; once Chrome offers the install, a small card
  floats at the bottom left, "Install the Observatory", next to the guide.
  Install puts the app on the home screen; "Not now" hides the card for a
  week; inside the installed app it never shows. The browser menu's "Add to
  Home screen" always works too, and the Community page has an Install button. The app opens full screen, dark, with the site's mark
  as its icon. Shortcuts on the icon: Play Gatekeeper, Verify Sable, The Log.
- iPhone, Safari: Share, "Add to Home Screen". Notifications on iOS need the
  page to be installed first (iOS 16.4 and later) and there is no vibration.
- Desktop Chrome and Edge install it too, from the address bar.

Files: `site/manifest.webmanifest`, `site/sw.js` (the service worker),
`site/icons/` (rendered from `sable-mark.svg` by `tools/make-icons.mjs`).
The service worker keeps the shell (page, script, fonts, icons) so the app
opens without a network; every live read (status, board, market, chain)
always goes to the network and is never cached by it.

## Notifications

The bell in the top bar. First tap: the browser asks permission, the phone
subscribes with the push service of its platform, the subscription (an
endpoint URL plus two keys, nothing else) is stored by the board, and a
welcome notification proves the sound. Tap again to turn it off.

A notification has the device's own sound and a short vibration. Web
notifications cannot carry a custom sound file on Android; the phone plays
its default notification sound, as it does for any app.

What sends one:

- **The watcher**, when Sable's whitepaper changes (hourly check, from the
  GitHub Actions run, with the `PUSH_SECRET` repository secret).
- **A deploy with a message**: `bash deploy-to-vps.sh --notify "Title" "Body"`
  sends after the site is verified live.
- **By hand**: `bash contest.sh notify "Title" "Body" [url]`, for contest
  news or anything else worth a sound.

The board's endpoints, behind `/api/game/`: `GET /push/key`,
`POST /push/subscribe`, `POST /push/unsubscribe`, `POST /push/notify` (header
`x-push-secret`). Dead subscriptions (404 or 410 from the push service) are
removed on the next send. `admin.js subs` counts subscribers, `admin.js push`
sends from inside the container.

Secrets live in `/opt/sable-peers/.env` on the VPS only: `PUSH_SECRET`,
`VAPID_PUBLIC`, `VAPID_PRIVATE`. The VAPID subject is the site's URL, so no
address of a person is sent to a push service.

## Limits, stated plainly

- Android plays the default sound; there is no custom sound for web pushes.
- A notification arrives only while the subscription is alive: reinstalling
  the browser or clearing site data drops it, and the bell shows "off".
- The board sends to every subscriber; there are no topics yet. If the
  volume ever annoys, topics (whitepaper, status, contest) are the next step.
