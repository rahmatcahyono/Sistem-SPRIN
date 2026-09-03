'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPersonelWithAvailability } from '@/lib/actions/sprin.actions';
import { DIVISION_LABELS } from '@/lib/utils';
import { Search, CheckCircle2, XCircle, Users, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

interface PersonelPickerProps {
  startDate: string;
  endDate: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  excludeSprinId?: string;
}

interface PersonelWithAvailability {
  id: string;
  name: string;
  nrp: string;
  rank: string;
  jabatan: string;
  division: string;
  status: string;
  conflict: any | null;
}

export function PersonelPicker({
  startDate,
  endDate,
  selectedIds,
  onSelectionChange,
  excludeSprinId,
}: PersonelPickerProps) {
  const [personelList, setPersonelList] = useState<PersonelWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiv, setFilterDiv] = useState<string>('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPersonelWithAvailability(startDate, endDate, excludeSprinId);
        setPersonelList(data as PersonelWithAvailability[]);
      } catch (err) {
        console.error('Failed to load personel availability:', err);
      } finally {
        setLoading(false);
      }
    }
    if (startDate && endDate) {
      load();
    }
  }, [startDate, endDate, excludeSprinId]);

  const filtered = useMemo(() => {
    return personelList.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nrp.includes(search) ||
        p.rank.toLowerCase().includes(search.toLowerCase());
      const matchDiv = filterDiv === 'ALL' || p.division === filterDiv;
      return matchSearch && matchDiv;
    });
  }, [personelList, search, filterDiv]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, p) => {
      if (!acc[p.division]) acc[p.division] = [];
      acc[p.division].push(p);
      return acc;
    }, {} as Record<string, PersonelWithAvailability[]>);
  }, [filtered]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <span className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mr-2" />
        Mengecek ketersediaan personel...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NRP, pangkat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={filterDiv}
          onChange={(e) => setFilterDiv(e.target.value)}
        >
          <option value="ALL">Semua Bagian</option>
          {Object.entries(DIVISION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Tersedia
        </span>
        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Terjadwal (Bisa dipilih untuk permohonan prioritas / override)
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span><strong className="text-foreground">{selectedIds.length}</strong> dipilih</span>
        </span>
      </div>

      {/* Personel list grouped by division */}
      <div className="border border-border rounded-xl overflow-hidden max-h-96 overflow-y-auto">
        {Object.entries(grouped).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Tidak ada personel yang sesuai
          </div>
        ) : (
          Object.entries(grouped).map(([division, personels]) => (
            <div key={division}>
              <div className="sticky top-0 px-4 py-2 bg-muted/80 backdrop-blur-sm border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {DIVISION_LABELS[division as Division] || division}
                </p>
              </div>
              {personels.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isBusy = !!p.conflict;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 text-left transition-all duration-150 cursor-pointer',
                      isSelected && !isBusy && 'bg-primary/5 border-l-2 border-l-primary',
                      isSelected && isBusy && 'bg-amber-50/70 border-l-2 border-l-amber-500',
                      !isSelected && !isBusy && 'hover:bg-accent/50',
                      !isSelected && isBusy && 'hover:bg-amber-50/30 bg-amber-50/15'
                    )}
                  >
                    {/* Status checkbox icon */}
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? isBusy
                          ? 'bg-amber-500 border-amber-500'
                          : 'bg-primary border-primary'
                        : isBusy
                          ? 'border-amber-400 bg-amber-50/60'
                          : 'border-border'
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Personel info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          {p.rank} {p.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">NRP: {p.nrp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.jabatan}</p>
                      {isBusy && p.conflict && (
                        <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
                          <span>
                            Terjadwal: {p.conflict.sprin?.title || 'Sprin lain'} ({' '}
                            {new Date(p.conflict.sprin?.startDate).toLocaleDateString('id-ID')} –{' '}
                            {new Date(p.conflict.sprin?.endDate).toLocaleDateString('id-ID')})
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Availability badge */}
                    <div className={cn(
                      'shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
                      isBusy
                        ? isSelected
                          ? 'text-amber-800 bg-amber-100 border-amber-300'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                        : isSelected
                          ? 'text-primary bg-primary/10 border-primary/20'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    )}>
                      {isBusy ? (
                        isSelected ? (
                          <><AlertTriangle className="w-3 h-3 text-amber-600" /> Dipilih (Perlu Override)</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 text-amber-600" /> Terjadwal</>
                        )
                      ) : (
                        <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersedia</>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
