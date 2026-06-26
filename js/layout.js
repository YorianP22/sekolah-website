/**
 * Layout bersama (navbar & footer) — dirender lewat JS supaya tidak
 * perlu menyalin HTML yang sama di 9 halaman.
 * Panggil: Layout.renderHeader('beranda'); Layout.renderFooter();
 */
const Layout = {
  links: [
    { key: 'beranda', label: 'Beranda', href: 'index.html' },
    { key: 'profil', label: 'Profil Sekolah', href: 'profil.html' },
    { key: 'visi-misi', label: 'Visi & Misi', href: 'visi-misi.html' },
    { key: 'guru', label: 'Data Guru', href: 'guru.html' },
    { key: 'berita', label: 'Berita', href: 'berita.html' },
    { key: 'galeri', label: 'Galeri', href: 'galeri.html' },
    { key: 'kontak', label: 'Kontak', href: 'kontak.html' },
  ],

  renderHeader(activeKey, basePath = '') {
    const mount = document.getElementById('site-header');
    if (!mount) return;
    const initials = (SCHOOL.singkatan || 'SK').slice(0, 3).toUpperCase();
    const linksHtml = this.links
      .map(
        (l) =>
          `<a href="${basePath}${l.href}" class="${l.key === activeKey ? 'is-active' : ''}">${l.label}</a>`
      )
      .join('');
    mount.innerHTML = `
      <header class="site-header">
        <nav class="nav">
          <a class="nav__brand" href="${basePath}index.html" style="text-decoration:none;">
            <span class="nav__crest">${initials.slice(0,1)}</span>
            <span class="nav__name">${SCHOOL.nama}<small>${SCHOOL.jamOperasional}</small></span>
          </a>
          <ul class="nav__links" id="navLinks" style="display:flex;">
            ${linksHtml}
            <a href="${basePath}login.html" class="btn btn--ghost btn--sm">Login Admin</a>
          </ul>
          <button class="nav__toggle" id="navToggle" aria-label="Buka menu">
            <span></span><span></span><span></span>
          </button>
        </nav>
      </header>`;
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('navLinks');
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
  },

  renderFooter(basePath = '') {
    const mount = document.getElementById('site-footer');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <h4>${SCHOOL.nama}</h4>
            <p style="color:var(--color-accent-soft); opacity:0.85;">${SCHOOL.alamat}</p>
          </div>
          <div>
            <h4>Tautan</h4>
            <ul>
              <li><a href="${basePath}profil.html">Profil Sekolah</a></li>
              <li><a href="${basePath}berita.html">Berita & Pengumuman</a></li>
              <li><a href="${basePath}galeri.html">Galeri</a></li>
            </ul>
          </div>
          <div>
            <h4>Kontak</h4>
            <ul>
              <li>${SCHOOL.telepon}</li>
              <li>${SCHOOL.email}</li>
            </ul>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>&copy; ${new Date().getFullYear()} ${SCHOOL.nama}</span>
          <span>Dibangun dengan GitHub Pages + Google Apps Script</span>
        </div>
      </footer>`;
  },
};
