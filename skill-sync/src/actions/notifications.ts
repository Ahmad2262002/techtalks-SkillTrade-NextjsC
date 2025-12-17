'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function getNotifications() {
    const userId = await getCurrentUserId();
    if (!userId) return []; // Return empty array if not auth

    return prisma.notification.findMany({ 
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}

export async function markNotificationAsRead(notificationId: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}

export async function markAllNotificationsAsRead() {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}