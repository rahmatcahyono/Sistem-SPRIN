import { auth } from '@/auth';
import { getSprinList } from '@/lib/actions/sprin.actions';
import { SprinCard } from '@/components/sprin/SprinCard';
import { FileText, UserCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Riwayat Sprin Saya' };

export default async function RiwayatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Hanya tampilkan sprin yang dibuat oleh akunnya masing-masing
  const sprins = await getSprinList({ myOnly: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Riwayat Sprin Saya</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Akun Sendiri
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Daftar Surat Perintah yang dibuat oleh akun Anda ({sprins.length} total)
          </p>
        </div>
      </div>

      {sprins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground">Belum ada riwayat Sprin</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            Akun Anda belum pernah membuat Sprin. Buat Sprin pertama Anda melalui tombol &quot;Buat Sprin Baru&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sprins.map((sprin) => (
            <SprinCard key={sprin.id} sprin={sprin as any} />
          ))}
        </div>
      )}
    </div>
  );
}
