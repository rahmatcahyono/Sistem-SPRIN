'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label, Textarea, Badge } from '@/components/ui/form-elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DIVISION_LABELS, formatDate, cn } from '@/lib/utils';
import { approveConflictRequest, rejectConflictRequest } from '@/lib/actions/sprin.actions';
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, AlertTriangle, Send, Inbox } from 'lucide-react';
import Link from 'next/link';
import { Division } from '@prisma/client';

interface InboxClientProps {
  conflicts: any[];
  currentUserId: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export function InboxClient({ conflicts, currentUserId }: InboxClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const incoming = conflicts.filter((c) => c.approvingOperatorId === currentUserId);
  const outgoing = conflicts.filter((c) => c.requestingOperatorId === currentUserId);

  async function handleApprove(conflictId: string) {
    startTransition(async () => {
      const result = await approveConflictRequest(conflictId);
      if (result.error) {
        toast.error('Gagal menyetujui', { description: result.error });
        return;
      }
      toast.success('Permintaan disetujui!', {
        description: 'Personel telah dialihkan. Anda perlu menentukan personel pengganti.',
      });
      router.refresh();
    });
  }

  async function handleReject() {
    if (!selectedId) return;
    if (rejectReason.length < 10) {
      toast.error('Alasan terlalu singkat');
      return;
    }
    startTransition(async () => {
      const result = await rejectConflictRequest(selectedId, rejectReason);
      if (result.error) {
        toast.error('Gagal menolak', { description: result.error });
        return;
      }
      toast.success('Permintaan ditolak');
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedId(null);
      router.refresh();
    });
  }

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-foreground">Kotak Masuk Kosong</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Tidak ada permintaan verifikasi override saat ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incoming requests (needs action) */}
      {incoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Permintaan Masuk ({incoming.length})
          </h2>
          {incoming.map((conflict) => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              isIncoming={true}
              onApprove={() => handleApprove(conflict.id)}
              onReject={() => { setSelectedId(conflict.id); setShowRejectDialog(true); }}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Permintaan Terkirim ({outgoing.length})
          </h2>
          {outgoing.map((conflict) => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              isIncoming={false}
              onApprove={() => {}}
              onReject={() => {}}
              isPending={false}
            />
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Tolak Permintaan Override</h3>
              <p className="text-muted-foreground text-sm">
                Operator peminta akan diberitahu alasan penolakan Anda.
              </p>
              <div className="space-y-2">
                <Label>Alasan Penolakan *</Label>
                <Textarea
                  rows={3}
                  placeholder="Contoh: Sprin yang sedang berjalan memiliki prioritas lebih tinggi karena..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isPending}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isPending || rejectReason.length < 10}
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Tolak Permintaan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConflictCard({ conflict, isIncoming, onApprove, onReject, isPending }: {
  conflict: any;
  isIncoming: boolean;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(conflict.status === 'PENDING' && isIncoming);

  return (
    <Card className={cn(
      'overflow-hidden transition-all',
      conflict.status === 'PENDING' && isIncoming && 'border-amber-200 shadow-amber-50/50 shadow-md'
    )}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('status-badge', STATUS_COLORS[conflict.status])}>
                {STATUS_LABELS[conflict.status]}
              </span>
              {isIncoming && conflict.status === 'PENDING' && (
                <span className="status-badge bg-red-50 text-red-600 border-red-200 animate-pulse">
                  Perlu Tindakan
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Personel: {conflict.targetPersonel.rank} {conflict.targetPersonel.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(conflict.createdAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 border-t border-border pt-4">
          {/* Two sprin comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Sprin Saat Ini</p>
              <p className="text-xs font-mono text-muted-foreground mb-1">{conflict.existingSprin.sprinNumber}</p>
              <p className="text-sm font-medium line-clamp-2">{conflict.existingSprin.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {DIVISION_LABELS[conflict.existingSprin.createdBy?.division as Division] || conflict.existingSprin.createdBy?.division}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(conflict.existingSprin.startDate)} – {formatDate(conflict.existingSprin.endDate)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Sprin Pemohon</p>
              <p className="text-xs font-mono text-muted-foreground mb-1">{conflict.requestedSprin.sprinNumber}</p>
              <p className="text-sm font-medium line-clamp-2">{conflict.requestedSprin.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {DIVISION_LABELS[conflict.requestingOperator?.division as Division] || conflict.requestingOperator?.division}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(conflict.requestedSprin.startDate)} – {formatDate(conflict.requestedSprin.endDate)}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-1">Alasan Permintaan Override:</p>
            <p className="text-sm text-foreground">{conflict.reason}</p>
          </div>

          {conflict.rejectionReason && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs font-semibold text-red-700 mb-1">Alasan Penolakan:</p>
              <p className="text-sm text-foreground">{conflict.rejectionReason}</p>
            </div>
          )}

          {/* Action buttons */}
          {isIncoming && conflict.status === 'PENDING' && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                disabled={isPending}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Tolak
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {isPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Setujui — Alihkan Personel
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
