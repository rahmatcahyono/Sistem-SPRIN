'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data,
    });
  } catch (err) {
    console.error('[PRISMA] Error creating notification:', err);
    return null;
  }
}

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching notifications:', err);
    return [];
  }
}

export async function getUnreadCount() {
  try {
    const session = await auth();
    if (!session?.user?.id) return 0;

    return await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
  } catch (err) {
    console.error('[PRISMA] Error fetching unread count:', err);
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });

    revalidatePath('/');
  } catch (err) {
    console.error('[PRISMA] Error marking notification as read:', err);
  }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath('/');
  } catch (err) {
    console.error('[PRISMA] Error marking all notifications as read:', err);
  }
}

