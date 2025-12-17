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
import { Loader2, Trash2, Send, Zap, MapPin } from "lucide-react";

export function ProposalDetailsModal({ proposal, isOwner }: { proposal: any, isOwner: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
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
        if (!confirm("Are you sure?")) return;
        setLoading(true);
        try {
            const result = await deleteProposal(proposal.id);
            if (result.success) {
                toast({ title: "Deleted", description: "Proposal deleted." });
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

    const offeredSkill = proposal.offeredSkills?.[0]?.skill?.name || "Skill";
    const neededSkills = proposal.neededSkills || [];
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">Details</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{proposal.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        {modalityIcon} {String(proposal.modality).replace("_", " ")}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
                    
                    <div className="flex justify-between text-sm">
                        <div>
                            <span className="font-semibold block text-green-600">Offering:</span>
                            <Badge variant="secondary">{offeredSkill}</Badge>
                        </div>
                        <div className="text-right">
                            <span className="font-semibold block text-orange-600">Seeking:</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {neededSkills.map((s: any) => (
                                    <Badge key={s.id} variant="outline">{s.skill?.name || s.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {isOwner ? (
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete
                        </Button>
                    ) : (
                        !isApplying ? (
                            <Button onClick={() => setIsApplying(true)}>Request Swap</Button>
                        ) : (
                            <div className="w-full space-y-2">
                                <Textarea 
                                    placeholder="Why are you a good match?" 
                                    value={pitch} 
                                    onChange={e => setPitch(e.target.value)} 
                                />
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsApplying(false)}>Cancel</Button>
                                    <Button onClick={handleApply} disabled={loading}>
                                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Send
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