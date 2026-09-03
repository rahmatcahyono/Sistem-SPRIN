# Sistem SPRIN Puslitbang

Sistem Manajemen Surat Perintah (Sprin) untuk Pusat Penelitian dan Pengembangan Polri.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres + Prisma ORM
- **Auth**: NextAuth.js v5 (Credentials)
- **PDF**: @react-pdf/renderer

## Setup

### 1. Clone & Install
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database
```bash
npm run db:push     # Push schema to Neon
npm run db:seed     # Seed 10 operators + 30 personnel
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials (after seed)

| Username | Password | Division |
|----------|----------|----------|
| ren | sprin2024 | Perencanaan |
| opsnal | sprin2024 | Operasional |
| tekpol | sprin2024 | Teknologi Kepolisian |
| dokinfo | sprin2024 | Dokumentasi & Informasi |
| kerma | sprin2024 | Kerja Sama |
| urkeu | sprin2024 | Urusan Keuangan |
| taud | sprin2024 | Tata Urusan Dalam |
| gasbin | sprin2024 | Tugas Pembinaan |
| rikuwastu | sprin2024 | Pemeriksaan & Pengawasan Mutu |
| sumda.logistik | sprin2024 | Sumda & Logistik |

## Workflow

1. **Buat Sprin** → Pilih personel → Cek ketersediaan real-time
2. **Konflik terdeteksi** → Kirim permintaan override ke Operator lain
3. **Operator 1 setuju** → Personel dialihkan, Operator 1 pilih pengganti
4. **Cetak Sprin** → Status PENDING_TTD, PDF di-generate
5. **Konfirmasi TTD** → Status ACTIVE (setelah TTD fisik didapat)
6. **Batalkan** → Status CANCELLED, personel dikembalikan FREE
