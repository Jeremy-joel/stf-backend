let editingId = null;

document.getElementById('t-photo').addEventListener('change', (e) => {
  const preview = document.getElementById('t-preview');
  if (e.target.files && e.target.files[0]) {
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
  }
});

async function loadTeam() {
  const res = await authFetch('/api/team/admin/all');
  const team = await res.json();

  const grid = document.getElementById('team-grid');
  grid.innerHTML = team.map(t => `
    <div class="admin-card ${t.published ? '' : 'unpublished'}">
      <img src="${t.photoUrl || ''}" onerror="this.style.display='none'">
      <div class="admin-card-body">
        ${t.published ? '' : '<span class="unpublished-tag">Hidden</span>'}
        <h4>${t.name}</h4>
        <p>${t.position}</p>
        <div class="admin-card-actions">
          <button onclick="editMember('${t._id}')">Edit</button>
          <button class="danger" onclick="deleteMember('${t._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No team members yet — add your first one above.</p>';

  window._teamCache = team;
}

window.editMember = (id) => {
  const t = window._teamCache.find(x => x._id === id);
  if (!t) return;
  editingId = id;
  document.getElementById('t-id').value = id;
  document.getElementById('t-name').value = t.name;
  document.getElementById('t-position').value = t.position;
  document.getElementById('t-bio').value = t.bio || '';
  document.getElementById('t-email').value = t.email || '';
  document.getElementById('t-phone').value = t.phone || '';
  document.getElementById('t-order').value = t.order;
  document.getElementById('t-published').value = String(t.published);
  document.getElementById('form-title').textContent = 'Edit Team Member';
  document.getElementById('t-submit-btn').textContent = 'Save Changes';
  document.getElementById('t-cancel-edit').style.display = 'inline-block';
  if (t.photoUrl) {
    document.getElementById('t-preview').src = t.photoUrl;
    document.getElementById('t-preview').style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteMember = async (id) => {
  if (!confirm('Remove this team member?')) return;
  await authFetch(`/api/team/admin/${id}`, { method: 'DELETE' });
  loadTeam();
};

document.getElementById('t-cancel-edit').addEventListener('click', () => resetForm());

function resetForm() {
  editingId = null;
  document.getElementById('team-form').reset();
  document.getElementById('t-id').value = '';
  document.getElementById('form-title').textContent = 'Add a Team Member';
  document.getElementById('t-submit-btn').textContent = 'Add Team Member';
  document.getElementById('t-cancel-edit').style.display = 'none';
  document.getElementById('t-preview').style.display = 'none';
}

document.getElementById('team-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('name', document.getElementById('t-name').value);
  formData.append('position', document.getElementById('t-position').value);
  formData.append('bio', document.getElementById('t-bio').value);
  formData.append('email', document.getElementById('t-email').value);
  formData.append('phone', document.getElementById('t-phone').value);
  formData.append('order', document.getElementById('t-order').value);
  formData.append('published', document.getElementById('t-published').value);
  const photoFile = document.getElementById('t-photo').files[0];
  if (photoFile) formData.append('photo', photoFile);

  const url = editingId ? `/api/team/admin/${editingId}` : '/api/team/admin';
  const method = editingId ? 'PUT' : 'POST';

  const res = await authFetch(url, { method, body: formData });
  if (res.ok) {
    resetForm();
    loadTeam();
  } else {
    const data = await res.json();
    alert(data.message || 'Could not save team member.');
  }
});

loadTeam();