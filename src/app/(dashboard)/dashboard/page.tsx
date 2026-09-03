import { auth } from '@/auth';
import { getSprinList, getConflictRequests, getOperatorList } from '@/lib/actions/sprin.actions';
import { SprinCard } from '@/components/sprin/SprinCard';
import { StatsBar } from '@/components/sprin/StatsBar';
import { DashboardFilters } from '@/components/sprin/DashboardFilters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/form-elements';
import Link from 'next/link';
import { FilePlus, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    operator?: string;
    division?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const session = await auth();

  const isMyOnly = resolvedParams.operator === 'me';
  const operatorId = (!isMyOnly && resolvedParams.operator) ? resolvedParams.operator : undefined;

  const [sprins, conflictRequests, operators] = await Promise.all([
    getSprinList({
      type: resolvedParams.type,
      status: resolvedParams.status,
      myOnly: isMyOnly,
      operatorId,
      division: resolvedParams.division,
    }),
    getConflictRequests(),
    getOperatorList(),
  ]);

  const pendingConflicts = conflictRequests.filter(
    (c: any) => c.status === 'PENDING' && c.approvingOperatorId === (session?.user as any)?.id
  );

  const stats = {
    total: sprins.length,
    active: sprins.filter((s: any) => s.status === 'ACTIVE').length,
    pendingTTD: sprins.filter((s: any) => s.status === 'PENDING_TTD').length,
    draft: sprins.filter((s: any) => s.status === 'DRAFT').length,
    needsReplacement: sprins.filter((s: any) => s.status === 'REPLACED_PENDING').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Sprin</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isMyOnly
              ? 'Menampilkan Surat Perintah yang Anda buat'
              : resolvedParams.division
              ? `Menampilkan Surat Perintah bagian ${resolvedParams.division}`
              : 'Kelola dan pantau seluruh Surat Perintah personel'}
          </p>
        </div>
        <Link href="/sprin/baru">
          <Button className="gap-2">
            <FilePlus className="w-4 h-4" />
            Buat Sprin Baru
          </Button>
        </Link>
      </div>

      {/* Conflict alert */}
      {pendingConflicts.length > 0 && (
        <Link href="/inbox">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">
                {pendingConflicts.length} Permintaan Override Menunggu Persetujuan Anda
              </p>
              <p className="text-amber-700/70 text-xs mt-0.5">
                Operator lain meminta pengalihan personel dari Sprin Anda. Klik untuk meninjau.
              </p>
            </div>
            <Badge variant="warning">{pendingConflicts.length} Pending</Badge>
          </div>
        </Link>
      )}

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filter Berdasarkan Akun Operator & Status */}
      <DashboardFilters
        currentUserId={session?.user?.id || ''}
        currentUserName={session?.user?.name}
        operators={operators as any}
      />

      {/* Sprin list */}
      {sprins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FilePlus className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground">Tidak ada Sprin ditemukan</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            {isMyOnly
              ? 'Akun Anda belum memiliki Sprin dengan kriteria filter ini.'
              : 'Tidak ada data Sprin yang cocok dengan filter yang Anda pilih.'}
          </p>
          <Link href="/sprin/baru">
            <Button>Buat Sprin Baru</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sprins.map((sprin: any) => (
            <SprinCard key={sprin.id} sprin={sprin as any} />
          ))}
        </div>
      )}
    </div>
  );
}
