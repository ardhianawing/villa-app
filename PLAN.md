# 📋 VillaPro — Project Plan v2.0

> Disempurnakan berdasarkan riset dari: Guesty, Hostaway, Little Hotelier, Cloudbeds, Lodgify, Booking Ninjas, GuestPro, KelolaPro, SuperKos, DOTERB, AMSOL SIKOS

---

## 1. Product Overview

Aplikasi **Villa Management System** internal untuk membantu **Operator** mengelola booking villa harian dari berbagai **Owner/Investor** secara terpusat.

**Flow utama:**
> Tamu booking via WA → Operator input ke app → App tampilkan grid availability → Operator assign unit → Tamu bayar DP → Check-in → Pelunasan → Check-out → Owner pantau hasil

### Core Principles
- **Visual first** — grid unit + kalender availability, langsung terlihat situasi
- **Cepat input** — operator bisa input booking dalam hitungan detik
- **Transparan ke owner** — owner bisa pantau properti & keuangan kapan saja
- **Role-based** — Owner view-only, Operator full-control

---

## 2. Hierarki Data

```
Operator
└── Villa "Villa Puncak Indah" (owner: Investor A)
│   └── Kavling A, Kavling B, ... Kavling O (15 unit)
│       └── Booking → Tamu → Pembayaran
└── Villa "Villa Bukit Asri" (owner: Investor B)
    └── Kavling 1, Kavling 2, ... (n unit)
        └── Booking → Tamu → Pembayaran
```

---

## 3. User Roles & Access

### Operator (Full Control)

| Akses | Keterangan |
|-------|-----------|
| Kelola villa & unit | CRUD villa, tambah/edit kavling |
| Input booking | Data tamu, tanggal, unit, harga |
| Kelola pembayaran | Input DP, pelunasan, security deposit |
| Availability view | Grid unit per tanggal |
| Blackout dates | Blokir tanggal untuk renovasi/maintenance |
| Lihat semua villa | Lintas owner |
| Laporan keuangan | Per villa, per periode |

### Owner / Investor (View Only)

| Akses | Keterangan |
|-------|-----------|
| Dashboard properti | Occupancy hari ini, bulan ini |
| Daftar booking | Booking aktif & history properti miliknya |
| Laporan keuangan | Pendapatan, pengeluaran, net profit |
| Owner statement | Export PDF/Excel per periode |
| CCTV | Akses CCTV properti miliknya |

> Owner **tidak bisa** edit data apapun.

---

## 4. Status Booking

```
INQUIRY → CONFIRMED → FULLY_PAID → CHECKED_IN → CHECKED_OUT
                ↓
           CANCELLED
```

| Status | Warna | Keterangan |
|--------|-------|-----------|
| **INQUIRY** | Abu-abu | Tamu tanya-tanya, belum pasti |
| **CONFIRMED** | Kuning | DP sudah dibayar, booking dikonfirmasi |
| **FULLY_PAID** | Biru | Lunas sebelum check-in |
| **CHECKED_IN** | Merah | Tamu sedang menginap |
| **CHECKED_OUT** | Hijau muda | Tamu sudah keluar, unit perlu dibersihkan |
| **CANCELLED** | Merah tua | Booking dibatalkan |

---

## 5. Alur Input Booking (Detail)

```
1. Operator buka Availability View
2. Pilih tanggal check-in & check-out
3. Grid 15 unit tampil → warna per status di rentang tanggal tsb
4. Operator klik unit kosong
5. Form booking muncul:
   ├── Data Tamu
   │   ├── Nama lengkap *
   │   ├── Nomor WhatsApp *
   │   ├── Jumlah tamu *
   │   ├── Asal booking (WA / Instagram / Walk-in / Referral / OTA) *
   │   └── Catatan khusus (request kamar, dll)
   ├── Detail Booking
   │   ├── Unit/Kavling (sudah terisi)
   │   ├── Check-in (sudah terisi)
   │   ├── Check-out (sudah terisi)
   │   ├── Jumlah malam (auto-hitung)
   │   └── Harga per malam + Total (auto-hitung)
   └── Pembayaran
       ├── DP (nominal) *
       ├── Metode bayar DP (Cash / Transfer / QRIS)
       └── Security deposit (opsional)
6. Simpan → status CONFIRMED, unit berubah warna di grid
7. Saat check-in → input pelunasan → status CHECKED_IN
8. Saat check-out → status CHECKED_OUT, kembalikan security deposit
```

