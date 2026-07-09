// Shared by every admin page: login check, authenticated fetch, logout.
const ADMIN_TOKEN = localStorage.getItem('sff_admin_token');
if (!ADMIN_TOKEN) window.location.href = 'login.html';

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
    }
  }).then(async (res) => {
    if (res.status === 401) {
      localStorage.removeItem('sff_admin_token');
      window.location.href = 'login.html';
      return;
    }
    return res;
  });

document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.getElementById('admin-username');
  if (usernameEl) usernameEl.textContent = localStorage.getItem('sff_admin_username') || '';

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('sff_admin_token');
      window.location.href = 'login.html';
    });
  }
});
