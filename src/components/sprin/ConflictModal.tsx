'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label, Textarea } from '@/components/ui/form-elements';
import { DIVISION_LABELS, formatDate } from '@/lib/utils';
import { AlertTriangle, X, Send, ArrowRight } from 'lucide-react';
import { Division } from '@prisma/client';

interface ConflictModalProps {
  conflicts: Array<{
    personelId: string;
    personelName: string;
    existingSprinId: string;
    existingSprinTitle: string;
    existingSprinNumber: string;
    existingSprinDivision: string;
    existingSprinDates: { start: string; end: string };
  }>;
  formData: any;
  selectedPersonelIds: string[];
  onClose: () => void;
  onCreateDraft: () => Promise<string>;
  onSubmitOverride: (conflict: any, reason: string, draftSprinId: string) => Promise<void>;
}

export function ConflictModal({
  conflicts,
  formData,
  selectedPersonelIds,
  onClose,
  onCreateDraft,
  onSubmitOverride,
}: ConflictModalProps) {
  const [isPending, startTransition] = useTransition();
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [reason, setReason] = useState('');
  const [draftSprinId, setDraftSprinId] = useState<string | null>(null);

  const conflict = conflicts[currentConflictIndex];

  async function handleSendRequest() {
    if (reason.length < 20) {
      toast.error('Alasan terlalu singkat', { description: 'Minimal 20 karakter' });
      return;
    }

    startTransition(async () => {
      let sprinId = draftSprinId;
      if (!sprinId) {
        try {
          sprinId = await onCreateDraft();
          setDraftSprinId(sprinId);
        } catch (e: any) {
          toast.error('Gagal membuat draft Sprin', { description: e.message });
          return;
        }
      }

      await onSubmitOverride(conflict, reason, sprinId);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-amber-900 text-base">Konflik Jadwal Terdeteksi</h2>
              <p className="text-amber-700/70 text-xs">
                {conflicts.length} personel memiliki konflik jadwal
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-700/60 hover:text-amber-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Conflict info */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sprin yang Sedang Berjalan (Konflik {currentConflictIndex + 1} / {conflicts.length})
              </p>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personel</span>
                <span className="font-semibold">{conflict.personelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nomor Sprin</span>
                <span className="font-mono text-xs">{conflict.existingSprinNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Judul</span>
                <span className="font-medium text-right max-w-[60%]">{conflict.existingSprinTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dari Bagian</span>
                <span>{DIVISION_LABELS[conflict.existingSprinDivision as Division] || conflict.existingSprinDivision}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Periode</span>
                <span>
                  {formatDate(conflict.existingSprinDates.start)} –{' '}
                  {formatDate(conflict.existingSprinDates.end)}
                </span>
              </div>
            </div>
          </div>

          {/* Override reason */}
          <div className="space-y-2">
            <Label>
              Alasan Override (mengapa Sprin Anda lebih prioritas?) *
            </Label>
            <Textarea
              rows={3}
              placeholder="Jelaskan urgensi dan prioritas Sprin Anda dibanding Sprin yang ada..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className={`text-xs ${reason.length < 20 ? 'text-muted-foreground' : 'text-emerald-600'}`}>
              {reason.length} / minimal 20 karakter
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <strong>Proses:</strong> Permintaan override akan dikirim ke Operator terkait. Jika disetujui, personel akan dialihkan ke Sprin Anda. Jika ditolak, Anda perlu memilih personel lain.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Pilih Personel Lain
          </Button>
          <div className="flex gap-2">
            {conflicts.length > 1 && currentConflictIndex < conflicts.length - 1 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentConflictIndex((i) => i + 1)}
              >
                Selanjutnya
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={handleSendRequest} disabled={isPending || reason.length < 20} className="gap-2">
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim Permintaan Override
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
