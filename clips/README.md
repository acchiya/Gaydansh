# clips/

Put your clip file(s) here (e.g. `clip1.mp4`). Then make sure the URL for it
is listed in `../config.json` under `"clips"`.

The default `config.json` already points at `clips/clip1.mp4` on this branch —
so the fastest path is: upload a file named exactly `clip1.mp4` into this folder.

**To swap the clip later without any caching delay:** upload a NEW filename
(e.g. `clip2.mp4`) and change the URL in `config.json` to match. A brand-new
URL updates instantly; reusing the same filename can take a few minutes to
refresh on GitHub's CDN.

Keep clips short and reasonably sized (GitHub rejects files over 100 MB, and
a public repo means anyone with the link can view them — don't upload anything
private).
