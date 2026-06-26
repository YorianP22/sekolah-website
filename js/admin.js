/**
 * admin.js — logika Dashboard Admin.
 * Semua aksi tulis memakai Api.postAuthed (otomatis menyisipkan token sesi).
 */
Auth.guard('../login.html');
document.getElementById('adminWhoami').textContent = 'Masuk sebagai: ' + (Auth.getUsername() || '-');

const UI = {
  toggleForm(name, reset = true) {
    const el = document.getElementById('form-' + name);
    const willShow = el.style.display === 'none';
    el.style.display = willShow ? 'block' : 'none';
    if (willShow && reset) document.getElementById('form' + capitalize(name)).reset();
  },
  showAlert(name, message, type = 'success') {
    const el = document.getElementById('alert-' + name);
    el.className = 'alert alert--' + type;
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  },
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- Tab switching ----------
document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn[data-tab]').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('is-active');
  });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await Api.post('logout', { token: Auth.getToken() });
  Auth.clear();
  window.location.href = '../login.html';
});

function formToObject(form) {
  const obj = {};
  new FormData(form).forEach((v, k) => { obj[k] = v; });
  return obj;
}

async function handleAuthError(res, panel) {
  if (!res.success && /sesi|token/i.test(res.message || '')) {
    Auth.clear();
    window.location.href = '../login.html';
    return true;
  }
  return false;
}

/* ===================== BERITA ===================== */
async function loadBerita() {
  const tbody = document.querySelector('#table-berita tbody');
  tbody.innerHTML = `<tr><td colspan="5">Memuat…</td></tr>`;
  const res = await Api.get('getBerita');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="5">Gagal memuat data.</td></tr>`; return; }
  if (!res.data.length) { tbody.innerHTML = `<tr><td colspan="5">Belum ada berita.</td></tr>`; return; }
  tbody.innerHTML = res.data.map((b) => `
    <tr>
      <td>${escapeHtml(b.judul)}</td>
      <td>${escapeHtml(b.penulis)}</td>
      <td>${formatTanggal(b.tanggal)}</td>
      <td><span class="badge badge--${b.status === 'draft' ? 'draft' : 'terbit'}">${b.status}</span></td>
      <td class="row-actions">
        <button class="btn btn--ghost btn--sm" onclick='editBerita(${JSON.stringify(b).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteBerita(${b.id})">Hapus</button>
      </td>
    </tr>`).join('');
}
function editBerita(b) {
  UI.toggleForm('berita', false);
  const f = document.getElementById('formBerita');
  f.id.value = b.id; f.judul.value = b.judul; f.isi.value = b.isi;
  f.gambar_url.value = b.gambar_url || ''; f.penulis.value = b.penulis || 'Admin'; f.status.value = b.status || 'terbit';
}
async function deleteBerita(id) {
  if (!confirm('Hapus berita ini?')) return;
  const res = await Api.postAuthed('deleteBerita', { id });
  if (await handleAuthError(res)) return;
  UI.showAlert('berita', res.success ? 'Berita dihapus.' : res.message, res.success ? 'success' : 'error');
  loadBerita();
}
document.getElementById('formBerita').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formToObject(e.target);
  const action = data.id ? 'updateBerita' : 'addBerita';
  const res = await Api.postAuthed(action, data);
  if (await handleAuthError(res)) return;
  UI.showAlert('berita', res.success ? 'Berita disimpan.' : res.message, res.success ? 'success' : 'error');
  if (res.success) { UI.toggleForm('berita'); loadBerita(); }
});

/* ===================== PENGUMUMAN ===================== */
async function loadPengumuman() {
  const tbody = document.querySelector('#table-pengumuman tbody');
  tbody.innerHTML = `<tr><td colspan="4">Memuat…</td></tr>`;
  const res = await Api.get('getPengumuman');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="4">Gagal memuat data.</td></tr>`; return; }
  if (!res.data.length) { tbody.innerHTML = `<tr><td colspan="4">Belum ada pengumuman.</td></tr>`; return; }
  tbody.innerHTML = res.data.map((p) => `
    <tr>
      <td>${escapeHtml(p.judul)}</td>
      <td>${formatTanggal(p.tanggal)}</td>
      <td><span class="badge badge--${p.status === 'draft' ? 'draft' : 'terbit'}">${p.status}</span></td>
      <td class="row-actions">
        <button class="btn btn--ghost btn--sm" onclick='editPengumuman(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deletePengumuman(${p.id})">Hapus</button>
      </td>
    </tr>`).join('');
}
function editPengumuman(p) {
  UI.toggleForm('pengumuman', false);
  const f = document.getElementById('formPengumuman');
  f.id.value = p.id; f.judul.value = p.judul; f.isi.value = p.isi;
  f.tanggal_kadaluarsa.value = p.tanggal_kadaluarsa ? String(p.tanggal_kadaluarsa).slice(0, 10) : '';
  f.status.value = p.status || 'terbit';
}
async function deletePengumuman(id) {
  if (!confirm('Hapus pengumuman ini?')) return;
  const res = await Api.postAuthed('deletePengumuman', { id });
  if (await handleAuthError(res)) return;
  UI.showAlert('pengumuman', res.success ? 'Pengumuman dihapus.' : res.message, res.success ? 'success' : 'error');
  loadPengumuman();
}
document.getElementById('formPengumuman').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formToObject(e.target);
  const action = data.id ? 'updatePengumuman' : 'addPengumuman';
  const res = await Api.postAuthed(action, data);
  if (await handleAuthError(res)) return;
  UI.showAlert('pengumuman', res.success ? 'Pengumuman disimpan.' : res.message, res.success ? 'success' : 'error');
  if (res.success) { UI.toggleForm('pengumuman'); loadPengumuman(); }
});

