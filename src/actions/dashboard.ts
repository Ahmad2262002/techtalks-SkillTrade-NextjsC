'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { getReputationStats } from "./reviews";

export async function getDashboardOverview() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. User Profile (Critical - fetch first)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        where: { isVisible: true },
        include: {
          skill: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  // 2. Main Lists (Batch 1)
  const [proposals, applications] = await Promise.all([
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
  ]);

  // 3. Secondary Lists (Batch 2)
  const [sentApplications, swaps] = await Promise.all([
    // Outgoing Applications (sent) - needed to disable "Apply" button
    prisma.application.findMany({
      where: { applicantId: userId },
      select: { proposalId: true },
    }),
    // Swaps
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
  ]);

  // 4. Attach Reputation to Applicants and Swap Partners
  const [applicationsWithReputation, swapsWithReputation] = await Promise.all([
    Promise.all(
      applications.map(async (app) => {
        const rep = await getReputationStats(app.applicantId);
        return {
          ...app,
          applicant: {
            ...app.applicant,
            reputation: rep,
          },
        };
      })
    ),
    Promise.all(
      swaps.map(async (s) => {
        const [teacherRep, studentRep] = await Promise.all([
          getReputationStats(s.teacherId),
          getReputationStats(s.studentId),
        ]);
        return {
          ...s,
          teacher: { ...s.teacher, reputation: teacherRep },
          student: { ...s.student, reputation: studentRep },
        };
      })
    ),
  ]);

  // 5. Reputation for current user (Batch 3 - has 2 internal queries)
  const reputation = await getReputationStats(userId);

  return {
    user,
    proposals,
    applications: applicationsWithReputation,
    sentApplications,
    swaps: swapsWithReputation,
    reputation,
  };
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    take: 50,
    include: {
      skills: {
        where: { isVisible: true, source: "ENDORSED" },
        include: { skill: true }
      }
    }
  });

  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const stats = await getReputationStats(user.id);
      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        industry: user.industry,
        reputation: stats,
      };
    })
  );

  return leaderboard.sort((a, b) => b.reputation.reputationPoints - a.reputation.reputationPoints);
}