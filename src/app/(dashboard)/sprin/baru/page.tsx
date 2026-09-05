'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, Textarea, Select, Badge } from '@/components/ui/form-elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonelPicker } from '@/components/sprin/PersonelPicker';
import { ConflictModal } from '@/components/sprin/ConflictModal';
import { createSprin, createSprinDraft, submitConflictRequest } from '@/lib/actions/sprin.actions';
import {
  ArrowLeft, ArrowRight, FileText, Users, Check,
  Calendar, ShieldCheck, Award, Sparkles, CheckCircle2,
  Clock, AlertCircle, Building2, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { title: 'Informasi Sprin', desc: 'Identitas & Perihal' },
  { title: 'Pilih Personel', desc: 'Alokasi Anggota' },
  { title: 'Konfirmasi', desc: 'Validasi Akhir' },
];

export default function BuatSprinPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    type: 'BIASA',
    nomorPart1: '',
    nomorPart2: 'IX',
    nomorPart3: '2026',
    title: '',
    description: '',
    dasar: '',
    untuk: '',
    penandatanganJabatan: 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI',
    penandatanganNama: 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.',
    penandatanganPangkat: 'BRIGADIR JENDRAL POLISI',
    startDate: '',
    endDate: '',
  });
  const [selectedPersonelIds, setSelectedPersonelIds] = useState<string[]>([]);

  // Conflict state
  const [conflictData, setConflictData] = useState<any[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingSprinId, setPendingSprinId] = useState<string | null>(null);

  function handleFormChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Calculate live duration days
  const durationDays = formData.startDate && formData.endDate && new Date(formData.endDate) >= new Date(formData.startDate)
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  async function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      const customSprinNumber = formData.nomorPart1.trim()
        ? `${formData.nomorPart1.trim()} / ${formData.nomorPart2.trim()} / ${formData.nomorPart3.trim()}`
        : '';
      fd.append('customSprinNumber', customSprinNumber);
      selectedPersonelIds.forEach((id) => fd.append('personelIds', id));

      const result = await createSprin(fd);

      if (result.error === 'CONFLICT_DETECTED') {
        setConflictData(result.conflicts ?? []);
        setShowConflictModal(true);
        return;
      }

      if (result.error) {
        toast.error('Gagal membuat Sprin', { description: result.error });
        return;
      }

      toast.success('Sprin berhasil dibuat!');
      router.push(`/sprin/${result.sprinId}`);
    });
  }

  async function handleConflictOverride(
    conflictItem: any,
    overrideReason: string,
    draftSprinId: string
  ) {
    startTransition(async () => {
      const result = await submitConflictRequest({
        existingSprinId: conflictItem.existingSprinId,
        requestedSprinId: draftSprinId,
        targetPersonelId: conflictItem.personelId,
        reason: overrideReason,
      });

      if (result.error) {
        toast.error('Gagal mengirim permintaan override', { description: result.error });
        return;
      }

      toast.success('Permintaan override berhasil dikirim!', {
        description: 'Operator terkait akan mendapat notifikasi untuk menyetujui/menolak.',
      });
      setShowConflictModal(false);
      router.push('/dashboard');
    });
  }

  async function handleCreateDraftForConflict(): Promise<string> {
    const customSprinNumber = formData.nomorPart1.trim()
      ? `${formData.nomorPart1.trim()} / ${formData.nomorPart2.trim()} / ${formData.nomorPart3.trim()}`
      : undefined;
    const result = await createSprinDraft({
      ...formData,
      customSprinNumber,
      personelIds: selectedPersonelIds,
    });
    if (result.error) throw new Error(result.error);
    return result.sprinId!;
  }

  const isStep1Valid = formData.title.length >= 5 && formData.startDate && formData.endDate &&
    new Date(formData.startDate) <= new Date(formData.endDate);
  const isStep2Valid = selectedPersonelIds.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0E1726] border border-white/10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <Link href="/dashboard">
            <button className="w-11 h-11 rounded-2xl bg-[#131F33] border border-white/10 shadow-sm flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1B2B47] transition-all active:scale-95 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Penerbitan Surat Perintah Baru
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistem Registrasi & Penugasan Personel Puslitbang Polri
            </p>
          </div>
        </div>

        {/* Step Indicator Chips */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              onClick={() => {
                if (i === 0) setStep(0);
                if (i === 1 && isStep1Valid) setStep(1);
                if (i === 2 && isStep1Valid && isStep2Valid) setStep(2);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                i < step
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                  : i === step
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-[#131F33] text-slate-400 border-white/5 opacity-60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {i < step ? <Check className="w-3 h-3 text-emerald-300" /> : i + 1}
              </span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2-COLUMN TACTICAL GRID (Left: Form Wizard / Right: Live Preview)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ═══════════════════════════════════════════════════════════
            KOLOM KIRI (LEBAR ~68%): FORMULIR INPUT BERTAHAP
        ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-8 space-y-6">
          {/* Step 0: Informasi Sprin */}
          {step === 0 && (
            <div className="card-antigravity p-6 sm:p-7 space-y-6 bg-[#0E1726] border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">1. Parameter Dokumen Sprin</h2>
                    <p className="text-xs text-slate-400">Lengkapi klasifikasi, nomor resmi, dan periode kedinasan</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-500/20">
                  Tahap 1 dari 3
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Jenis Sprin */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="type" className="text-xs font-bold text-slate-300">
                    Jenis Klasifikasi Sprin *
                  </Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                  >
                    <option value="BIASA">Sprin Biasa (Tugas Umum / Operasional Rutin)</option>
                    <option value="POKJA">Sprin Pokja (Kelompok Kerja Khusus Puslitbang)</option>
                  </Select>
                </div>

                {/* Nomor Surat Perintah */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold text-slate-300">
                    Format Nomor Surat Perintah (Sprin)
                  </Label>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <span className="font-semibold text-xs px-3.5 py-2.5 bg-[#131F33] rounded-xl border border-white/10 shrink-0 text-slate-200">
                      Nomor: Sprin /
                    </span>
                    <Input
                      placeholder="001"
                      value={formData.nomorPart1}
                      onChange={(e) => handleFormChange('nomorPart1', e.target.value)}
                      className="w-24 text-center font-mono text-sm bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <Input
                      placeholder="IX"
                      value={formData.nomorPart2}
                      onChange={(e) => handleFormChange('nomorPart2', e.target.value)}
                      className="w-28 text-center font-mono text-sm bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <Input
                      placeholder="2026"
                      value={formData.nomorPart3}
                      onChange={(e) => handleFormChange('nomorPart3', e.target.value)}
                      className="flex-1 font-mono text-sm bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pratinjau nomor cetak PDF:{' '}
                    <span className="font-mono text-blue-300 font-bold">
                      Nomor: Sprin/ {formData.nomorPart1 || '[No]'} / {formData.nomorPart2 || '[Bulan]'} / {formData.nomorPart3 || '[Tahun]'} / PUSLITBANG
                    </span>
                  </p>
                </div>

                {/* Judul / Perihal */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold text-slate-300">
                    Judul / Perihal Penugasan Sprin *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Pelaksanaan Penelitian Teknologi Kepolisian..."
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                  />
                  {formData.title && formData.title.length < 5 && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Minimal 5 karakter wajib diisi
                    </p>
                  )}
                </div>

                {/* Tanggal Mulai */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs font-bold text-slate-300">
                    Tanggal Mulai Pelaksanaan *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                  />
                </div>

                {/* Tanggal Selesai */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs font-bold text-slate-300">
                    Tanggal Selesai Pelaksanaan *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={formData.startDate}
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                  />
                  {formData.startDate && formData.endDate &&
                    new Date(formData.startDate) > new Date(formData.endDate) && (
                      <p className="text-xs text-rose-400 mt-1">Tanggal selesai harus setelah tanggal mulai</p>
                    )}
                </div>

                {/* Pertimbangan */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="dasar" className="text-xs font-bold text-slate-300">
                    Pertimbangan (Menimbang)
                  </Label>
                  <Textarea
                    id="dasar"
                    rows={3}
                    placeholder="Contoh: bahwa dalam rangka kelancaran pelaksanaan tugas penelitian di lingkungan Polri..."
                    value={formData.dasar}
                    onChange={(e) => handleFormChange('dasar', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl font-normal"
                  />
                </div>

                {/* Dasar Hukum */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold text-slate-300">
                    Dasar Hukum (Mengingat)
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Pisahkan tiap dasar hukum dengan baris baru..."
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl font-normal"
                  />
                </div>

                {/* Perintah / Untuk */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="untuk" className="text-xs font-bold text-slate-300">
                      Diktum Perintah (&quot;Untuk&quot;)
                    </Label>
                    <span className="text-[11px] text-slate-400">Instruksi kedinasan khusus</span>
                  </div>
                  <Textarea
                    id="untuk"
                    rows={4}
                    placeholder="Contoh: 1. Melaksanakan tugas penelitian... &#10;2. Melaporkan hasil pelaksanaan tugas kepada pimpinan..."
                    value={formData.untuk}
                    onChange={(e) => handleFormChange('untuk', e.target.value)}
                    className="bg-[#060A14] border-white/15 text-slate-100 rounded-xl font-mono text-xs"
                  />
                </div>

                {/* Pejabat Penandatangan */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#E2C275]">
                      Pejabat Otoritas Penandatangan
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="penandatanganJabatan" className="text-[11px] text-slate-400">
                        Jabatan Penandatangan
                      </Label>
                      <Input
                        id="penandatanganJabatan"
                        value={formData.penandatanganJabatan}
                        onChange={(e) => handleFormChange('penandatanganJabatan', e.target.value)}
                        className="text-xs bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="penandatanganNama" className="text-[11px] text-slate-400">
                        Nama Lengkap & Gelar
                      </Label>
                      <Input
                        id="penandatanganNama"
                        value={formData.penandatanganNama}
                        onChange={(e) => handleFormChange('penandatanganNama', e.target.value)}
                        className="text-xs bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="penandatanganPangkat" className="text-[11px] text-slate-400">
                        Pangkat Penandatangan
                      </Label>
                      <Input
                        id="penandatanganPangkat"
                        value={formData.penandatanganPangkat}
                        onChange={(e) => handleFormChange('penandatanganPangkat', e.target.value)}
                        className="text-xs bg-[#060A14] border-white/15 text-slate-100 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action next */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button
                  onClick={() => setStep(1)}
                  disabled={!isStep1Valid}
                  className="gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md"
                >
                  Lanjut ke Pemilihan Personel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Pilih Personel */}
          {step === 1 && (
            <div className="card-antigravity p-6 sm:p-7 space-y-6 bg-[#0E1726] border-white/10 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">2. Alokasi Personel Puslitbang</h2>
                    <p className="text-xs text-slate-400">Pilih personel yang ditugaskan berdasarkan ketersediaan jadwal</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                  {selectedPersonelIds.length} Terpilih
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/10 text-xs text-slate-300">
                Memfilter ketersediaan dinas periode:{' '}
                <strong className="text-blue-400 font-bold font-mono">
                  {new Date(formData.startDate).toLocaleDateString('id-ID')} s.d.{' '}
                  {new Date(formData.endDate).toLocaleDateString('id-ID')}
                </strong>{' '}
                ({durationDays} Hari)
              </div>

              <PersonelPicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                selectedIds={selectedPersonelIds}
                onSelectionChange={setSelectedPersonelIds}
              />

              <div className="flex justify-between pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="rounded-xl border-white/10 bg-[#131F33] text-slate-200 hover:bg-[#1B2B47] text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!isStep2Valid}
                  className="gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md"
                >
                  Lanjut ke Konfirmasi Akhir
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Konfirmasi */}
          {step === 2 && (
            <div className="card-antigravity p-6 sm:p-7 space-y-6 bg-[#0E1726] border-white/10 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 tracking-tight">3. Validasi & Pengesahan Draft</h2>
                    <p className="text-xs text-slate-400">Periksa ringkasan sebelum menerbitkan surat perintah</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
                  Verifikasi Akhir
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#060A14] border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Klasifikasi Sprin:</span>
                  <span className="font-bold text-slate-100">{formData.type === 'BIASA' ? 'Sprin Biasa' : 'Sprin Pokja'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {formData.nomorPart1 ? `Sprin/ ${formData.nomorPart1} / ${formData.nomorPart2} / ${formData.nomorPart3}` : '(Otomatis oleh sistem)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Periode Tugas:</span>
                  <span className="font-bold text-slate-100">
                    {new Date(formData.startDate).toLocaleDateString('id-ID')} s.d. {new Date(formData.endDate).toLocaleDateString('id-ID')} ({durationDays} Hari)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Judul / Perihal:</span>
                  <span className="font-bold text-slate-100 text-right max-w-[65%]">{formData.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Personel Dialokasikan:</span>
                  <span className="font-bold text-emerald-400">{selectedPersonelIds.length} Anggota Terpilih</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Penandatangan:</span>
                  <span className="font-bold text-[#E2C275]">{formData.penandatanganNama}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 leading-relaxed">
                <strong>Catatan Operator:</strong> Dokumen yang diterbitkan akan disimpan sebagai status <strong>DRAFT</strong>. Personel akan resmi terikat dan status dapat diajukan tanda tangan atasan.
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-xl border-white/10 bg-[#131F33] text-slate-200 hover:bg-[#1B2B47] text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menerbitkan Sprin...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Terbitkan Surat Perintah
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            KOLOM KANAN (LEBAR ~32%): LIVE TACTICAL TELEMETRY PREVIEW
        ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-6 self-start">
          {/* Card 1: Pratinjau Dokumen Real-time */}
          <div className="card-antigravity p-5 bg-[#0E1726] border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Pratinjau Telemetri Dokumen
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                Live Sinkron
              </span>
            </div>

            {/* Document Header Preview */}
            <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/[0.08] space-y-2.5">
              <div className="text-center pb-2 border-b border-white/[0.06]">
                <p className="text-[10px] font-bold tracking-widest text-[#E2C275] uppercase">
                  PUSAT PENELITIAN DAN PENGEMBANGAN POLRI
                </p>
                <p className="text-[11px] font-extrabold text-slate-100 tracking-wide mt-0.5">
                  SURAT PERINTAH
                </p>
                <p className="text-[10px] font-mono text-blue-400 mt-0.5 truncate">
                  Nomor: Sprin/ {formData.nomorPart1 || '...'} / {formData.nomorPart2 || 'IX'} / {formData.nomorPart3 || '2026'}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Perihal Penugasan:</span>
                  <p className="text-xs font-bold text-slate-100 leading-snug line-clamp-2 mt-0.5">
                    {formData.title || <span className="text-slate-500 italic">Belum mengisi judul sprin...</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.05]">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Durasi:</span>
                    <p className="text-xs font-bold text-blue-400 mt-0.5">
                      {durationDays > 0 ? `${durationDays} Hari Kerja` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Personel:</span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">
                      {selectedPersonelIds.length} Anggota
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-white/[0.05]">
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Penandatangan:</span>
                  <p className="text-xs font-semibold text-[#E2C275] mt-0.5 truncate">
                    {formData.penandatanganNama}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {formData.penandatanganJabatan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Checklist Standar Operasional Penerbitan */}
          <div className="card-antigravity p-5 bg-[#0E1726] border-white/10 shadow-xl space-y-3.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Checklist Validasi Kedinasan
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <ChecklistItem
                done={formData.title.length >= 5}
                text="Judul tugas spesifik (min. 5 karakter)"
              />
              <ChecklistItem
                done={!!formData.startDate && !!formData.endDate && new Date(formData.startDate) <= new Date(formData.endDate)}
                text="Rentang tanggal pelaksanaan valid"
              />
              <ChecklistItem
                done={selectedPersonelIds.length > 0}
                text="Alokasi personel telah ditentukan"
              />
              <ChecklistItem
                done={!!formData.penandatanganNama && !!formData.penandatanganJabatan}
                text="Otoritas penandatangan sah"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONFLICT MODAL
      ───────────────────────────────────────────────────────────── */}
      {showConflictModal && (
        <ConflictModal
          conflicts={conflictData}
          formData={formData}
          selectedPersonelIds={selectedPersonelIds}
          onClose={() => setShowConflictModal(false)}
          onCreateDraft={handleCreateDraftForConflict}
          onSubmitOverride={handleConflictOverride}
        />
      )}
    </div>
  );
}

function ChecklistItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
          done
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'bg-white/5 text-slate-500 border border-white/10'
        }`}
      >
        {done ? <Check className="w-2.5 h-2.5" /> : '•'}
      </div>
      <span className={`text-xs ${done ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
        {text}
      </span>
    </div>
  );
}
