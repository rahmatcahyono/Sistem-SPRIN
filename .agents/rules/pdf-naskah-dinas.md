# Invarian Naskah Dinas Cetak PDF Polri (Sistem SPRIN)

Pedoman dan aturan tetap saat membuat atau memodifikasi generator dokumen PDF (menggunakan `@react-pdf/renderer`) pada Sistem SPRIN Puslitbang Polri:

## 1. Halaman 1 (Naskah Surat Perintah Utama)
- **Kop Surat Berada di Kiri Atas**:
  - Gunakan `alignSelf: 'flex-start'`.
  - Teks terdiri dari 3 baris instansi:
    1. `MARKAS BESAR`
    2. `KEPOLISIAN NEGARA REPUBLIK INDONESIA`
    3. `PUSAT PENELITIAN DAN PENGEMBANGAN`
  - Ketiga baris teks diratakan tengah terhadap bloknya sendiri (`alignItems: 'center'`).
  - Garis bawah hitam (`borderBottomWidth: 1, borderBottomColor: '#000000'`) diposisikan tepat di bawah baris ketiga dan **hanya membentang selebar teks kop**, tidak memotong penuh selebar halaman.
- **Logo Tribrata Polri**:
  - Diletakkan **di tengah halaman horizontal** (`alignItems: 'center'`), berada di bawah Kop Surat dan tepat di atas judul `SURAT PERINTAH`.
  - Ukuran proporsional sesuai naskah fisik resmi: `width: 48, height: 46` dengan `objectFit: 'contain'`.
  - Dilarang menyatukan logo ke dalam kop teks atau memasang garis pemisah selebar halaman di bawah logo pada Halaman 1.
- **Judul Dokumen**:
  - Teks: `SURAT PERINTAH` bergaris bawah (*underlined*, huruf kapital tebal).
  - Format nomor: `Nomor : Sprin/ [nomor]` dengan spasi tanda titik dua yang rapi.

## 2. Halaman 2 (Lampiran Daftar Personel / Susunan Tim Pokja)
- **Header Lampiran**:
  - Berada di sisi kanan atas (format `LAMPIRAN SURAT PERINTAH...`, `NOMOR : ...`, `TANGGAL : ...`).
- **Kop Mini Lampiran**:
  - Menggunakan format kop teks tengah (*MARKAS BESAR / KEPOLISIAN NEGARA REPUBLIK INDONESIA / PUSAT PENELITIAN DAN PENGEMBANGAN*).
  - Menggunakan garis pembatas horizontal penuh selebar tabel (`borderBottomWidth: 2, width: '100%'`).
- **Tabel & Susunan**:
  - Diikuti judul lampiran dan tabel susunan personel / pokja dengan kolom nomor, nama, pangkat/NRP, jabatan kesatuan, dan jabatan pokja/keterangan.
