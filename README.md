# React + Express Auth Starter

Project website fullstack dengan:

- React + Vite untuk frontend
- ExpressJS untuk backend API
- JWT untuk autentikasi
- Middleware proteksi route dan role di backend
- Guard route di frontend
- Role `superadmin`, `admin`, dan `marketing`
- Dashboard aktivitas sesuai role
- Backend tersambung ke MySQL

## Menjalankan Project

```bash
npm install
npm run dev
```

Jika PowerShell memblokir `npm`, gunakan:

```bash
npm.cmd install
npm.cmd run dev
```

Frontend berjalan di `http://localhost:5173` dan backend di `http://localhost:5050`.

## Akun Demo

- Superadmin: `superadmin@example.com` / `password123`
- Admin Cabang: `admin.jakarta@example.com` / `password123`
- Marketing: `marketing.rina@example.com` / `password123`

## Struktur Singkat

- `client` untuk aplikasi React
- `server` untuk Express API

## Konfigurasi Port

Default backend memakai port `5050`. Jika ingin mengganti, buat file `server/.env` berdasarkan `server/.env.example`.

## Konfigurasi MySQL

Backend sekarang memakai MySQL dan akan otomatis:

- membuat database jika belum ada
- membuat tabel yang dibutuhkan
- melakukan seed data demo jika tabel `users` masih kosong

Contoh konfigurasi di `server/.env`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=ecard_platform_db
```

## Tunneling dan Scan QR

Supaya QR bisa discan dari HP saat development:

1. Jalankan frontend dan backend seperti biasa.
2. Buat tunnel ke frontend Vite, misalnya `http://localhost:5173`.
3. Isi `CLIENT_URL` di `server/.env` dengan URL tunnel frontend, misalnya:

```env
CLIENT_URL=https://namatunnel-anda.ngrok-free.app
```

4. Restart backend setelah `CLIENT_URL` berubah.

Catatan penting:

- QR e-card memakai `CLIENT_URL` sebagai link publik.
- Saat backend start ulang, QR yang sudah ada akan diregenerate mengikuti `CLIENT_URL` terbaru.
- Vite sudah diset `host 0.0.0.0` agar mudah dipublish lewat tunnel.
- Backend CORS mengizinkan `CLIENT_URL`, `localhost:5173`, dan `127.0.0.1:5173`.
- Satu marketing sekarang hanya memiliki 1 QR e-card.

## Aktivitas Role

- `superadmin` mengelola seluruh resource, cabang, admin, dan marketing
- `admin` mengelola marketing di cabangnya dan membuat akun marketing
- `marketing` mengelola biodata pribadi, social media, sertifikat, dan membuat E-Card QR Code
