import { FileText, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatsBarProps {
  stats: {
    total: number;
    active: number;
    pendingTTD: number;
    draft: number;
    needsReplacement: number;
  };
}

const statItems = [
  { key: 'total', label: 'Total Sprin', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  { key: 'active', label: 'Aktif', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  { key: 'pendingTTD', label: 'Menunggu TTD', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  { key: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
  { key: 'needsReplacement', label: 'Perlu Pengganti', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
] as const;

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((item) => (
        <div
          key={item.key}
          className={`rounded-xl border p-4 ${item.bg} flex flex-col gap-2`}
        >
          <div className={`w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center ${item.color}`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${item.color}`}>{stats[item.key]}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
