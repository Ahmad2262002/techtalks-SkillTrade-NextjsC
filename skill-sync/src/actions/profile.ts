'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      reviewsReceived: true,
      reviewsGiven: true,
    },
  });
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

  // In many setups Supabase user.id and email are source of truth.
  // Here we ensure a row exists in our User table.
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


