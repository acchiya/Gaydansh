// Runs every time a new tab opens.
// Reads a small config.json (hosted on GitHub) that says how often to fire and
// which clip(s) to play. You edit that file from your own laptop; this browser
// follows on the next tab or two.
//
// Design: we roll instantly using the LAST config we cached locally (so new
// tabs never stall on the network), and refresh the cache in the background for
// next time. The very first run, with no cache yet, waits briefly for a fetch.

const DEFAULT_CONFIG_URL =
  "https://raw.githubusercontent.com/acchiya/Gaydansh/refs/heads/claude/chrome-random-clip-extension-0ssf2u/config.json";

const HARD_DEFAULT = { probability: 0.3, volume: 1, clips: [] };

function fromStorage(defaults) {
  return new Promise((resolve) => {
    chrome.storage.local.get(defaults, (items) => resolve(items));
  });
}
function toStorage(obj) {
  return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
}

function normalize(cfg) {
  const out = { ...HARD_DEFAULT };
  if (cfg && typeof cfg === "object") {
    if (typeof cfg.probability === "number")
      out.probability = Math.min(1, Math.max(0, cfg.probability));
    if (typeof cfg.volume === "number")
      out.volume = Math.min(1, Math.max(0, cfg.volume));
    if (Array.isArray(cfg.clips))
      out.clips = cfg.clips.filter((u) => typeof u === "string" && u.trim());
  }
  return out;
}

async function fetchConfig(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url + "?cb=" + Date.now(), {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const cfg = normalize(await res.json());
    await toStorage({ lastConfig: cfg });
    return cfg;
  } finally {
    clearTimeout(timer);
  }
}

(async function () {
  const calm = document.getElementById("calm");
  const stage = document.getElementById("stage");
  const tapHint = document.getElementById("tapHint");

  function startClock() {
    const el = document.getElementById("clock");
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    tick();
    setInterval(tick, 1000);
  }
  function showCalm() {
    stage.hidden = true;
    calm.hidden = false;
    startClock();
  }

  const { configUrl, lastConfig } = await fromStorage({
    configUrl: DEFAULT_CONFIG_URL,
    lastConfig: null,
  });

  let config;
  if (lastConfig) {
    // Instant path: use cached config now, refresh in the background.
    config = lastConfig;
    fetchConfig(configUrl).catch(() => {});
  } else {
    // First run: no cache, so wait (briefly) for a real fetch.
    try {
      config = await fetchConfig(configUrl);
    } catch (e) {
      config = HARD_DEFAULT;
    }
  }

  const win = Math.random() < config.probability;
  if (!win || config.clips.length === 0) return showCalm();

  const src = config.clips[Math.floor(Math.random() * config.clips.length)];
  const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(src);

  const media = document.createElement(isAudio ? "audio" : "video");
  media.src = src;
  media.autoplay = true;
  media.controls = false;
  media.volume = config.volume;
  if (isAudio) stage.classList.add("audio-only");

  media.addEventListener("ended", showCalm);
  media.addEventListener("error", () => {
    // Bad URL / offline / 404 — just fall back to a normal tab.
    console.error("Random Clip: could not load", src);
    showCalm();
  });

  stage.appendChild(media);
  calm.hidden = true;
  stage.hidden = false;

  function playOnGesture() {
    tapHint.hidden = false;
    const go = () => {
      media.play().then(() => (tapHint.hidden = true)).catch(() => {});
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
    window.addEventListener("pointerdown", go);
    window.addEventListener("keydown", go);
  }

  try {
    await media.play();
  } catch (err) {
    playOnGesture();
  }
})();
