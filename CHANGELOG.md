# Changelog — VillaPro

---

## Sesi 1 — 2026-04-08

### Inisialisasi Project
- Setup project baru dengan Vite + React + TypeScript + Tailwind CSS v4
- Riset referensi: Guesty, Hostaway, Little Hotelier, Cloudbeds, Lodgify, KelolaPro, SuperKos
- Buat `PLAN.md` v2.0 dengan product overview, data model, booking flow, roadmap

### Data & Types
- Definisi tipe lengkap: `Booking`, `Unit`, `Villa`, `User`, `Payment`, `BookingStatus`, `BookingSource`, dll
- Mock data: 2 villa, 15 unit kavling, 20+ booking dengan berbagai status dan payment

### Komponen UI
- `Layout` — Sidebar (desktop) + Header + BottomNav (mobile) + main content area
- `Sidebar` — collapsible, menu items dengan icon, user info di bawah
- `Header` — villa selector dropdown, notification bell, user avatar + logout
- `BottomNav` — 5 tab mobile navigation
- `StatusBadge` — badge warna per status booking

### Halaman
- **Login** — 2 tombol: "Masuk sebagai Operator" dan "Masuk sebagai Owner"
- **Dashboard** — stat cards (check-in/out hari ini, unit terisi, pendapatan bulan ini), list check-in & check-out hari ini, tabel upcoming bookings
- **Availability Grid** — grid unit × tanggal, booking blocks dengan colSpan, navigasi tanggal, bottom sheet form tambah booking, detail booking + ubah status + pelunasan

### Mobile Optimization
- Bottom navigation (mobile) vs Sidebar (desktop)
- Grid 7 hari di mobile, 14 hari di desktop
- Bottom sheet modal untuk form booking di mobile
- Card list untuk upcoming bookings di mobile (bukan tabel)
- `useIsMobile()` hook

### Role Differentiation
- Sidebar filter menu berdasarkan role (`ownerVisible` per item)
  - Owner: Dashboard, Availability, Bookings, Keuangan, Laporan
  - Operator: semua menu termasuk Villa & Unit, Pengaturan
- BottomNav berbeda per role:
  - Owner: tab ke-5 = Laporan
  - Operator: tab ke-5 = Lainnya (Pengaturan)
- Availability grid read-only untuk Owner (tidak bisa tambah booking, badge "View Only")

### Deploy
- GitHub repo: https://github.com/ardhianawing/villa-app
- GitHub Pages: https://ardhianawing.github.io/villa-app/
- Script deploy: `gh-pages` dengan `--nojekyll`, base `/villa-app/`

---

## Backlog

| Fitur | Priority | Notes |
|-------|----------|-------|
| Halaman Bookings | High | List + filter status + search tamu |
| Halaman Keuangan | High | Rekap DP vs lunas, export |
| Rate management | Medium | Harga default per kavling + override tanggal |
| Halaman Laporan | Medium | Occupancy rate, revenue chart |
| Villa & Unit management | Low | CRUD villa dan kavling |
| Pengaturan | Low | Profil, notifikasi |
