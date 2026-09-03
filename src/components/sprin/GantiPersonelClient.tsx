'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonelPicker } from './PersonelPicker';
import { assignReplacementPersonel } from '@/lib/actions/sprin.actions';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface GantiPersonelClientProps {
  sprin: any;
}

export function GantiPersonelClient({ sprin }: GantiPersonelClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const overriddenAssignments = sprin.assignments.filter((a: any) => a.status === 'OVERRIDDEN');

  async function handleSave() {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal 1 personel pengganti');
      return;
    }
    startTransition(async () => {
      const result = await assignReplacementPersonel(sprin.id, selectedIds);
      if (result.error) {
        toast.error('Gagal menyimpan', { description: result.error });
        return;
      }
      toast.success('Personel pengganti berhasil ditambahkan!');
      router.push(`/sprin/${sprin.id}`);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/sprin/${sprin.id}`}>
          <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Pilih Personel Pengganti</h1>
          <p className="text-muted-foreground text-sm">{sprin.sprinNumber}</p>
        </div>
      </div>

      {/* Overridden personel info */}
      {overriddenAssignments.length > 0 && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            Personel yang Dialihkan (perlu diganti):
          </p>
          <div className="space-y-1">
            {overriddenAssignments.map((a: any) => (
              <p key={a.id} className="text-sm text-orange-700">
                • {a.personel.rank} {a.personel.name} (NRP: {a.personel.nrp})
              </p>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck className="w-4 h-4 text-primary" />
            Pilih Personel Pengganti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-accent/50 border border-border text-xs text-muted-foreground mb-4">
            Menampilkan ketersediaan untuk periode{' '}
            <strong>{formatDate(sprin.startDate)} s.d. {formatDate(sprin.endDate)}</strong>
          </div>
          <PersonelPicker
            startDate={new Date(sprin.startDate).toISOString().split('T')[0]}
            endDate={new Date(sprin.endDate).toISOString().split('T')[0]}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            excludeSprinId={sprin.id}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href={`/sprin/${sprin.id}`}>
          <Button variant="outline">Batal</Button>
        </Link>
        <Button onClick={handleSave} disabled={isPending || selectedIds.length === 0} className="gap-2">
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          Simpan Personel Pengganti ({selectedIds.length})
        </Button>
      </div>
    </div>
  );
}
