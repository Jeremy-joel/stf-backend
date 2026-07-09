let editingId = null;

const previewImage = (input, previewEl) => {
  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      previewEl.src = URL.createObjectURL(input.files[0]);
      previewEl.style.display = 'block';
    }
  });
};
previewImage(document.getElementById('p-image'), document.getElementById('p-preview'));

async function loadPrograms() {
  const res = await authFetch('/api/programs/admin/all');
  const programs = await res.json();

  const grid = document.getElementById('programs-grid');
  grid.innerHTML = programs.map(p => `
    <div class="admin-card ${p.published ? '' : 'unpublished'}">
      <img src="${p.imageUrl || ''}" onerror="this.style.display='none'">
      <div class="admin-card-body">
        ${p.published ? '' : '<span class="unpublished-tag">Hidden</span>'}
        <h4>${p.title}</h4>
        <p>${p.description.slice(0, 90)}${p.description.length > 90 ? '…' : ''}</p>
        <div class="admin-card-actions">
          <button onclick="editProgram('${p._id}')">Edit</button>
          <button class="danger" onclick="deleteProgram('${p._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No programs yet — add your first one above.</p>';

  window._programsCache = programs;
}

window.editProgram = (id) => {
  const p = window._programsCache.find(x => x._id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('p-id').value = id;
  document.getElementById('p-title').value = p.title;
  document.getElementById('p-description').value = p.description;
  document.getElementById('p-order').value = p.order;
  document.getElementById('p-published').value = String(p.published);
  document.getElementById('form-title').textContent = 'Edit Program';
  document.getElementById('p-submit-btn').textContent = 'Save Changes';
  document.getElementById('p-cancel-edit').style.display = 'inline-block';
  if (p.imageUrl) {
    document.getElementById('p-preview').src = p.imageUrl;
    document.getElementById('p-preview').style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProgram = async (id) => {
  if (!confirm('Delete this program? This cannot be undone.')) return;
  await authFetch(`/api/programs/admin/${id}`, { method: 'DELETE' });
  loadPrograms();
};

document.getElementById('p-cancel-edit').addEventListener('click', () => resetForm());

function resetForm() {
  editingId = null;
  document.getElementById('program-form').reset();
  document.getElementById('p-id').value = '';
  document.getElementById('form-title').textContent = 'Add a New Program';
  document.getElementById('p-submit-btn').textContent = 'Add Program';
  document.getElementById('p-cancel-edit').style.display = 'none';
  document.getElementById('p-preview').style.display = 'none';
}

document.getElementById('program-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('p-title').value);
  formData.append('description', document.getElementById('p-description').value);
  formData.append('order', document.getElementById('p-order').value);
  formData.append('published', document.getElementById('p-published').value);
  const imageFile = document.getElementById('p-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  const url = editingId ? `/api/programs/admin/${editingId}` : '/api/programs/admin';
  const method = editingId ? 'PUT' : 'POST';

  const res = await authFetch(url, { method, body: formData });
  if (res.ok) {
    resetForm();
    loadPrograms();
  } else {
    const data = await res.json();
    alert(data.message || 'Could not save program.');
  }
});

loadPrograms();
