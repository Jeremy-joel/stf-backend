let editingId = null;

document.getElementById('i-image').addEventListener('change', (e) => {
  const preview = document.getElementById('i-preview');
  if (e.target.files && e.target.files[0]) {
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});

async function loadImpact() {
  const res = await authFetch('/api/impact/admin/all');
  const items = await res.json();

  const grid = document.getElementById('impact-grid');
  grid.innerHTML = items.map(i => `
    <div class="admin-card ${i.published ? '' : 'unpublished'}">
      <img src="${i.imageUrl || ''}" onerror="this.style.display='none'">
      <div class="admin-card-body">
        ${i.published ? '' : '<span class="unpublished-tag">Hidden</span>'}
        <h4>${i.label}</h4>
        <div class="admin-card-actions">
          <button onclick="editImpact('${i._id}')">Edit</button>
          <button class="danger" onclick="deleteImpact('${i._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No impact cards yet — add your first one above.</p>';

  window._impactCache = items;
}

window.editImpact = (id) => {
  const i = window._impactCache.find(x => x._id === id);
  if (!i) return;
  editingId = id;
  document.getElementById('i-id').value = id;
  document.getElementById('i-label').value = i.label;
  document.getElementById('i-order').value = i.order;
  document.getElementById('i-published').value = String(i.published);
  document.getElementById('form-title').textContent = 'Edit Impact Card';
  document.getElementById('i-submit-btn').textContent = 'Save Changes';
  document.getElementById('i-cancel-edit').style.display = 'inline-block';
  if (i.imageUrl) {
    document.getElementById('i-preview').src = i.imageUrl;
    document.getElementById('i-preview').style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteImpact = async (id) => {
  if (!confirm('Delete this impact card?')) return;
  await authFetch(`/api/impact/admin/${id}`, { method: 'DELETE' });
  loadImpact();
};

document.getElementById('i-cancel-edit').addEventListener('click', () => resetForm());

function resetForm() {
  editingId = null;
  document.getElementById('impact-form').reset();
  document.getElementById('i-id').value = '';
  document.getElementById('form-title').textContent = 'Add an Impact Card';
  document.getElementById('i-submit-btn').textContent = 'Add Impact Card';
  document.getElementById('i-cancel-edit').style.display = 'none';
  document.getElementById('i-preview').style.display = 'none';
}

document.getElementById('impact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('label', document.getElementById('i-label').value);
  formData.append('order', document.getElementById('i-order').value);
  formData.append('published', document.getElementById('i-published').value);
  const imageFile = document.getElementById('i-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  const url = editingId ? `/api/impact/admin/${editingId}` : '/api/impact/admin';
  const method = editingId ? 'PUT' : 'POST';

  const res = await authFetch(url, { method, body: formData });
  if (res.ok) {
    resetForm();
    loadImpact();
  } else {
    const data = await res.json();
    alert(data.message || 'Could not save impact card.');
  }
});

loadImpact();
