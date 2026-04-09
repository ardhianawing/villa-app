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

## Sesi 2 — 2026-04-08

### Data Update
- Mock data diganti ke data riil: **Zhafira Villa Residence**, Jl. Imam Bonjol Atas No.27, Kota Batu
- 15 unit villa (Villa 1–15), harga Rp 850rb–1.5jt/malam
- 1 villa (hapus villa kedua yang fiktif), 20+ booking tersebar April–Mei 2026

### Visual Overhaul — "Refined Hospitality" Design
Seluruh UI di-redesign dari generic blue-gray menjadi warm earth tone aesthetic:

**Typography**
- DM Sans (body/headings) + DM Mono (tanggal, harga, monospace labels)
- Menggantikan Inter yang terlalu generik

**Color Palette**
- Terracotta `#c4704b` — accent utama, today highlight, CTA buttons
- Sage `#7c8c6e` — available/success state
- Sand `#d4c5b2` — separator, subtle accents
- Warm grays `#44312a` → `#fdf8f6` — text & background hierarchy
- Purple `#7b6b8a` — checkout state

**Dashboard**
- Stat cards dengan warm accents dan left-border accent
- Unit cards dengan earthy gradient (sage=tersedia, terracotta=terisi, gold=check-in, purple=checkout, slate=maintenance, teal=upcoming)
- Dot-pattern overlay + radial glow + hover lift animation
- Klik unit → monthly calendar modal

**Availability Grid**
- Monospace date headers, terracotta "Hari Ini" highlight
- Sage-colored available cells (bukan hijau terang)
- Warm-styled booking form modal dan detail modal
- Action buttons dengan gradient (bk-action classes)

**Bookings Page (baru)**
- Date strip cards — kolom tanggal monospace di kiri setiap booking card
- Status tab navigation dengan underline style (bukan chip/pill)
- Search bar dengan warm tones
- Payment timeline dengan dot-line visualization
- Detail modal dengan colored accent border per status
- Filter by status, sortable, searchable

**Calendar Modal**
- Terracotta accent border header
- Monospace day numbers, terracotta weekend & today highlight
- Booking bars berwarna per status
- Detail panel dengan warm background
- Source icons (emoji) untuk sumber booking

### CSS Architecture
- Custom CSS variables (`--bk-warm-*`, `--bk-sage`, `--bk-terracotta`, `--bk-sand`)
- Component classes: `.bk-card`, `.bk-date-strip`, `.bk-tab`, `.bk-search`, `.bk-action`
- Animations: `bk-slide-in`, `bk-modal-enter`, `card-pop`
- Google Fonts: DM Sans + DM Mono

---

---

## Sesi 3 — 2026-04-09

### Data & Types
- Tambah tipe `Expense` untuk pencatatan biaya operasional
- Tambah `mockExpenses` di `mockData.ts`

### Halaman Keuangan (Finance)
- **Summary Cards** — Total Pemasukan, Piutang/Pending, Total Pengeluaran, Profit Bersih
- **Tabs System** — Switch antara Riwayat Transaksi (Pemasukan) dan Biaya Operasional (Pengeluaran)
- **Visual Analytics** — Monthly Revenue trend chart (mock) dan Financial Health indicators
- **Transaction List** — Tabel detail dengan filter, search, identitas unit, dan status pelunasan
- **Quick Actions** — Setoran, Tagihan, dan Export Rekap Bulanan

### Halaman Laporan (Reports)
- **Analytics Dashboard** — Ringkasan Occupancy Rate, Total Bookings, Avg Stay, dan Repeat Guest Rate
- **Unit Performance Index** — Visualisasi performa per unit villa dengan bar indicators
- **Booking Source Breakdown** — Donut chart (CSS-based) untuk melihat kontribusi tiap channel (WA, IG, OTA)
- **Geographic Insights** — Placeholder untuk Map Guest Origin data

---

## Backlog

| Fitur | Priority | Notes |
|-------|----------|-------|
| ~~Halaman Bookings~~ | ~~High~~ | ~~Done — Sesi 2~~ |
| ~~Halaman Keuangan~~ | ~~High~~ | ~~Done — Sesi 3~~ |
| ~~Halaman Laporan~~ | ~~Medium~~ | ~~Done — Sesi 3~~ |
| Rate management | Medium | Harga default per kavling + override tanggal |
| Villa & Unit management | Low | CRUD villa dan kavling |
| Pengaturan | Low | Profil, notifikasi |
