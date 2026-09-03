import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSprinDetail, assignReplacementPersonel } from '@/lib/actions/sprin.actions';
import { notFound, redirect } from 'next/navigation';
import { GantiPersonelClient } from '@/components/sprin/GantiPersonelClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ganti Personel' };

export default async function GantiPersonelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, sprin] = await Promise.all([auth(), getSprinDetail(id)]);
  if (!sprin) notFound();

  const isOwner = sprin.createdBy.id === (session?.user as any)?.id;
  if (!isOwner) redirect('/dashboard');
  if (sprin.status !== 'REPLACED_PENDING') redirect(`/sprin/${id}`);

  return (
    <div className="max-w-4xl">
      <GantiPersonelClient sprin={sprin as any} />
    </div>
  );
}
