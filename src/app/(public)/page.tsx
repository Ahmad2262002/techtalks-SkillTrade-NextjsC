import { revalidatePath } from "next/cache";

import { listPublicProposals } from "@/actions/proposals";

async function searchProposalsAction(formData: FormData) {
  "use server";

  const search = (formData.get("search") as string) || "";
  const modality = (formData.get("modality") as string) || "";

  // Revalidate the homepage with the new search params encoded in the URL.
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  if (modality) params.set("modality", modality);

  revalidatePath(`/?${params.toString()}`);
}

export default async function Home(props: {
  searchParams?: { q?: string; modality?: string };
}) {
  const search = props.searchParams?.q ?? "";
  const modality = props.searchParams?.modality ?? "";

  const proposals = await listPublicProposals({
    search: search || undefined,
    modality: modality || undefined,
    take: 20,
  });

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            SkillTrade – The Barter Economy for Knowledge
          </h1>
          <p className="text-zinc-600">
            Search open swap proposals. This is a simple test UI that calls the
            real backend actions.
          </p>
        </section>

        <section className="space-y-4">
          <form
            action={searchProposalsAction}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by title (e.g. Guitar, SEO, Spanish)..."
              className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="modality" className="sr-only">
              Modality
            </label>
            <select
              id="modality"
              name="modality"
              defaultValue={modality}
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any modality</option>
              <option value="REMOTE">Remote</option>
              <option value="IN_PERSON">In person</option>
            </select>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Open Proposals</h2>
          {proposals.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No open proposals match this filter yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {proposals.map((p: any) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">{p.title}</h3>
                      <p className="text-xs text-zinc-600 line-clamp-2">
                        {p.description}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Modality: {p.modality} · Owner: {p.owner?.email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-zinc-500">
                      <div>Applications: {p._count.applications}</div>
                      <div>Swaps: {p._count.swaps}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          <p>
            For internal testing: use{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">
              /dashboard
            </code>{" "}
            to exercise create/apply/swap/review actions with the test user.
          </p>
        </section>
      </div>
    </main>
  );
}

