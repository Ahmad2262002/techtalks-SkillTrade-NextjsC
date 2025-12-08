'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function searchSkills(query: string, limit = 10) {
  if (!query.trim()) return [];

  return prisma.skill.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function addSkillToCurrentUser(input: { name: string }) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const skill = await prisma.skill.upsert({
    where: { name: input.name },
    update: {},
    create: { name: input.name },
  });

  const userSkill = await prisma.userSkill.upsert({
    where: {
      userId_skillId: {
        userId,
        skillId: skill.id,
      },
    },
    update: {},
    create: {
      userId,
      skillId: skill.id,
    },
  });

  return userSkill;
}

export async function removeManualSkillFromCurrentUser(userSkillId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const existing = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Skill not found");
  }

  // Only allow hard-delete for manual skills; endorsed skills should be hidden instead.
  if (existing.source === "MANUAL") {
    await prisma.userSkill.delete({ where: { id: userSkillId } });
  }

  return true;
}

export async function setUserSkillVisibility(params: {
  userSkillId: string;
  isVisible: boolean;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const existing = await prisma.userSkill.findUnique({
    where: { id: params.userSkillId },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Skill not found");
  }

  return prisma.userSkill.update({
    where: { id: params.userSkillId },
    data: { isVisible: params.isVisible },
  });
}

export async function endorseUserSkill(params: {
  userId: string;
  skillId: string;
}) {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) throw new Error("Not authenticated");

  // In a fuller system you might ensure currentUserId has completed a swap
  // with the target user for this skill before endorsing.
  return prisma.userSkill.update({
    where: {
      userId_skillId: {
        userId: params.userId,
        skillId: params.skillId,
      },
    },
    data: {
      endorsementCount: {
        increment: 1,
      },
      source: "ENDORSED",
    },
  });
}


