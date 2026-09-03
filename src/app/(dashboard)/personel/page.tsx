import { prisma } from '@/lib/prisma';
import { PersonelListClient } from '@/components/personel/PersonelListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Personel',
  description: 'Daftar dan pencarian personel Pusat Penelitian dan Pengembangan Polri',
};

export default async function PersonelPage() {
  const personelList = await prisma.personel.findMany({
    orderBy: [{ division: 'asc' }, { rank: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      nrp: true,
      name: true,
      rank: true,
      jabatan: true,
      division: true,
      status: true,
    },
  });

  return <PersonelListClient initialPersonel={personelList as any} />;
}
