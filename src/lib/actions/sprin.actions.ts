'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateSprinNumber } from '@/lib/utils';
import {
  createSprinSchema,
  conflictRequestSchema,
  approveConflictSchema,
  rejectConflictSchema,
  batalkanSprinSchema,
  konfirmasiTTDSchema,
} from '@/lib/validations/sprin';
import { createNotification } from './notification.actions';
import { SprinStatus, AssignmentStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check personel availability in a date range
// ─────────────────────────────────────────────────────────────────────────────
export async function checkPersonelAvailability(
  personelId: string,
  startDate: string,
  endDate: string,
  excludeSprinId?: string
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const conflict = await prisma.sprinAssignment.findFirst({
    where: {
      personelId,
      status: 'ASSIGNED',
      sprin: {
        status: { in: ['PENDING_TTD', 'ACTIVE', 'REPLACED_PENDING'] },
        ...(excludeSprinId ? { id: { not: excludeSprinId } } : {}),
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    },
    include: {
      sprin: {
        include: {
          createdBy: { select: { name: true, division: true } },
        },
      },
      personel: { select: { name: true, rank: true, nrp: true } },
    },
  });

  return conflict;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK MULTIPLE PERSONEL AVAILABILITY (for picker UI)
// ─────────────────────────────────────────────────────────────────────────────
export async function checkMultiplePersonelAvailability(
  personelIds: string[],
  startDate: string,
  endDate: string,
  excludeSprinId?: string
) {
  const results = await Promise.all(
    personelIds.map(async (id) => ({
      personelId: id,
      conflict: await checkPersonelAvailability(id, startDate, endDate, excludeSprinId),
    }))
  );
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PERSONEL WITH AVAILABILITY STATUS
// ─────────────────────────────────────────────────────────────────────────────
export async function getPersonelWithAvailability(
  startDate: string,
  endDate: string,
  excludeSprinId?: string
) {
  const allPersonel = await prisma.personel.findMany({
    orderBy: [{ division: 'asc' }, { rank: 'asc' }, { name: 'asc' }],
  });

  const results = await Promise.all(
    allPersonel.map(async (p: any) => {
      const conflict = await checkPersonelAvailability(p.id, startDate, endDate, excludeSprinId);
      return { ...p, conflict };
    })
  );

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SPRIN (DRAFT)
// ─────────────────────────────────────────────────────────────────────────────
export async function createSprin(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const raw = {
    type: (formData.get('type') as string) || undefined,
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    dasar: (formData.get('dasar') as string) || undefined,
    untuk: (formData.get('untuk') as string) || undefined,
    customSprinNumber: (formData.get('customSprinNumber') as string) || undefined,
    penandatanganJabatan: (formData.get('penandatanganJabatan') as string) || undefined,
    penandatanganNama: (formData.get('penandatanganNama') as string) || undefined,
    penandatanganPangkat: (formData.get('penandatanganPangkat') as string) || undefined,
    startDate: (formData.get('startDate') as string) || undefined,
    endDate: (formData.get('endDate') as string) || undefined,
    personelIds: formData.getAll('personelIds') as string[],
  };

  const parsed = createSprinSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  // Count existing sprins this year to generate default number if not manually inputted
  const year = new Date().getFullYear();
  const count = await prisma.sprin.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });

  const autoNumber = generateSprinNumber(count + 1);
  const sprinNumber = (data.customSprinNumber && data.customSprinNumber.trim().length > 0)
    ? data.customSprinNumber.trim()
    : autoNumber;

  // Check conflicts for all selected personel
  const conflicts: { personelId: string; conflict: any }[] = [];
  for (const personelId of data.personelIds) {
    const conflict = await checkPersonelAvailability(personelId, data.startDate, data.endDate);
    if (conflict) {
      conflicts.push({ personelId, conflict });
    }
  }

  if (conflicts.length > 0) {
    return {
      error: 'CONFLICT_DETECTED',
      conflicts: conflicts.map((c) => ({
        personelId: c.personelId,
        personelName: c.conflict.personel.name,
        existingSprinId: c.conflict.sprinId,
        existingSprinTitle: c.conflict.sprin.title,
        existingSprinNumber: c.conflict.sprin.sprinNumber,
        existingSprinDivision: c.conflict.sprin.createdBy.division,
        existingSprinDates: {
          start: c.conflict.sprin.startDate,
          end: c.conflict.sprin.endDate,
        },
      })),
    };
  }

  // All personel free — create sprin
  const sprin = await prisma.sprin.create({
    data: {
      sprinNumber,
      type: data.type as any,
      title: data.title,
      description: data.description,
      dasar: data.dasar,
      untuk: data.untuk || null,
      penandatanganJabatan: data.penandatanganJabatan || 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI',
      penandatanganNama: data.penandatanganNama || 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.',
      penandatanganPangkat: data.penandatanganPangkat || 'BRIGADIR JENDERAL POLISI',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'DRAFT',
      createdByOperatorId: session.user.id,
      assignments: {
        create: data.personelIds.map((personelId) => ({
          personelId,
          status: 'ASSIGNED',
        })),
      },
    },
    include: { assignments: true },
  });

  // Update personel status
  await prisma.personel.updateMany({
    where: { id: { in: data.personelIds } },
    data: { status: 'ON_SPRIN' },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      sprinId: sprin.id,
      userId: session.user.id,
      action: 'SPRIN_CREATED',
      details: `Sprin ${sprinNumber} dibuat dengan ${data.personelIds.length} personel`,
    },
  });

  revalidatePath('/dashboard');
  return { success: true, sprinId: sprin.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SPRIN WITH DRAFT (skip conflict check — for re-submission after review)
// ─────────────────────────────────────────────────────────────────────────────
export async function createSprinDraft(data: {
  type: string;
  title: string;
  description?: string;
  dasar?: string;
  untuk?: string;
  customSprinNumber?: string;
  penandatanganJabatan?: string;
  penandatanganNama?: string;
  penandatanganPangkat?: string;
  startDate: string;
  endDate: string;
  personelIds: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const year = new Date().getFullYear();
  const count = await prisma.sprin.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  const autoNumber = generateSprinNumber(count + 1);
  const sprinNumber = (data.customSprinNumber && data.customSprinNumber.trim().length > 0)
    ? data.customSprinNumber.trim()
    : autoNumber;

  const sprin = await prisma.sprin.create({
    data: {
      sprinNumber,
      type: data.type as any,
      title: data.title,
      description: data.description,
      dasar: data.dasar,
      untuk: data.untuk || null,
      penandatanganJabatan: data.penandatanganJabatan || 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI',
      penandatanganNama: data.penandatanganNama || 'DIDI HAYAMSYAH, S.H., S.I.K., M.H.',
      penandatanganPangkat: data.penandatanganPangkat || 'BRIGADIR JENDERAL POLISI',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'DRAFT',
      createdByOperatorId: session.user.id,
      assignments: {
        create: data.personelIds.map((personelId) => ({
          personelId,
          status: 'ASSIGNED',
        })),
      },
    },
  });

  return { success: true, sprinId: sprin.id, sprinNumber };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT CONFLICT REQUEST (Override request from Operator 2 to Operator 1)
// ─────────────────────────────────────────────────────────────────────────────
export async function submitConflictRequest(data: {
  existingSprinId: string;
  requestedSprinId: string;
  targetPersonelId: string;
  reason: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const parsed = conflictRequestSchema.safeParse({
    ...data,
    requestingOperatorId: session.user.id,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Get existing sprin owner
  const existingSprin = await prisma.sprin.findUnique({
    where: { id: data.existingSprinId },
    include: { createdBy: true },
  });

  if (!existingSprin) return { error: 'Sprin tidak ditemukan' };

  // Get requesting sprin info
  const requestedSprin = await prisma.sprin.findUnique({
    where: { id: data.requestedSprinId },
  });

  if (!requestedSprin) return { error: 'Sprin yang diminta tidak ditemukan' };

  const conflictRequest = await prisma.sprinConflictRequest.create({
    data: {
      existingSprinId: data.existingSprinId,
      requestedSprinId: data.requestedSprinId,
      targetPersonelId: data.targetPersonelId,
      requestingOperatorId: session.user.id,
      approvingOperatorId: existingSprin.createdByOperatorId,
      reason: data.reason,
      status: 'PENDING',
    },
  });

  // Notify Operator 1
  const targetPersonel = await prisma.personel.findUnique({
    where: { id: data.targetPersonelId },
    select: { name: true, rank: true },
  });

  await createNotification({
    userId: existingSprin.createdByOperatorId,
    title: '⚠️ Permintaan Pengalihan Personel',
    message: `Operator ${session.user.name} mengajukan permintaan override untuk personel ${targetPersonel?.rank} ${targetPersonel?.name} dari Sprin "${existingSprin.title}". Silakan periksa Kotak Masuk.`,
    link: `/inbox`,
  });

  revalidatePath('/dashboard');
  return { success: true, conflictRequestId: conflictRequest.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE CONFLICT REQUEST (Operator 1 approves)
// ─────────────────────────────────────────────────────────────────────────────
export async function approveConflictRequest(conflictRequestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const conflictReq = await prisma.sprinConflictRequest.findUnique({
    where: { id: conflictRequestId },
    include: {
      existingSprin: { include: { createdBy: true } },
      requestedSprin: { include: { createdBy: true } },
      targetPersonel: true,
      requestingOperator: true,
    },
  });

  if (!conflictReq) return { error: 'Request tidak ditemukan' };
  if (conflictReq.approvingOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang menyetujui request ini' };
  }
  if (conflictReq.status !== 'PENDING') {
    return { error: 'Request ini sudah diproses' };
  }

  const userId = session.user.id;
  await prisma.$transaction(async (tx: any) => {
    // 1. Update conflict request status
    await tx.sprinConflictRequest.update({
      where: { id: conflictRequestId },
      data: { status: 'APPROVED' },
    });

    // 2. Cancel the existing assignment for this personel in Sprin 1
    await tx.sprinAssignment.updateMany({
      where: {
        sprinId: conflictReq.existingSprinId,
        personelId: conflictReq.targetPersonelId,
        status: 'ASSIGNED',
      },
      data: { status: 'OVERRIDDEN' },
    });

    // 3. Update Sprin 1 status to REPLACED_PENDING
    await tx.sprin.update({
      where: { id: conflictReq.existingSprinId },
      data: { status: 'REPLACED_PENDING' },
    });

    // 4. Update assignment in Sprin 2 to ASSIGNED (if it was pending)
    await tx.sprinAssignment.updateMany({
      where: {
        sprinId: conflictReq.requestedSprinId,
        personelId: conflictReq.targetPersonelId,
      },
      data: { status: 'ASSIGNED' },
    });

    // 5. Audit log
    await tx.auditLog.create({
      data: {
        sprinId: conflictReq.existingSprinId,
        userId,
        action: 'CONFLICT_APPROVED',
        details: `Personel ${conflictReq.targetPersonel.name} dipindahkan ke Sprin "${conflictReq.requestedSprin.title}"`,
      },
    });
  });

  // Notify Operator 2 (requesting)
  await createNotification({
    userId: conflictReq.requestingOperatorId,
    title: '✅ Permintaan Override Disetujui',
    message: `Operator ${session.user.name} menyetujui pengalihan personel ${conflictReq.targetPersonel.rank} ${conflictReq.targetPersonel.name} ke Sprin "${conflictReq.requestedSprin.title}".`,
    link: `/sprin/${conflictReq.requestedSprinId}`,
  });

  // Notify Operator 1 to assign replacement
  await createNotification({
    userId: session.user.id,
    title: '⚠️ Wajib Pilih Personel Pengganti',
    message: `Personel ${conflictReq.targetPersonel.name} telah dipindahkan. Segera tentukan personel pengganti untuk Sprin "${conflictReq.existingSprin.title}".`,
    link: `/sprin/${conflictReq.existingSprinId}/ganti-personel`,
  });

  revalidatePath('/inbox');
  revalidatePath('/dashboard');
  revalidatePath(`/sprin/${conflictReq.existingSprinId}`);
  revalidatePath(`/sprin/${conflictReq.requestedSprinId}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// REJECT CONFLICT REQUEST (Operator 1 rejects)
// ─────────────────────────────────────────────────────────────────────────────
export async function rejectConflictRequest(conflictRequestId: string, rejectionReason: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const parsed = rejectConflictSchema.safeParse({ conflictRequestId, rejectionReason });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const conflictReq = await prisma.sprinConflictRequest.findUnique({
    where: { id: conflictRequestId },
    include: {
      existingSprin: true,
      requestedSprin: true,
      targetPersonel: true,
      requestingOperator: true,
    },
  });

  if (!conflictReq) return { error: 'Request tidak ditemukan' };
  if (conflictReq.approvingOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang menolak request ini' };
  }

  await prisma.sprinConflictRequest.update({
    where: { id: conflictRequestId },
    data: { status: 'REJECTED', rejectionReason },
  });

  // Notify Operator 2
  await createNotification({
    userId: conflictReq.requestingOperatorId,
    title: '❌ Permintaan Override Ditolak',
    message: `Permintaan override personel ${conflictReq.targetPersonel.name} ditolak. Alasan: ${rejectionReason}. Silakan pilih personel lain.`,
    link: `/sprin/${conflictReq.requestedSprinId}`,
  });

  await prisma.auditLog.create({
    data: {
      sprinId: conflictReq.existingSprinId,
      userId: session.user.id,
      action: 'CONFLICT_REJECTED',
      details: `Request override ditolak. Alasan: ${rejectionReason}`,
    },
  });

  revalidatePath('/inbox');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN REPLACEMENT PERSONEL (after conflict approved, Operator 1 picks new)
// ─────────────────────────────────────────────────────────────────────────────
export async function assignReplacementPersonel(sprinId: string, newPersonelIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const sprin = await prisma.sprin.findUnique({
    where: { id: sprinId },
    include: { assignments: true },
  });

  if (!sprin) return { error: 'Sprin tidak ditemukan' };
  if (sprin.createdByOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang mengubah sprin ini' };
  }

  const userId2 = session.user.id;
  // Check conflicts for new personel
  for (const personelId of newPersonelIds) {
    const conflict = await checkPersonelAvailability(personelId, sprin.startDate.toISOString(), sprin.endDate.toISOString(), sprinId);
    if (conflict) {
      const p = await prisma.personel.findUnique({ where: { id: personelId }, select: { name: true } });
      return { error: `Personel ${p?.name} sudah terjadwal di sprin lain` };
    }
  }

  await prisma.$transaction(async (tx: any) => {
    // Add new assignments
    await tx.sprinAssignment.createMany({
      data: newPersonelIds.map((personelId) => ({
        sprinId,
        personelId,
        status: 'ASSIGNED' as AssignmentStatus,
      })),
      skipDuplicates: true,
    });

    // Update personel status
    await tx.personel.updateMany({
      where: { id: { in: newPersonelIds } },
      data: { status: 'ON_SPRIN' },
    });

    // Update sprin status back to DRAFT
    await tx.sprin.update({
      where: { id: sprinId },
      data: { status: 'DRAFT' },
    });

    await tx.auditLog.create({
      data: {
        sprinId,
        userId: userId2,
        action: 'REPLACEMENT_ASSIGNED',
        details: `Personel pengganti ditambahkan: ${newPersonelIds.length} personel`,
      },
    });
  });

  revalidatePath(`/sprin/${sprinId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// CETAK SPRIN → Lock to PENDING_TTD
// ─────────────────────────────────────────────────────────────────────────────
export async function cetakSprin(sprinId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const sprin = await prisma.sprin.findUnique({
    where: { id: sprinId },
    include: {
      assignments: {
        where: { status: 'ASSIGNED' },
        include: { personel: true },
      },
      createdBy: true,
    },
  });

  if (!sprin) return { error: 'Sprin tidak ditemukan' };
  if (sprin.createdByOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang mencetak sprin ini' };
  }
  if (!['DRAFT'].includes(sprin.status)) {
    return { error: `Status sprin saat ini adalah ${sprin.status}, tidak dapat dicetak` };
  }

  await prisma.sprin.update({
    where: { id: sprinId },
    data: { status: 'PENDING_TTD' },
  });

  await prisma.auditLog.create({
    data: {
      sprinId,
      userId: session.user.id,
      action: 'SPRIN_CETAK',
      details: `Sprin ${sprin.sprinNumber} dicetak — menunggu TTD`,
    },
  });

  revalidatePath(`/sprin/${sprinId}`);
  revalidatePath('/dashboard');
  return { success: true, sprin };
}

// ─────────────────────────────────────────────────────────────────────────────
// KONFIRMASI TTD → PENDING_TTD → ACTIVE
// ─────────────────────────────────────────────────────────────────────────────
export async function konfirmasiTTD(sprinId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const parsed = konfirmasiTTDSchema.safeParse({ sprinId });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const sprin = await prisma.sprin.findUnique({
    where: { id: sprinId },
    include: {
      assignments: { where: { status: 'ASSIGNED' }, include: { personel: true } },
    },
  });

  if (!sprin) return { error: 'Sprin tidak ditemukan' };
  if (sprin.createdByOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang mengonfirmasi TTD sprin ini' };
  }
  if (sprin.status !== 'PENDING_TTD') {
    return { error: 'Sprin harus dalam status Menunggu TTD untuk dikonfirmasi' };
  }

  const userId3 = session.user.id;
  await prisma.$transaction(async (tx: any) => {
    await tx.sprin.update({
      where: { id: sprinId },
      data: { status: 'ACTIVE' },
    });

    // Personel status stays ON_SPRIN (already set)
    await tx.auditLog.create({
      data: {
        sprinId,
        userId: userId3,
        action: 'TTD_CONFIRMED',
        details: `TTD disetujui — Sprin ${sprin.sprinNumber} kini AKTIF`,
      },
    });
  });

  revalidatePath(`/sprin/${sprinId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATALKAN SPRIN → Rollback to CANCELLED + FREE all personel
// ─────────────────────────────────────────────────────────────────────────────
export async function batalkanSprin(sprinId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' };

  const parsed = batalkanSprinSchema.safeParse({ sprinId, reason });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const sprin = await prisma.sprin.findUnique({
    where: { id: sprinId },
    include: {
      assignments: { where: { status: 'ASSIGNED' }, include: { personel: true } },
    },
  });

  if (!sprin) return { error: 'Sprin tidak ditemukan' };
  if (sprin.createdByOperatorId !== session.user.id) {
    return { error: 'Anda tidak berwenang membatalkan sprin ini' };
  }
  if (!['DRAFT', 'PENDING_TTD'].includes(sprin.status)) {
    return { error: 'Hanya sprin berstatus Draft atau Menunggu TTD yang dapat dibatalkan' };
  }

  const personelIds = sprin.assignments.map((a: any) => a.personelId);
  const userId4 = session.user.id;

  await prisma.$transaction(async (tx: any) => {
    // Cancel sprin
    await tx.sprin.update({
      where: { id: sprinId },
      data: { status: 'CANCELLED' },
    });

    // Cancel all assignments
    await tx.sprinAssignment.updateMany({
      where: { sprinId, status: 'ASSIGNED' },
      data: { status: 'CANCELLED' },
    });

    // Free personel — only if they are not assigned to another active sprin
    for (const personelId of personelIds) {
      const otherActive = await tx.sprinAssignment.findFirst({
        where: {
          personelId,
          status: 'ASSIGNED',
          sprinId: { not: sprinId },
          sprin: { status: { in: ['PENDING_TTD', 'ACTIVE'] } },
        },
      });
      if (!otherActive) {
        await tx.personel.update({
          where: { id: personelId },
          data: { status: 'FREE' },
        });
      }
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        sprinId,
        userId: userId4,
        action: 'SPRIN_CANCELLED',
        details: `Sprin ${sprin.sprinNumber} dibatalkan. ${reason ? `Alasan: ${reason}` : ''}`,
      },
    });
  });

  revalidatePath(`/sprin/${sprinId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SPRIN LIST (for dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export async function getSprinList(filters?: {
  type?: string;
  status?: string;
  divisionOnly?: boolean;
  division?: string;
  operatorId?: string;
  myOnly?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const where: any = {};
    if (filters?.type && filters.type !== 'ALL') where.type = filters.type;
    if (filters?.status && filters.status !== 'ALL') where.status = filters.status;

    if (filters?.myOnly) {
      where.createdByOperatorId = session.user.id;
    } else if (filters?.operatorId && filters.operatorId !== 'ALL') {
      where.createdByOperatorId = filters.operatorId;
    }

    if (filters?.division && filters.division !== 'ALL') {
      where.createdBy = { division: filters.division };
    } else if (filters?.divisionOnly) {
      where.createdBy = { division: (session.user as any).division };
    }

    return await prisma.sprin.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, division: true } },
        assignments: {
          where: { status: 'ASSIGNED' },
          include: { personel: { select: { name: true, rank: true, nrp: true } } },
        },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching sprin list:', err);
    return [];
  }
}

export async function getOperatorList() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        division: true,
        username: true,
      },
      orderBy: { division: 'asc' },
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching operator list:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SPRIN DETAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function getSprinDetail(sprinId: string) {
  try {
    return await prisma.sprin.findUnique({
      where: { id: sprinId },
      include: {
        createdBy: { select: { id: true, name: true, division: true } },
        assignments: {
          include: {
            personel: true,
            replacedByPersonel: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          include: { user: { select: { name: true, division: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching sprin detail:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CONFLICT REQUESTS (inbox for operator)
// ─────────────────────────────────────────────────────────────────────────────
export async function getConflictRequests() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.sprinConflictRequest.findMany({
      where: {
        OR: [
          { approvingOperatorId: session.user.id }, // Operator 1: needs to approve
          { requestingOperatorId: session.user.id }, // Operator 2: sent the request
        ],
      },
      include: {
        existingSprin: { include: { createdBy: { select: { name: true, division: true } } } },
        requestedSprin: { include: { createdBy: { select: { name: true, division: true } } } },
        targetPersonel: true,
        requestingOperator: { select: { name: true, division: true } },
        approvingOperator: { select: { name: true, division: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching conflict requests:', err);
    return [];
  }
}