/* ===================== GALERI ===================== */
async function loadGaleri() {
  const grid = document.getElementById('grid-galeri');
  grid.innerHTML = `<div class="skeleton" style="height:160px;"></div>`.repeat(4);
  const res = await Api.get('getGaleri');
  if (!res.success || !res.data.length) { grid.innerHTML = `<p class="empty-state">Belum ada foto.</p>`; return; }
  grid.innerHTML = res.data.map((g) => `
    <div class="card" style="padding:10px;">
      <img src="${g.gambar_url}" alt="${escapeHtml(g.judul)}" style="aspect-ratio:1/1; object-fit:cover; border-radius:4px; margin-bottom:8px;">
      <strong style="font-size:0.88rem;">${escapeHtml(g.judul)}</strong>
      <div class="form-hint">${escapeHtml(g.kategori)}</div>
      <button class="btn btn--danger btn--sm" style="margin-top:8px; width:100%;" onclick="deleteGaleri(${g.id})">Hapus</button>
    </div>`).join('');
}
async function deleteGaleri(id) {
  if (!confirm('Hapus foto ini?')) return;
  const res = await Api.postAuthed('deleteGaleri', { id });
  if (await handleAuthError(res)) return;
  UI.showAlert('galeri', res.success ? 'Foto dihapus.' : res.message, res.success ? 'success' : 'error');
  loadGaleri();
}
document.getElementById('formGaleri').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formToObject(e.target);
  const res = await Api.postAuthed('addGaleri', data);
  if (await handleAuthError(res)) return;
  UI.showAlert('galeri', res.success ? 'Foto ditambahkan.' : res.message, res.success ? 'success' : 'error');
  if (res.success) { UI.toggleForm('galeri'); loadGaleri(); }
});

