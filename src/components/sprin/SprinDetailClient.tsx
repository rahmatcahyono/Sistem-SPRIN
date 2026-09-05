'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label, Textarea } from '@/components/ui/form-elements';
import { DIVISION_LABELS, SPRIN_STATUS_LABELS, SPRIN_TYPE_LABELS, formatDate, cn } from '@/lib/utils';
import { cetakSprin, konfirmasiTTD, batalkanSprin } from '@/lib/actions/sprin.actions';
import {
  ArrowLeft, Printer, CheckCircle, XCircle, AlertTriangle,
  Calendar, Users, Building2, FileText, History, ChevronRight,
  Copy, Check, ShieldCheck, Scale, Clock, Award, Send,
  FileCheck2, ShieldAlert, Sparkles, UserCheck
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SprinPDFDownload = dynamic(() => import('@/components/pdf/SprinPDFDownload'), { ssr: false });

interface SprinDetailClientProps {
  sprin: any;
  isOwner: boolean;
  currentUserId: string;
}

export function SprinDetailClient({ sprin, isOwner, currentUserId }: SprinDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog & clipboard states
  const [showBatalDialog, setShowBatalDialog] = useState(false);
  const [showKonfirmasiDialog, setShowKonfirmasiDialog] = useState(false);
  const [batalReason, setBatalReason] = useState('');
  const [copied, setCopied] = useState(false);

  const activeAssignments = sprin.assignments?.filter((a: any) => a.status === 'ASSIGNED') || [];

  const durationDays = Math.max(
    1,
    Math.ceil((new Date(sprin.endDate).getTime() - new Date(sprin.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  function copySprinNumber() {
    if (sprin.sprinNumber) {
      navigator.clipboard.writeText(sprin.sprinNumber);
      setCopied(true);
      toast.success('Nomor Sprin disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCetak() {
    startTransition(async () => {
      const result = await cetakSprin(sprin.id);
      if (result.error) {
        toast.error('Gagal mengunci Sprin', { description: result.error });
        return;
      }
      toast.success('Sprin dikunci — status: Menunggu TTD', {
        description: 'Dokumen PDF siap diunduh',
      });
      router.refresh();
    });
  }

  async function handleKonfirmasiTTD() {
    startTransition(async () => {
      const result = await konfirmasiTTD(sprin.id);
      if (result.error) {
        toast.error('Gagal konfirmasi TTD', { description: result.error });
        return;
      }
      toast.success('TTD dikonfirmasi — Sprin kini AKTIF!');
      setShowKonfirmasiDialog(false);
      router.refresh();
    });
  }

  async function handleBatalkan() {
    startTransition(async () => {
      const result = await batalkanSprin(sprin.id, batalReason || undefined);
      if (result.error) {
        toast.error('Gagal membatalkan Sprin', { description: result.error });
        return;
      }
      toast.success('Sprin berhasil dibatalkan', {
        description: 'Semua personel dikembalikan ke status Tersedia',
      });
      setShowBatalDialog(false);
      router.refresh();
    });
  }

  // Parse legal basis lines if multiline
  const dasarLines = sprin.description
    ? sprin.description.split('\n').filter((l: string) => l.trim().length > 0)
    : [];

  return (
    <div className="w-full space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP NAVIGATION & DOCUMENT IDENTITY HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="card-antigravity p-5 sm:p-6 bg-[#0E1726] border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/dashboard">
              <button
                className="w-11 h-11 rounded-2xl bg-[#131F33] border border-white/10 shadow-sm flex items-center justify-center text-slate-300 hover:text-white hover:border-white/20 hover:bg-[#1B2B47] transition-all active:scale-95 shrink-0"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>

            <div className="space-y-1.5 min-w-0">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge with Neon Indicator */}
                <StatusPill status={sprin.status} />

                {/* Classification Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  {SPRIN_TYPE_LABELS[sprin.type as keyof typeof SPRIN_TYPE_LABELS]}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <span>Dibuat oleh</span>
                  <strong className="text-slate-200 font-semibold">{sprin.createdBy?.name}</strong>
                  <span>({DIVISION_LABELS[sprin.createdBy?.division as keyof typeof DIVISION_LABELS] || sprin.createdBy?.division})</span>
                </span>
              </div>

              {/* Main Document Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
                {sprin.title}
              </h1>

              {/* Nomor Sprin Pill with 1-Click Copy */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  onClick={copySprinNumber}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#131F33] hover:bg-[#1B2B47] border border-white/10 text-slate-200 font-mono text-xs cursor-pointer transition-colors group"
                  title="Klik untuk menyalin nomor"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                  <span className="font-semibold text-blue-300">{sprin.sprinNumber}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  • Terdaftar pada {formatDate(sprin.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Date Tag */}
          <div className="hidden xl:flex flex-col items-end pl-6 border-l border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Durasi Penugasan</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-blue-400">{durationDays}</span>
              <span className="text-xs font-bold text-slate-300">Hari Kerja</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {formatDate(sprin.startDate)} - {formatDate(sprin.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          WARNING CALLOUT IF PERSONEL NEEDS REPLACEMENT
      ───────────────────────────────────────────────────────────── */}
      {sprin.status === 'REPLACED_PENDING' && (
        <div className="card-antigravity p-5 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 border border-orange-200 shadow-[0_4px_20px_rgba(249,115,22,0.1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-600">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-orange-950 text-sm">Perlu Penggantian Personel Segera</p>
                <p className="text-orange-800/80 text-xs mt-0.5 leading-relaxed">
                  Satu atau lebih personel pada Sprin ini telah dialihkan ke tugas prioritas lain. Silakan tentukan personel pengganti untuk melanjutkan validasi.
                </p>
              </div>
            </div>
            {isOwner && (
              <Link href={`/sprin/${sprin.id}/ganti-personel`} className="shrink-0">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md">
                  Pilih Personel Pengganti
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2-COLUMN FLOATING GRID (70% Sheet / 30% Telemetry Sticky Rail)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ═══════════════════════════════════════════════════════════
            KOLOM KIRI (70% LEBAR): LEMBAR DIGITAL UTAMA
        ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. PERTIMBANGAN */}
          {sprin.dasar && (
            <div className="sheet-antigravity p-6 sm:p-8 space-y-4 bg-[#0E1726] border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">I. Pertimbangan</h2>
                    <p className="text-[11px] font-medium text-slate-400">Konsideran dan landasan pertimbangan perintah tugas</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#060A14] p-4 sm:p-5 rounded-xl border border-white/[0.06] font-normal">
                {sprin.dasar}
              </div>
            </div>
          )}

          {/* 2. DASAR HUKUM */}
          {sprin.description && (
            <div className="sheet-antigravity p-6 sm:p-8 space-y-4 bg-[#0E1726] border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">II. Dasar Hukum</h2>
                    <p className="text-[11px] font-medium text-slate-400">Rujukan regulasi dan peraturan perundang-undangan</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {dasarLines.map((line: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#060A14] border border-white/[0.06] hover:border-white/10 transition-colors">
                    <span className="w-6 h-6 rounded-lg bg-[#131F33] border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-200 shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal pt-0.5">
                      {line.replace(/^\d+[\.\)]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. DIKTUM PERINTAH ("UNTUK") - TACTICAL COMMAND HIGHLIGHT */}
          {sprin.untuk && (
            <div className="card-antigravity p-6 sm:p-8 space-y-4 border border-blue-500/30 bg-gradient-to-br from-[#0B172E] via-[#0E1726] to-[#080D1A] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-[0_0_14px_rgba(37,99,235,0.4)]">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">III. Diktum Perintah (&quot;Untuk&quot;)</h2>
                    <p className="text-[11px] font-medium text-slate-400">Instruksi operasional mandat kedinasan</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#060A14] border border-blue-500/20 shadow-inner">
                <div className="text-xs sm:text-sm font-mono text-slate-100 leading-relaxed whitespace-pre-line">
                  {sprin.untuk}
                </div>
              </div>
            </div>
          )}

          {/* 4. DAFTAR PERSONEL DITUGASKAN */}
          <div className="sheet-antigravity p-6 sm:p-8 space-y-5 bg-[#0E1726] border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 tracking-tight">IV. Daftar Personel Pelaksana</h2>
                  <p className="text-[11px] font-medium text-slate-400">Anggota Puslitbang Polri yang tercantum dalam surat perintah</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                {activeAssignments.length} Personel
              </span>
            </div>

            {activeAssignments.length === 0 ? (
              <div className="p-8 text-center bg-[#060A14] rounded-2xl border border-dashed border-white/10 text-slate-500 text-sm">
                Belum ada personel yang ditugaskan pada surat perintah ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAssignments.map((assignment: any, index: number) => {
                  const p = assignment.personel;
                  return (
                    <div
                      key={assignment.id}
                      className="card-antigravity-interactive p-4 border border-white/[0.08] bg-[#131F33] flex items-start gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {p.name?.[0]?.toUpperCase() ?? (index + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/30">
                            {p.rank}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            NRP: {p.nrp}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 truncate mt-1 group-hover:text-blue-400 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {p.jabatan}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {DIVISION_LABELS[p.division as keyof typeof DIVISION_LABELS] || p.division}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. RIWAYAT AKTIVITAS & AUDIT TRAIL */}
          {sprin.auditLogs?.length > 0 && (
            <div className="sheet-antigravity p-6 sm:p-8 space-y-4 bg-[#0E1726] border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#131F33] border border-white/10 flex items-center justify-center text-slate-300">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">V. Jejak Audit & Riwayat Aktivitas</h2>
                    <p className="text-[11px] font-medium text-slate-400">Catatan kronologis perubahan dan pengesahan dokumen</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {sprin.auditLogs.length} Entri
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {sprin.auditLogs.map((log: any) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#0E1726] shadow-sm" />
                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/[0.06] hover:border-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-200">{log.action}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.details}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        Oleh: <strong className="text-slate-200">{log.user?.name || 'Sistem'}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            KOLOM KANAN (30% LEBAR): STICKY TACTICAL TELEMETRY RAIL
        ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-6 self-start">
          {/* TACTICAL CARD 1: AKSI KOMANDO CEPAT */}
          {isOwner && (
            <div className="card-antigravity p-5 border-blue-500/30 bg-[#0E1726] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)] animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Aksi Dokumen</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                  Kontrol Operator
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. DRAFT: Kunci & Cetak */}
                {sprin.status === 'DRAFT' && (
                  <Button
                    onClick={handleCetak}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    {isPending ? 'Memproses Dokumen...' : 'Kunci & Cetak Sprin'}
                  </Button>
                )}

                {/* 2. PENDING_TTD / ACTIVE: Download PDF */}
                {['PENDING_TTD', 'ACTIVE'].includes(sprin.status) && (
                  <div className="w-full [&>a]:w-full [&>a>button]:w-full [&>a>button]:py-2.5 [&>a>button]:rounded-xl [&>a>button]:bg-gradient-to-r [&>a>button]:from-blue-700 [&>a>button]:to-indigo-700 [&>a>button]:text-white [&>a>button]:font-bold [&>a>button]:text-xs [&>a>button]:shadow-md [&>a>button]:hover:shadow-lg">
                    <SprinPDFDownload sprin={sprin} />
                  </div>
                )}

                {/* 3. PENDING_TTD: Konfirmasi TTD Disetujui */}
                {sprin.status === 'PENDING_TTD' && (
                  <Button
                    onClick={() => setShowKonfirmasiDialog(true)}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Konfirmasi TTD Disetujui
                  </Button>
                )}

                {/* 4. REPLACED_PENDING: CTA Ganti Personel */}
                {sprin.status === 'REPLACED_PENDING' && (
                  <Link href={`/sprin/${sprin.id}/ganti-personel`} className="block w-full">
                    <Button className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-2 shadow-md">
                      <UserCheck className="w-4 h-4" />
                      Ganti Personel Pengganti
                    </Button>
                  </Link>
                )}

                {/* 5. BATALKAN: Tersedia saat DRAFT & PENDING_TTD */}
                {['DRAFT', 'PENDING_TTD'].includes(sprin.status) && (
                  <Button
                    variant="outline"
                    onClick={() => setShowBatalDialog(true)}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 font-bold text-xs gap-2 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Batalkan Dokumen Sprin
                  </Button>
                )}
              </div>

              {/* Lifecycle explanation hint */}
              {sprin.status === 'PENDING_TTD' && (
                <div className="mt-3.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Dokumen telah dikunci. Segera ajukan TTD fisik ke pimpinan, lalu klik <strong>Konfirmasi TTD</strong> setelah disahkan.</span>
                </div>
              )}
            </div>
          )}

          {/* TACTICAL CARD 2: TELEMETRI INFORMASI SPRIN */}
          <div className="sheet-antigravity p-5 space-y-3.5 bg-[#0E1726] border-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Telemetri Dokumen</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <TelemetryRow label="Nomor Sprin" value={<span className="font-mono font-bold text-[11px] text-blue-300">{sprin.sprinNumber}</span>} />
              <TelemetryRow label="Tipe Klasifikasi" value={SPRIN_TYPE_LABELS[sprin.type as keyof typeof SPRIN_TYPE_LABELS]} />
              <TelemetryRow
                label="Unit Kerja Pembuat"
                value={DIVISION_LABELS[sprin.createdBy?.division as keyof typeof DIVISION_LABELS] || sprin.createdBy?.division || '-'}
              />
              <TelemetryRow label="Operator Registrasi" value={sprin.createdBy?.name || '-'} />
              <TelemetryRow label="Tanggal Dibuat" value={formatDate(sprin.createdAt)} />
            </div>
          </div>

          {/* TACTICAL CARD 3: PERIODE & JADWAL PENUGASAN */}
          <div className="sheet-antigravity p-5 space-y-3.5 bg-[#0E1726] border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Periode Tugas</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                {durationDays} Hari
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#060A14] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Mulai</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{formatDate(sprin.startDate)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Selesai</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{formatDate(sprin.endDate)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Status Pelaksanaan</span>
                  <span className="font-bold text-blue-400">{sprin.status === 'ACTIVE' ? 'Sedang Berjalan' : 'Terjadwal'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#060A14] overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      sprin.status === 'ACTIVE' ? 'bg-emerald-500 w-3/4 animate-pulse' : 'bg-blue-600 w-full'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TACTICAL CARD 4: OTORITAS PENANDATANGAN */}
          <div className="sheet-antigravity p-5 space-y-3.5 bg-[#0E1726] border-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E2C275]">Otoritas Pengesahan</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060A14] border border-[#D4AF37]/20 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pejabat Penandatangan</p>
              <div>
                <p className="text-xs font-black text-slate-100 leading-tight">
                  {sprin.penandatanganNama || 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.'}
                </p>
                <p className="text-[11px] font-bold text-[#E2C275] mt-0.5">
                  {sprin.penandatanganPangkat || 'BRIGADIR JENDERAL POLISI'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-snug">
                  {sprin.penandatanganJabatan || 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL DIALOGS (KONFIRMASI TTD & PEMBATALAN)
      ───────────────────────────────────────────────────────────── */}
      {showKonfirmasiDialog && (
        <ConfirmDialog
          title="Konfirmasi Tanda Tangan Atasan"
          description="Apakah lembar surat perintah fisik telah resmi ditandatangani oleh pejabat yang berwenang? Dokumen akan beralih ke status AKTIF dan personel resmi terikat tugas."
          confirmText="Ya, Konfirmasi TTD Disetujui"
          confirmVariant="success"
          onConfirm={handleKonfirmasiTTD}
          onCancel={() => setShowKonfirmasiDialog(false)}
          isPending={isPending}
        />
      )}

      {showBatalDialog && (
        <ConfirmDialog
          title="Batalkan Surat Perintah"
          description="Apakah Anda yakin ingin membatalkan surat perintah ini? Semua personel yang dialokasikan akan segera dikembalikan ke status Tersedia (FREE)."
          confirmText="Batalkan Sprin Ini"
          confirmVariant="danger"
          onConfirm={handleBatalkan}
          onCancel={() => setShowBatalDialog(false)}
          isPending={isPending}
          extraContent={
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-bold text-slate-700">Alasan Pembatalan (opsional)</Label>
              <Textarea
                rows={2}
                placeholder="Contoh: Perubahan agenda kegiatan, pembatalan oleh pimpinan..."
                value={batalReason}
                onChange={(e) => setBatalReason(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          }
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 neon-glow-emerald">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
          Aktif
        </span>
      );
    case 'PENDING_TTD':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 neon-glow-amber">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" />
          Menunggu TTD
        </span>
      );
    case 'REPLACED_PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 neon-glow-amber">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)] animate-ping" />
          Perlu Ganti Personel
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 neon-glow-rose">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Dibatalkan
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Draft
        </span>
      );
  }
}

function TelemetryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-white/[0.08] last:border-none">
      <span className="text-xs font-medium text-slate-400 shrink-0">{label}</span>
      <span className="font-bold text-slate-100 text-right text-xs truncate max-w-[65%]">{value}</span>
    </div>
  );
}

function ConfirmDialog({
  title, description, confirmText, confirmVariant, onConfirm, onCancel, isPending, extraContent,
}: {
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
  extraContent?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0E1726] rounded-2xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden text-slate-100">
        <div className="p-6 space-y-3">
          <h3 className="font-extrabold text-base text-slate-100 tracking-tight">{title}</h3>
          <p className="text-slate-300 text-xs leading-relaxed">{description}</p>
          {extraContent}
        </div>
        <div className="px-6 py-4 bg-[#080D1A]/80 border-t border-white/10 flex gap-2.5 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending} className="text-xs font-bold rounded-xl border-white/10 bg-[#131F33] text-slate-200 hover:bg-[#1B2B47]">
            Batal
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'text-xs font-bold rounded-xl shadow-md',
              confirmVariant === 'danger'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            )}
          >
            {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
