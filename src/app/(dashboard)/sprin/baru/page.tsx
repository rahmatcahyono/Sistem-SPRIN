'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, Textarea, Select, Badge } from '@/components/ui/form-elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonelPicker } from '@/components/sprin/PersonelPicker';
import { ConflictModal } from '@/components/sprin/ConflictModal';
import { createSprin, createSprinDraft, submitConflictRequest } from '@/lib/actions/sprin.actions';
import { ArrowLeft, ArrowRight, FileText, Users, Check } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Informasi Sprin', 'Pilih Personel', 'Konfirmasi'];

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
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Buat Sprin Baru</h1>
          <p className="text-muted-foreground text-sm">Surat Perintah Personel</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${i < step
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : i === step
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-transparent'
              }`}>
              {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < step ? 'bg-emerald-300' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Informasi Sprin */}
      {step === 0 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Informasi Sprin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="type">Jenis Sprin *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <option value="BIASA">Sprin Biasa</option>
                  <option value="POKJA">Sprin Pokja</option>
                </Select>
              </div>

              {/* Nomor Sprin Manual 3 Part */}
              <div className="col-span-2 space-y-2">
                <Label>Nomor Surat Perintah (Sprin)</Label>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs px-3 py-2 bg-muted rounded-md border border-border shrink-0 text-foreground">
                    Nomor: Sprin /
                  </span>
                  <Input
                    placeholder="001"
                    value={formData.nomorPart1}
                    onChange={(e) => handleFormChange('nomorPart1', e.target.value)}
                    className="w-24 text-center font-mono text-sm"
                  />
                  <span className="text-muted-foreground font-bold">/</span>
                  <Input
                    placeholder="IX"
                    value={formData.nomorPart2}
                    onChange={(e) => handleFormChange('nomorPart2', e.target.value)}
                    className="w-28 text-center font-mono text-sm"
                  />
                  <span className="text-muted-foreground font-bold">/</span>
                  <Input
                    placeholder="2026"
                    value={formData.nomorPart3}
                    onChange={(e) => handleFormChange('nomorPart3', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Format pada dokumen PDF:{' '}
                  <span className="font-mono text-foreground font-semibold">
                    Nomor: Sprin/ {formData.nomorPart1 || '[No]'} / {formData.nomorPart2 || '[Kode]'} / {formData.nomorPart3 || '[Tahun]'}
                  </span>
                </p>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Judul / Perihal Sprin *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pelaksanaan Penelitian Teknologi Kepolisian..."
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
                {formData.title && formData.title.length < 5 && (
                  <p className="text-xs text-destructive">Minimal 5 karakter</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai *</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                />
                {formData.startDate && formData.endDate &&
                  new Date(formData.startDate) > new Date(formData.endDate) && (
                    <p className="text-xs text-destructive">Tanggal selesai harus setelah tanggal mulai</p>
                  )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="dasar">Pertimbangan</Label>
                <Textarea
                  id="dasar"
                  rows={3}
                  placeholder="catatan bagian (pertimbangan)"
                  value={formData.dasar}
                  onChange={(e) => handleFormChange('dasar', e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="untuk"> Perintah (&quot;Untuk&quot;)</Label>
                  <span className="text-[11px] text-muted-foreground font-normal">Kustomisasi tugas / perintah khusus</span>
                </div>
                <Textarea
                  id="untuk"
                  rows={4}
                  placeholder="catatan bagian (untuk) "
                  value={formData.untuk}
                  onChange={(e) => handleFormChange('untuk', e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Pisahkan baris untuk tiap nomor/poin tugas. Jika dikosongkan, sistem akan otomatis membuat poin standar berdasarkan judul dan periode Sprin.
                </p>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Dasar</Label>
                <Textarea
                  id="description"
                  rows={2}
                  placeholder="catatan bagian (dasar)"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>

              {/* Pejabat Pemberi Perintah / Penandatangan */}
              <div className="col-span-2 pt-3 border-t border-border space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Pejabat Pemberi Perintah / Penandatangan</h3>
                  <p className="text-xs text-muted-foreground">Sesuaikan dengan pejabat yang memerintahkan / menandatangani Sprin</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="penandatanganJabatan" className="text-xs">Jabatan Penandatangan</Label>
                    <Input
                      id="penandatanganJabatan"
                      value={formData.penandatanganJabatan}
                      onChange={(e) => handleFormChange('penandatanganJabatan', e.target.value)}
                      placeholder="Contoh: KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="penandatanganNama" className="text-xs">Nama Penandatangan</Label>
                    <Input
                      id="penandatanganNama"
                      value={formData.penandatanganNama}
                      onChange={(e) => handleFormChange('penandatanganNama', e.target.value)}
                      placeholder="Contoh: DIDI HAYAMSYAH, S.H., S.I.K., M.H."
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="penandatanganPangkat" className="text-xs">Pangkat / NRP Penandatangan</Label>
                    <Input
                      id="penandatanganPangkat"
                      value={formData.penandatanganPangkat}
                      onChange={(e) => handleFormChange('penandatanganPangkat', e.target.value)}
                      placeholder="Contoh: BRIGADIR JENDRAL POLISI"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(1)}
                disabled={!isStep1Valid}
                className="gap-2"
              >
                Lanjut Pilih Personel
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Pilih Personel */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Pilih Personel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-accent/50 border border-border text-xs text-muted-foreground mb-4">
                Menampilkan ketersediaan untuk periode{' '}
                <strong>
                  {new Date(formData.startDate).toLocaleDateString('id-ID')} s.d.{' '}
                  {new Date(formData.endDate).toLocaleDateString('id-ID')}
                </strong>
              </div>
              <PersonelPicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                selectedIds={selectedPersonelIds}
                onSelectionChange={setSelectedPersonelIds}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <Button onClick={() => setStep(2)} disabled={!isStep2Valid} className="gap-2">
              Lanjut Konfirmasi
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Konfirmasi */}
      {step === 2 && (
        <div className="animate-fade-in space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Konfirmasi Sprin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Jenis Sprin</p>
                  <Badge>{formData.type === 'BIASA' ? 'Sprin Biasa' : 'Sprin Pokja'}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Periode</p>
                  <p className="font-medium">
                    {new Date(formData.startDate).toLocaleDateString('id-ID')} s.d.{' '}
                    {new Date(formData.endDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Nomor Sprin</p>
                  <p className="font-mono font-medium text-xs">
                    {formData.nomorPart1 ? `Sprin/ ${formData.nomorPart1} / ${formData.nomorPart2} / ${formData.nomorPart3}` : '(Otomatis oleh sistem)'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Judul / Perihal</p>
                  <p className="font-medium">{formData.title}</p>
                </div>
                {formData.dasar && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Pertimbangan</p>
                    <p className="text-sm whitespace-pre-line">{formData.dasar}</p>
                  </div>
                )}
                {formData.description && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Dasar</p>
                    <p className="text-sm whitespace-pre-line">{formData.description}</p>
                  </div>
                )}
                {formData.untuk && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Perintah (&quot;Untuk&quot;)</p>
                    <p className="text-sm whitespace-pre-line text-foreground/90 bg-muted/40 p-2.5 rounded-lg border border-border/50 font-mono text-xs">{formData.untuk}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Pejabat Penandatangan</p>
                  <p className="text-xs font-semibold">{formData.penandatanganJabatan}</p>
                  <p className="text-xs">{formData.penandatanganNama} ({formData.penandatanganPangkat})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Personel ({selectedPersonelIds.length})
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedPersonelIds.length} personel dipilih</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                <strong>Perhatian:</strong> Setelah Sprin dibuat, status personel yang dipilih akan berubah menjadi <strong>ON_SPRIN</strong>. Anda masih dapat membatalkan sebelum cetak.
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat Sprin...
                </span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Buat Sprin
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
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