---

## 6. Fitur Lengkap

### 6.1 Dashboard
- **Summary hari ini:** unit terisi, unit kosong, check-in hari ini, check-out hari ini
- **Pemasukan bulan ini:** total pendapatan, pending pelunasan
- **Tamu check-in hari ini:** nama, unit, jam check-in
- **Tamu check-out hari ini:** nama, unit
- **Upcoming booking:** 7 hari ke depan

### 6.2 Availability View (Fitur Utama)
- Pilih rentang tanggal → grid unit tampil dengan warna status
- Klik unit kosong → langsung buka form booking
- Klik unit terisi → lihat detail booking
- Filter per villa (jika operator kelola banyak villa)

### 6.3 Kalender View
- Tampilan Gantt chart: baris = unit, kolom = tanggal
- Blok berwarna per status booking
- Scroll horizontal untuk navigasi bulan
- Klik blok → detail booking

### 6.4 Manajemen Booking
- List semua booking (filter: tanggal, unit, status, asal booking)
- Detail booking: data tamu, tanggal, pembayaran, history perubahan
- Edit booking (reschedule, ganti unit)
- Batalkan booking (dengan catatan alasan + penalti)
- Riwayat tamu (apakah tamu pernah menginap sebelumnya)

### 6.5 Manajemen Pembayaran
- **DP** — input saat booking, nominal + metode
- **Pelunasan** — input saat check-in atau sebelumnya
- **Security deposit** — dicatat terpisah, dikembalikan saat check-out
- **Status pembayaran:** Belum DP / DP / Lunas
- **Sisa tagihan** — selalu terlihat di detail booking
- **Riwayat pembayaran** per booking (siapa yang terima, kapan, metode)
- Invoice/kuitansi digital per transaksi (printable)

### 6.6 Blackout Dates
- Blokir rentang tanggal per unit (renovasi, maintenance, personal use)
- Alasan blokir (catatan internal)
- Tampil di grid sebagai warna ungu/abu

### 6.7 Source Tracking
- Setiap booking tercatat asal-usulnya: WhatsApp, Instagram, Walk-in, Referral, OTA (Airbnb, Traveloka, dll)
- Laporan: booking paling banyak dari channel mana

### 6.8 Manajemen Villa & Unit
- CRUD villa (nama, alamat, kota, provinsi, Google Maps, foto cover, galeri foto, CCTV)
- CRUD kavling per villa (nama, harga/malam, fasilitas, foto)
- Set harga weekday / weekend / high season (v2)

### 6.9 Owner View
- Dashboard properti miliknya
- Occupancy rate per bulan
- Pendapatan & pengeluaran per periode
- Daftar booking aktif
- **Owner Statement** — laporan bulanan yang bisa di-export PDF/Excel

### 6.10 Laporan
- Laporan booking per periode (filter: villa, unit, status)
- Laporan keuangan (pendapatan, pengeluaran, net profit)
- Laporan occupancy rate per villa/unit
- Laporan asal booking (source tracking)
- Laporan tamu (repeat guest, tamu baru)
- Export PDF / Excel

---

## 7. Registrasi Villa

### Step 1 — Informasi Dasar
| Field | Wajib |
|-------|-------|
| Nama Villa | ✅ |
| Owner (pilih/tambah baru) | ✅ |

### Step 2 — Lokasi
| Field | Wajib |
|-------|-------|
| Alamat lengkap | ✅ |
| Kota | ✅ |
| Provinsi | ✅ |
| Kode Pos | - |
| Link Google Maps | - |

### Step 3 — Foto
| Field | Wajib |
|-------|-------|
| Foto cover | ✅ |
| Galeri foto (maks 10) | - |
| Caption per foto | - |

### Step 4 — Informasi Tambahan
| Field | Wajib |
|-------|-------|
| Deskripsi villa | - |
| Fasilitas villa (checklist) | - |
| Link CCTV | - |
| Label CCTV | - |

### Step 5 — Setup Kavling
- Tambah satu per satu atau bulk (input jumlah → auto-generate label)
- Per kavling: nama, harga/malam, fasilitas, foto

---

## 8. Data Model (Prisma Schema)

