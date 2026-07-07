const token = localStorage.getItem('sff_admin_token');
if (!token) window.location.href = 'login.html';

document.getElementById('admin-username').textContent = localStorage.getItem('sff_admin_username') || '';

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    }
  }).then(async (res) => {
    if (res.status === 401) {
      localStorage.removeItem('sff_admin_token');
      window.location.href = 'login.html';
      return;
    }
    return res;
  });

const formatKES = (n) => `KES ${Number(n || 0).toLocaleString()}`;

/* ---------- Logout ---------- */
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('sff_admin_token');
  window.location.href = 'login.html';
});

/* ---------- Load stats + charts ---------- */
let monthChart, methodChart;

async function loadStats() {
  const res = await authFetch('/api/admin/stats');
  const data = await res.json();

  document.getElementById('stat-total').textContent = formatKES(data.totalRaised);
  document.getElementById('stat-count').textContent = data.totalDonations;

  const findMethod = (name) => data.byMethod.find(m => m._id === name)?.total || 0;
  document.getElementById('stat-mpesa').textContent = formatKES(findMethod('mpesa'));
  document.getElementById('stat-card').textContent = formatKES(findMethod('card'));
  document.getElementById('stat-bank').textContent = formatKES(findMethod('bank_transfer'));

  const monthLabels = data.byMonth.map(m => `${m._id.month}/${m._id.year}`);
  const monthTotals = data.byMonth.map(m => m.total);

  if (monthChart) monthChart.destroy();
  monthChart = new Chart(document.getElementById('monthChart'), {
    type: 'bar',
    data: { labels: monthLabels, datasets: [{ label: 'KES Raised', data: monthTotals, backgroundColor: '#E8A93D' }] },
    options: { plugins: { legend: { display: false } } }
  });

  if (methodChart) methodChart.destroy();
  methodChart = new Chart(document.getElementById('methodChart'), {
    type: 'doughnut',
    data: {
      labels: data.byMethod.map(m => m._id),
      datasets: [{ data: data.byMethod.map(m => m.total), backgroundColor: ['#16342C', '#E8A93D', '#B44E2E', '#4B5750'] }]
    }
  });
}

/* ---------- Donations table ---------- */
let currentPage = 1;

async function loadDonations(page = 1) {
  currentPage = page;
  const params = new URLSearchParams({
    page,
    limit: 15,
    search: document.getElementById('f-search').value,
    status: document.getElementById('f-status').value,
    method: document.getElementById('f-method').value,
    from: document.getElementById('f-from').value,
    to: document.getElementById('f-to').value
  });

  const res = await authFetch(`/api/admin/donations?${params}`);
  const data = await res.json();

  const tbody = document.getElementById('donations-tbody');
  tbody.innerHTML = data.donations.map(d => `
    <tr>
      <td>${new Date(d.createdAt).toLocaleDateString()}</td>
      <td>${d.donorName}</td>
      <td>${d.donorEmail || d.donorPhone || '-'}</td>
      <td>${formatKES(d.amount)}</td>
      <td>${d.paymentMethod}</td>
      <td><span class="badge badge-${d.status}">${d.status}</span></td>
      <td><button class="row-delete" data-id="${d._id}">Delete</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7">No donations found.</td></tr>';

  document.querySelectorAll('.row-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this donation record?')) return;
      await authFetch(`/api/admin/donations/${btn.dataset.id}`, { method: 'DELETE' });
      loadDonations(currentPage);
      loadStats();
    });
  });

  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= data.pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === data.page) btn.classList.add('active');
    btn.addEventListener('click', () => loadDonations(i));
    pagination.appendChild(btn);
  }
}

/* ---------- Filters ---------- */
document.getElementById('filter-btn').addEventListener('click', () => loadDonations(1));
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('f-search').value = '';
  document.getElementById('f-status').value = '';
  document.getElementById('f-method').value = '';
  document.getElementById('f-from').value = '';
  document.getElementById('f-to').value = '';
  loadDonations(1);
});

/* ---------- Manual donation form ---------- */
document.getElementById('manual-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    donorName: document.getElementById('m-name').value,
    donorEmail: document.getElementById('m-email').value,
    donorPhone: document.getElementById('m-phone').value,
    amount: Number(document.getElementById('m-amount').value),
    paymentMethod: document.getElementById('m-method').value,
    notes: document.getElementById('m-notes').value
  };

  const res = await authFetch('/api/admin/donations', { method: 'POST', body: JSON.stringify(body) });
  if (res.ok) {
    e.target.reset();
    loadDonations(1);
    loadStats();
  } else {
    alert('Could not add donation.');
  }
});

/* ---------- Export ---------- */
document.getElementById('export-btn').addEventListener('click', () => {
  fetch('/api/admin/export', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'donations.csv';
      a.click();
    });
});

/* ---------- Init ---------- */
loadStats();
loadDonations();
