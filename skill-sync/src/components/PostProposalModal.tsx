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

export function PostProposalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        setTitle("");
        setDescription("");
        setOfferedSkill("");
        setNeededSkills("");
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message || "Failed." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Unexpected error." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Post Proposal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post a Proposal</DialogTitle>
          <DialogDescription>What can you teach, and what do you want to learn?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Modality</Label>
            <Select value={modality} onValueChange={(val: any) => setModality(val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="offered">Offered Skill</Label>
            <Input id="offered" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} placeholder="e.g. React" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="needed">Needed Skills (comma separated)</Label>
            <Input id="needed" value={neededSkills} onChange={(e) => setNeededSkills(e.target.value)} placeholder="e.g. Design, Piano" required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}