'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/actions/auth";

export async function createReview(input: {
  swapId: string;
  rating: number;
  comment?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. Fetch swap details
  const swap = await prisma.swap.findUnique({
    where: { id: input.swapId },
    include: { 
      proposal: {
        include: { offeredSkills: true } 
      } 
    }
  });

  if (!swap) throw new Error("Swap not found");

  // 2. Authorization Check
  const isTeacher = swap.teacherId === userId;
  const isStudent = swap.studentId === userId;

  if (!isTeacher && !isStudent) {
    throw new Error("Not authorized to review this swap");
  }

  // 3. Status Check
  if (swap.status !== "COMPLETED") {
    throw new Error("You cannot review a swap until it is marked Complete");
  }

  // 4. Duplicate Check
  const existingReview = await prisma.review.findFirst({
    where: {
      swapId: input.swapId,
      authorId: userId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this swap");
  }

  const receiverId = isTeacher ? swap.studentId : swap.teacherId;

  // 5. Create Review
  const review = await prisma.review.create({
    data: {
      swapId: input.swapId,
      authorId: userId,
      receiverId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  // 6. Endorsement Logic
  // If Student rates Teacher >= 4, verify the skills
  if (isStudent && input.rating >= 4) {
    const skillsTaught = swap.proposal.offeredSkills;
    
    for (const skill of skillsTaught) {
      // Use updateMany or careful upsert logic if the userSkill might not exist yet
      // For MVP, we assume the Teacher added the skill manually when creating the proposal.
      // If not, we skip or catch error.
      try {
        await prisma.userSkill.update({
          where: {
            userId_skillId: {
              userId: receiverId, // The Teacher
              skillId: skill.id
            }
          },
          data: {
            endorsementCount: { increment: 1 },
            source: "ENDORSED" // Upgrade status
          }
        });
      } catch (e) {
        // Ignore if userSkill doesn't exist (edge case)
      }
    }
  }

  return review;
}

export async function listReviewsForUser(userId: string) {
  return prisma.review.findMany({
    where: { receiverId: userId },
    include: {
      author: true,
      swap: {
        include: { proposal: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// --- THIS WAS MISSING ---
export async function getReputationStats(userId: string) {
  const [completedSwaps, reviews] = await Promise.all([
    prisma.swap.count({
      where: {
        OR: [{ teacherId: userId }, { studentId: userId }],
        status: "COMPLETED",
      },
    }),
    prisma.review.findMany({
      where: { receiverId: userId },
    }),
  ]);

  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;

  return {
    completedSwaps,
    totalReviews,
    positiveReviews,
    battingAverage:
      totalReviews === 0 ? null : positiveReviews / Math.max(completedSwaps, 1),
  };
}