import { PrismaClient } from '@prisma/client';
import { personelPdfData } from '../prisma/seed-personel-pdf';

const prisma = new PrismaClient();

async function main() {
  console.log(`=== Memeriksa Data Personel Puslitbang Polri ===`);
  console.log(`Total Personel Resmi di PDF: ${personelPdfData.length}`);

  const officialNrps = new Set(personelPdfData.map((p) => p.nrp.trim()));

  // 1. Ambil semua personel di database
  const allDbPersonel = await prisma.personel.findMany();
  console.log(`Total Personel di Database saat ini: ${allDbPersonel.length}`);

  // 2. Cari yang TIDAK terdaftar di PDF
  const unlisted = allDbPersonel.filter((p) => !officialNrps.has(p.nrp.trim()));
  console.log(`Ditemukan ${unlisted.length} personel yang TIDAK TERDAFTAR di PDF:`);
  for (const p of unlisted) {
    console.log(` - [HAPUS] ${p.rank} ${p.name} (NRP: ${p.nrp})`);
  }

  // 3. Hapus personel yang tidak terdaftar
  if (unlisted.length > 0) {
    const unlistedIds = unlisted.map((p) => p.id);

    // Hapus relasi sprin assignments & conflict requests jika ada
    await prisma.sprinConflictRequest.deleteMany({
      where: { targetPersonelId: { in: unlistedIds } },
    });
    await prisma.sprinAssignment.deleteMany({
      where: {
        OR: [
          { personelId: { in: unlistedIds } },
          { replacedByPersonelId: { in: unlistedIds } },
        ],
      },
    });

    const deleted = await prisma.personel.deleteMany({
      where: { id: { in: unlistedIds } },
    });
    console.log(`✅ Berhasil menghapus ${deleted.count} personel tidak terdaftar dari database.`);
  } else {
    console.log(`✅ Tidak ada personel asing/tidak terdaftar.`);
  }

  // 4. Pastikan semua 129 personel resmi terupdate persis sesuai PDF
  let createdCount = 0;
  let updatedCount = 0;

  for (const p of personelPdfData) {
    const nrpClean = p.nrp.trim();
    const existing = await prisma.personel.findUnique({
      where: { nrp: nrpClean },
    });

    if (existing) {
      await prisma.personel.update({
        where: { nrp: nrpClean },
        data: {
          name: p.name.trim(),
          rank: p.rank.trim(),
          jabatan: p.jabatan.trim(),
          division: p.division,
        },
      });
      updatedCount++;
    } else {
      await prisma.personel.create({
        data: {
          nrp: nrpClean,
          name: p.name.trim(),
          rank: p.rank.trim(),
          jabatan: p.jabatan.trim(),
          division: p.division,
          status: 'FREE',
        },
      });
      createdCount++;
    }
  }

  const finalCount = await prisma.personel.count();
  console.log(`\n=== Hasil Sinkronisasi ===`);
  console.log(`- Diperbarui: ${updatedCount}`);
  console.log(`- Ditambahkan: ${createdCount}`);
  console.log(`- Total Personel Sekarang di Database: ${finalCount}`);
  console.log(`Selesai.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
