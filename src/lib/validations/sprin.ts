import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const createSprinSchema = z.object({
  type: z.enum(['BIASA', 'POKJA'], { required_error: 'Jenis sprin wajib dipilih' }),
  title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
  description: z.string().optional().nullable(),
  dasar: z.string().optional().nullable(),
  untuk: z.string().optional().nullable(),
  customSprinNumber: z.string().optional().nullable(),
  penandatanganJabatan: z.string().optional().nullable(),
  penandatanganNama: z.string().optional().nullable(),
  penandatanganPangkat: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  personelIds: z.array(z.string()).min(1, 'Pilih minimal 1 personel'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
  path: ['endDate'],
});

export const conflictRequestSchema = z.object({
  requestedSprinId: z.string().min(1),
  existingSprinId: z.string().min(1),
  targetPersonelId: z.string().min(1),
  reason: z.string().min(20, 'Alasan minimal 20 karakter — jelaskan mengapa Sprin ini lebih prioritas'),
});

export const approveConflictSchema = z.object({
  conflictRequestId: z.string().min(1),
  replacementPersonelIds: z.array(z.string()).optional(),
});

export const rejectConflictSchema = z.object({
  conflictRequestId: z.string().min(1),
  rejectionReason: z.string().min(10, 'Harap sertakan alasan penolakan'),
});

export const batalkanSprinSchema = z.object({
  sprinId: z.string().min(1),
  reason: z.string().optional(),
});

export const konfirmasiTTDSchema = z.object({
  sprinId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSprinInput = z.infer<typeof createSprinSchema>;
export type ConflictRequestInput = z.infer<typeof conflictRequestSchema>;
export type ApproveConflictInput = z.infer<typeof approveConflictSchema>;
export type RejectConflictInput = z.infer<typeof rejectConflictSchema>;
export type BatalkanSprinInput = z.infer<typeof batalkanSprinSchema>;
export type KonfirmasiTTDInput = z.infer<typeof konfirmasiTTDSchema>;
