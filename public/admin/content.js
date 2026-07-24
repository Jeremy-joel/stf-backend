function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'save-msg ' + (ok ? 'ok' : 'err');
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// Generic helper for uploading a single image into a content section.
// `key` = which section (e.g. "site-settings", "hero", "who-we-are")
// `field` = which image within that section (e.g. "logoUrl", "imageUrl", "whoImage")
async function uploadContentImage(key, field, fileInputId, msgId) {
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput.files[0];
  if (!file) { showMsg(msgId, 'Choose a photo first.', false); return; }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('field', field);

  const res = await authFetch(`/api/content/admin/${key}/image`, { method: 'PUT', body: formData });
  if (res.ok) {
    showMsg(msgId, 'Photo uploaded!', true);
    fileInput.value = '';
  } else {
    const data = await res.json();
    showMsg(msgId, data.message || 'Upload failed.', false);
  }
}

/* ---------- Logo ---------- */
async function loadLogo() {
  const res = await authFetch('/api/content/admin/site-settings');
  const d = await res.json();
  if (d.logoUrl) {
    document.getElementById('logo-preview').src = d.logoUrl;
    document.getElementById('logo-preview').style.display = 'block';
  }
}
document.getElementById('logo-file').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    const preview = document.getElementById('logo-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});
document.getElementById('logo-upload-btn').addEventListener('click', () => {
  uploadContentImage('site-settings', 'logoUrl', 'logo-file', 'logo-msg');
});

/* ---------- Hero ---------- */
async function loadHero() {
  const res = await authFetch('/api/content/admin/hero');
  const d = await res.json();
  document.getElementById('h-title').value = d.title || '';
  document.getElementById('h-subtitle').value = d.subtitle || '';
  if (d.imageUrl) {
    document.getElementById('hero-preview').src = d.imageUrl;
    document.getElementById('hero-preview').style.display = 'block';
  }
}
document.getElementById('hero-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('h-title').value,
    subtitle: document.getElementById('h-subtitle').value
  };
  const res = await authFetch('/api/content/admin/hero', { method: 'PUT', body: JSON.stringify(body) });
  showMsg('hero-msg', res.ok ? 'Saved!' : 'Could not save.', res.ok);
});
document.getElementById('hero-file').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    const preview = document.getElementById('hero-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});
document.getElementById('hero-upload-btn').addEventListener('click', () => {
  uploadContentImage('hero', 'imageUrl', 'hero-file', 'hero-img-msg');
});

/* ---------- Who We Are images ---------- */
document.getElementById('who-img-file').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    const preview = document.getElementById('who-img-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});
document.getElementById('who-img-upload-btn').addEventListener('click', () => {
  uploadContentImage('who-we-are', 'whoImage', 'who-img-file', 'who-img-msg');
});
document.getElementById('transforming-img-file').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    const preview = document.getElementById('transforming-img-preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});
document.getElementById('transforming-img-upload-btn').addEventListener('click', () => {
  uploadContentImage('who-we-are', 'transformingImage', 'transforming-img-file', 'who-img-msg');
});
async function loadWhoImages() {
  const res = await authFetch('/api/content/admin/who-we-are');
  const d = await res.json();
  if (d.whoImage) {
    document.getElementById('who-img-preview').src = d.whoImage;
    document.getElementById('who-img-preview').style.display = 'block';
  }
  if (d.transformingImage) {
    document.getElementById('transforming-img-preview').src = d.transformingImage;
    document.getElementById('transforming-img-preview').style.display = 'block';
  }
}

/* ---------- Who We Are (text) ---------- */
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

loadLogo();
loadHero();
loadWhoImages();
loadWho();
loadAbout();
loadInvolved();