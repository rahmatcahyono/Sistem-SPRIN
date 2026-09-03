export {};

declare module '@prisma/client' {
  export type Division =
    | 'SUMDA_LOGISTIK'
    | 'KERMA'
    | 'URKEU'
    | 'TAUD'
    | 'REN'
    | 'OPSNAL'
    | 'GASBIN'
    | 'RIKUWASTU'
    | 'DOKINFO'
    | 'TEKPOL';

  export type SprinType = 'BIASA' | 'POKJA';

  export type SprinStatus =
    | 'DRAFT'
    | 'PENDING_TTD'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'REPLACED_PENDING';

  export type PersonelStatus = 'FREE' | 'ON_SPRIN';

  export type AssignmentStatus = 'ASSIGNED' | 'REPLACED' | 'CANCELLED';

  export type ConflictStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
}
