// Settings + clip management UI.

const probEl = document.getElementById("prob");
const probOut = document.getElementById("probOut");
const volEl = document.getElementById("vol");
const volOut = document.getElementById("volOut");
const fileEl = document.getElementById("file");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const statusEl = document.getElementById("status");

let statusTimer;
function flash(msg) {
  statusEl.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (statusEl.textContent = ""), 2500);
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function renderList() {
  const clips = await getAllClips();
  listEl.innerHTML = "";
  emptyEl.hidden = clips.length > 0;
  for (const clip of clips) {
    const li = document.createElement("li");

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML =
      `<div>${escapeHtml(clip.name)}</div>` +
      `<div class="size">${escapeHtml(clip.type || "?")} · ${fmtSize(clip.size || 0)}</div>`;

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "Remove";
    del.addEventListener("click", async () => {
      await deleteClip(clip.id);
      flash("Removed.");
      renderList();
    });

    li.append(meta, del);
    listEl.appendChild(li);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// --- Init ---
(async function () {
  const settings = await getSettings();
  probEl.value = Math.round(settings.probability * 100);
  probOut.textContent = probEl.value + "%";
  volEl.value = Math.round((settings.volume ?? 1) * 100);
  volOut.textContent = volEl.value + "%";
  renderList();
})();

// --- Events ---
probEl.addEventListener("input", () => {
  probOut.textContent = probEl.value + "%";
});
probEl.addEventListener("change", async () => {
  await saveSettings({ probability: Number(probEl.value) / 100 });
  flash("Saved.");
});

volEl.addEventListener("input", () => {
  volOut.textContent = volEl.value + "%";
});
volEl.addEventListener("change", async () => {
  await saveSettings({ volume: Number(volEl.value) / 100 });
  flash("Saved.");
});

fileEl.addEventListener("change", async () => {
  const files = Array.from(fileEl.files || []);
  if (!files.length) return;
  for (const f of files) {
    try {
      await addClip(f);
    } catch (e) {
      flash("Couldn't store " + f.name + " (too large?)");
      console.error(e);
    }
  }
  fileEl.value = "";
  flash(files.length === 1 ? "Clip added." : files.length + " clips added.");
  renderList();
});
