export interface ProposalValues {
  title: string;
  description: string;
  modality: string;
  offeredSkill: string;
  neededSkill: string;
}

export function validateProposal(values: ProposalValues) {
  const errors: Partial<Record<keyof ProposalValues, string>> = {};

  const title = values.title.trim();
  const modality = values.modality.trim();
  const offeredSkill = values.offeredSkill.trim();
  const neededSkill = values.neededSkill.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (!modality) {
    errors.modality = "Please choose a modality.";
  }

  if (!offeredSkill) {
    errors.offeredSkill = "Tell people what you can offer in return.";
  }

  if (!neededSkill) {
    errors.neededSkill = "Describe the skill you want to learn.";
  }

  if (!values.description) {
    errors.description = "Description is required.";
  } else if (values.description.length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}