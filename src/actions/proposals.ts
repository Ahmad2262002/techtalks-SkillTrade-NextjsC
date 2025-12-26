'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ProposalStatus } from "@prisma/client";

export async function createProposal(input: {
  title: string;
  description: string;
  modality: string;
  offeredSkillIds: string[];
  neededSkillIds: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.proposal.create({
    data: {
      ownerId: userId,
      title: input.title,
      description: input.description,
      modality: input.modality,
      offeredSkills: {
        connect: input.offeredSkillIds.map((id) => ({ id })),
      },
      neededSkills: {
        connect: input.neededSkillIds.map((id) => ({ id })),
      },
    },
  });
}

import { getReputationStats } from "./reviews";

export async function listPublicProposals(params: {
  wantSkillIds?: string[];
  haveSkillIds?: string[];
  modality?: string;
  search?: string;
  take?: number;
  skip?: number;
} = {}) {
  const {
    wantSkillIds,
    haveSkillIds,
    modality,
    search,
    take = 20,
    skip = 0,
  } = params;

  // --- SEARCH LOGIC ---
  const searchFilter = search
    ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { owner: { name: { contains: search, mode: "insensitive" as const } } },
        {
          offeredSkills: {
            some: { name: { contains: search, mode: "insensitive" as const } },
          },
        },
        {
          neededSkills: {
            some: { name: { contains: search, mode: "insensitive" as const } },
          },
        },
      ],
    }
    : {};

  const proposals = await prisma.proposal.findMany({
    where: {
      status: "OPEN",
      modality: modality ?? undefined,
      ...searchFilter,
      AND: [
        wantSkillIds && wantSkillIds.length
          ? {
            neededSkills: {
              some: {
                id: {
                  in: wantSkillIds,
                },
              },
            },
          }
          : {},
        haveSkillIds && haveSkillIds.length
          ? {
            offeredSkills: {
              some: {
                id: {
                  in: haveSkillIds,
                },
              },
            },
          }
          : {},
      ],
    },
    include: {
      owner: true,
      offeredSkills: true,
      neededSkills: true,
      _count: {
        select: {
          applications: true,
          swaps: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    skip,
  });

  // Attach reputation to each owner
  const proposalsWithReputation = await Promise.all(
    proposals.map(async (p) => {
      const reputation = await getReputationStats(p.ownerId);
      return {
        ...p,
        owner: {
          ...p.owner,
          reputation,
        },
      };
    })
  );

  return proposalsWithReputation;
}

export async function listMyProposals() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.proposal.findMany({
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
  });
}

export async function getProposalById(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      owner: true,
      offeredSkills: true,
      neededSkills: true,
      applications: {
        include: {
          applicant: true,
        },
        orderBy: { createdAt: "desc" },
      },
      swaps: true,
    },
  });

  if (!proposal) return null;

  // Attach reputation to owner
  const ownerReputation = await getReputationStats(proposal.ownerId);

  // Attach reputation to applicants
  const applicationsWithReputation = await Promise.all(
    proposal.applications.map(async (app) => {
      const rep = await getReputationStats(app.applicantId);
      return {
        ...app,
        applicant: {
          ...app.applicant,
          reputation: rep,
        },
      };
    })
  );

  return {
    ...proposal,
    owner: {
      ...proposal.owner,
      reputation: ownerReputation,
    },
    applications: applicationsWithReputation,
  };
}

export async function updateProposalStatus(params: {
  proposalId: string;
  status: ProposalStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.proposalId },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Proposal not found");
  }

  return prisma.proposal.update({
    where: { id: params.proposalId },
    data: {
      status: params.status,
    },
  });
}

export async function rescindProposal(proposalId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { swaps: true },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Proposal not found");
  }

  if (proposal.swaps.length > 0) {
    throw new Error("Cannot rescind a proposal with swaps");
  }

  return prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: "CLOSED",
    },
  });
}