```prisma
enum BookingStatus {
  INQUIRY
  CONFIRMED
  FULLY_PAID
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
}

enum UnitStatus {
  AVAILABLE
  MAINTENANCE
}

enum PaymentType {
  DP
  PELUNASAN
  SECURITY_DEPOSIT
  REFUND
}

enum PaymentMethod {
  CASH
  TRANSFER
  QRIS
}

enum BookingSource {
  WHATSAPP
  INSTAGRAM
  WALK_IN
  REFERRAL
  AIRBNB
  TRAVELOKA
  BOOKING_COM
  OTHER
}

model Owner {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String   @unique
  villas    Villa[]
  createdAt DateTime @default(now())
}

model Villa {
  id            String       @id @default(cuid())
  name          String
  address       String
  city          String
  province      String
  googleMapsUrl String?
  coverPhoto    String?
  photos        VillaPhoto[]
  cctvLink      String?
  cctvLabel     String?
  description   String?
  facilities    String[]
  owner         Owner        @relation(fields: [ownerId], references: [id])
  ownerId       String
  operatorId    String
  units         Unit[]
  expenses      Expense[]
  createdAt     DateTime     @default(now())
}

model VillaPhoto {
  id        String   @id @default(cuid())
  villaId   String
  villa     Villa    @relation(fields: [villaId], references: [id])
  url       String
  caption   String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model Unit {
  id           String      @id @default(cuid())
  villaId      String
  villa        Villa       @relation(fields: [villaId], references: [id])
  label        String      // "Kavling A", "Kavling B", ...
  pricePerNight Int
  facilities   String[]
  status       UnitStatus  @default(AVAILABLE)
  bookings     Booking[]
  blackouts    Blackout[]
  createdAt    DateTime    @default(now())
}

model Booking {
  id              String        @id @default(cuid())
  unitId          String
  unit            Unit          @relation(fields: [unitId], references: [id])
  guestName       String
  guestPhone      String
  guestCount      Int
  source          BookingSource @default(WHATSAPP)
  checkIn         DateTime
  checkOut        DateTime
  nights          Int
  pricePerNight   Int
  totalPrice      Int
  status          BookingStatus @default(INQUIRY)
  notes           String?
  cancelReason    String?
  payments        Payment[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Payment {
  id        String        @id @default(cuid())
  bookingId String
  booking   Booking       @relation(fields: [bookingId], references: [id])
  amount    Int
  type      PaymentType
  method    PaymentMethod
  note      String?
  paidAt    DateTime      @default(now())
  createdAt DateTime      @default(now())
}

model Blackout {
  id        String   @id @default(cuid())
  unitId    String
  unit      Unit     @relation(fields: [unitId], references: [id])
  startDate DateTime
  endDate   DateTime
  reason    String?
  createdAt DateTime @default(now())
}

model Expense {
  id        String   @id @default(cuid())
  villaId   String
  label     String
  amount    Int
  date      DateTime
  note      String?
  createdAt DateTime @default(now())
}
```

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State | useState + Context |
| Data | Mock data (prototype) → REST API (production) |
| Deploy | GitHub Pages (prototype) |

---

## 10. Feature Roadmap

### v1.0 — MVP Prototype (Mock Data)
- [ ] Login — tombol demo langsung masuk
- [ ] Dashboard — summary hari ini
- [ ] Availability view — grid unit per tanggal dengan warna status
- [ ] Input booking — form lengkap dengan source tracking
- [ ] Detail booking + status tracking
- [ ] Pembayaran — DP & pelunasan
- [ ] Blackout dates
- [ ] Manajemen villa & unit (mock)
- [ ] Owner view — dashboard properti miliknya

### v2.0 — Enhanced
- [ ] Kalender Gantt chart view
- [ ] Harga weekday / weekend / high season
- [ ] Owner statement export PDF/Excel
- [ ] Laporan source booking
- [ ] Riwayat tamu (repeat guest detection)
- [ ] Invoice/kuitansi digital printable
- [ ] WhatsApp reminder otomatis ke tamu

### v3.0 — Production
- [ ] Backend NestJS + PostgreSQL
- [ ] Auth JWT (operator & owner login terpisah)
- [ ] Upload foto (S3/local storage)
- [ ] Multi operator
- [ ] Integrasi payment gateway (QRIS, transfer)

---

**Status:** Planning ✅
**Version:** 0.1.0
**Last Updated:** April 2026
