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
import { ReputationBadge } from "@/components/ReputationBadge";
import Link from "next/link";
import { Loader2, Trash2, Send, Zap, MapPin, UserCircle } from "lucide-react";

export function ProposalDetailsModal({
    proposal,
    isOwner,
    isOpen,
    onOpenChange
}: {
    proposal: any,
    isOwner: boolean,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [isApplying, setIsApplying] = useState(false);
    const [pitch, setPitch] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleApply = async () => {
        if (!pitch.trim()) return;
        setLoading(true);
        try {
            await createApplication({ proposalId: proposal.id, pitchMessage: pitch });
            toast({ title: "Application Sent!", description: "Good luck!" });
            onOpenChange(false);
            setPitch("");
            setIsApplying(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send application." });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return;
        setLoading(true);
        try {
            const result = await deleteProposal(proposal.id);
            if (result.success) {
                toast({ title: "Deleted", description: "Proposal deleted." });
                onOpenChange(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
        } finally {
            setLoading(false);
        }
    };

    const offeredSkill = proposal.offeredSkills?.[0]?.skill?.name || "Skill";
    const neededSkills = proposal.neededSkills || [];
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 rounded-xl font-bold hover:bg-primary/5 hover:text-primary transition-all">
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <div className="bg-gradient-to-br from-primary/20 via-background to-background p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                {modalityIcon}
                            </div>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none uppercase tracking-widest text-[10px] font-black">
                                {String(proposal.modality).replace("_", " ")}
                            </Badge>
                        </div>
                        <DialogTitle className="text-3xl font-black text-foreground leading-tight">{proposal.title}</DialogTitle>
                        {proposal.owner && (
                            <div className="flex items-center gap-3 mt-4">
                                <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 transition-colors group">
                                    Posted by <span className="text-primary font-black uppercase tracking-tighter hover:underline cursor-pointer">{proposal.owner.name}</span>
                                </p>
                                {proposal.owner.reputation && <ReputationBadge reputation={proposal.owner.reputation} size="sm" />}
                            </div>
                        )}
                    </DialogHeader>

                    <div className="space-y-8">
                        <div className="relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full" />
                            <p className="pl-6 text-muted-foreground text-lg leading-relaxed font-medium">
                                {proposal.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-6 rounded-3xl border border-border/50">
                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Skill Offered
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-xl text-sm font-bold">
                                        {offeredSkill}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Skills Sought
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {neededSkills.map((s: any) => (
                                        <Badge key={s.id} variant="secondary" className="bg-orange-500/10 text-orange-600 border-none px-4 py-2 rounded-xl text-sm font-bold">
                                            {s.skill?.name || s.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-8">
                            {isOwner ? (
                                <div className="flex items-center justify-between w-full p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
                                    <p className="text-sm font-bold text-destructive/80 italic">You are the owner of this proposal.</p>
                                    <Button variant="destructive" onClick={handleDelete} disabled={loading} className="rounded-xl font-black px-6 hover:scale-105 active:scale-95 transition-all">
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                        Delete Proposal
                                    </Button>
                                </div>
                            ) : (
                                !isApplying ? (
                                    <div className="flex flex-col gap-4 w-full">
                                        <Link href={`/profile/${proposal.ownerId}`} className="w-full">
                                            <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all gap-2">
                                                <UserCircle className="w-5 h-5" />
                                                View Poster Profile
                                            </Button>
                                        </Link>
                                        <Button onClick={() => setIsApplying(true)} className="w-full h-16 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
                                            <Zap className="w-6 h-6" />
                                            Request This Swap
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-4 animate-fade-in">
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Introduce yourself and explain why this swap is a great match..."
                                                value={pitch}
                                                onChange={e => setPitch(e.target.value)}
                                                className="min-h-[120px] rounded-2xl border-2 border-primary/20 focus:border-primary transition-all p-4 text-base font-medium"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" onClick={() => setIsApplying(false)} className="h-14 px-8 rounded-xl font-bold">
                                                Cancel
                                            </Button>
                                            <Button onClick={handleApply} disabled={loading} className="flex-1 h-14 rounded-xl font-black text-lg gap-2">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                                Send Request
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
