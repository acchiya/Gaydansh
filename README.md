# Random Clip New Tab

A tiny Chrome extension: **every time you open a new tab, there's a 30% chance
one of your clips plays full-screen.** The other 70% you get a plain, quiet new
tab with a clock. The chance and volume are adjustable.

Made to be loaded locally (unpacked) — no Chrome Web Store, no accounts, nothing
uploaded anywhere. Clips live only in that browser.

## Install (load unpacked)

1. Download/copy this folder onto the computer.
2. Open **chrome://extensions** in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this folder.
5. Click the extension's icon (or **Details → Extension options**) to open
   settings, then **Add clip(s)** and pick a video or audio file.

That's it. Open new tabs and wait for the 30%.

## Settings

- **Chance** — how often a clip plays on a new tab (default 30%).
- **Volume** — playback volume for the clip.
- **Clips** — add as many as you like; one is picked at random each time.
  Remove any you don't want.

## The one honest caveat: autoplay with sound

Chrome blocks pages from auto-playing audio until you've interacted with them.
On a fresh new tab the extension tries to play with sound immediately; if Chrome
blocks it, a "Click anywhere" hint appears and the clip plays the instant you
click or press a key (which on a new tab is usually a second later anyway).

In practice, after the extension has run a few times Chrome tends to trust it and
sound autoplays on its own. There is no way to *guarantee* silent-to-loud
autoplay without user interaction — that's a browser rule, not a bug here.

## Notes / limits

- Clips are stored in the browser's IndexedDB. Very large files (hundreds of MB)
  may fail to store; keep clips short — it's funnier anyway.
- This replaces Chrome's default new tab page while installed. Remove the
  extension to get the normal new tab back.
- Chrome only. (Works in other Chromium browsers like Edge/Brave with the same
  "load unpacked" steps, but it's untested there.)
