'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Division } from '@prisma/client';
import { User, Users, X } from 'lucide-react';

interface OperatorItem {
  id: string;
  name: string;
  division: Division;
  username: string;
}

interface DashboardFiltersProps {
  currentUserId: string;
  currentUserName?: string | null;
  operators: OperatorItem[];
}

export function DashboardFilters({
  currentUserId,
  currentUserName,
  operators,
}: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentOperator = searchParams.get('operator') || '';

  function setParam(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== 'ALL') {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const statusFilters = [
    { label: 'Semua Status', type: '', status: '' },
    { label: 'Sprin Biasa', type: 'BIASA', status: '' },
    { label: 'Sprin Pokja', type: 'POKJA', status: '' },
    { label: 'Draft', type: '', status: 'DRAFT' },
    { label: 'Menunggu TTD', type: '', status: 'PENDING_TTD' },
    { label: 'Aktif', type: '', status: 'ACTIVE' },
    { label: 'Dibatalkan', type: '', status: 'CANCELLED' },
  ];

  const hasActiveFilters = !!(currentType || currentStatus || currentOperator);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
      {/* Filter Khusus Berdasarkan Akun Operator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            Akun Operator:
          </span>

          {/* Tombol Semua Operator */}
          <button
            type="button"
            onClick={() => setParam({ operator: undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
              !currentOperator
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            Semua Operator
          </button>

          {/* Tombol Akun Saya */}
          <button
            type="button"
            onClick={() => setParam({ operator: 'me' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              currentOperator === 'me'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Akun Saya</span>
          </button>
        </div>

        {/* Dropdown Pemilihan Akun Operator */}
        <div className="flex items-center gap-2">
          <select
            value={currentOperator || ''}
            onChange={(e) => {
              const val = e.target.value;
              setParam({ operator: val || undefined });
            }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto cursor-pointer"
          >
            <option value="">-- Pilih Akun Operator --</option>
            <option value="me">⭐ Akun Saya ({currentUserName || 'Operator'})</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name} ({op.username})
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => router.push(pathname)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs flex items-center gap-1 shrink-0 cursor-pointer"
              title="Reset Semua Filter"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Baris 2: Filter Status / Tipe */}
      <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium mr-1">Status:</span>
        {statusFilters.map((f) => {
          const isActive =
            (currentType || '') === f.type && (currentStatus || '') === f.status;

          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setParam({ type: f.type || undefined, status: f.status || undefined })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-secondary text-secondary-foreground border-border font-semibold shadow-xs'
                  : 'bg-background text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
