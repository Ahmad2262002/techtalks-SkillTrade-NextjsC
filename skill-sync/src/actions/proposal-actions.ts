'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// --- Zod Schema for Validation ---
const CreateProposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(20, "Please provide a detailed description.").max(500, "Description is too long."),
  modality: z.enum(["Remote", "In-Person"] as const),
  offeredSkillName: z.string().min(1, "You must offer one skill."),
  neededSkillNames: z.string().min(1, "You must seek at least one skill."),
});

type ProposalFormData = z.infer<typeof CreateProposalSchema>;

// --- Server Action: Create a Proposal ---
export async function createProposal(
  formData: ProposalFormData,
  options: { revalidate: boolean } = { revalidate: true }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message: 'You must be logged in to post a proposal.',
    };
  }

  // 1. Validate Input using Zod schema
  const validatedFields = CreateProposalSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
    };
  }

  const { title, description, modality, offeredSkillName, neededSkillNames } = validatedFields.data;

  try {
    // 2. Get or Create Offered Skill
    const offeredSkill = await prisma.skill.upsert({
      where: { name: offeredSkillName },
      update: {},
      create: { name: offeredSkillName },
    });

    // 3. Get or Create Needed Skills
    const neededSkillsList = neededSkillNames.split(',').map(s => s.trim()).filter(s => s);
    const neededSkillIds: string[] = [];

    for (const name of neededSkillsList) {
      const skill = await prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      neededSkillIds.push(skill.id);
    }

    // 4. Create the Proposal in the Database
    const dbModality = modality === 'Remote' ? 'REMOTE' : 'IN_PERSON';

    const proposal = await prisma.proposal.create({
      data: {
        ownerId: userId,
        title,
        description,
        modality: dbModality,
        status: 'OPEN',
        offeredSkills: {
          connect: [{ id: offeredSkill.id }],
        },
        neededSkills: {
          connect: neededSkillIds.map(id => ({ id })),
        },
      },
    });

    if (options.revalidate) {
      revalidatePath('/dashboard');
    }

    return {
      success: true,
      proposalId: proposal.id,
      message: 'Proposal posted successfully!',
    };

  } catch (error) {
    console.error('Action Error:', error);
    return {
      success: false,
      message: 'Failed to create proposal due to an unexpected error.',
    };
  }
}

// Wrapper for form actions if needed elsewhere
export async function createProposalAction(
  prevState: any,
  formData: FormData
) {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    modality: formData.get("modality") as "Remote" | "In-Person",
    offeredSkillName: formData.get("offeredSkillName") as string,
    neededSkillNames: formData.get("neededSkillNames") as string,
  };

  const result = await createProposal(rawData);
  return result;
}

// --- Server Action: Delete a Proposal ---
export async function deleteProposal(proposalId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, message: 'Not authenticated' };

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return { success: false, message: 'Proposal not found.' };
    }

    if (proposal.ownerId !== userId) {
      return { success: false, message: 'Unauthorized to delete this proposal.' };
    }

    await prisma.proposal.delete({
      where: { id: proposalId },
    });

    revalidatePath('/dashboard');
    return { success: true, message: 'Proposal deleted successfully.' };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: 'Failed to delete proposal.' };
  }
}