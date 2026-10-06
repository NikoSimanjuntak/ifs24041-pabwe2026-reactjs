# Lost & Found Del — ReactJS (JavaScript)

Aplikasi pelaporan barang hilang & temuan berbasis **React 19 + Vite + Tailwind CSS v4 + Redux Toolkit**, memakai
[Delcom Open API](https://open-api.delcom.org/docs/1.0/api-lost-founds).

## Menjalankan
```bash
bun install
cp .env.example .env     # sesuaikan APP_PORT / DELCOM_BASEURL bila perlu
bun run dev              # http://localhost:$APP_PORT
bun run build            # build produksi
bun run test             # Vitest
bun run coverage         # Vitest + coverage (threshold di vite.config.js)
```

## Struktur
```
src/
├─ helpers/        apiHelper.js, toolsHelper.js
├─ hooks/          useInput.js
├─ components/     Avatar, Logo, Spinner, StatusBadge (UI bersama)
├─ features/
│  ├─ auth/        api · states · layouts/AuthLayout · pages (Login, Register)
│  ├─ users/       api · states · pages (Users, Profile)
│  └─ lost-founds/ api · states · layouts · components (Navbar, Sidebar) · modals · pages (Home, Detail)
├─ store.js · App.jsx · main.jsx · setupTests.js · test-utils.jsx
```

## Rute
| Rute | Halaman |
|---|---|
| `/auth/login`, `/auth/register` | Autentikasi (dialihkan ke `/` bila sudah login) |
| `/` | Beranda: ringkasan, statistik, filter, live search |
| `/lost-founds/:id` | Detail laporan |
| `/users` · `/profile` | Daftar pengguna · Profil & pengaturan akun |
