'use client';

import { Bell, Search } from 'lucide-react';
import { DIVISION_LABELS } from '@/lib/utils';
import { Division } from '@prisma/client';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    getUnreadCount().then(setUnread);
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
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{today}</p>
          <p className="text-sm font-semibold text-foreground">
            {user.division ? DIVISION_LABELS[user.division] : 'Dashboard'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-11 w-96 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
                <button onClick={handleMarkAll} className="text-xs text-primary hover:underline">
                  Tandai semua dibaca
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || '#'}
                      onClick={() => setShowDropdown(false)}
                      className={`block px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
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

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {user.name?.[0]?.toUpperCase() ?? 'O'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">{user.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
