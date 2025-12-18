
"use client";

import React, { useState, useEffect } from "react";
import { listPublicProposals } from "@/actions/proposals";
import { createApplication } from "@/actions/applications";
import { Search, Filter, Grid, List, User, ArrowRightLeft, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProposalWithDetails = Awaited<ReturnType<typeof listPublicProposals>>[number];

// THE FIX:
// The `filtersData` constant was missing. It is now defined here.
const filtersData: Record<string, string[]> = {
  date: ["ANY", "Today", "This Week", "This Month"],
};

const getReputationScore = (owner: ProposalWithDetails["owner"]) => {
  const reputation = (owner as any).reputation;
  if (!reputation) {
    return { label: "New", score: 0 };
  }
  const rating = reputation.averageRating ?? 0;
  const swaps = reputation.completedSwaps ?? 0;
  const score = (rating * 5) + swaps;
  if (score >= 30) return { label: "Gold", score };
  if (score >= 15) return { label: "Silver", score };
  return { label: "New", score };
};

export default function SearchSection() {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedProposals, setAppliedProposals] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ANY");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProposals(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchProposals = async (query: string) => {
    setLoading(true);
    try {
      const data = await listPublicProposals({ search: query, take: 50 });
      setProposals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (proposalId: string) => {
    setApplyingId(proposalId);
    try {
      await createApplication({ proposalId, pitchMessage: "I'm interested in this swap!" });
      setAppliedProposals(prev => new Set(prev).add(proposalId));
    } catch (error: any) {
      if (error.message?.includes("Unique constraint failed")) {
        setAppliedProposals(prev => new Set(prev).add(proposalId));
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setApplyingId(null);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeFilter === "ANY") return true;
    const date = new Date(p.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (activeFilter === "Today") return diffDays <= 1;
    if (activeFilter === "This Week") return diffDays <= 7;
    if (activeFilter === "This Month") return diffDays <= 30;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md sticky top-0 z-30">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn("p-3 rounded-xl transition-all border", showFilters ? "bg-sky-500/20 text-sky-400 border-sky-500/50" : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent")}
          aria-label="Toggle filters"
        >
          <Filter className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setViewMode(prev => (prev === "list" ? "grid" : "list"))}
          className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all hidden md:block"
          aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
        >
          {viewMode === "list" ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>
        <div className="flex-1 relative w-full">
          <input
            type="text"
            placeholder="Search for skills (e.g. React, Piano)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-slate-400 self-center mr-2">Posted:</span>
          {filtersData.date.map(opt => (
            <button key={opt} onClick={() => setActiveFilter(opt)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", activeFilter === opt ? "bg-sky-500/20 text-sky-400 border-sky-500/50" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600")}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">Searching the database...</div>
      ) : (
        <div className={cn("grid gap-4 animate-in fade-in mx-auto transition-[max-width] ease-in-out duration-500", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl" : "grid-cols-1 max-w-4xl")}>
          {filteredProposals.length === 0 ? (
             <div className="col-span-full text-center py-20 text-slate-500">No proposals found.</div>
          ) : filteredProposals.map((item) => {
              const isApplied = appliedProposals.has(item.id);
              const reputation = (item.owner as any).reputation;
              const repScore = getReputationScore(item.owner);
              
              return (
                <div key={item.id} className="group flex flex-col gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 transition-all backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                       <Link href={`/profile/${item.owner.id}`} className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                         <User className="w-3 h-3" /> 
                         <span className="font-medium text-slate-400">{item.owner.name}</span>
                       </Link>
                       <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          repScore.label === "Gold" && "bg-amber-400/10 text-amber-400 border border-amber-400/20",
                          repScore.label === "Silver" && "bg-gray-400/10 text-gray-300 border border-gray-400/20",
                          repScore.label === "New" && "bg-slate-700/50 text-slate-400 border border-slate-700/80"
                       )}>
                         {repScore.label}
                       </span>
                    </div>
                    {reputation && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <Star className="w-3.5 h-3.5" />
                          <span className="font-bold">{reputation.averageRating?.toFixed(1)}</span>
                          <span className="text-slate-500">({reputation.completedSwaps} swaps)</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-200 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2 h-10">{item.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-3 text-sm pt-4 border-t border-slate-800/50">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold block mb-1">Offers</span>
                      <div className="flex flex-wrap gap-1">
                        {item.offeredSkills.map(s => <Badge key={s.id} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s.name}</Badge>)}
                      </div>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                    <div className="flex-1 text-right">
                      <span className="text-[10px] uppercase tracking-wider text-orange-400 font-bold block mb-1">Wants</span>
                       <div className="flex flex-wrap gap-1 justify-end">
                        {item.neededSkills.map(s => <Badge key={s.id} variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">{s.name}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                      <Button className="w-full" size="sm" disabled={applyingId === item.id || isApplied} onClick={() => handleApply(item.id)}>
                        {applyingId === item.id ? "Applying..." : isApplied ? (<><CheckCircle className="w-4 h-4 mr-2"/> Applied</>) : "Request Swap"}
                      </Button>
                  </div>
                </div>
            )})
          }
        </div>
      )}
    </div>
  );
}