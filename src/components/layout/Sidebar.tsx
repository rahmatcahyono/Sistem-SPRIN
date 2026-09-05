'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, DIVISION_LABELS } from '@/lib/utils';
import {
  LayoutDashboard,
  FilePlus,
  Inbox,
  Users,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Division } from '@prisma/client';

interface SidebarProps {
  user: {
    name?: string | null;
    division?: Division;
  };
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/sprin/baru', icon: FilePlus, label: 'Buat Sprin Baru' },
  { href: '/inbox', icon: Inbox, label: 'Kotak Masuk', badge: true },
  { href: '/personel', icon: Users, label: 'Data Personel' },
  { href: '/riwayat', icon: FileText, label: 'Riwayat Sprin' },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-[#080D1A] via-[#0C1D3B] to-[#080D1A] flex flex-col border-r border-white/10 shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-30 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-12 rounded-xl bg-white/[0.08] p-1.5 flex items-center justify-center shrink-0 border border-[#D4AF37]/30 shadow-inner backdrop-blur-md">
            <Image
              src="/logo-puslitbang.png"
              alt="Logo Puslitbang Polri"
              width={34}
              height={40}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm tracking-wide leading-tight">SISTEM SPRIN</p>
            <p className="text-[#C5A059] text-[10px] uppercase font-bold tracking-wider mt-0.5">Puslitbang Polri</p>
          </div>
        </div>
      </div>

      {/* Operator Status Pill Card */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/[0.07] backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <p className="text-white text-xs font-bold truncate">{user.name || 'Operator'}</p>
          </div>
          <p className="text-blue-200/75 text-[11px] font-medium mt-1 pl-4">
            {user.division ? DIVISION_LABELS[user.division] : 'Puslitbang Polri'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <p className="text-blue-300/60 text-[10px] uppercase tracking-widest font-bold px-3 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] border border-blue-400/30'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/[0.08]'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-blue-300/80')} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          );
        })}
      </nav>

      {/* Floating Bottom Logout Card */}
      <div className="p-3">
        <div className="p-2 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-md">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-200 hover:text-white hover:bg-rose-500/25 transition-all duration-200 border border-rose-400/10 hover:border-rose-400/30 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>Keluar Akun</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
