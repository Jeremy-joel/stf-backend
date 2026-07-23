function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'save-msg ' + (ok ? 'ok' : 'err');
  setTimeout(() => { el.textContent = ''; }, 3000);
}

/* ---------- Who We Are ---------- */
async function loadWho() {
  const res = await authFetch('/api/content/admin/who-we-are');
  const d = await res.json();
  document.getElementById('w-intro').value = d.intro || '';
  document.getElementById('w-p1t').value = d.pillar1Title || '';
  document.getElementById('w-p1d').value = d.pillar1Desc || '';
  document.getElementById('w-p2t').value = d.pillar2Title || '';
  document.getElementById('w-p2d').value = d.pillar2Desc || '';
  document.getElementById('w-p3t').value = d.pillar3Title || '';
  document.getElementById('w-p3d').value = d.pillar3Desc || '';
  document.getElementById('w-p4t').value = d.pillar4Title || '';
  document.getElementById('w-p4d').value = d.pillar4Desc || '';
  document.getElementById('w-tt').value = d.transformingTitle || '';
  document.getElementById('w-tx').value = d.transformingText || '';
}

document.getElementById('who-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    intro: document.getElementById('w-intro').value,
    pillar1Title: document.getElementById('w-p1t').value,
    pillar1Desc: document.getElementById('w-p1d').value,
    pillar2Title: document.getElementById('w-p2t').value,
    pillar2Desc: document.getElementById('w-p2d').value,
    pillar3Title: document.getElementById('w-p3t').value,
    pillar3Desc: document.getElementById('w-p3d').value,
    pillar4Title: document.getElementById('w-p4t').value,
    pillar4Desc: document.getElementById('w-p4d').value,
    transformingTitle: document.getElementById('w-tt').value,
    transformingText: document.getElementById('w-tx').value
  };
  const res = await authFetch('/api/content/admin/who-we-are', { method: 'PUT', body: JSON.stringify(body) });
  showMsg('who-msg', res.ok ? 'Saved! Your live site will show this on next visit.' : 'Could not save.', res.ok);
});

/* ---------- About ---------- */
async function loadAbout() {
  const res = await authFetch('/api/content/admin/about');
  const d = await res.json();
  document.getElementById('a-vision').value = d.vision || '';
  document.getElementById('a-mission').value = d.mission || '';
  document.getElementById('a-values').value = d.values || '';
  document.getElementById('a-objectives').value = d.objectives || '';
}

document.getElementById('about-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    vision: document.getElementById('a-vision').value,
    mission: document.getElementById('a-mission').value,
    values: document.getElementById('a-values').value,
    objectives: document.getElementById('a-objectives').value
  };
  const res = await authFetch('/api/content/admin/about', { method: 'PUT', body: JSON.stringify(body) });
  showMsg('about-msg', res.ok ? 'Saved!' : 'Could not save.', res.ok);
});

/* ---------- Get Involved ---------- */
async function loadInvolved() {
  const res = await authFetch('/api/content/admin/get-involved');
  const d = await res.json();
  document.getElementById('g-intro').value = d.intro || '';
  document.getElementById('g-title').value = d.journeyTitle || '';
  document.getElementById('g-text').value = d.journeyText || '';
}

document.getElementById('involved-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    intro: document.getElementById('g-intro').value,
    journeyTitle: document.getElementById('g-title').value,
    journeyText: document.getElementById('g-text').value
  };
  const res = await authFetch('/api/content/admin/get-involved', { method: 'PUT', body: JSON.stringify(body) });
  showMsg('involved-msg', res.ok ? 'Saved!' : 'Could not save.', res.ok);
});

loadWho();
loadAbout();
loadInvolved();