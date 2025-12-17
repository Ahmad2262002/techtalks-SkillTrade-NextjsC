'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

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
      reviewsReceived: true,
      swapsAsTeacher: {
        where: { status: "COMPLETED" },
      },
      swapsAsStudent: {
        where: { status: "COMPLETED" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const completedSwaps = user.swapsAsTeacher.length + user.swapsAsStudent.length;
  const totalRating = user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = user.reviewsReceived.length > 0
    ? Number((totalRating / user.reviewsReceived.length).toFixed(1))
    : 0;
  const totalEndorsements = user.skills.filter(s => s.source === "ENDORSED").length;

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
    reputation: {
      averageRating,
      completedSwaps,
      totalEndorsements,
    },
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