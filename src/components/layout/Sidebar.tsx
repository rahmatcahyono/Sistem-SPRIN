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
    <aside className="w-64 gradient-police flex flex-col shadow-2xl z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/15 shadow-inner">
            <Image
              src="/logo-puslitbang.png"
              alt="Logo Puslitbang Polri"
              width={34}
              height={40}
              className="object-contain drop-shadow"
              priority
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">SISTEM SPRIN</p>
            <p className="text-blue-200/80 text-[10px] uppercase font-medium tracking-wider">Puslitbang Polri</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white text-sm font-semibold truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-blue-200/70 text-xs">
              {user.division ? DIVISION_LABELS[user.division] : 'Operator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-blue-300/50 text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-item group',
                isActive && 'active'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="sidebar-item w-full text-red-300/70 hover:text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
