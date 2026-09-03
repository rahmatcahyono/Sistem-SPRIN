'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SprinBiasaDocument, type PersonelData } from './SprinBiasaDocument';
import { SprinPokjaDocument, type PokjaPersonelData } from './SprinPokjaDocument';
import { DIVISION_LABELS } from '@/lib/utils';
import { Division } from '@prisma/client';

interface SprinPDFDownloadProps {
  sprin: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const ROMAN_MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()} ${ROMAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildSprinNumber(raw: string): string {
  // raw example: "Sprin/001/KEP./2026"  → just return the middle portion for display
  return raw;
}

// Default dasar hukum jika belum diisi operator
const DEFAULT_DASAR = [
  'Undang-Undang RI Nomor 2 Tahun 2002 tentang Kepolisian Negara Republik Indonesia;',
  'Peraturan Kapolri Nomor 22 Tahun 2010 tentang Susunan Organisasi dan Tata Kerja pada Tingkat Mabes Polri;',
  'Rencana Kegiatan Pusat Penelitian dan Pengembangan Polri.',
];

// Default pertimbangan
const DEFAULT_PERTIMBANGAN =
  'bahwa dalam rangka pelaksanaan tugas Pusat Penelitian dan Pengembangan Polri, dipandang perlu mengeluarkan Surat Perintah kepada personel yang namanya tercantum dalam lampiran surat perintah ini.';

// Default untuk list
const DEFAULT_UNTUK = [
  'Melaksanakan tugas yang diberikan dengan penuh rasa tanggung jawab.',
  'Melaporkan hasil pelaksanaan tugas kepada pimpinan.',
  'Selesai melaksanakan tugas segera kembali ke kesatuan.',
];

// Fixed pejabat data (Kapuslitbang)
const PEJABAT_NAMA = 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.';
const PEJABAT_PANGKAT = 'BRIGADIR JENDRAL POLISI';

// ─────────────────────────────────────────────────────────────────────────────
// MAP DB ASSIGNMENTS → PersonelData
// ─────────────────────────────────────────────────────────────────────────────
function mapToBiasaPersonel(assignments: any[]): PersonelData[] {
  return assignments
    .filter((a) => a.status === 'ASSIGNED')
    .map((a, idx) => ({
      no: idx + 1,
      nama: a.personel.name,
      pangkatNrp: `${a.personel.rank} / ${a.personel.nrp}`,
      jabatan: `${a.personel.jabatan} / ${DIVISION_LABELS[a.personel.division as Division] ?? a.personel.division}`,
      ket: '',
    }));
}

function mapToPokjaPersonel(assignments: any[]): PokjaPersonelData[] {
  const active = assignments.filter((a) => a.status === 'ASSIGNED');
  return active.map((a, idx) => ({
    no: idx + 1,
    nama: a.personel.name,
    pangkatNrp: `${a.personel.rank} / ${a.personel.nrp}`,
    jabatanKesatuan: `${a.personel.jabatan} / ${DIVISION_LABELS[a.personel.division as Division] ?? a.personel.division}`,
    // Simple heuristic: first person = Ketua, rest = Anggota
    jabatanPokja: idx === 0 ? 'KETUA' : 'ANGGOTA',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SprinPDFDownload({ sprin }: SprinPDFDownloadProps) {
  const fileName = `${sprin.sprinNumber.replace(/\s*\/\s*/g, '-')}.pdf`;
  const tanggalDikeluarkan = formatTanggal(sprin.createdAt ?? new Date());

  // Clean sprin number so that "Nomor: Sprin/ {cleanNumber}" formats as "Nomor: Sprin/ 001 / IX / 2026"
  let cleanNumber = (sprin.sprinNumber || '').trim();
  cleanNumber = cleanNumber.replace(/^Nomor\s*:\s*/i, '');
  cleanNumber = cleanNumber.replace(/^Sprin\s*\/\s*/i, '');
  cleanNumber = cleanNumber.replace(/^\/+/g, '').replace(/\/+$/g, '').trim();

  // Pejabat penandatangan
  const pejabatJabatan = sprin.penandatanganJabatan || 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI';
  const pejabatNama = sprin.penandatanganNama || 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.';
  const pejabatPangkat = sprin.penandatanganPangkat || 'BRIGADIR JENDRAL POLISI';

  // Pertimbangan & Dasar:
  // In the form:
  // 'dasar' textarea is labeled 'Pertimbangan' (catatan bagian pertimbangan)
  // 'description' textarea is labeled 'Dasar' (catatan bagian dasar)
  const pertimbangan = sprin.dasar && sprin.dasar.trim().length > 0
    ? sprin.dasar
    : DEFAULT_PERTIMBANGAN;

  const dasarList: string[] =
    sprin.description && sprin.description.trim().length > 0
      ? sprin.description.split('\n').map((s: string) => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
      : DEFAULT_DASAR;

  // Parse untuk — if operator filled custom tasks, parse each line; otherwise use standard default
  const untukList: string[] =
    sprin.untuk && sprin.untuk.trim().length > 0
      ? sprin.untuk
          .split('\n')
          .map((s: string) => s.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*•]\s*/, '').trim())
          .filter(Boolean)
      : [
          `Melaksanakan ${sprin.title} mulai tanggal ${formatTanggal(sprin.startDate)} s.d. ${formatTanggal(sprin.endDate)}.`,
          'Melaporkan pelaksanaan tugas kepada pimpinan.',
          'Selesai melaksanakan tugas segera kembali ke kesatuan.',
        ];

  const isPokja = sprin.type === 'POKJA';

  const document = isPokja ? (
    <SprinPokjaDocument
      sprinNumber={cleanNumber}
      namaPokja={sprin.title}
      pertimbangan={pertimbangan}
      dasarList={dasarList}
      untukList={untukList}
      tanggalDikeluarkan={tanggalDikeluarkan}
      pejabatJabatan={pejabatJabatan}
      pejabatNama={pejabatNama}
      pejabatPangkat={pejabatPangkat}
      personelList={mapToPokjaPersonel(sprin.assignments)}
    />
  ) : (
    <SprinBiasaDocument
      sprinNumber={cleanNumber}
      pertimbangan={pertimbangan}
      dasarList={dasarList}
      untukList={untukList}
      tanggalDikeluarkan={tanggalDikeluarkan}
      pejabatJabatan={pejabatJabatan}
      pejabatNama={pejabatNama}
      pejabatPangkat={pejabatPangkat}
      personelList={mapToBiasaPersonel(sprin.assignments)}
    />
  );

  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading }) => (
        <Button variant="outline" disabled={loading} className="gap-2">
          <Printer className="w-4 h-4" />
          {loading ? 'Menyiapkan PDF...' : 'Unduh PDF Sprin'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
