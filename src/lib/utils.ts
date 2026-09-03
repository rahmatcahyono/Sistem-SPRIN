import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Division, SprinStatus, SprinType } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DIVISION_LABELS: Record<Division, string> = {
  SUMDA_LOGISTIK: 'Sumda & Logistik',
  KERMA: 'Kerja Sama',
  URKEU: 'Urusan Keuangan',
  TAUD: 'Tata Urusan Dalam',
  REN: 'Perencanaan',
  OPSNAL: 'Operasional',
  GASBIN: 'Tugas Pembinaan',
  RIKUWASTU: 'Pemeriksaan & Pengawasan Mutu',
  DOKINFO: 'Dokumentasi & Informasi',
  TEKPOL: 'Teknologi Kepolisian',
};

export const SPRIN_STATUS_LABELS: Record<SprinStatus, string> = {
  DRAFT: 'Draft',
  PENDING_TTD: 'Menunggu TTD',
  ACTIVE: 'Aktif',
  CANCELLED: 'Dibatalkan',
  REPLACED_PENDING: 'Perlu Ganti Personel',
};

export const SPRIN_STATUS_COLORS: Record<SprinStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  PENDING_TTD: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  REPLACED_PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
};

export const SPRIN_TYPE_LABELS: Record<SprinType, string> = {
  BIASA: 'Sprin Biasa',
  POKJA: 'Sprin Pokja',
};

const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
];

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function generateSprinNumber(sequence: number, date: Date = new Date()): string {
  const num = String(sequence).padStart(3, '0');
  const month = ROMAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `SPRIN / ${num} / ${month} / ${year} / PUSLITBANG`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = BULAN_INDONESIA[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)} s.d. ${formatDate(end)}`;
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
