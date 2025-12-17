"use server";

import { prisma } from "@/lib/prisma";

export async function getProposals() {
  try {
    const proposals = await prisma.proposal.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        modality: true,
        description: true,
        status: true,
        createdAt: true,
        // Relation: Fetch Skill names
        offeredSkills: {
          select: { name: true },
        },
        neededSkills: {
          select: { name: true },
        },
      },
    });

    return proposals;
  } catch (error) {
    console.error("[proposal-queries] Failed to fetch proposals:", error);
    return [];
  }
}