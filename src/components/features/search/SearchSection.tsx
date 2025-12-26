
"use client";

import React, { useState, useEffect } from "react";
import { listPublicProposals } from "@/actions/proposals";
import { createApplication } from "@/actions/applications";
import { Search, Filter, Grid, List, User, ArrowRightLeft, Star, CheckCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ReputationBadge } from "@/components/ReputationBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProposalWithDetails = Awaited<ReturnType<typeof listPublicProposals>>[number];

// THE FIX:
// The `filtersData` constant was missing. It is now defined here.
const filtersData: Record<string, string[]> = {
  date: ["ANY", "Today", "This Week", "This Month"],
};


// Optimized Proposal Card Component
const ProposalCard = React.memo(({ item, isApplied, applyingId, handleApply }: {
  item: ProposalWithDetails,
  isApplied: boolean,
  applyingId: string | null,
  handleApply: (id: string) => void
}) => {
  const reputation = (item.owner as any).reputation;

  return (
    <div className="group relative flex flex-col p-8 rounded-[2.5rem] bg-card border-2 border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Zap className="w-24 h-24 rotate-12" />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <Link href={`/profile/${item.owner.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary/50 transition-colors">
            <AvatarImage src={item.owner.avatarUrl || ""} />
            <AvatarFallback className="font-bold">{(item.owner.name || "U")[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-extrabold text-foreground group-hover:text-primary transition-colors leading-none">{item.owner.name || "Anonymous User"}</span>
            {reputation && <ReputationBadge reputation={reputation} size="sm" className="mt-1" />}
          </div>
        </Link>

        {reputation && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-black text-xs">{reputation.averageRating?.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mb-8 relative z-10">
        <h3 className="font-black text-2xl text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2 h-[2.8rem] opacity-80">{item.description}</p>
      </div>

      <div className="mt-auto grid grid-cols-[1fr,auto,1fr] items-center gap-4 py-6 border-t border-border/50 relative z-10">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-1.5 font-sans">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Offers
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.offeredSkills.map(s => <Badge key={s.id} variant="secondary" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold px-3 py-1 rounded-lg">{s.name}</Badge>)}
          </div>
        </div>

        <div className="bg-muted px-2 py-4 rounded-full">
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 justify-end flex items-center gap-1.5 font-sans">
            Requests
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {item.neededSkills.map(s => <Badge key={s.id} variant="secondary" className="bg-orange-500/5 text-orange-600 border-orange-500/20 font-bold px-3 py-1 rounded-lg">{s.name}</Badge>)}
          </div>
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <Button
          className={cn(
            "w-full h-14 rounded-2xl font-black text-lg transition-all gap-2",
            isApplied ? "bg-emerald-500 text-white border-none cursor-default" : "bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          )}
          size="lg"
          disabled={applyingId === item.id || isApplied}
          onClick={() => handleApply(item.id)}
        >
          {applyingId === item.id ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : isApplied ? (
            <>
              <CheckCircle className="w-6 h-6" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <span>Request Swap</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
ProposalCard.displayName = "ProposalCard";

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
    <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-6 bg-card/50 p-6 rounded-[2rem] border border-border/50 backdrop-blur-xl sticky top-4 z-30 shadow-2xl shadow-primary/5">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full group">
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-background/50 border-2 border-border rounded-2xl py-4 pl-14 pr-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-[60px] px-6 rounded-2xl border-2 transition-all gap-2 font-bold",
                showFilters ? "bg-primary/10 text-primary border-primary" : "hover:border-primary/50"
              )}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </Button>

            <div className="hidden md:flex bg-muted/50 p-1.5 rounded-2xl border-2 border-border h-[60px] items-center">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-xl h-10 w-10"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-xl h-10 w-10"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border animate-fade-in">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">Quick Filters:</span>
            {filtersData.date.map(opt => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                  activeFilter === opt
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {opt === "ANY" ? "All Time" : opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className={cn(
          "grid gap-8",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-card/50 border-2 border-border/50 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-3 w-12" /><Skeleton className="h-8 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-12" /><Skeleton className="h-8 w-full rounded-lg" /></div>
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          "grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          {filteredProposals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
              <p className="text-muted-foreground max-w-xs">Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
          ) : (
            filteredProposals.map((item) => (
              <ProposalCard
                key={item.id}
                item={item}
                isApplied={appliedProposals.has(item.id)}
                applyingId={applyingId}
                handleApply={handleApply}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}