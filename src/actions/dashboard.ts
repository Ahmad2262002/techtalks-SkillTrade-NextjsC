'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getReputationStats } from "./reviews";

export async function getDashboardOverview() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const [user, proposals, applications, sentApplications, swaps, reputation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          where: { isVisible: true },
          include: {
            skill: true,
          },
        },
      },
    }),
    prisma.proposal.findMany({
      where: { ownerId: userId },
      include: {
        offeredSkills: true,
        neededSkills: true,
        _count: {
          select: {
            applications: true,
            swaps: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Incoming applications (for "Applications" tab)
    prisma.application.findMany({
      where: {
        proposal: {
          ownerId: userId,
        },
      },
      include: {
        applicant: {
          include: {
            skills: {
              where: { isVisible: true },
              include: {
                skill: true,
              },
            },
          },
        },
        proposal: {
          include: {
            owner: true,
            offeredSkills: true,
            neededSkills: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // Outgoing applications (for filtering "already applied")
    prisma.application.findMany({
      where: { applicantId: userId },
      select: { proposalId: true },
    }),
    prisma.swap.findMany({
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
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    getReputationStats(userId),
  ]);

  return {
    user,
    proposals,
    applications,
    sentApplications,
    swaps,
    reputation,
  };
}
