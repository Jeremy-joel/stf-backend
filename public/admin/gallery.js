async function loadGallery() {
  const res = await authFetch('/api/gallery/admin/all');
  const images = await res.json();

  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = images.map(img => `
    <div class="admin-card ${img.published ? '' : 'unpublished'}">
      <img src="${img.imageUrl}">
      <div class="admin-card-body">
        ${img.published ? '' : '<span class="unpublished-tag">Hidden</span>'}
        <p>${img.caption || '<em>No caption</em>'}</p>
        <div class="admin-card-actions">
          <button onclick="togglePublish('${img._id}', ${!img.published})">${img.published ? 'Hide' : 'Show'}</button>
          <button class="danger" onclick="deleteImage('${img._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No photos yet — upload your first one above.</p>';
}

window.togglePublish = async (id, newState) => {
  const formData = new FormData();
  formData.append('published', String(newState));
  await authFetch(`/api/gallery/admin/${id}`, { method: 'PUT', body: formData });
  loadGallery();
};

window.deleteImage = async (id) => {
  if (!confirm('Delete this photo permanently?')) return;
  await authFetch(`/api/gallery/admin/${id}`, { method: 'DELETE' });
  loadGallery();
};

document.getElementById('gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('g-image');
  if (!fileInput.files[0]) return;

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('caption', document.getElementById('g-caption').value);
  formData.append('published', document.getElementById('g-published').value);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Uploading...';
  submitBtn.disabled = true;

  const res = await authFetch('/api/gallery/admin', { method: 'POST', body: formData });

  submitBtn.textContent = 'Upload Photo';
  submitBtn.disabled = false;

  if (res.ok) {
    e.target.reset();
    loadGallery();
  } else {
    const data = await res.json();
    alert(data.message || 'Could not upload photo.');
  }
});

loadGallery();
