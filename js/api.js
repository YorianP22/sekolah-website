/**
 * API client — semua komunikasi ke Google Apps Script lewat sini.
 * POST memakai Content-Type: text/plain agar browser tidak mengirim
 * preflight OPTIONS (yang tidak didukung Apps Script secara default).
 */
const Api = {
  async get(action, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { method: 'GET' });
    return res.json();
  },

  async post(action, payload = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  },

  // Helper khusus untuk aksi admin: otomatis menyisipkan token sesi.
  async postAuthed(action, payload = {}) {
    const token = Auth.getToken();
    return this.post(action, { ...payload, token });
  },
};
