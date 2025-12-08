"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createApplication } from "@/actions/applications";
import { deleteProposal } from "@/actions/proposal-actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Send, UserCircle, GraduationCap, Zap, MapPin, ArrowRight, Phone, Briefcase, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export function ProposalDetailsModal({ proposal, isOwner }: { proposal: any, isOwner: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [pitch, setPitch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);
    const { toast } = useToast();

    const owner = proposal.owner;
    const ownerSkills = owner?.skills || [];

    const handleApply = async () => {
        if (!pitch.trim()) return;
        setLoading(true);
        try {
            await createApplication({ proposalId: proposal.id, pitchMessage: pitch });
            toast({ title: "Application Sent!", description: "Good luck!" });
            setIsOpen(false);
            setPitch("");
            setIsApplying(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send application." });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this proposal?")) return;
        setLoading(true);
        try {
            const result = await deleteProposal(proposal.id);
            if (result.success) {
                toast({ title: "Deleted", description: "Proposal deleted successfully." });
                setIsOpen(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
        } finally {
            setLoading(false);
        }
    };

    const offeredSkill = proposal.offeredSkills?.[0]?.skill?.name || proposal.offeredSkill?.name || "Skill";
    const neededSkills = proposal.neededSkills || [];
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 group/btn">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold">{proposal.title}</DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    {modalityIcon}
                                    {String(proposal.modality).replace("_", " ")}
                                </Badge>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Poster Information Section */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-100 dark:border-indigo-900/30">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                <UserCircle className="w-4 h-4" />
                                Posted By
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Avatar and Basic Info */}
                                <div className="flex items-start gap-4">
                                    <Link href={`/profile/${owner?.id}`} className="group">
                                        <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
                                            <AvatarImage src={owner?.avatarUrl || ""} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-2xl">
                                                {owner?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1">
                                        <Link href={`/profile/${owner?.id}`} className="hover:underline">
                                            <h3 className="text-xl font-bold text-foreground">{owner?.name || "Unknown"}</h3>
                                        </Link>
                                        {owner?.industry && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span>{owner.industry}</span>
                                            </div>
                                        )}
                                        {owner?.phoneNumber && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                <a href={`tel:${owner.phoneNumber}`} className="hover:text-primary">
                                                    {owner.phoneNumber}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {owner?.bio && (
                                    <div className="flex-1">
                                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About</h5>
                                        <div className="text-sm text-foreground leading-relaxed">
                                            {showFullBio || owner.bio.length <= 150 ? (
                                                <p>{owner.bio}</p>
                                            ) : (
                                                <>
                                                    <p>{owner.bio.slice(0, 150)}...</p>
                                                    <button
                                                        onClick={() => setShowFullBio(true)}
                                                        className="text-primary hover:underline text-xs mt-1 font-medium"
                                                    >
                                                        Read more
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Owner's Skills */}
                            {ownerSkills.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-900/30">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5" />
                                        Skills
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {ownerSkills.map((userSkill: any) => (
                                            <Badge
                                                key={userSkill.id}
                                                variant="secondary"
                                                className={userSkill.source === "ENDORSED"
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                }
                                            >
                                                {userSkill.source === "ENDORSED" && <Award className="w-3 h-3 mr-1" />}
                                                {userSkill.skill?.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proposal Description */}
                        <div className="prose dark:prose-invert max-w-none">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Proposal Description</h4>
                            <div className="text-foreground leading-relaxed">
                                {showFullDescription || proposal.description.length <= 300 ? (
                                    <p className="whitespace-pre-wrap">{proposal.description}</p>
                                ) : (
                                    <>
                                        <p className="whitespace-pre-wrap">{proposal.description.slice(0, 300)}...</p>
                                        <button
                                            onClick={() => setShowFullDescription(true)}
                                            className="text-primary hover:underline text-sm mt-2 font-medium"
                                        >
                                            Read more
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Skills Exchange */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-900 dark:text-green-300">Offering to Teach</span>
                                </div>
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 hover:bg-green-200">
                                    {offeredSkill}
                                </Badge>
                            </div>

                            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    <span className="font-semibold text-orange-900 dark:text-orange-300">Looking to Learn</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {neededSkills.length > 0 ? (
                                        neededSkills.map((skill: any) => (
                                            <Badge key={skill.id} variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200">
                                                {skill.skill ? skill.skill.name : skill.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Open to suggestions</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0 flex-col sm:flex-row border-t pt-4 px-6 pb-6">
                    {isOwner ? (
                        <Button variant="destructive" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Proposal
                        </Button>
                    ) : (
                        !isApplying ? (
                            <Button onClick={() => setIsApplying(true)} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                Request Swap
                            </Button>
                        ) : (
                            <div className="w-full space-y-3 bg-muted/30 p-4 rounded-lg border animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Pitch your swap</span>
                                    <Button variant="ghost" size="sm" onClick={() => setIsApplying(false)} className="h-auto p-1 text-muted-foreground">Cancel</Button>
                                </div>
                                <Textarea
                                    placeholder="Hi! I'd love to learn this. I can teach you..."
                                    value={pitch}
                                    onChange={e => setPitch(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleApply} disabled={loading || !pitch.trim()} className="w-full sm:w-auto">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Send Request
                                    </Button>
                                </div>
                            </div>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
