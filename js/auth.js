/**
 * Auth — menyimpan token sesi admin di localStorage.
 * Catatan keamanan: ini cocok untuk skala website sekolah sederhana.
 * Token kedaluwarsa otomatis divalidasi ulang oleh server (Apps Script)
 * pada setiap request admin.
 */
const Auth = {
  KEY: 'sekolah_admin_session',

  setSession(token, username) {
    localStorage.setItem(this.KEY, JSON.stringify({ token, username, at: Date.now() }));
  },
  getToken() {
    const s = this.getSession();
    return s ? s.token : null;
  },
  getUsername() {
    const s = this.getSession();
    return s ? s.username : null;
  },
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY));
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(this.KEY);
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  // Panggil di awal halaman dashboard untuk mencegah akses tanpa login.
  guard(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) window.location.href = redirectTo;
  },
};
