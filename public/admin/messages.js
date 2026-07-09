let currentPage = 1;

async function loadMessages(page = 1) {
  currentPage = page;
  const readFilter = document.getElementById('filter-read').value;
  const params = new URLSearchParams({ page, limit: 15 });
  if (readFilter) params.append('read', readFilter);

  const res = await authFetch(`/api/contact/admin/all?${params}`);
  const data = await res.json();

  const unreadEl = document.getElementById('unread-count');
  if (data.unreadCount > 0) {
    unreadEl.textContent = data.unreadCount;
    unreadEl.style.display = 'inline-block';
  } else {
    unreadEl.style.display = 'none';
  }

  const list = document.getElementById('messages-list');
  list.innerHTML = data.messages.map(m => `
    <div class="msg-row ${m.read ? '' : 'unread'}">
      <div class="msg-top">
        <span class="msg-name">${m.name} ${m.subject ? `— <em>${m.subject}</em>` : ''}</span>
        <span class="msg-date">${new Date(m.createdAt).toLocaleString()}</span>
      </div>
      <div class="msg-contact">${m.email || ''} ${m.phone ? '· ' + m.phone : ''}</div>
      <div class="msg-body">${m.message}</div>
      <div class="admin-card-actions">
        ${m.read ? '' : `<button onclick="markRead('${m._id}')">Mark as read</button>`}
        ${m.email ? `<a href="mailto:${m.email}" style="text-decoration:none;"><button type="button">Reply by email</button></a>` : ''}
        <button class="danger" onclick="deleteMsg('${m._id}')">Delete</button>
      </div>
    </div>
  `).join('') || '<p>No messages found.</p>';

  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= data.pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === data.page) btn.classList.add('active');
    btn.addEventListener('click', () => loadMessages(i));
    pagination.appendChild(btn);
  }
}

window.markRead = async (id) => {
  await authFetch(`/api/contact/admin/${id}/read`, { method: 'PUT' });
  loadMessages(currentPage);
};

window.deleteMsg = async (id) => {
  if (!confirm('Delete this message?')) return;
  await authFetch(`/api/contact/admin/${id}`, { method: 'DELETE' });
  loadMessages(currentPage);
};

document.getElementById('filter-read').addEventListener('change', () => loadMessages(1));

loadMessages();
