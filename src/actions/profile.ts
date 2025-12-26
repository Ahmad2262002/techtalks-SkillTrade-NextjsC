'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getReputationStats } from "./reviews";

export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
      reviewsReceived: true,
      reviewsGiven: true,
    },
  });
}

export async function getUserProfile(userId: string) {
  // --- FIX: Guard against undefined userId ---
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const reputation = await getReputationStats(userId);

  return {
    id: user.id,
    name: user.name,
    industry: user.industry,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
    skills: user.skills.map(s => ({
      id: s.id,
      name: s.skill.name,
      source: s.source,
      isVisible: s.isVisible,
    })),
    reputation,
  };
}

export async function upsertProfile(input: {
  name?: string | null;
  industry?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const { email } =
    (await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })) ?? {};

  return prisma.user.upsert({
    where: { id: userId },
    update: {
      name: input.name ?? undefined,
      industry: input.industry ?? undefined,
      bio: input.bio ?? undefined,
      avatarUrl: input.avatarUrl ?? undefined,
      phoneNumber: input.phoneNumber ?? undefined,
    },
    create: {
      id: userId,
      email: email ?? "",
      name: input.name ?? null,
      industry: input.industry ?? null,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      phoneNumber: input.phoneNumber ?? null,
    },
  });
}