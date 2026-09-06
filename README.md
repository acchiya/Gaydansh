# Random Clip New Tab (remote-controlled)

A tiny Chrome extension: **every new tab has a 30% chance of playing a clip.**
The other 70% you get a plain, quiet new tab with a clock.

The twist: the clip and the odds are **controlled remotely from a file on
GitHub**. You edit that one file from your own laptop and your friend's browser
follows within a minute or two — no reinstall, no touching their PC again.

## How it works

- The extension reads **`config.json`** from this repo on every new tab.
- `config.json` says: how often to fire (`probability`), how loud (`volume`),
  and which clip URL(s) to play (`clips`).
- Change that file → your friend's browser picks it up on the next tab or two.

```json
{
  "probability": 0.3,
  "volume": 1,
  "clips": [
    "https://raw.githubusercontent.com/acchiya/Gaydansh/refs/heads/claude/chrome-random-clip-extension-0ssf2u/clips/clip1.mp4"
  ]
}
```

## One-time setup (on your friend's PC)

1. Download this repo: green **Code** button → **Download ZIP** → extract it to
   a permanent folder (e.g. `Documents\newtab`). **Don't delete that folder** —
   Chrome loads the extension live from it.
2. Open **chrome://extensions** → turn on **Developer mode** (top-right).
3. Click **Load unpacked** → select the extracted folder (the one with
   `manifest.json` in it).
4. Open a few new tabs to confirm it works and to let Chrome learn to autoplay
   sound. Done — you never need to touch this PC again.

## Add your clip (one time)

1. On GitHub, open the `clips/` folder → **Add file → Upload files** →
   upload your clip as **`clip1.mp4`** → commit.
2. That's it — the default `config.json` already points at `clips/clip1.mp4`.

## Changing things later, from your laptop (the whole point)

Open **`config.json`** on GitHub → pencil (Edit) icon → change values → commit:

- **Change the odds:** set `"probability"` (e.g. `0.5` = 50%, `1` = every tab).
- **Change the volume:** set `"volume"` (`0`–`1`).
- **Swap the clip:** upload a NEW file (e.g. `clip2.mp4`) into `clips/`, then
  change the URL in `"clips"` to match it. Using a new filename makes the change
  land instantly; reusing the same filename can take a few minutes to refresh
  on GitHub's CDN.
- **Multiple clips:** list several URLs in `"clips"` — one is picked at random.

Your friend's browser refreshes its copy in the background, so the new settings
take effect on the next tab or two.

## Read the config caveats before you prank

- **The clip is public.** It lives in a public GitHub repo, so anyone with the
  URL can view it. Fine for memes; **don't use anything private or
  embarrassing.**
- **It needs internet.** If their PC is offline, the extension falls back to the
  last settings it saw (or does nothing on a fresh install).
- **Autoplay with sound:** Chrome may block audio until the page is "engaged."
  On a new tab, if it's blocked, a "Click anywhere" hint shows and the clip
  plays on the first click/keypress. After a few runs Chrome usually autoplays
  on its own.
- **File limits:** GitHub rejects files over 100 MB. Keep clips short — funnier
  anyway. Use a normal **MP4** (video) or **MP3** (audio).
- **If this branch is ever deleted/merged**, update the config URL in the
  extension's options page (and the URLs inside `config.json`) to point at
  wherever the files then live.

## Settings page (on the friend's PC)

chrome://extensions → the extension → **Details → Extension options** (or click
its toolbar icon). It shows which config URL this browser is following and a
**Check now** button to see what's currently live. You normally never need it —
everything is driven from `config.json`.

## Reverting to a normal new tab

Remove the extension from chrome://extensions. The default new tab comes back.
