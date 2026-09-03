import { auth } from '@/auth';
import { getConflictRequests } from '@/lib/actions/sprin.actions';
import { InboxClient } from '@/components/sprin/InboxClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Kotak Masuk' };

export default async function InboxPage() {
  const [session, conflicts] = await Promise.all([
    auth(),
    getConflictRequests(),
  ]);

  const userId = (session?.user as any)?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kotak Masuk</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Permintaan verifikasi dan override personel
        </p>
      </div>
      <InboxClient conflicts={conflicts as any} currentUserId={userId} />
    </div>
  );
}
