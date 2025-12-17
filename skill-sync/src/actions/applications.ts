'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";
import { ApplicationStatus } from "@prisma/client";

export async function createApplication(input: {
  proposalId: string;
  pitchMessage: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // --- FIX START: Fetch Proposal first ---
  const proposal = await prisma.proposal.findUnique({
    where: { id: input.proposalId },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  // CHECK 1: You cannot apply to your own proposal
  if (proposal.ownerId === userId) {
    throw new Error("You cannot apply to your own proposal");
  }

  // CHECK 2: You cannot apply twice
  const existingApplication = await prisma.application.findUnique({
    where: {
      proposalId_applicantId: {
        proposalId: input.proposalId,
        applicantId: userId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("You have already applied to this proposal");
  }
  // --- FIX END ---

  return prisma.application.create({
    data: {
      proposalId: input.proposalId,
      applicantId: userId,
      pitchMessage: input.pitchMessage,
    },
  });
}

export async function listApplicationsForProposal(proposalId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal || proposal.ownerId !== userId) {
    throw new Error("Not authorized to view applications");
  }

  return prisma.application.findMany({
    where: { proposalId },
    include: { applicant: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listMyApplications() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.application.findMany({
    where: { applicantId: userId },
    include: {
      proposal: {
        include: {
          owner: true,
          offeredSkills: true,
          neededSkills: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(params: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
    include: {
      proposal: true,
    },
  });

  if (!application || application.proposal.ownerId !== userId) {
    throw new Error("Application not found");
  }

  return prisma.application.update({
    where: { id: params.applicationId },
    data: { status: params.status },
  });
}