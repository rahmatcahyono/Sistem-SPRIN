'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label, Textarea, Badge } from '@/components/ui/form-elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DIVISION_LABELS, SPRIN_STATUS_LABELS, SPRIN_STATUS_COLORS, SPRIN_TYPE_LABELS, formatDate, cn } from '@/lib/utils';
import { cetakSprin, konfirmasiTTD, batalkanSprin } from '@/lib/actions/sprin.actions';
import {
  ArrowLeft, Printer, CheckCircle, XCircle, AlertTriangle,
  Calendar, Users, Building2, FileText, History, ChevronRight
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

  // Dialog states
  const [showBatalDialog, setShowBatalDialog] = useState(false);
  const [showKonfirmasiDialog, setShowKonfirmasiDialog] = useState(false);
  const [batalReason, setBatalReason] = useState('');

  const activeAssignments = sprin.assignments.filter((a: any) => a.status === 'ASSIGNED');

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

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('status-badge', SPRIN_STATUS_COLORS[sprin.status as keyof typeof SPRIN_STATUS_COLORS])}>
              {SPRIN_STATUS_LABELS[sprin.status as keyof typeof SPRIN_STATUS_LABELS]}
            </span>
            <span className="status-badge bg-primary/10 text-primary border-primary/20">
              {SPRIN_TYPE_LABELS[sprin.type as keyof typeof SPRIN_TYPE_LABELS]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground line-clamp-2">{sprin.title}</h1>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{sprin.sprinNumber}</p>
        </div>
      </div>

      {/* Status warning for REPLACED_PENDING */}
      {sprin.status === 'REPLACED_PENDING' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Personel Perlu Diganti</p>
            <p className="text-orange-700/70 text-xs mt-0.5">
              Satu atau lebih personel pada Sprin ini telah dialihkan ke Sprin lain. Silakan tambahkan personel pengganti.
            </p>
            {isOwner && (
              <Link href={`/sprin/${sprin.id}/ganti-personel`}>
                <Button size="sm" className="mt-2 gap-1.5 bg-orange-600 hover:bg-orange-700">
                  Pilih Personel Pengganti
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isOwner && (
        <Card className="border-primary/20 bg-primary/2">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Aksi Sprin</p>
            <div className="flex flex-wrap gap-3">
              {/* Cetak: available for DRAFT */}
              {sprin.status === 'DRAFT' && (
                <Button onClick={handleCetak} disabled={isPending} className="gap-2">
                  <Printer className="w-4 h-4" />
                  {isPending ? 'Memproses...' : 'Cetak Sprin'}
                </Button>
              )}

              {/* PDF Download: available for PENDING_TTD, ACTIVE */}
              {['PENDING_TTD', 'ACTIVE'].includes(sprin.status) && (
                <SprinPDFDownload sprin={sprin} />
              )}

              {/* Konfirmasi TTD: available for PENDING_TTD */}
              {sprin.status === 'PENDING_TTD' && (
                <Button
                  variant="secondary"
                  onClick={() => setShowKonfirmasiDialog(true)}
                  disabled={isPending}
                  className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Konfirmasi TTD Disetujui
                </Button>
              )}

              {/* Batalkan: available for DRAFT and PENDING_TTD */}
              {['DRAFT', 'PENDING_TTD'].includes(sprin.status) && (
                <Button
                  variant="outline"
                  onClick={() => setShowBatalDialog(true)}
                  disabled={isPending}
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                >
                  <XCircle className="w-4 h-4" />
                  Batalkan Sprin
                </Button>
              )}
            </div>

            {sprin.status === 'PENDING_TTD' && (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sprin dikunci menunggu tanda tangan fisik atasan. Konfirmasi setelah TTD didapat, atau batalkan jika gagal.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Informasi Sprin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Nomor" value={<span className="font-mono text-xs">{sprin.sprinNumber}</span>} />
            <InfoRow label="Jenis" value={SPRIN_TYPE_LABELS[sprin.type as keyof typeof SPRIN_TYPE_LABELS]} />
            {sprin.penandatanganJabatan && (
              <InfoRow
                label="Penandatangan"
                value={`${sprin.penandatanganNama || ''} - ${sprin.penandatanganJabatan}`}
              />
            )}
            <InfoRow label="Dibuat oleh" value={`${sprin.createdBy.name} (${DIVISION_LABELS[sprin.createdBy.division as keyof typeof DIVISION_LABELS] || sprin.createdBy.division})`} />
            <InfoRow label="Tanggal Dibuat" value={formatDate(sprin.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Periode Tugas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Tanggal Mulai" value={formatDate(sprin.startDate)} />
            <InfoRow label="Tanggal Selesai" value={formatDate(sprin.endDate)} />
            <div>
              <p className="text-muted-foreground text-xs mb-1">Durasi</p>
              <p className="font-medium">
                {Math.ceil((new Date(sprin.endDate).getTime() - new Date(sprin.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} hari
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pertimbangan */}
      {sprin.dasar && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pertimbangan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-line">{sprin.dasar}</p>
          </CardContent>
        </Card>
      )}

      {/* Dasar */}
      {sprin.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dasar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-line">{sprin.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Diktum Untuk / Perintah */}
      {sprin.untuk && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Diktum Perintah (&quot;Untuk&quot;)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-line bg-muted/40 p-3 rounded-lg border border-border/50 font-mono text-xs">
              {sprin.untuk}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Personel list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Daftar Personel ({activeAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada personel yang ditugaskan
            </p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">No</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">NRP</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Nama / Pangkat</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Jabatan</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Bagian</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAssignments.map((assignment: any, i: number) => (
                    <tr key={assignment.id} className="border-t border-border hover:bg-accent/30">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">{assignment.personel.nrp}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{assignment.personel.rank} {assignment.personel.name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.personel.jabatan}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {DIVISION_LABELS[assignment.personel.division as keyof typeof DIVISION_LABELS] || assignment.personel.division}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit log */}
      {sprin.auditLogs?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Riwayat Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sprin.auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{log.action}</p>
                    {log.details && <p className="text-muted-foreground text-xs mt-0.5">{log.details}</p>}
                    <p className="text-muted-foreground/60 text-xs mt-0.5">
                      {log.user?.name} · {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konfirmasi TTD Dialog */}
      {showKonfirmasiDialog && (
        <ConfirmDialog
          title="Konfirmasi TTD Disetujui"
          description="Apakah tanda tangan atasan sudah didapatkan? Sprin akan berubah menjadi status AKTIF dan personel akan resmi terikat."
          confirmText="Ya, Konfirmasi TTD"
          confirmVariant="success"
          onConfirm={handleKonfirmasiTTD}
          onCancel={() => setShowKonfirmasiDialog(false)}
          isPending={isPending}
        />
      )}

      {/* Batalkan Dialog */}
      {showBatalDialog && (
        <ConfirmDialog
          title="Batalkan Sprin"
          description="Sprin akan dibatalkan dan semua personel akan dikembalikan ke status Tersedia (FREE)."
          confirmText="Batalkan Sprin"
          confirmVariant="danger"
          onConfirm={handleBatalkan}
          onCancel={() => setShowBatalDialog(false)}
          isPending={isPending}
          extraContent={
            <div className="space-y-2">
              <Label className="text-sm">Alasan Pembatalan (opsional)</Label>
              <Textarea
                rows={2}
                placeholder="Contoh: TTD atasan tidak dapat diperoleh..."
                value={batalReason}
                onChange={(e) => setBatalReason(e.target.value)}
              />
            </div>
          }
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className="font-medium text-right text-xs">{value}</span>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          {extraContent}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>Batal</Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={confirmVariant === 'danger'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'}
          >
            {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
