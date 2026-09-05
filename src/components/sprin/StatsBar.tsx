'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface StatsBarProps {
  stats: {
    total: number;
    active: number;
    pendingTTD: number;
    draft: number;
    needsReplacement: number;
  };
}

interface StatConfig {
  key: keyof StatsBarProps['stats'];
  label: string;
  statusCode?: string; // Query param status
  icon: typeof FileText;
  theme: {
    text: string;
    iconColor: string;
    iconBg: string;
    borderDefault: string;
    borderHover: string;
    glowShadow: string;
    activeBorder: string;
    activeRing: string;
    badgeText: string;
  };
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'total',
    label: 'Total Sprin',
    statusCode: undefined, // Menampilkan semua
    icon: FileText,
    theme: {
      text: 'text-blue-400',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      borderDefault: 'border-white/10',
      borderHover: 'hover:border-blue-500/50',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(59,130,246,0.18)]',
      activeBorder: 'border-blue-500',
      activeRing: 'ring-2 ring-blue-500/30',
      badgeText: 'text-blue-300',
    },
  },
  {
    key: 'active',
    label: 'Sprin Aktif',
    statusCode: 'ACTIVE',
    icon: CheckCircle2,
    theme: {
      text: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      borderDefault: 'border-emerald-500/20',
      borderHover: 'hover:border-emerald-500/60',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)]',
      activeBorder: 'border-emerald-500',
      activeRing: 'ring-2 ring-emerald-500/30',
      badgeText: 'text-emerald-300',
    },
  },
  {
    key: 'pendingTTD',
    label: 'Menunggu TTD',
    statusCode: 'PENDING_TTD',
    icon: Clock,
    theme: {
      text: 'text-amber-400',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      borderDefault: 'border-amber-500/20',
      borderHover: 'hover:border-amber-500/60',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(245,158,11,0.2)]',
      activeBorder: 'border-amber-500',
      activeRing: 'ring-2 ring-amber-500/30',
      badgeText: 'text-amber-300',
    },
  },
  {
    key: 'draft',
    label: 'Konsep Draft',
    statusCode: 'DRAFT',
    icon: FileText,
    theme: {
      text: 'text-slate-300',
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/10 border-slate-500/20',
      borderDefault: 'border-white/10',
      borderHover: 'hover:border-slate-400/50',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(148,163,184,0.15)]',
      activeBorder: 'border-slate-400',
      activeRing: 'ring-2 ring-slate-400/30',
      badgeText: 'text-slate-300',
    },
  },
  {
    key: 'needsReplacement',
    label: 'Perlu Pengganti',
    statusCode: 'REPLACED_PENDING',
    icon: AlertTriangle,
    theme: {
      text: 'text-rose-400',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      borderDefault: 'border-rose-500/25',
      borderHover: 'hover:border-rose-500/70',
      glowShadow: 'hover:shadow-[0_8px_25px_rgba(244,63,94,0.25)]',
      activeBorder: 'border-rose-500',
      activeRing: 'ring-2 ring-rose-500/30',
      badgeText: 'text-rose-300',
    },
  },
];

export function StatsBar({ stats }: StatsBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || '';

  function handleCardClick(statusCode?: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    // Toggle behavior: jika status yang diklik sudah aktif, bersihkan filter
    if (statusCode && currentStatus === statusCode) {
      params.delete('status');
    } else if (statusCode) {
      params.set('status', statusCode);
    } else {
      // Tombol 'total' me-reset status
      params.delete('status');
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {STAT_CONFIGS.map((item) => {
        const count = stats[item.key] ?? 0;
        const isEmpty = count === 0;
        
        // Logika kondisi aktif
        const isActive = item.statusCode 
          ? currentStatus === item.statusCode 
          : !currentStatus && item.key === 'total';

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleCardClick(item.statusCode)}
            className={`group relative text-left rounded-2xl p-4 bg-[#0E1726] border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between
              ${/* 1. Efek Elevasi & Glow Sesuai Tema */ ''}
              hover:-translate-y-1 ${item.theme.borderHover} ${item.theme.glowShadow}
              
              ${/* Status Aktif */ ''}
              ${isActive 
                ? `${item.theme.activeBorder} ${item.theme.activeRing} bg-[#121E33] shadow-md` 
                : item.theme.borderDefault
              }

              ${/* 3. Manajemen State Kosong (Count === 0) */ ''}
              ${isEmpty && !isActive ? 'opacity-55 hover:opacity-85 saturate-60' : 'opacity-100'}
            `}
          >
            {/* Ambient Background Shimmer on Active */}
            {isActive && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-full blur-xl pointer-events-none" />
            )}

            {/* Header Kartu: Icon & Indicator Badge */}
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${item.theme.iconBg} ${item.theme.iconColor}`}>
                <item.icon className="w-4 h-4" />
              </div>

              {isActive ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif
                </span>
              ) : count > 0 && item.key === 'needsReplacement' ? (
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  Tindakan
                </span>
              ) : null}
            </div>

            {/* Body Kartu: Angka & Label */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${isEmpty ? 'text-slate-400' : item.theme.text}`}>
                  {count}
                </span>
                {isEmpty && (
                  <span className="text-[11px] text-slate-500 font-medium">Nihil</span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 tracking-wide">
                {item.label}
              </p>
            </div>

            {/* 2. Teks Petunjuk Akses (Muncul / Terang saat Hover) */}
            <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className={`transition-all duration-200 ${
                isActive 
                  ? 'text-white font-medium opacity-100' 
                  : 'text-slate-400 group-hover:text-slate-200 opacity-60 group-hover:opacity-100'
              }`}>
                {isActive ? 'Sedang difilter' : 'Klik untuk filter'}
              </span>

              <div className="flex items-center gap-0.5 text-slate-400 group-hover:text-white transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 opacity-40 group-hover:opacity-100">
                <span className="text-[10px] font-semibold hidden group-hover:inline">
                  Lihat
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
