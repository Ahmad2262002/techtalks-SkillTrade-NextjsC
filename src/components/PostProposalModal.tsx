"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createProposal } from "@/actions/proposal-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function PostProposalModal({
  triggerClassName,
  buttonText = "Post a Proposal"
}: {
  triggerClassName?: string,
  buttonText?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState<"Remote" | "In-Person">("Remote");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [neededSkills, setNeededSkills] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = {
      title,
      description,
      modality,
      offeredSkillName: offeredSkill,
      neededSkillNames: neededSkills,
    };

    try {
      const result = await createProposal(dataToSend);

      if (result.success) {
        toast({ title: "Success!", description: result.message });
        setIsOpen(false);
        // Clear form
        setTitle("");
        setDescription("");
        setOfferedSkill("");
        setNeededSkills("");
        router.refresh(); // Refresh server components
      } else {
        const errorMsg = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        toast({ variant: "destructive", title: "Error", description: errorMsg || "Failed to post proposal." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn(
          "flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-6 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95",
          triggerClassName
        )}>
          <Plus className="w-6 h-6" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 to-background p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-foreground">Create Proposal</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">Share your expertise and find someone to learn from.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-primary">Proposal Title</Label>
                <span className={cn("text-[10px] font-bold", title.length < 10 ? "text-rose-500" : "text-emerald-500")}>
                  {title.length}/80
                </span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder="e.g., Master Classical Piano"
                className="h-12 rounded-xl border-2 border-border focus:border-primary transition-all font-bold px-4"
                required
              />
              {title.length > 0 && title.length < 10 && (
                <p className="text-[10px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-left-2">Title must be at least 10 characters.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-primary">Description</Label>
                <span className={cn("text-[10px] font-bold", description.length < 30 ? "text-rose-500" : "text-emerald-500")}>
                  {description.length}/500
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Tell us about what you can teach and what you are looking for..."
                className="min-h-[100px] rounded-xl border-2 border-border focus:border-primary transition-all font-medium p-4"
                required
              />
              {description.length > 0 && description.length < 30 && (
                <p className="text-[10px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-left-2">Give a bit more detail (min 30 chars).</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Modality</Label>
                <Select value={modality} onValueChange={(val: any) => setModality(val)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 border-border font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-border">
                    <SelectItem value="Remote" className="font-bold">Remote</SelectItem>
                    <SelectItem value="In-Person" className="font-bold">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offered" className="text-xs font-black uppercase tracking-widest text-emerald-500 ml-1">Skill You Teach</Label>
                <Input
                  id="offered"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  placeholder="e.g. Piano"
                  className="h-12 rounded-xl border-2 border-emerald-500/20 focus:border-emerald-500 transition-all font-bold px-4"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needed" className="text-xs font-black uppercase tracking-widest text-orange-500 ml-1">Skills You Seek (comma separated)</Label>
              <Input
                id="needed"
                value={neededSkills}
                onChange={(e) => setNeededSkills(e.target.value)}
                placeholder="e.g. Cooking, French"
                className="h-12 rounded-xl border-2 border-orange-500/20 focus:border-orange-500 transition-all font-bold px-4"
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isLoading || title.length < 10 || description.length < 30}
                className="w-full h-16 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Plus className="mr-2 h-6 w-6" />}
                Publish Proposal
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
