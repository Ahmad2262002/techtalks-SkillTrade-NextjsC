import { createProposal as createProposalInternal } from "@/actions/proposal-actions";
import { ProposalValues } from "@/lib/validation";

export async function createProposal(data: ProposalValues) {
  try {
    const actionData = {
      title: data.title,
      description: data.description,
      modality: data.modality as "Remote" | "In-Person",
      offeredSkillName: data.offeredSkill,
      neededSkillNames: data.neededSkill,
    };

    const result = await createProposalInternal(actionData);

    if (result.success) {
      return { status: "success", id: result.proposalId };
    }

    throw new Error(result.message || "Unknown error");
  } catch (error) {
    console.error("[proposalService] Failed to create proposal:", error);
    throw error;
  }
}