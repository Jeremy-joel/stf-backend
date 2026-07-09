# Connecting Programs, Gallery, Impact & Contact Messages to Your Live Site

This makes your Programs, Impact, and Gallery sections load from the admin panel instead of being fixed in your code — and saves every contact form submission to your dashboard too.

**Important:** your existing hardcoded content in `index.html` stays in place as a fallback — if the backend is ever unreachable, visitors still see your original content. The JavaScript below only *replaces* it once real data loads successfully.

---

## 1. In `index.html` — add IDs to three containers

**Programs section** — find this line:
```html
<div class="programs-grid">
```
Change it to:
```html
<div class="programs-grid" id="programs-grid">
```
(Leave the 4 existing `<article class="program-card">` blocks inside exactly as they are — they're now your fallback content.)

**Impact section** — find:
```html
<div class="impact-grid">
```
Change to:
```html
<div class="impact-grid" id="impact-grid">
```

**Gallery section** — find:
```html
<div class="gallery-grid">
```
Change to:
```html
<div class="gallery-grid" id="gallery-grid">
```

That's it for HTML — three `id` attributes added, nothing removed.

---

## 2. In `script.js` — replace your gallery lightbox section

Find this whole block (from your last update):
```javascript
  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  ...
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
```

Replace the **whole block** with this version (same behavior, but re-usable after the gallery reloads with real photos):

```javascript
  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');
  let currentIndex = 0;
  let galleryItems = [];

  window.bindGalleryLightbox = () => {
    galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });
  };

  const showImage = (index) => {
    if (!galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].getAttribute('data-img');
    lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
  };

  const openLightbox = (index) => {
    showImage(index);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  };

  bindGalleryLightbox();

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
```

---

## 3. In `script.js` — add these new functions at the bottom

(Make sure `const BACKEND_URL = '...'` already exists near your donation code — reuse that same line, don't duplicate it.)

```javascript
/* ---------- Load Programs from the admin panel ---------- */
async function loadPrograms() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/programs`);
    const programs = await res.json();
    if (!programs.length) return; // keep fallback content

    const grid = document.getElementById('programs-grid');
    grid.innerHTML = programs.map(p => `
      <article class="program-card">
        <div class="program-media"><img src="${p.imageUrl || ''}" alt="${p.title}"></div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </article>
    `).join('');
  } catch (err) {
    console.warn('Could not load programs from backend, showing default content.', err);
  }
}

/* ---------- Load Impact cards from the admin panel ---------- */
async function loadImpact() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/impact`);
    const items = await res.json();
    if (!items.length) return;

    const grid = document.getElementById('impact-grid');
    grid.innerHTML = items.map(i => `
      <figure class="impact-card">
        <img src="${i.imageUrl || ''}" alt="${i.label}">
        <figcaption>${i.label}</figcaption>
      </figure>
    `).join('');
  } catch (err) {
    console.warn('Could not load impact cards from backend, showing default content.', err);
  }
}

/* ---------- Load Gallery photos from the admin panel ---------- */
async function loadGalleryPhotos() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/gallery`);
    const images = await res.json();
    if (!images.length) return;

    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = images.map(img => `
      <button class="gallery-item" data-img="${img.imageUrl}">
        <img src="${img.imageUrl}" alt="${img.caption || 'Gallery photo'}">
      </button>
    `).join('');

    if (window.bindGalleryLightbox) window.bindGalleryLightbox();
  } catch (err) {
    console.warn('Could not load gallery from backend, showing default content.', err);
  }
}

loadPrograms();
loadImpact();
loadGalleryPhotos();
```

---

## 4. Save contact form submissions to your dashboard too

Find your existing contact form handler:
```javascript
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ...
    window.location.href = mailto;
  });
}
```

Add this line right before `window.location.href = mailto;` (inside the same function, so it saves a copy to the database *and* still opens the visitor's email app):

```javascript
      // Save a copy to the admin dashboard too
      fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message })
      }).catch(err => console.warn('Could not save message to dashboard:', err));

      window.location.href = mailto;
```

---

That's everything for the frontend. Once these are saved and redeployed to Netlify, your Programs/Impact/Gallery sections pull live from whatever you set up in the admin panel, and every contact form submission appears under **Messages** in the dashboard.
