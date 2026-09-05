'use client';

import { Bell, Search } from 'lucide-react';
import { DIVISION_LABELS } from '@/lib/utils';
import { Division } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';
import { getUnreadCount, getNotifications, markAllAsRead } from '@/lib/actions/notification.actions';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface TopBarProps {
  user: {
    name?: string | null;
    division?: Division;
  };
}

export function TopBar({ user }: TopBarProps) {
  const [unread, setUnread] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnreadCount().then(setUnread);

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleBellClick() {
    setShowDropdown((v) => !v);
    if (!showDropdown) {
      const notifs = await getNotifications();
      setNotifications(notifs);
      setUnread(0);
    }
  }

  async function handleMarkAll() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[#0E1726]/90 backdrop-blur-md border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
      {/* Left breadcrumb / current date */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#131F33] border border-white/[0.08] text-[11px] font-medium text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span>Sistem Komando Aktif</span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 capitalize leading-tight">{today}</p>
          <p className="text-sm font-bold text-slate-100 tracking-tight">
            {user.division ? DIVISION_LABELS[user.division] : 'Puslitbang Polri'}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative w-9 h-9 rounded-xl border border-white/[0.08] bg-[#131F33] hover:bg-[#1B2B47] flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0E1726] animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-11 w-96 bg-[#0E1726] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080D1A]/60">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Pusat Notifikasi</h3>
                <button onClick={handleMarkAll} className="text-xs text-blue-400 font-semibold hover:underline">
                  Tandai dibaca
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.05]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || '#'}
                      onClick={() => setShowDropdown(false)}
                      className={`block px-4 py-3 hover:bg-[#131F33]/80 transition-colors ${!n.isRead ? 'bg-blue-950/30' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-xs font-semibold text-slate-100">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {formatDate(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 mx-0.5" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1 py-1 pr-3 rounded-full bg-[#131F33] border border-white/[0.08] hover:bg-[#1B2B47] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-white/20">
            {user.name?.[0]?.toUpperCase() ?? 'O'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[140px]">{user.name}</p>
            <p className="text-[10px] font-medium text-slate-400 leading-none">Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
