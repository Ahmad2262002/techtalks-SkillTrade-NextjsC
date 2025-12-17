import { listPublicProposals } from "@/actions/proposals";
import { getDashboardOverview } from "@/actions/dashboard";
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
  tab?: "browse" | "my-proposals" | "active-swaps";
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
    const fetchedOverview = await getDashboardOverview();

    const fetchedPublicProposals = await listPublicProposals({
      search: search || undefined,
      modality: modalityFilter,
      take: 20,
    });

    overview = fetchedOverview;
    publicProposals = fetchedPublicProposals;
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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10 dark:bg-white/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">
                Welcome back, {overview.user?.name || "SkillSwapper"}! 👋
              </h2>
              <p className="text-indigo-100 dark:text-indigo-200 text-lg">
                {overview.user?.bio ||
                  "Ready to swap skills and grow together? Let's get started!"}
              </p>
            </div>
          </div>
        </div>

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
      </div>
    </main>
  );
}