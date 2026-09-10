import { auth } from '@/auth';
import { getSprinDetail } from '@/lib/actions/sprin.actions';
import { notFound } from 'next/navigation';
import { SprinDetailClient } from '@/components/sprin/SprinDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sprin = await getSprinDetail(id);
  return { title: sprin ? sprin.title : 'Detail Sprin' };
}

export default async function SprinDetailPage({ params }: Props) {
  const { id } = await params;
  const [session, sprin] = await Promise.all([
    auth(),
    getSprinDetail(id),
  ]);

  if (!sprin) notFound();

  const isOwner = sprin.createdBy?.id === (session?.user as any)?.id;

  return (
    <SprinDetailClient
      sprin={sprin as any}
      isOwner={isOwner}
      currentUserId={(session?.user as any)?.id}
    />
  );
}
