"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { deleteProposal } from "@/actions/proposal-actions";
import { createSwapFromApplication } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
import styles from './Dashboard.module.css';

// UI Components
import { PostProposalModal } from "@/components/PostProposalModal";
import { ChatModal } from "@/components/ChatModal"; // Chat functionality is imported here
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import {
  Bell, LogOut, Zap, MapPin, Search, Layers, Trash2, CheckCircle, XCircle, UserCircle, Plus, Home, MessageSquare, Trophy, ArrowRight, Menu, X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavSearchButton from "../../../components/features/search/NavSearchButton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReputationBadge } from "@/components/ReputationBadge";

// --- Types ---
interface DashboardProps {
  overview: any; myProposals: any[]; publicOnlyProposals: any[];
  search: string; rawModality: string; activeTab: string;
  swaps: any[]; applications: any[];
}

// --- Main Client Component ---
export default function DashboardClientContent({
  overview, myProposals, publicOnlyProposals, activeTab, swaps, applications,
}: DashboardProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPersonal, setShowPersonal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteProposal(id);
    if (res.success) {
      toast({ title: "Deleted", description: "Proposal removed." });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
  };

  const handleAccept = async (appId: string) => {
    try {
      await createSwapFromApplication(appId);
      toast({ title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error accepting." }); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error rejecting." }); }
  };

  const NavLink = ({ id, label, icon: Icon, delay = 0, href, active }: any) => {
    const isActive = active !== undefined ? active : activeTab === id;
    const finalHref = href || `?tab=${id}`;

    return (
      <Link
        href={finalHref}
        onClick={() => setIsSidebarOpen(false)}
        style={{ animationDelay: `${delay}ms` }}
        className={cn(
          styles.navLink,
          isActive && styles.active,
          styles.animateSlideInRight,
          "group"
        )}
      >
        {React.isValidElement(Icon) ? Icon : <Icon className={cn(
          "w-5 h-5 transition-colors",
          isActive ? "text-primary" : "group-hover:text-foreground"
        )} />}
        <span className={cn(isActive && "text-primary font-bold")}>{label}</span>
        {isActive && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />}
      </Link>
    );
  };

  const tabTitle = {
    "browse": "Explore Skills",
    "my-proposals": "My Proposals",
    "active-swaps": "Active Swaps",
  }[activeTab] || "Dashboard";

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        styles.sidebar,
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "fixed lg:sticky top-0 left-0 w-[280px] h-screen transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-50"
      )}>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-6 right-6 p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className={styles.animateSlideInRight}>
          <Link href="/" className={styles.logo}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white mr-2 shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            Skill<span>Swap</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1">
          <p className={cn(styles.navGroupTitle, styles.animateSlideInRight)} style={{ animationDelay: '100ms' }}>Platform</p>
          <NavLink href="/dashboard?tab=browse" active={activeTab === "browse"} icon={<Layers className="w-5 h-5" />} label="Browse" />
          <NavLink href="/dashboard?tab=my-proposals" active={activeTab === "my-proposals"} icon={<Zap className="w-5 h-5" />} label="My Proposals" />
          <NavLink href="/dashboard?tab=active-swaps" active={activeTab === "active-swaps"} icon={<MessageSquare className="w-5 h-5" />} label="Active Swaps" />
          <NavLink href="/dashboard?tab=leaderboard" active={activeTab === "leaderboard"} icon={<Trophy className="w-5 h-5" />} label="Leaderboard" />
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            onClick={() => setShowPersonal(!showPersonal)}
            className={cn(styles.navLink, styles.animateSlideInRight, "w-full justify-between")}
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5" />
              <span>Account</span>
            </div>
            <div className={cn("transition-transform duration-300", showPersonal ? "rotate-180" : "rotate-0")}>
              <Plus className="w-4 h-4 opacity-50" />
            </div>
          </button>

          {showPersonal && (
            <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-4 fade-in duration-300">
              <Link href={`/profile/${overview.user?.id}`} className={cn(styles.navLink, "hover:bg-muted pl-8")}>
                <UserCircle className="w-4 h-4" /><span>View Profile</span>
              </Link>
              <Link href="/" className={cn(styles.navLink, "hover:bg-muted pl-8")}>
                <Home className="w-4 h-4" /><span>Landing Page</span>
              </Link>
              <button onClick={() => signOut()} className={cn(styles.navLink, "w-full text-rose-500 hover:bg-rose-500/10 pl-8 font-black")}>
                <LogOut className="w-4 h-4" /><span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className={cn(styles.mainContent, styles.animateSlideUp)}>
        <header className={styles.header}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-muted/50 border border-border/50 text-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className={styles.headerTitle}>{tabTitle}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                Welcome back, <span className="font-extrabold text-primary uppercase tracking-tight">{overview.user?.name || "User"}</span>!
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
              <NavSearchButton />
            </div>
            <PostProposalModal />
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border/50">
              <ThemeCustomizer />
              <Notifications notifications={notifications} unreadCount={unreadCount} handleMarkRead={handleMarkRead} />
              <UserMenu user={overview.user} />
            </div>
          </div>
        </header>

        <div className="animate-fade-in delay-150">
          {activeTab === "browse" && <BrowseTabContent publicOnlyProposals={publicOnlyProposals} />}
          {activeTab === "my-proposals" && <MyProposalsTabContent myProposals={myProposals} handleDelete={handleDeleteProposal} />}
          {activeTab === "active-swaps" && <ActiveSwapsTabContent applications={applications} swaps={swaps} user={overview.user} handleAccept={handleAccept} handleReject={handleReject} />}
          {activeTab === "leaderboard" && <LeaderboardTabContent leaderboard={overview.leaderboard} />}
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components ---

const SwapCard = React.memo(({ swap, partner, currentUserId }: any) => (
  <div className={cn(styles.swapCard, "group hover:shadow-lg transition-all duration-300")}>
    <div className={styles.partnerInfo}>
      <div className="relative">
        <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover:border-primary transition-colors">
          <AvatarImage src={partner.avatarUrl} className="object-cover" />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">{partner.name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">Active Swap</p>
        <div className="flex items-center gap-2">
          <h3 className="font-black text-xl tracking-tight">{partner.name}</h3>
          <ReputationBadge reputation={partner.reputation} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 opacity-70">
          <Zap className="w-3.5 h-3.5" />
          Trading {swap.requesterId === currentUserId ? 'for' : 'with'} {swap.proposal.title}
        </p>
      </div>
      <ChatModal
        swapId={swap.id}
        currentUserId={currentUserId}
        otherUserName={partner.name}
      />
    </div>
  </div>
));
SwapCard.displayName = "SwapCard";

const ActiveSwapsTabContent = ({ applications, swaps, user, handleAccept, handleReject }: any) => {
  const pendingApps = applications.filter((a: any) => a.status === "PENDING");
  return (
    <div className="space-y-12 max-w-5xl">
      {pendingApps.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              Incoming Requests
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 ml-2">{pendingApps.length}</Badge>
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingApps.map((app: any) => (
              <ApplicationCard key={app.id} app={app} onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        </section>
      )}
      <section className="animate-fade-in delay-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            Active Swaps
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 ml-2">{swaps.length}</Badge>
          </h3>
        </div>
        {swaps.length === 0 ? (
          <div className={styles.emptyState}>
            <div className="p-4 rounded-full bg-muted/50 mb-2">
              <Zap className="w-10 h-10 text-muted-foreground opacity-20" />
            </div>
            <p className="font-medium">No active connections yet.</p>
            <p className="text-sm text-muted-foreground max-w-xs">Accept an incoming request or browse other proposals to start a skill exchange.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {swaps.map((swap: any) => {
              const partner = swap.teacherId === user.id ? swap.student : swap.teacher;
              return <SwapCard key={swap.id} swap={swap} partner={partner} currentUserId={user.id} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
};


// --- Other Helper Components (Unchanged) ---

const BrowseTabContent = ({ publicOnlyProposals }: any) => {
  // Sort proposals by reputation for spotlight
  const sortedByRep = [...publicOnlyProposals].sort((a, b) =>
    (b.owner?.reputation?.reputationPoints || 0) - (a.owner?.reputation?.reputationPoints || 0)
  ).slice(0, 5); // Show top 5

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex-1 space-y-10">
        {/* Skill Explorer Header */}
        <section className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Layers className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter">Skill Explorer</h2>
            <p className="text-muted-foreground font-medium max-w-md mb-8 text-lg opacity-80">Discover over 150 unique skills being traded right now by experts around the globe.</p>
            <div className="flex flex-wrap gap-3">
              {["React", "UI Design", "Python", "Marketing", "Piano", "Cooking"].map((skill, i) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-6 py-3 rounded-2xl bg-background border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer font-black text-sm shadow-xl shadow-black/5 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {skill}
                </Badge>
              ))}
              <Badge variant="outline" className="px-4 py-2 rounded-xl font-black italic opacity-50 border-dashed">
                + 144 more
              </Badge>
            </div>
          </div>
        </section>

        {/* Main Feed */}
        <div className={styles.cardGrid}>
          {publicOnlyProposals.length === 0 ? (
            <EmptyState message="No public proposals found. Be the first to post!" />
          ) : (
            publicOnlyProposals.map((p: any, i: number) => (
              <div key={p.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <ProposalCard proposal={p} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Spotlight */}
      <aside className="lg:w-80 shrink-0 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <section className="p-8 rounded-[3rem] bg-card border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Top Mentors</h3>
          </div>
          <div className="space-y-8">
            {sortedByRep.map((p: any, i: number) => (
              <Link href={`/profile/${p.ownerId}`} key={p.id} className="flex items-center gap-4 group transition-all">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary transition-all duration-300 group-hover:scale-105">
                    <AvatarImage src={p.owner?.avatarUrl} />
                    <AvatarFallback className="font-black text-lg">{(p.owner?.name?.[0] || "U")}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center text-[10px] font-black shadow-lg">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">{p.owner?.name}</span>
                  {p.owner?.reputation && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-primary/70 uppercase">{p.owner.reputation.title}</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground">LVL {p.owner.reputation.level}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/dashboard?tab=leaderboard">
            <Button variant="outline" className="w-full mt-10 rounded-2xl h-12 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary transition-all">
              Full Leaderboard
            </Button>
          </Link>
        </section>

        <Link href="/#contact" className="block">
          <section className="p-8 rounded-[3rem] bg-muted/50 border border-border/50 relative group cursor-pointer hover:bg-muted transition-colors">
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Need Help?</h3>
            <p className="text-xs font-medium text-muted-foreground mb-4">Check out our community guidelines and learn how to swap like a pro.</p>
            <div className="flex items-center gap-2 text-xs font-black text-primary">
              Contact Support <ArrowRight className="w-3 h-3" />
            </div>
          </section>
        </Link>
      </aside>
    </div>
  );
};

const LeaderboardTabContent = ({ leaderboard }: any) => (
  <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Global Leaderboard</h2>
        <p className="text-muted-foreground font-medium">Rankings based on reputation, successful swaps, and skills endorsed.</p>
      </div>
      <div className="hidden md:flex p-5 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner">
        <Trophy className="w-10 h-10 text-primary animate-pulse" />
      </div>
    </div>

    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
      <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Mentor</div>
        <div className="col-span-3 text-center">Title</div>
        <div className="col-span-3 text-right">Reputation</div>
      </div>
      <div className="divide-y divide-border/50">
        {leaderboard?.map((entry: any, i: number) => (
          <Link href={`/profile/${entry.id}`} key={entry.id}
            className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/50 transition-colors group">
            <div className="col-span-1 font-black text-lg opacity-40 group-hover:opacity-100 transition-opacity">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <div className="col-span-11 md:col-span-5 flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-all">
                <AvatarImage src={entry.avatarUrl} />
                <AvatarFallback className="font-bold">{entry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-foreground group-hover:text-primary transition-colors truncate">{entry.name}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{entry.industry || "Generalist"}</span>
              </div>
            </div>
            <div className="hidden md:block col-span-3 text-center">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                entry.reputation.color,
                entry.reputation.color.replace('text-', 'bg-') + "/10"
              )}>
                {entry.reputation.title}
              </span>
            </div>
            <div className="col-span-11 md:col-span-3 text-right">
              <div className="flex flex-col items-end">
                <span className="font-black text-lg text-primary">{entry.reputation.reputationPoints.toLocaleString()}</span>
                <span className="text-[10px] font-bold opacity-50 uppercase">Points</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const MyProposalsTabContent = ({ myProposals, handleDelete }: any) => (
  <div className={styles.cardGrid}>
    {myProposals.length === 0 ? (
      <EmptyState message="You haven't posted any proposals yet." />
    ) : (
      myProposals.map((p: any) => <ProposalCard key={p.id} proposal={p} isOwner onDelete={handleDelete} />)
    )}
  </div>
);

const ProposalCard = ({ proposal, isOwner = false, onDelete }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalityIcon = proposal.modality === "REMOTE" ? <Zap size={14} className="text-sky-400" /> : <MapPin size={14} className="text-indigo-400" />;
  const offered = proposal.offeredSkills?.[0]?.name || proposal.offeredSkills?.[0]?.skill?.name || "N/A";
  const needed = proposal.neededSkills?.map((s: any) => s.name || s.skill?.name).join(", ") || "N/A";

  return (
    <div className={cn(styles.card, "group relative overflow-hidden")}>
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-1 h-1/2 bg-primary rounded-full opacity-50 group-hover:h-full transition-all duration-500" />

      <div className={styles.cardHeader}>
        <div className="flex-1">
          <h3 className={cn(styles.cardTitle, "line-clamp-2")}>{proposal.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(styles.cardBadge, proposal.modality === "REMOTE" ? "bg-sky-500/10 text-sky-400" : "bg-indigo-500/10 text-indigo-400")}>
              {modalityIcon} <span className="text-[10px] font-black uppercase tracking-widest">{proposal.modality}</span>
            </div>
            {!isOwner && proposal.owner?.reputation && (
              <ReputationBadge reputation={proposal.owner.reputation} size="sm" />
            )}
          </div>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className={cn(styles.skillLabel, styles.offered)}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Offering
            </div>
            <div className="text-sm font-black text-foreground line-clamp-1">{offered}</div>
          </div>
          <div className="space-y-1">
            <div className={cn(styles.skillLabel, styles.needed)}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Seeking
            </div>
            <div className="text-sm font-black text-foreground line-clamp-1">{needed}</div>
          </div>
        </div>
      </div>

      {!isOwner && proposal.owner && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-muted/30 rounded-2xl border border-border/50 group-hover:border-primary/20 transition-colors">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={proposal.owner.avatarUrl} />
            <AvatarFallback className="text-[10px] font-black">{proposal.owner.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Posted by</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{proposal.owner.name}</span>
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <ProposalDetailsModal
          proposal={proposal}
          isOwner={isOwner}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
        {isOwner && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-black text-primary tracking-tighter">Requests</span>
              <span className="text-sm font-black text-foreground">{proposal._count?.applications || 0}</span>
            </div>
            <button
              onClick={() => onDelete(proposal.id)}
              className="p-2.5 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg shadow-destructive/5"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationCard = React.memo(({ app, onAccept, onReject }: any) => (
  <div className={cn(styles.applicationCard, "group relative overflow-hidden border-none bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-500 rounded-[2rem] shadow-xl shadow-black/5")}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <MessageSquare className="w-12 h-12" />
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-orange-500/20 group-hover:border-orange-500 transition-colors">
              <AvatarImage src={app.applicant.avatarUrl} />
              <AvatarFallback className="bg-orange-500/5 text-orange-500 font-black">{app.applicant.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-background flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/profile/${app.applicant.id}`} className="font-black text-xl text-foreground hover:text-primary transition-colors block leading-tight">{app.applicant.name}</Link>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-none px-2 py-0 text-[10px] font-black uppercase tracking-tighter shrink-0">New Applicant</Badge>
              {app.applicant.reputation && <ReputationBadge reputation={app.applicant.reputation} size="sm" className="shrink-0" />}
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mt-1 md:mt-0">Wants to learn {app.proposal.offeredSkills?.[0]?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-6 p-5 bg-background/40 rounded-2xl border border-border/50 group-hover:border-orange-500/20 transition-colors">
        <div className="absolute top-0 left-6 -translate-y-1/2 bg-background px-3 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border border-border/50 rounded-full">The Pitch</div>
        <p className="text-base text-foreground/90 leading-relaxed italic font-medium">"{app.pitchMessage}"</p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => onAccept(app.id)}
          className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all font-black gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <CheckCircle size={18} /> Accept Request
        </Button>
        <Button
          variant="outline"
          onClick={() => onReject(app.id)}
          className="w-12 h-12 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
        >
          <XCircle size={20} />
        </Button>
      </div>
    </div>
  </div>
));
ApplicationCard.displayName = "ApplicationCard";

const UserMenu = ({ user }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="h-10 w-10 rounded-full border-2 border-border overflow-hidden hover:border-primary transition-colors">
        <Avatar><AvatarImage src={user?.avatarUrl || ""} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
      <DropdownMenuItem asChild><Link href={`/profile/${user?.id}`} className="cursor-pointer">My Profile</Link></DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border" />
      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Notifications = ({ notifications, unreadCount, handleMarkRead }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80 bg-popover border-border text-popover-foreground">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-border" />
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
        ) : (
          notifications.map((n: any) => (
            <DropdownMenuItem key={n.id} onClick={() => handleMarkRead(n.id)} className={`cursor-pointer ${!n.isRead ? 'bg-primary/10' : ''}`}>
              <div>
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className={styles.emptyState}>
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background border-border mb-4">
      <Layers className="h-8 w-8 text-muted-foreground" />
    </div>
    <p>{message}</p>
  </div>
);