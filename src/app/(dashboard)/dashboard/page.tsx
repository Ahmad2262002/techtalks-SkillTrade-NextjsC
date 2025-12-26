import { listPublicProposals } from "@/actions/proposals";
import { getDashboardOverview, getLeaderboard } from "@/actions/dashboard";
import { getCurrentUserId } from "@/actions/auth";
import DashboardClientContent from "./client";
import { redirect } from "next/navigation";

type Skill = {
  id: string;
  name: string;
};

type Proposal = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  modality: "REMOTE" | "IN_PERSON";
  offeredSkill: Skill;
  neededSkills: Skill[];
};

type DashboardSearchParams = {
  tab?: "browse" | "my-proposals" | "active-swaps" | "leaderboard";
  q?: string;
  modality?: string;
};

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const params = await searchParams;

  const activeTab = params?.tab || "browse";
  const search = params?.q ?? "";
  const rawModality = params?.modality || "";

  // Convert "ALL" or empty to undefined for API filter
  const modalityFilter = rawModality === "ALL" || rawModality === ""
    ? undefined
    : rawModality;

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  let overview: any;
  let publicProposals: any[] = [];

  try {
    const [fetchedOverview, fetchedPublicProposals, fetchedLeaderboard] = await Promise.all([
      getDashboardOverview(),
      listPublicProposals({
        search: search || undefined,
        modality: modalityFilter,
        take: 20,
      }),
      getLeaderboard(),
    ]);

    overview = fetchedOverview;
    publicProposals = fetchedPublicProposals;
    overview.leaderboard = fetchedLeaderboard;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return <div>Error loading dashboard. Please try again.</div>;
  }

  // Filter: Exclude my own proposals AND proposals I've already applied to
  const proposalById = new Map<string, Proposal>();
  for (const p of publicProposals || []) {
    proposalById.set(p.id, p);
  }
  const allProposals = Array.from(proposalById.values());

  const appliedProposalIds = new Set(overview.sentApplications?.map((app: any) => app.proposalId) || []);

  const publicOnlyProposals = allProposals.filter(
    (p) => p.ownerId !== userId && !appliedProposalIds.has(p.id),
  );

  const myProposals = overview.proposals;

  return (
    <main>
      <DashboardClientContent
        overview={overview}
        myProposals={myProposals}
        publicOnlyProposals={publicOnlyProposals}
        search={search}
        rawModality={rawModality}
        activeTab={activeTab}
        swaps={overview.swaps}
        applications={overview.applications}
      />
    </main>
  );
}