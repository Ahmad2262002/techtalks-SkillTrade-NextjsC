// Real server actions
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser } from "@/actions/skills";
import { listPublicProposals } from "@/actions/proposals";
import {
  createApplication,
  updateApplicationStatus,
} from "@/actions/applications";
import { createSwapFromApplication, updateSwapStatus } from "@/actions/swaps";
import { createReview } from "@/actions/reviews";
import { getDashboardOverview } from "@/actions/dashboard";
import { getCurrentUserId } from "@/lib/auth";
import DashboardClientContent from "./client";

// --- Type Definitions based on PRD/SRS ---

type Skill = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  industry: string;
  bio: string;
  skills: Skill[];
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

type DashboardOverview = {
  user: User;
  proposals: Proposal[];
  applications: any[]; // Define Application type if needed
  swaps: any[]; // Define Swap type if needed
};

// --- Mock data fallback ---
const MOCK_USER_ID = "user-12345";

const mockUserData = {
  user: {
    id: MOCK_USER_ID,
    name: "Alex Johnson",
    industry: "Software Engineering",
    bio: "Passionate about full-stack development and teaching beginner Python. Looking to swap for design principles.",
    skills: [
      { id: "s1", name: "Python" },
      { id: "s2", name: "React/Next.js" },
      { id: "s3", name: "SQL" },
    ],
  },
  reputation: {
    averageRating: 4.8,
    completedSwaps: 12,
  },
  applications: [],
  proposals: [],
};

const mockPublicProposals = [
  {
    id: "prop1",
    ownerId: "other-user-1",
    title: "Seeking React Mentorship",
    description:
      "Offering French language conversation practice for an hour of React/Next.js mentorship per week.",
    modality: "REMOTE",
    offeredSkill: { name: "French" },
    neededSkills: [{ id: "s2", name: "React/Next.js" }],
  },
  {
    id: "prop2",
    ownerId: "other-user-2",
    title: "Spanish Lessons for Web Design",
    description:
      "Native Spanish speaker looking for help setting up a personal website.",
    modality: "IN_PERSON",
    offeredSkill: { name: "Spanish" },
    neededSkills: [{ id: "s5", name: "Web Design" }],
  },
];

const mockSwaps = [
  {
    id: "swap1",
    proposal: { title: "Guitar Lessons" },
    status: "IN_PROGRESS",
    partner: { name: "Charlie" },
    myReviewId: null,
  },
];

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
  // Next.js 16: searchParams is now a Promise and MUST be awaited
  const params = await searchParams; // Await the promise to get search params

  const activeTab = params?.tab || "browse";
  const search = params?.q ?? "";
  const rawModality = params?.modality || "";

  // Convert "ALL" or empty to undefined for API filter
  const modalityFilter = rawModality === "ALL" || rawModality === ""
    ? undefined
    : rawModality;

  let overview: any;
  let publicProposals: any[] = [];
  let useMockData = false;

  try {
    // Fetch dashboard overview and public proposals in parallel for performance
    const [fetchedOverview, fetchedPublicProposals] = await Promise.all([
      getDashboardOverview(),
      listPublicProposals({
        search: search || undefined,
        modality: modalityFilter,
        take: 20,
      }),
    ]);

    overview = fetchedOverview;
    publicProposals = fetchedPublicProposals;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Fallback to mock data if the backend is unavailable
    useMockData = true;
    overview = mockUserData;
    publicProposals = mockPublicProposals;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    // In a real app, you'd redirect. For this demo, we'll use the mock ID.
    // redirect("/login");
  }

  // Use a Map to merge proposals from the user's overview and the public list,
  // ensuring there are no duplicates.
  const proposalById = new Map<string, Proposal>();
  for (const p of overview.proposals || []) {
    if (p?.id) proposalById.set(p.id, p);
  }
  for (const p of publicProposals || []) {
    // Add public proposals only if they aren't already in the map (e.g., owned by the user)
    if (p?.id && !proposalById.has(p.id)) {
      proposalById.set(p.id, p);
    }
  }
  const allProposals = Array.from(proposalById.values());

  // Create a Set of proposal IDs the user has already applied to
  const appliedProposalIds = new Set(overview.sentApplications?.map((app: any) => app.proposalId) || []);

  // Filter proposals into "mine" and "public" for the different dashboard tabs
  const publicOnlyProposals = allProposals.filter(
    (p) => p.ownerId !== (userId || MOCK_USER_ID) && !appliedProposalIds.has(p.id),
  );
  const myProposals = allProposals.filter((p) => p.ownerId === (userId || MOCK_USER_ID));

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
              {useMockData && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <span className="text-sm font-medium">
                    Using mock data - backend not available
                  </span>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          </div>
        </div>

        <DashboardClientContent
          overview={overview}
          myProposals={myProposals}
          publicOnlyProposals={publicOnlyProposals}
          search={search}
          rawModality={rawModality}
          activeTab={activeTab}
          swaps={overview.swaps || (useMockData ? mockSwaps : [])}
          applications={overview.applications || []}
        />
      </div>
    </main>
  );
}