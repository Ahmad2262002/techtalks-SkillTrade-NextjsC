'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { SwapStatus } from "@prisma/client";

export async function createSwapFromApplication(applicationId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      proposal: true,
    },
  });

  if (!application) throw new Error("Application not found");
  if (application.proposal.ownerId !== userId) {
    throw new Error("Not authorized to accept this application");
  }

  // Teacher is the proposal owner; student is the applicant
  const swap = await prisma.swap.create({
    data: {
      proposalId: application.proposalId,
      teacherId: application.proposal.ownerId,
      studentId: application.applicantId,
    },
  });

  // mark application as accepted and proposal in progress
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "ACCEPTED" },
  });

  await prisma.proposal.update({
    where: { id: application.proposalId },
    data: { status: "IN_PROGRESS" },
  });

  return swap;
}

export async function listMySwaps() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.swap.findMany({
    where: {
      OR: [{ teacherId: userId }, { studentId: userId }],
    },
    include: {
      proposal: {
        include: {
          offeredSkills: true,
          neededSkills: true,
        },
      },
      teacher: true,
      student: true,
      reviews: true,
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function updateSwapStatus(params: {
  swapId: string;
  status: SwapStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const swap = await prisma.swap.findUnique({
    where: { id: params.swapId },
  });

  if (!swap || (swap.teacherId !== userId && swap.studentId !== userId)) {
    throw new Error("Swap not found");
  }

  return prisma.swap.update({
    where: { id: params.swapId },
    data: {
      status: params.status,
      completedAt:
        params.status === "COMPLETED" ? new Date() : swap.completedAt,
    },
  });
}


