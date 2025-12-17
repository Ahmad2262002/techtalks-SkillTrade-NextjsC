'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";

export async function sendMessage(params: {
    swapId: string;
    content: string;
}) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const swap = await prisma.swap.findUnique({
        where: { id: params.swapId },
        include: {
            teacher: true,
            student: true,
        },
    });

    if (!swap) throw new Error("Swap not found");

    // Verify user is part of the swap
    if (swap.teacherId !== userId && swap.studentId !== userId) {
        throw new Error("Not authorized");
    }

    const receiverId = swap.teacherId === userId ? swap.studentId : swap.teacherId;

    const message = await prisma.message.create({
        data: {
            content: params.content,
            senderId: userId,
            receiverId: receiverId,
            swapId: params.swapId,
        },
    });

    // Create notification for receiver
    await prisma.notification.create({
        data: {
            userId: receiverId,
            type: "MESSAGE_RECEIVED",
            message: `New message from ${swap.teacherId === userId ? swap.teacher.name : swap.student.name}`,
            link: `/dashboard?tab=active-swaps&swapId=${params.swapId}`,
        },
    });

    return message;
}

export async function getSwapMessages(swapId: string) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const swap = await prisma.swap.findUnique({
        where: { id: swapId },
    });

    if (!swap) throw new Error("Swap not found");
    if (swap.teacherId !== userId && swap.studentId !== userId) {
        throw new Error("Not authorized");
    }

    return prisma.message.findMany({
        where: { swapId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: true,
        },
    });
}