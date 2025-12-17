import { createProposal as createProposalServerAction } from "@/actions/proposal-actions";
import { ProposalValues } from "@/lib/validation";

export async function createProposal(data: ProposalValues) {
  try {
    const result = await createProposalServerAction(data as any);

    if (result.success) {
      return { status: "success", id: result.proposalId };
    }

    throw new Error(result.message || "Unknown error");
  } catch (error) {
    console.error("[proposalService] Failed to create proposal:", error);
    throw error;
  }
}