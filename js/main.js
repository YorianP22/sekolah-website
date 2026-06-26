/**
 * main.js — fungsi-fungsi rendering konten dinamis dari API.
 * Setiap halaman publik memanggil fungsi yang relevan saja.
 */

function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function skeletonGrid(target, count = 3) {
  target.innerHTML = Array.from({ length: count }).map(() => `<div class="skeleton" style="height:160px;"></div>`).join('');
}

// ---------- PENGUMUMAN (pinboard, untuk Beranda & halaman Berita) ----------
async function renderPengumuman(targetEl, limit = 4) {
  skeletonGrid(targetEl, 2);
  const res = await Api.get('getPengumuman');
  if (!res.success || !res.data.length) {
    targetEl.innerHTML = `<p class="empty-state">Belum ada pengumuman terbaru.</p>`;
    return;
  }
  const tilts = [-0.6, 0.5, -0.3, 0.7];
  targetEl.innerHTML = res.data.slice(0, limit).map((p, i) => `
    <div class="pin-note" style="--tilt:${tilts[i % tilts.length]}deg">
      <span class="eyebrow">Pengumuman</span>
      <h3>${escapeHtml(p.judul)}</h3>
      <p>${escapeHtml(String(p.isi)).slice(0, 140)}${String(p.isi).length > 140 ? '…' : ''}</p>
      <time>${formatTanggal(p.tanggal)}</time>
    </div>`).join('');
}

// ---------- BERITA ----------
async function renderBerita(targetEl, limit = 20) {
  targetEl.innerHTML = `<div class="skeleton" style="height:90px; margin-bottom:14px;"></div>`.repeat(3);
  const res = await Api.get('getBerita');
  if (!res.success || !res.data.length) {
    targetEl.innerHTML = `<p class="empty-state">Belum ada berita yang dipublikasikan.</p>`;
    return;
  }
  targetEl.innerHTML = res.data.slice(0, limit).map((b, idx) => `
    <article class="news-item">
      <img src="${b.gambar_url || 'https://placehold.co/260x200?text=Berita'}" alt="${escapeHtml(b.judul)}" loading="lazy">
      <div>
        <span class="eyebrow">${formatTanggal(b.tanggal)} · ${escapeHtml(b.penulis || 'Admin')}</span>
        <h3>${escapeHtml(b.judul)}</h3>
        <p id="berita-isi-${idx}">${escapeHtml(String(b.isi)).slice(0, 180)}${String(b.isi).length > 180 ? '…' : ''}</p>
        ${String(b.isi).length > 180 ? `<button class="btn btn--ghost btn--sm" data-full="${encodeURIComponent(b.isi)}" data-idx="${idx}" onclick="toggleBerita(this)">Baca selengkapnya</button>` : ''}
      </div>
    </article>`).join('');
}

function toggleBerita(btn) {
  const idx = btn.dataset.idx;
  const p = document.getElementById('berita-isi-' + idx);
  const expanded = btn.dataset.expanded === 'true';
  if (expanded) {
    p.textContent = decodeURIComponent(btn.dataset.full).slice(0, 180) + '…';
    btn.textContent = 'Baca selengkapnya';
    btn.dataset.expanded = 'false';
  } else {
    p.textContent = decodeURIComponent(btn.dataset.full);
    btn.textContent = 'Tutup';
    btn.dataset.expanded = 'true';
  }
}

// ---------- GALERI ----------
async function renderGaleri(targetEl) {
  skeletonGrid(targetEl, 6);
  const res = await Api.get('getGaleri');
  if (!res.success || !res.data.length) {
    targetEl.innerHTML = `<p class="empty-state">Belum ada foto di galeri.</p>`;
    return;
  }
  targetEl.innerHTML = res.data.map((g) => `
    <div class="gallery-item" onclick="openLightbox('${encodeURIComponent(g.gambar_url)}', '${encodeURIComponent(g.judul)}')">
      <img src="${g.gambar_url}" alt="${escapeHtml(g.judul)}" loading="lazy">
      <div class="gallery-item__cap">${escapeHtml(g.kategori || 'Umum')}</div>
    </div>`).join('');
}

function openLightbox(url, caption) {
  let box = document.getElementById('lightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'lightbox';
    box.className = 'lightbox';
    box.innerHTML = `<button class="lightbox__close" onclick="closeLightbox()">&times;</button><img id="lightboxImg" alt="">`;
    box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    document.body.appendChild(box);
  }
  document.getElementById('lightboxImg').src = decodeURIComponent(url);
  document.getElementById('lightboxImg').alt = decodeURIComponent(caption);
  box.classList.add('is-open');
}
function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('is-open');
}

// ---------- GURU ----------
async function renderGuru(targetEl) {
  skeletonGrid(targetEl, 8);
  const res = await Api.get('getGuru');
  if (!res.success || !res.data.length) {
    targetEl.innerHTML = `<p class="empty-state">Data guru belum tersedia.</p>`;
    return;
  }
  targetEl.innerHTML = res.data.map((g) => `
    <div class="card teacher-card">
      <img src="${g.foto_url || 'https://placehold.co/96x96?text=Foto'}" alt="${escapeHtml(g.nama)}">
      <h3>${escapeHtml(g.nama)}</h3>
      <div class="role">${escapeHtml(g.jabatan)}</div>
      <p style="margin-top:8px; font-size:0.85rem;">${escapeHtml(g.mapel || '')}</p>
    </div>`).join('');
}

// ---------- KONTAK ----------
function initKontakForm(formEl, alertEl) {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Mengirim…';
    const payload = {
      nama: formEl.nama.value.trim(),
      email: formEl.email.value.trim(),
      pesan: formEl.pesan.value.trim(),
    };
    try {
      const res = await Api.post('submitKontak', payload);
      if (res.success) {
        alertEl.className = 'alert alert--success';
        alertEl.textContent = 'Pesan terkirim. Terima kasih, kami akan segera merespons.';
        formEl.reset();
      } else {
        throw new Error(res.message || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      alertEl.className = 'alert alert--error';
      alertEl.textContent = 'Pesan gagal dikirim: ' + err.message;
    } finally {
      alertEl.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Kirim Pesan';
    }
  });
}
