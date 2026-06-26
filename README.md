# Website Sekolah — Frontend (GitHub Pages) + Backend (Google Apps Script + Google Sheets)

Website sekolah statis yang datanya (berita, pengumuman, galeri, data guru, pesan kontak)
dikelola lewat **Dashboard Admin**, disimpan di **Google Sheets**, dan diakses lewat
**Google Apps Script** yang berfungsi sebagai REST API. 100% gratis — tidak perlu hosting
backend berbayar.

## Struktur Folder

```
sekolah-website/
├── index.html              Beranda
├── profil.html              Profil Sekolah
├── visi-misi.html            Visi & Misi
├── guru.html                 Data Guru (dinamis dari Sheets)
├── berita.html                Berita & Pengumuman (dinamis dari Sheets)
├── galeri.html                Galeri (dinamis dari Sheets)
├── kontak.html                 Kontak + form pesan
├── login.html                  Login Admin
├── admin/
│   └── dashboard.html         Dashboard Admin (kelola berita, pengumuman, galeri, guru, pesan)
├── css/style.css
├── js/
│   ├── config.js              <-- WAJIB diisi dengan URL Apps Script kamu
│   ├── api.js                 wrapper fetch ke API
│   ├── layout.js               navbar & footer
│   ├── auth.js                 sesi login admin (localStorage)
│   ├── main.js                  render berita/pengumuman/galeri/guru/kontak
│   └── admin.js                  logika CRUD dashboard admin
└── apps-script/
    └── Code.gs                  kode backend, tempel ke Google Apps Script
```

## Langkah 1 — Siapkan Backend (Google Sheets + Apps Script)

1. Buat **Google Spreadsheet** baru di Google Drive (beri nama, misalnya `DB Website Sekolah`).
2. Di spreadsheet itu, buka menu **Extensions → Apps Script**.
3. Hapus kode default di `Code.gs`, lalu **copy-paste seluruh isi** file
   `apps-script/Code.gs` dari proyek ini.
4. Di toolbar editor Apps Script, pilih fungsi **`setup`** dari dropdown lalu klik **Run**.
   - Saat pertama kali run, akan muncul permintaan izin akses — klik **Review permissions**,
     pilih akun Google kamu, lalu **Allow**.
   - Fungsi ini otomatis membuat semua sheet (`Berita`, `Pengumuman`, `Galeri`, `Guru`,
     `Admin`, `Sessions`, `Kontak`) beserta header kolomnya.
5. Buka isi fungsi **`buatAdmin`**, ganti `USERNAME` dan `PASSWORD` sesuai keinginan,
   lalu pilih fungsi `buatAdmin` dari dropdown dan klik **Run** sekali saja.
   Ini membuat akun admin pertama (password disimpan terenkripsi/hash, bukan teks biasa).
6. **Deploy sebagai Web App**:
   - Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - **Execute as**: *Me*.
   - **Who has access**: *Anyone*.
   - Klik **Deploy**, lalu **copy URL** yang dihasilkan
     (bentuknya: `https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec`).

> Setiap kali kamu mengubah isi `Code.gs`, kamu harus membuat **New deployment** baru
> (atau gunakan "Manage deployments → Edit → versi baru") agar perubahan ikut termuat.

## Langkah 2 — Hubungkan Frontend ke Backend

Buka file `js/config.js`, ganti baris:

```js
const API_URL = 'https://script.google.com/macros/s/GANTI_DENGAN_ID_DEPLOYMENT/exec';
```

dengan URL Web App hasil deploy di Langkah 1. Simpan juga data identitas sekolah
(nama, alamat, telepon, email) di objek `SCHOOL` pada file yang sama.

## Langkah 3 — Publikasikan ke GitHub Pages

1. Buat repository baru di GitHub, lalu upload seluruh isi folder `sekolah-website/`
   (bukan folder itu sendiri, tapi isinya) ke repository tersebut.
2. Buka **Settings → Pages** di repository.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`, klik **Save**.
4. Tunggu beberapa menit, website akan tersedia di
   `https://<username-github>.github.io/<nama-repo>/`.

## Mengelola Konten

1. Buka `login.html` di website kamu.
2. Masuk dengan akun admin yang dibuat di Langkah 1 (fungsi `buatAdmin`).
3. Di **Dashboard Admin**, kamu bisa menambah/mengedit/menghapus:
   - **Berita** — bisa disimpan sebagai *Draft* dulu sebelum *Terbit*.
   - **Pengumuman** — tampil di papan pengumuman Beranda & halaman Berita.
   - **Galeri** — tambah foto dengan judul & kategori.
   - **Data Guru** — kelola daftar tenaga pendidik.
   - **Pesan Masuk** — lihat pesan dari form Kontak, tandai dibaca, atau hapus.

### Tentang gambar/foto

Apps Script + Sheets tidak menyediakan tempat upload file langsung dari form.
Cara termudah dan gratis:
1. Unggah gambar ke **Google Drive**.
2. Klik kanan file → **Share → Anyone with the link**.
3. Salin link tersebut dan tempel ke kolom **URL Gambar** di dashboard.

Alternatif lain: gunakan layanan hosting gambar gratis apa pun (misalnya imgur) dan
tempel URL gambarnya.

## Catatan Keamanan

- Password admin disimpan dalam bentuk **hash SHA-256**, bukan teks biasa.
- Sesi login (token) tersimpan di `localStorage` browser dan kedaluwarsa otomatis
  setelah 12 jam (diatur lewat `SESSION_DURATION_MS` di `Code.gs`).
- Karena backend berjalan di akun Google pribadi, **jangan bagikan URL Apps Script
  Editor** (bukan URL Web App) ke siapa pun, dan jaga kerahasiaan password admin.
- Untuk skala sekolah dengan banyak admin/staf, pertimbangkan menambahkan lebih dari
  satu baris di sheet `Admin` (jalankan `buatAdmin` lagi dengan username berbeda, atau
  tambahkan baris manual berisi `username` + hash password — gunakan fungsi
  `hashPassword` di Apps Script untuk membuat hash-nya).

## Troubleshooting

| Masalah | Kemungkinan Sebab & Solusi |
|---|---|
| Data tidak muncul / error CORS di console | Pastikan deployment **Who has access** = *Anyone*, dan `API_URL` di `js/config.js` sudah benar (diakhiri `/exec`). |
| "Sheet tidak ditemukan" | Jalankan ulang fungsi `setup` di Apps Script. |
| Login gagal terus | Cek username/password sesuai yang dibuat di fungsi `buatAdmin`; ingat password bersifat case-sensitive. |
| Perubahan kode `Code.gs` tidak berefek | Buat **New deployment** baru setelah mengubah kode, lalu update `API_URL` jika URL-nya berubah. |
