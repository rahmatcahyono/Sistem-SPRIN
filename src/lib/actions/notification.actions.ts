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
  return prisma.notification.create({
    data,
  });
}

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath('/');
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath('/');
}
