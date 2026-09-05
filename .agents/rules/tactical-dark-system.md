# Standar Desain "Tactical Command Dark Mode" (Puslitbang Polri)

Pedoman dan aturan sistem desain antarmuka web Sistem SPRIN Puslitbang Polri:

## 1. Palet Warna & Kanvas Latar Belakang
- **Larangan Putih Polos**: Dilarang menggunakan kanvas latar belakang berwarna putih polos (`#FFFFFF`) pada halaman manapun.
- **Warna Kanvas Utama**: Gunakan *Rich Deep Navy* (`#080D1A` atau gradasi `#060B18` via `#0A1428` to `#060B18`).
- **Tekstur Teknologi**: Lapisi kanvas dengan pola *subtle mesh grid* garis tipis (`bg-[linear-gradient(...)]`) dengan *radial mask*.
- **Permukaan Kartu (Cards)**: Gunakan warna gelap solid (`#161F30` atau `#0E1726`), sudut membulat halus (`rounded-[20px]`), bayangan lembut (*subtle drop shadow*), dan border tipis halus (`border-white/[0.08]`). Hindari border kaku berwarna abu-abu terang.
- **Kotak Input Formulir**: Gunakan warna latar yang sedikit lebih gelap dari kartu (`#0C1322`), dengan efek *focus glow* berwarna Emas Tribrata (`#EAB308` / `#FFB100`).

## 2. Tombol Aksi & Operator Selector
- **Tombol Utama (CTA)**: Menggunakan warna Emas Polri (`#FFB100` atau `#EAB308`) dengan teks hitam tebal (`text-slate-950 font-bold`).
- **Fitur Quick Login / Pemilihan Divisi Operator**:
  - Dilarang menggunakan tombol panjang dinamis seperti awan tag (*tag clouds*) yang berantakan.
  - Wajib disusun ke dalam sistem **Grid Simetris Konstan** (misal: Grid 5 Kolom x 2 Baris untuk 10 divisi kerja).
  - Setiap tombol operator wajib memiliki dimensi lebar dan tinggi yang **sama persis** (`h-9 w-full`), latar gelap semi-transparan (`bg-[#0C1322]/80`), dan teks terpusat (*centered text*).

## 3. Kartu Statistik & Filter Interaktif (Clickable Stat Toggles)
- **Efek Elevasi**: Kartu memiliki efek terangkat saat disorot kursor (`hover:-translate-y-1`).
- **Glow Sesuai Kategori**: Memiliki pendaran bayangan border halus (*subtle glow*) sesuai tema warnanya (Total = Biru, Aktif = Emerald/Hijau, Menunggu TTD = Amber/Kuning, Draft = Slate/Abu-abu, Perlu Pengganti = Rose/Merah).
- **Petunjuk Akses (Affordance Hint)**: Teks kecil "Lihat" atau ikon panah `ArrowUpRight` di pojok kanan bawah yang hanya muncul atau menjadi terang saat kartu di-hover (`group-hover:opacity-100`).
- **State Kosong (Count === 0)**: Diberikan gaya CSS redup (`opacity-55`, desaturasi) dan badge "Nihil" agar tidak mendistraksi operator dari data aktif atau kartu kritis yang membutuhkan tindakan.

## 4. Kontras Teks (High Contrast & WCAG AAA)
- Teks pada permukaan gelap wajib menggunakan warna terang kontras (`text-slate-100` atau `text-slate-200`).
- Dilarang keras menggunakan kelas gelap seperti `text-slate-800` atau `text-gray-900` di dalam kartu atau elemen bertema gelap, karena menyebabkan teks tidak terbaca atau tampak samar.
