// Runs every time a new tab opens.
// Rolls the dice: with probability `settings.probability` (default 0.3),
// play a random clip. Otherwise show a plain, quiet new tab.

(async function () {
  const calm = document.getElementById("calm");
  const stage = document.getElementById("stage");
  const tapHint = document.getElementById("tapHint");

  function startClock() {
    const el = document.getElementById("clock");
    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], {
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

  let settings, clips;
  try {
    [settings, clips] = await Promise.all([getSettings(), getAllClips()]);
  } catch (e) {
    console.error("Random Clip: failed to load data", e);
    return showCalm();
  }

  const roll = Math.random();
  const win = roll < settings.probability;

  if (!win || clips.length === 0) {
    return showCalm();
  }

  // Pick a random clip and play it full-screen.
  const clip = clips[Math.floor(Math.random() * clips.length)];
  const isAudio = (clip.type || "").startsWith("audio/");
  const url = URL.createObjectURL(clip.blob);

  // Loudness: 0–1 is normal (attenuation), above 1 amplifies past the clip's
  // own level using Web Audio (louder + distorted). NOTE: nothing here can
  // exceed the operating system's master volume — that's a hardware/OS limit.
  const loud = typeof settings.volume === "number" ? settings.volume : 1;

  const media = document.createElement(isAudio ? "audio" : "video");
  media.src = url;
  media.autoplay = true;
  media.controls = false;
  media.muted = false;
  media.volume = Math.min(1, loud); // the element itself caps at 1.0
  if (isAudio) stage.classList.add("audio-only");

  // Amplify beyond 100% when asked.
  let audioCtx = null;
  if (loud > 1) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const source = audioCtx.createMediaElementSource(media);
      const gain = audioCtx.createGain();
      gain.gain.value = loud; // e.g. 4 = 400%
      source.connect(gain).connect(audioCtx.destination);
    } catch (e) {
      console.error("Random Clip: boost unavailable", e);
    }
  }
  function resumeCtx() {
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  }

  // Clean up and drop back to a normal tab when the clip finishes.
  media.addEventListener("ended", () => {
    URL.revokeObjectURL(url);
    if (audioCtx) audioCtx.close().catch(() => {});
    showCalm();
  });

  stage.appendChild(media);
  calm.hidden = true;
  stage.hidden = false;

  // Attempt autoplay WITH sound. Chrome may block this on a page the user
  // hasn't engaged with — in which case we wait for the first interaction,
  // which on a fresh new tab is usually a click or keypress moments later.
  function playOnGesture() {
    tapHint.hidden = false;
    const go = () => {
      resumeCtx();
      media
        .play()
        .then(() => {
          tapHint.hidden = true;
        })
        .catch(() => {});
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
    window.addEventListener("pointerdown", go);
    window.addEventListener("keydown", go);
  }

  try {
    await media.play();
    resumeCtx(); // the boost graph can start suspended even when playback isn't blocked
  } catch (err) {
    // Blocked autoplay: fall back to play-on-first-interaction.
    playOnGesture();
  }
})();
