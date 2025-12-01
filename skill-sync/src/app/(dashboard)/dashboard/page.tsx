import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDashboardOverview } from "@/actions/dashboard";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser } from "@/actions/skills";
import {
  createProposal,
  listPublicProposals,
} from "@/actions/proposals";
import {
  createApplication,
  updateApplicationStatus,
} from "@/actions/applications";
import {
  createSwapFromApplication,
  listMySwaps,
  updateSwapStatus,
} from "@/actions/swaps";
import { createReview } from "@/actions/reviews";
import { getCurrentUserId } from "@/lib/auth";

// Server action wrappers to work with <form action={...}>

async function updateProfileAction(formData: FormData) {
  "use server";

  await upsertProfile({
    name: (formData.get("name") as string) || null,
    industry: (formData.get("industry") as string) || null,
    bio: (formData.get("bio") as string) || null,
  });

  revalidatePath("/dashboard");
}

async function addSkillAction(formData: FormData) {
  "use server";

  const name = (formData.get("skillName") as string) || "";
  if (!name.trim()) return;

  await addSkillToCurrentUser({ name });
  revalidatePath("/dashboard");
}

async function createProposalAction(formData: FormData) {
  "use server";

  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const modality = (formData.get("modality") as string) || "REMOTE";

  if (!title.trim()) return;

  await createProposal({
    title,
    description,
    modality,
    offeredSkillIds: [],
    neededSkillIds: [],
  });

  revalidatePath("/dashboard");
}

async function applyToProposalAction(formData: FormData) {
  "use server";

  const proposalId = formData.get("proposalId") as string;
  const pitchMessage = (formData.get("pitchMessage") as string) || "";

  if (!proposalId) return;

  await createApplication({ proposalId, pitchMessage });
  revalidatePath("/dashboard");
}

async function acceptApplicationToSwapAction(formData: FormData) {
  "use server";

  const applicationId = formData.get("applicationId") as string;
  if (!applicationId) return;

  await createSwapFromApplication(applicationId);
  revalidatePath("/dashboard");
}

async function markSwapCompletedAction(formData: FormData) {
  "use server";

  const swapId = formData.get("swapId") as string;
  if (!swapId) return;

  await updateSwapStatus({ swapId, status: "COMPLETED" });
  revalidatePath("/dashboard");
}

async function leaveReviewAction(formData: FormData) {
  "use server";

  const swapId = formData.get("swapId") as string;
  const rating = Number(formData.get("rating") || 5);
  const comment = (formData.get("comment") as string) || "";

  if (!swapId) return;

  await createReview({ swapId, rating, comment });
  revalidatePath("/dashboard");
}

async function updateApplicationStatusAction(formData: FormData) {
  "use server";

  const applicationId = formData.get("applicationId") as string;
  const status = formData.get("status") as "ACCEPTED" | "REJECTED";
  if (!applicationId || !status) return;

  await updateApplicationStatus({ applicationId, status });
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const overview = await getDashboardOverview();
  const publicProposals = await listPublicProposals();
  const swaps = await listMySwaps();

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard (Test UI)</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Profile</h2>
        <form action={updateProfileAction} className="space-y-2 max-w-md">
          <input
            name="name"
            placeholder="Name"
            defaultValue={overview.user?.name ?? ""}
            className="border px-2 py-1 w-full"
          />
          <input
            name="industry"
            placeholder="Industry"
            defaultValue={overview.user?.industry ?? ""}
            className="border px-2 py-1 w-full"
          />
          <textarea
            name="bio"
            placeholder="Bio"
            defaultValue={overview.user?.bio ?? ""}
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Save Profile
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Skills</h2>
        <form action={addSkillAction} className="space-y-2 max-w-sm">
          <input
            name="skillName"
            placeholder="Add a skill (e.g. Guitar)"
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-green-600 text-white text-sm"
          >
            Add Skill
          </button>
        </form>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(overview.user?.skills ?? [], null, 2)}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Create Proposal</h2>
        <form action={createProposalAction} className="space-y-2 max-w-md">
          <input
            name="title"
            placeholder="Title"
            className="border px-2 py-1 w-full"
          />
          <textarea
            name="description"
            placeholder="Description"
            className="border px-2 py-1 w-full"
          />
          <select
            name="modality"
            defaultValue="REMOTE"
            className="border px-2 py-1 w-full"
          >
            <option value="REMOTE">REMOTE</option>
            <option value="IN_PERSON">IN_PERSON</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
          >
            Create Proposal
          </button>
        </form>

        <div>
          <h3 className="font-semibold">My Proposals</h3>
          <pre className="bg-gray-100 p-2 text-xs overflow-auto">
            {JSON.stringify(overview.proposals ?? [], null, 2)}
          </pre>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Public Proposals (Apply)</h2>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(publicProposals, null, 2)}
        </pre>
        <form action={applyToProposalAction} className="space-y-2 max-w-md">
          <input
            name="proposalId"
            placeholder="Proposal ID to apply to"
            className="border px-2 py-1 w-full"
          />
          <textarea
            name="pitchMessage"
            placeholder="Why are you a good match?"
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-orange-600 text-white text-sm"
          >
            Apply to Proposal
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">My Applications</h2>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(overview.applications ?? [], null, 2)}
        </pre>
        <form
          action={updateApplicationStatusAction}
          className="space-y-2 max-w-md"
        >
          <input
            name="applicationId"
            placeholder="Application ID to accept/reject"
            className="border px-2 py-1 w-full"
          />
          <select
            name="status"
            defaultValue="ACCEPTED"
            className="border px-2 py-1 w-full"
          >
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-teal-600 text-white text-sm"
          >
            Update Application Status
          </button>
        </form>
        <form
          action={acceptApplicationToSwapAction}
          className="space-y-2 max-w-md"
        >
          <input
            name="applicationId"
            placeholder="Application ID to convert to swap"
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
          >
            Create Swap from Application
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">My Swaps</h2>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(swaps ?? [], null, 2)}
        </pre>
        <form
          action={markSwapCompletedAction}
          className="space-y-2 max-w-md"
        >
          <input
            name="swapId"
            placeholder="Swap ID to mark completed"
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-gray-800 text-white text-sm"
          >
            Mark Swap Completed
          </button>
        </form>
        <form action={leaveReviewAction} className="space-y-2 max-w-md">
          <input
            name="swapId"
            placeholder="Swap ID to review"
            className="border px-2 py-1 w-full"
          />
          <input
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={5}
            className="border px-2 py-1 w-full"
          />
          <textarea
            name="comment"
            placeholder="Review comment"
            className="border px-2 py-1 w-full"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-pink-600 text-white text-sm"
          >
            Leave Review
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Reputation Snapshot</h2>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(overview.reputation ?? {}, null, 2)}
        </pre>
      </section>
    </main>
  );
}


