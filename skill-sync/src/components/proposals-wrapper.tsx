"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProposals } from "@/actions/proposal-queries";
import { RecentProposals } from "@/components/RecentProposals";

// Helper to map DB response to UI format
function mapProposalFromDB(proposal: any) {
  // Extract skill names from the relation arrays
  const offeredSkill = proposal.offeredSkills?.map((s: any) => s.name).join(", ") || "";
  const neededSkill = proposal.neededSkills?.map((s: any) => s.name).join(", ") || "";

  // Map status enum to UI labels
  const statusMap: Record<string, string> = {
    OPEN: "pending",
    IN_PROGRESS: "matched",
    CLOSED: "closed",
  };

  // Map modality enum to UI labels
  const modalityMap: Record<string, string> = {
    ONLINE: "Online · video calls",
    ASYNC: "Async · messages, recordings",
    "IN-PERSON": "In-person · same city",
    HYBRID: "Hybrid · mix of formats",
  };

  const modalityKey = proposal.modality ? proposal.modality.toUpperCase() : "ONLINE";

  return {
    id: proposal.id,
    title: proposal.title,
    offeredSkill: offeredSkill || "View details",
    neededSkill: neededSkill || "View details",
    modality: modalityMap[modalityKey] || proposal.modality,
    status: statusMap[proposal.status] || proposal.status,
    createdAt: proposal.createdAt,
  };
}

export function ProposalsWrapper() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const dbProposals = await getProposals();
      const mapped = dbProposals.map(mapProposalFromDB);
      setProposals(mapped);
    } catch (error) {
      console.error("[ProposalsWrapper] Failed to load proposals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState === "visible") loadProposals();
    };
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);
    return () => {
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, []);

  const handleDelete = (id: string) => {
    setProposals((current) => current.filter((p) => p.id !== id));
    router.refresh();
    setTimeout(() => {
      loadProposals();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-cyan-400/40 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <span className="ml-4 text-slate-400 text-sm">Loading proposals...</span>
      </div>
    );
  }

  return <RecentProposals proposals={proposals} onProposalDeleted={handleDelete} />;
}