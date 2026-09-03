import Link from 'next/link';
import { DIVISION_LABELS, SPRIN_STATUS_LABELS, SPRIN_STATUS_COLORS, SPRIN_TYPE_LABELS, formatDate } from '@/lib/utils';
import { Calendar, Users, Building2, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SprinCardProps {
  sprin: {
    id: string;
    sprinNumber: string;
    type: 'BIASA' | 'POKJA';
    title: string;
    startDate: Date;
    endDate: Date;
    status: 'DRAFT' | 'PENDING_TTD' | 'ACTIVE' | 'CANCELLED' | 'REPLACED_PENDING';
    createdBy: { name: string; division: string };
    assignments: Array<{ personel: { name: string; rank: string; nrp: string } }>;
  };
}

export function SprinCard({ sprin }: SprinCardProps) {
  return (
    <Link href={`/sprin/${sprin.id}`}>
      <div className="glass-card rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 group cursor-pointer">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('status-badge', SPRIN_STATUS_COLORS[sprin.status])}>
                {SPRIN_STATUS_LABELS[sprin.status]}
              </span>
              <span className="status-badge bg-primary/10 text-primary border-primary/20">
                {SPRIN_TYPE_LABELS[sprin.type]}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {sprin.title}
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Sprin number */}
        <p className="text-xs font-mono text-muted-foreground mb-3 bg-muted/50 rounded-md px-2 py-1 inline-block">
          {sprin.sprinNumber}
        </p>

        {/* Info rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            <span>{formatDate(sprin.startDate)} s.d. {formatDate(sprin.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            <span>{DIVISION_LABELS[sprin.createdBy.division as keyof typeof DIVISION_LABELS] || sprin.createdBy.division}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            <span>
              {sprin.assignments.length} personel
              {sprin.assignments.length > 0 && (
                <span className="text-muted-foreground/60 ml-1">
                  ({sprin.assignments.slice(0, 2).map((a) => `${a.personel.rank} ${a.personel.name}`).join(', ')}
                  {sprin.assignments.length > 2 ? `, +${sprin.assignments.length - 2} lainnya` : ''})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