/* ===================== GURU ===================== */
async function loadGuruTable() {
  const tbody = document.querySelector('#table-guru tbody');
  tbody.innerHTML = `<tr><td colspan="5">Memuat…</td></tr>`;
  const res = await Api.get('getGuru');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="5">Gagal memuat data.</td></tr>`; return; }
  if (!res.data.length) { tbody.innerHTML = `<tr><td colspan="5">Belum ada data guru.</td></tr>`; return; }
  tbody.innerHTML = res.data.map((g) => `
    <tr>
      <td>${escapeHtml(g.nama)}</td>
      <td>${escapeHtml(g.nip)}</td>
      <td>${escapeHtml(g.jabatan)}</td>
      <td>${escapeHtml(g.mapel)}</td>
      <td class="row-actions">
        <button class="btn btn--ghost btn--sm" onclick='editGuru(${JSON.stringify(g).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="btn btn--danger btn--sm" onclick="deleteGuru(${g.id})">Hapus</button>
      </td>
    </tr>`).join('');
}
function editGuru(g) {
  UI.toggleForm('guru', false);
  const f = document.getElementById('formGuru');
  f.id.value = g.id; f.nama.value = g.nama; f.nip.value = g.nip || '';
  f.jabatan.value = g.jabatan; f.mapel.value = g.mapel || ''; f.foto_url.value = g.foto_url || '';
}
async function deleteGuru(id) {
  if (!confirm('Hapus data guru ini?')) return;
  const res = await Api.postAuthed('deleteGuru', { id });
  if (await handleAuthError(res)) return;
  UI.showAlert('guru', res.success ? 'Data guru dihapus.' : res.message, res.success ? 'success' : 'error');
  loadGuruTable();
}
document.getElementById('formGuru').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formToObject(e.target);
  const action = data.id ? 'updateGuru' : 'addGuru';
  const res = await Api.postAuthed(action, data);
  if (await handleAuthError(res)) return;
  UI.showAlert('guru', res.success ? 'Data guru disimpan.' : res.message, res.success ? 'success' : 'error');
  if (res.success) { UI.toggleForm('guru'); loadGuruTable(); }
});

/* ===================== PESAN MASUK ===================== */
async function loadPesan() {
  const tbody = document.querySelector('#table-pesan tbody');
  tbody.innerHTML = `<tr><td colspan="6">Memuat…</td></tr>`;
  const res = await Api.postAuthed('getKontakMasuk');
  if (await handleAuthError(res)) return;
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="6">Gagal memuat data.</td></tr>`; return; }
  if (!res.data.length) { tbody.innerHTML = `<tr><td colspan="6">Belum ada pesan masuk.</td></tr>`; return; }
  tbody.innerHTML = res.data.map((p) => `
    <tr>
      <td>${escapeHtml(p.nama)}</td>
      <td>${escapeHtml(p.email)}</td>
      <td style="max-width:280px;">${escapeHtml(p.pesan)}</td>
      <td>${formatTanggal(p.tanggal)}</td>
      <td><span class="badge badge--${p.dibaca === 'YA' ? 'terbit' : 'draft'}">${p.dibaca === 'YA' ? 'Dibaca' : 'Baru'}</span></td>
      <td class="row-actions">
        ${p.dibaca !== 'YA' ? `<button class="btn btn--ghost btn--sm" onclick="tandaiDibaca(${p.id})">Tandai Dibaca</button>` : ''}
        <button class="btn btn--danger btn--sm" onclick="deleteKontak(${p.id})">Hapus</button>
      </td>
    </tr>`).join('');
}
async function tandaiDibaca(id) {
  const res = await Api.postAuthed('tandaiDibaca', { id });
  if (await handleAuthError(res)) return;
  loadPesan();
}
async function deleteKontak(id) {
  if (!confirm('Hapus pesan ini?')) return;
  const res = await Api.postAuthed('deleteKontak', { id });
  if (await handleAuthError(res)) return;
  loadPesan();
}

// ---------- Init ----------
loadBerita();
loadPengumuman();
loadGaleri();
loadGuruTable();
loadPesan();
