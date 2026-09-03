import { PrismaClient, Division, PersonelStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const divisions: Division[] = [
  'SUMDA_LOGISTIK',
  'KERMA',
  'URKEU',
  'TAUD',
  'REN',
  'OPSNAL',
  'GASBIN',
  'RIKUWASTU',
  'DOKINFO',
  'TEKPOL',
];

const divisionLabels: Record<Division, string> = {
  SUMDA_LOGISTIK: 'Sumda & Logistik',
  KERMA: 'Kerja Sama',
  URKEU: 'Urusan Keuangan',
  TAUD: 'Tata Urusan Dalam',
  REN: 'Perencanaan',
  OPSNAL: 'Operasional',
  GASBIN: 'Tugas Pembinaan',
  RIKUWASTU: 'Pemeriksaan & Pengawasan Mutu',
  DOKINFO: 'Dokumentasi & Informasi',
  TEKPOL: 'Teknologi Kepolisian',
};

const ranks = [
  'AKBP', 'Kompol', 'AKP', 'Iptu', 'Ipda', 'Aiptu', 'Aipda',
  'Bripka', 'Brigadir', 'Briptu', 'Bripda',
];

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clear existing data ──────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.sprinConflictRequest.deleteMany();
  await prisma.sprinAssignment.deleteMany();
  await prisma.sprin.deleteMany();
  await prisma.personel.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create 10 Operators (one per division) ───────────────────
  const password = await bcrypt.hash('sprin2024', 10);

  const operators = await Promise.all(
    divisions.map((division) =>
      prisma.user.create({
        data: {
          name: `Operator ${divisionLabels[division]}`,
          username: division.toLowerCase().replace('_', '.'),
          password,
          division,
        },
      })
    )
  );

  console.log(`✅ Created ${operators.length} operators`);

  // ─── Create 129 Official Personnel from PDF ───────────────────
  const { personelPdfData } = await import('./seed-personel-pdf');
  const personelList = await Promise.all(
    personelPdfData.map((p) =>
      prisma.personel.create({
        data: {
          nrp: p.nrp,
          name: p.name,
          rank: p.rank,
          jabatan: p.jabatan,
          division: p.division,
          status: 'FREE',
        },
      })
    )
  );

  console.log(`✅ Created ${personelList.length} personnel`);
  console.log('\n🔑 Operator Login Credentials:');
  console.log('─'.repeat(50));
  divisions.forEach((div) => {
    console.log(`  ${div.toLowerCase().replace('_', '.')} / sprin2024`);
  });
  console.log('─'.repeat(50));
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
