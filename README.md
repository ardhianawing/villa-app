# VillaPro — Villa Management System

Aplikasi manajemen villa internal untuk **Operator** dan **Owner/Investor**. Dibangun dengan React + TypeScript + Tailwind CSS v4.

**Demo:** https://ardhianawing.github.io/villa-app/

---

## Login Demo

| Role | Akses |
|------|-------|
| **Operator** | Full control — input booking, kelola unit, lihat keuangan & pengaturan |
| **Owner** | View only — pantau availability, booking, keuangan, laporan |

---

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Deploy:** GitHub Pages (`gh-pages`)

---

## Fitur yang Sudah Ada

- [x] Login role-based (Operator / Owner)
- [x] Dashboard — stat cards, check-in/out hari ini, upcoming bookings
- [x] Availability Grid — 14 hari (desktop) / 7 hari (mobile), booking blocks
- [x] Tambah booking + DP & pelunasan payment flow
- [x] Role differentiation — Owner view-only, Operator full-control
- [x] Mobile-first — bottom navigation, bottom sheet modal
- [x] Multi-villa selector

## Fitur Planned

- [ ] Halaman Bookings — list + filter + search
- [ ] Halaman Keuangan — rekap pembayaran, DP vs lunas
- [ ] Rate management — harga per kavling + override tanggal tertentu
- [ ] Halaman Laporan — occupancy rate, revenue per villa
- [ ] Villa & Unit management (operator only)
- [ ] Pengaturan akun

---

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build
npm run deploy    # build + deploy ke GitHub Pages
```

---

## Dokumen

- [`PLAN.md`](./PLAN.md) — product plan, data model, roadmap
- [`CHANGELOG.md`](./CHANGELOG.md) — log progress per sesi
