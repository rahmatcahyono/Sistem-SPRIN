'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/form-elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DIVISION_LABELS } from '@/lib/utils';
import { Division } from '@prisma/client';
import { Search, X, Users, Filter, CheckCircle2, Clock } from 'lucide-react';

interface PersonelItem {
  id: string;
  nrp: string;
  name: string;
  rank: string;
  jabatan: string;
  division: Division;
  status: 'FREE' | 'ON_SPRIN';
}

interface PersonelListClientProps {
  initialPersonel: PersonelItem[];
}

export function PersonelListClient({ initialPersonel }: PersonelListClientProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Trigger search on button click or Enter key
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput('');
    setActiveQuery('');
    setSelectedDivision('ALL');
    setSelectedStatus('ALL');
  };

  // Filter logic
  const filteredList = useMemo(() => {
    const q = activeQuery.toLowerCase();
    return initialPersonel.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nrp.toLowerCase().includes(q) ||
        p.rank.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q);

      const matchDiv = selectedDivision === 'ALL' || p.division === selectedDivision;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchQuery && matchDiv && matchStatus;
    });
  }, [initialPersonel, activeQuery, selectedDivision, selectedStatus]);

  // Group by division
  const grouped = useMemo(() => {
    return filteredList.reduce((acc, p) => {
      if (!acc[p.division]) acc[p.division] = [];
      acc[p.division].push(p);
      return acc;
    }, {} as Record<string, PersonelItem[]>);
  }, [filteredList]);

  const totalFree = initialPersonel.filter((p) => p.status === 'FREE').length;
  const totalOnSprin = initialPersonel.filter((p) => p.status === 'ON_SPRIN').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            Data Personel Puslitbang Polri
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Total {initialPersonel.length} personel terdaftar dalam database
          </p>
        </div>

        {/* Quick count chips */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tersedia: {totalFree}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>On Sprin: {totalOnSprin}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama personel, NRP / NIP, pangkat, atau jabatan..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-10 w-full"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <Button type="submit" className="gap-2 h-10 px-5 shrink-0">
            <Search className="w-4 h-4" />
            <span>Cari</span>
          </Button>

          {/* Reset Button */}
          {(activeQuery || selectedDivision !== 'ALL' || selectedStatus !== 'ALL') && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="gap-1.5 h-10 px-3 shrink-0"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          )}
        </form>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Division select */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Semua Satuan / Divisi</option>
            {Object.entries(DIVISION_LABELS).map(([div, label]) => (
              <option key={div} value={div}>
                {label}
              </option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Semua Status</option>
            <option value="FREE">Tersedia (FREE)</option>
            <option value="ON_SPRIN">On Sprin</option>
          </select>

          {/* Search indicator */}
          <div className="ml-auto text-muted-foreground text-xs">
            Ditemukan: <span className="font-semibold text-foreground">{filteredList.length}</span> personel
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
          <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground text-base">Tidak ada personel ditemukan</h3>
          <p className="text-muted-foreground text-xs mt-1">
            Tidak ditemukan personel yang cocok dengan kata kunci &quot;{activeQuery}&quot; atau filter yang dipilih.
          </p>
          <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">
            Reset Pencarian
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([division, personels]) => (
            <div key={division} className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="bg-muted/70 px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h2 className="font-semibold text-sm text-foreground">
                    {DIVISION_LABELS[division as Division] || division}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-md border border-border">
                  {personels.length} personel
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground">
                    <tr>
                      <th className="text-center w-12 px-3 py-2.5 font-semibold">No</th>
                      <th className="text-left w-36 px-4 py-2.5 font-semibold">NRP / NIP</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Nama & Pangkat</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Jabatan & Kesatuan</th>
                      <th className="text-center w-28 px-4 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {personels.map((p, i) => (
                      <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-3 py-3 text-center text-muted-foreground text-xs">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                          {p.nrp}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground text-sm leading-tight">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.rank}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs leading-snug">
                          {p.jabatan}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={p.status === 'FREE' ? 'success' : 'warning'}>
                            {p.status === 'FREE' ? '✓ Tersedia' : '⏳ On Sprin'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
