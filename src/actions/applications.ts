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

  const application = await prisma.application.create({
    data: {
      proposalId: input.proposalId,
      applicantId: userId,
      pitchMessage: input.pitchMessage,
    },
  });

  // Get owner details to send email
  const owner = await prisma.user.findUnique({
    where: { id: proposal.ownerId },
  });

  if (owner && owner.email) {
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: owner.email,
      subject: `New Application for: ${proposal.title}`,
      html: `
        <p>You have a new applicant for your proposal <strong>${proposal.title}</strong>.</p>
        <p><strong>Pitch:</strong> ${input.pitchMessage}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=my-proposals">View Application</a></p>
      `,
    });
  }

  return application;
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
      applicant: true,
    },
  });

  if (!application || application.proposal.ownerId !== userId) {
    throw new Error("Application not found");
  }

  const updatedApplication = await prisma.application.update({
    where: { id: params.applicationId },
    data: { status: params.status },
  });

  // IMMEDIATE EMAIL for critical status updates
  if (application.applicant.email && params.status !== ApplicationStatus.PENDING) {
    const { sendEmail } = await import("@/lib/email");
    const statusText = params.status === ApplicationStatus.ACCEPTED ? "Accepted" : "Rejected";
    const statusColor = params.status === ApplicationStatus.ACCEPTED ? "#10b981" : "#ef4444";

    await sendEmail({
      to: application.applicant.email,
      subject: `Application ${statusText}: ${application.proposal.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor};">Application ${statusText}</h2>
          <p>Your application for <strong>${application.proposal.title}</strong> has been <strong>${statusText.toLowerCase()}</strong>.</p>
          ${params.status === ApplicationStatus.ACCEPTED ? `
            <p>🎉 Congratulations! The proposal owner has accepted your application. You can now start collaborating!</p>
          ` : `
            <p>Unfortunately, your application was not accepted this time. Keep exploring other opportunities!</p>
          `}
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=my-applications" style="background-color: ${statusColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Dashboard</a></p>
        </div>
      `,
    });
  }

  return updatedApplication;
}