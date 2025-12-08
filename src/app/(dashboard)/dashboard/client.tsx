"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Zap,
    MapPin,
    Search,
    Layers,
    Bell,
    LogOut,
    User,
    GraduationCap,
    UserCircle,
    MessageSquare,
    CheckCircle,
    Share2,
    ArrowRight,
    Calendar,
    XCircle,
    Phone,
    Briefcase,
    Award,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notifications";
import { PostProposalModal } from "@/components/PostProposalModal";
import { ChatModal } from "@/components/ChatModal";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { createSwapFromApplication } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
import { useToast } from "@/components/ui/use-toast";

// Dashboard Header Component
function DashboardHeader({ user }: { user: any }) {
    const userId = user?.id;
    const userName = user?.name;
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPLICATION_RECEIVED': return <UserCircle className="w-4 h-4 text-blue-500" />;
            case 'APPLICATION_ACCEPTED': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'APPLICATION_REJECTED': return <LogOut className="w-4 h-4 text-red-500" />;
            case 'SWAP_STARTED': return <Zap className="w-4 h-4 text-yellow-500" />;
            case 'MESSAGE_RECEIVED': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'REVIEW_RECEIVED': return <GraduationCap className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 dark:bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 shadow-lg group-hover:scale-105 transition-transform">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    SkillSwap
                                </h1>
                                <p className="text-xs text-muted-foreground hidden sm:block">Learn by Teaching</p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Create Proposal Button */}
                        <div className="hidden md:block">
                            <PostProposalModal />
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                            <DropdownMenuTrigger asChild suppressHydrationWarning>
                                <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span>Notifications</span>
                                    {unreadCount > 0 && (
                                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllRead}>
                                            Mark all read
                                        </Button>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-[300px]">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {notifications.map((notification) => (
                                                <DropdownMenuItem
                                                    key={notification.id}
                                                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                >
                                                    <div className="flex items-start gap-2 w-full">
                                                        <div className="mt-1 shrink-0">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm leading-none font-medium">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                                {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                                        )}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-3 border-l">
                            <Link href={`/profile/${userId}`} title="My Profile">
                                <Avatar className="border-2 border-transparent hover:border-primary transition-colors">
                                    <AvatarImage
                                        src={user?.avatarUrl || ""}
                                        key={user?.avatarUrl}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                        {userName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <Button variant="ghost" size="icon" title="Logout" onClick={() => signOut()}>
                                <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Proposal Card Component
function ProposalCard({ proposal, isOwner = false }: { proposal: any; isOwner?: boolean }) {
    const modalityIcon =
        proposal.modality === "REMOTE" ? (
            <Zap className="w-4 h-4" />
        ) : (
            <MapPin className="w-4 h-4" />
        );

    const offeredSkill =
        proposal.offeredSkills?.[0]?.skill?.name ||
        proposal.offeredSkills?.[0]?.name ||
        proposal.offeredSkill?.name ||
        "No skill specified";
    const neededSkills = proposal.neededSkills || [];

    // Debug logging for missing skills (can be removed after verification)
    if (offeredSkill === "No skill specified") {
        console.log('Missing offered skill for proposal:', {
            id: proposal.id,
            title: proposal.title,
            offeredSkills: proposal.offeredSkills,
            offeredSkill: proposal.offeredSkill
        });
    }


    return (
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 dark:hover:border-primary/30 overflow-hidden">
            {/* Gradient Header */}
            <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 dark:bg-white/5"></div>
                <div className="absolute top-3 right-3">
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                    >
                        {modalityIcon}
                        <span className="text-xs">
                            {String(proposal.modality).replace("_", " ")}
                        </span>
                    </Badge>
                </div>
            </div>

            <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                        {proposal.title}
                    </h4>
                    {proposal._count && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            {proposal._count.applications || 0}
                            <CheckCircle className="w-3 h-3" />
                            {proposal._count.swaps || 0}
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {proposal.description}
                </p>

                {/* Skills Display */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <UserCircle className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Offering
                            </span>
                            <div className="mt-1">
                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                                    {offeredSkill}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <div className="flex-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Seeking
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {neededSkills.length > 0 ? (
                                    neededSkills.map((skill: any) => (
                                        <Badge
                                            key={skill.id}
                                            variant="outline"
                                            className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                                        >
                                            {skill.skill ? skill.skill.name : skill.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                        Not specified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-4 border-t flex gap-2">
                    <ProposalDetailsModal proposal={proposal} isOwner={isOwner} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/dashboard?tab=browse&q=${proposal.title}`);
                            alert("Link copied to clipboard!");
                        }}
                        title="Share Proposal"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardClientContent({
    overview,
    myProposals,
    publicOnlyProposals,
    search,
    rawModality,
    activeTab,
    swaps,
    applications,
}: any) {
    const totalProposals = myProposals.length + publicOnlyProposals.length;
    const router = useRouter();
    const { toast } = useToast();

    const handleAcceptApplication = async (appId: string) => {
        try {
            await createSwapFromApplication(appId);
            toast({ title: "Accepted!", description: "Swap started." });
            router.refresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to accept." });
        }
    };

    const handleRejectApplication = async (appId: string) => {
        try {
            await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
            toast({ title: "Rejected", description: "Application rejected." });
            router.refresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reject." });
        }
    };

    return (
        <>
            <DashboardHeader user={overview.user} />

            {/* Stats Overview */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Proposals</p>
                                    <p className="text-2xl font-bold">{totalProposals}</p>
                                </div>
                                <Layers className="w-8 h-8 text-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Swaps</p>
                                    <p className="text-2xl font-bold">{swaps?.filter((s: any) => s.status === 'ACTIVE').length || 0}</p>
                                </div>
                                <Zap className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
                                    <p className="text-2xl font-bold">{applications?.filter((a: any) => a.status === 'PENDING').length || 0}</p>
                                </div>
                                <Bell className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-card rounded-xl border p-1 shadow-sm mb-6">
                    <nav className="flex space-x-1">
                        <a
                            href={`?tab=browse${search || rawModality
                                ? `&q=${encodeURIComponent(search)}&modality=${encodeURIComponent(rawModality)}`
                                : ""
                                }`}
                            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "browse"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" />
                                <span>Browse</span>
                            </div>
                        </a>
                        <a
                            href="?tab=my-proposals"
                            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "my-proposals"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Layers className="w-4 h-4" />
                                <span>My Proposals</span>
                            </div>
                        </a>
                        <a
                            href="?tab=active-swaps"
                            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "active-swaps"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>Active Swaps</span>
                            </div>
                        </a>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "browse" && (
                    <div className="space-y-6">
                        {/* Search & Filter Bar */}
                        <Card className="border-2 shadow-lg">
                            <CardContent className="p-6">
                                <form
                                    className="flex flex-col gap-4 md:flex-row md:items-end"
                                    method="get"
                                >
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Search className="w-4 h-4" />
                                            Search Proposals
                                        </label>
                                        <Input
                                            name="q"
                                            defaultValue={search}
                                            placeholder="I want to learn..."
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 md:w-48">
                                        <label className="text-sm font-semibold text-foreground">
                                            Modality
                                        </label>
                                        <Select
                                            name="modality"
                                            defaultValue={rawModality || "ALL"}
                                        >
                                            <SelectTrigger className="h-11" suppressHydrationWarning>
                                                <SelectValue placeholder="Any modality" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">Any modality</SelectItem>
                                                <SelectItem value="REMOTE">Remote</SelectItem>
                                                <SelectItem value="IN_PERSON">In-Person</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <input type="hidden" name="tab" value="browse" />
                                    <Button type="submit" className="h-11 md:w-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Proposals Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-foreground">
                                    Discover Opportunities
                                </h3>
                                <Badge variant="secondary" className="text-sm">
                                    {publicOnlyProposals.length} available
                                </Badge>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6 items-stretch">
                                {publicOnlyProposals.map((proposal: any) => (
                                    <ProposalCard
                                        key={proposal.id}
                                        proposal={proposal}
                                    />
                                ))}
                                {publicOnlyProposals.length === 0 && (
                                    <div className="sm:col-span-2">
                                        <Card className="border-dashed">
                                            <CardContent className="p-12 text-center">
                                                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground font-medium">
                                                    No proposals match your search yet.
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Try adjusting your filters or check back later!
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "my-proposals" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">
                                    My Proposals
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage the offers you've posted to the SkillSwap marketplace
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                {myProposals.length} active
                            </Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6 items-stretch">
                            {myProposals.map((proposal: any) => (
                                <ProposalCard
                                    key={proposal.id}
                                    proposal={proposal}
                                    isOwner
                                />
                            ))}
                            {myProposals.length === 0 && (
                                <div className="sm:col-span-2">
                                    <Card className="border-dashed">
                                        <CardContent className="p-12 text-center">
                                            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <p className="text-muted-foreground font-medium">
                                                No proposals yet
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Create your first proposal to start swapping skills!
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "active-swaps" && (
                    <div className="space-y-6">
                        {/* Pending Requests Section */}
                        {applications && applications.filter((a: any) => a.status === 'PENDING').length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Pending Requests</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Review applications for your proposals
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                        {applications.filter((a: any) => a.status === 'PENDING').length} pending
                                    </Badge>
                                </div>
                                <div className="grid gap-4">
                                    {applications.filter((a: any) => a.status === 'PENDING').map((app: any) => {
                                        const applicant = app.applicant;
                                        const applicantSkills = applicant?.skills || [];

                                        return (
                                            <Card key={app.id} className="overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                                                <div className="p-6 space-y-4">
                                                    {/* Header: Proposal Title */}
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Application for</p>
                                                            <h4 className="font-bold text-lg text-foreground">"{app.proposal.title}"</h4>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 shrink-0">
                                                            Pending
                                                        </Badge>
                                                    </div>

                                                    {/* Applicant Profile Section */}
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-100 dark:border-indigo-900/30">
                                                        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                            <UserCircle className="w-4 h-4" />
                                                            Applicant Profile
                                                        </h5>

                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            {/* Avatar and Basic Info */}
                                                            <div className="flex items-start gap-3">
                                                                <Link href={`/profile/${applicant.id}`} className="group">
                                                                    <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform">
                                                                        <AvatarImage src={applicant.avatarUrl || ""} />
                                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl">
                                                                            {applicant.name?.charAt(0) || "U"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </Link>
                                                                <div className="flex-1 min-w-0">
                                                                    <Link href={`/profile/${applicant.id}`} className="hover:underline">
                                                                        <h3 className="text-lg font-bold text-foreground truncate">{applicant.name || "Unknown"}</h3>
                                                                    </Link>
                                                                    {applicant.industry && (
                                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                                                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                                                            <span className="truncate">{applicant.industry}</span>
                                                                        </div>
                                                                    )}
                                                                    {applicant.phoneNumber && (
                                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                                                            <Phone className="w-3.5 h-3.5 shrink-0" />
                                                                            <a href={`tel:${applicant.phoneNumber}`} className="hover:text-primary truncate">
                                                                                {applicant.phoneNumber}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Bio */}
                                                            {applicant.bio && (
                                                                <div className="flex-1 min-w-0">
                                                                    <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">About</h6>
                                                                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                                                                        {applicant.bio}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Applicant Skills */}
                                                        {applicantSkills.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-900/30">
                                                                <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                                    <Award className="w-3.5 h-3.5" />
                                                                    Skills
                                                                </h6>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {applicantSkills.map((userSkill: any) => (
                                                                        <Badge
                                                                            key={userSkill.id}
                                                                            variant="secondary"
                                                                            className={`text-xs ${userSkill.source === "ENDORSED"
                                                                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                                }`}
                                                                        >
                                                                            {userSkill.source === "ENDORSED" && <Award className="w-3 h-3 mr-1" />}
                                                                            {userSkill.skill?.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Pitch Message */}
                                                    <div className="bg-muted/50 p-4 rounded-lg border">
                                                        <h6 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            Pitch Message
                                                        </h6>
                                                        <p className="text-sm text-foreground italic leading-relaxed">
                                                            "{app.pitchMessage}"
                                                        </p>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleAcceptApplication(app.id)}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Application
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/30"
                                                            onClick={() => handleRejectApplication(app.id)}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Active Swaps</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Track your ongoing skill exchanges and chat with partners
                                </p>
                            </div>
                            <Badge variant="secondary">{swaps?.length || 0} active</Badge>
                        </div>

                        {swaps && swaps.length > 0 ? (
                            <div className="grid gap-4">
                                {swaps.map((swap: any) => {
                                    const isTeacher = swap.teacherId === overview.user.id;
                                    const otherUser = isTeacher ? swap.student : swap.teacher;

                                    return (
                                        <Card key={swap.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4 flex-1">
                                                <Avatar className="w-12 h-12 border">
                                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-lg">{otherUser.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {swap.proposal.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {isTeacher ? "Teaching" : "Learning"}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                            Started {new Date(swap.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <ChatModal
                                                    swapId={swap.id}
                                                    currentUserId={overview.user.id}
                                                    otherUserName={otherUser.name}
                                                />
                                                <Button variant="outline" size="sm">
                                                    Details
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground font-medium">
                                        No active swaps yet
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Accept an application or have yours accepted to start swapping!
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
