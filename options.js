// Settings UI for the remote-controlled version.
// The only real setting stored on THIS machine is the config URL. Everything
// else (probability, volume, clips) lives in the remote config.json.

const DEFAULT_CONFIG_URL =
  "https://raw.githubusercontent.com/acchiya/Gaydansh/refs/heads/claude/chrome-random-clip-extension-0ssf2u/config.json";

const urlEl = document.getElementById("url");
const saveEl = document.getElementById("save");
const checkEl = document.getElementById("check");
const liveEl = document.getElementById("live");
const testEl = document.getElementById("test");
const statusEl = document.getElementById("status");
const preview = document.getElementById("preview");

let statusTimer;
function flash(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "#9ad29a" : "#ff9a9a";
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (statusEl.textContent = ""), 3000);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function get(defaults) {
  return new Promise((r) => chrome.storage.local.get(defaults, r));
}
function set(obj) {
  return new Promise((r) => chrome.storage.local.set(obj, r));
}

let lastClips = [];

async function check() {
  const url = urlEl.value.trim();
  if (!url) return flash("Enter a config URL first.", false);
  liveEl.textContent = "Checking…";
  testEl.hidden = true;
  try {
    const res = await fetch(url + "?cb=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const cfg = await res.json();
    const prob = Math.round((Number(cfg.probability) || 0) * 100);
    const vol = Math.round((Number(cfg.volume ?? 1)) * 100);
    const clips = Array.isArray(cfg.clips) ? cfg.clips : [];
    lastClips = clips;

    liveEl.innerHTML =
      `<div class="stat"><b>${prob}%</b> chance a clip plays</div>` +
      `<div class="stat"><b>${vol}%</b> volume</div>` +
      `<div class="stat"><b>${clips.length}</b> clip(s):</div>` +
      (clips.length
        ? `<ul class="cliplist">${clips
            .map((c) => `<li>${escapeHtml(c)}</li>`)
            .join("")}</ul>`
        : `<p class="warn">No clips listed — nothing will ever play.</p>`);

    testEl.hidden = clips.length === 0;
    flash("Config loaded.");
    // Cache it so new tabs use the fresh values immediately.
    await set({
      lastConfig: {
        probability: Math.min(1, Math.max(0, Number(cfg.probability) || 0)),
        volume: Math.min(1, Math.max(0, Number(cfg.volume ?? 1))),
        clips: clips.filter((c) => typeof c === "string"),
      },
    });
  } catch (e) {
    liveEl.innerHTML = `<p class="warn">Couldn't load config: ${escapeHtml(
      e.message
    )}</p><p class="hint">Check the URL is the <b>raw</b> GitHub link and the file exists.</p>`;
    flash("Fetch failed.", false);
  }
}

(async function () {
  const { configUrl } = await get({ configUrl: DEFAULT_CONFIG_URL });
  urlEl.value = configUrl;
  check();
})();

saveEl.addEventListener("click", async () => {
  const url = urlEl.value.trim();
  if (!url) return flash("URL can't be empty.", false);
  await set({ configUrl: url });
  flash("Saved.");
  check();
});

checkEl.addEventListener("click", check);

testEl.addEventListener("click", () => {
  if (!lastClips.length) return;
  const src = lastClips[0];
  preview.hidden = false;
  preview.src = src;
  preview.controls = true;
  preview.play().catch(() => flash("Autoplay blocked — press play on the video.", false));
});
