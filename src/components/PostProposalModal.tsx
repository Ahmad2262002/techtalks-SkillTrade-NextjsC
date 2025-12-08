"use client";

import React, { useState, useEffect } from "react";
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
import { getCurrentUserProfile } from "@/actions/profile";

export function PostProposalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState<"Remote" | "In-Person">("Remote");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [neededSkills, setNeededSkills] = useState("");
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [isCustomSkill, setIsCustomSkill] = useState(false);

  // Fetch user skills when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        try {
          const profile = await getCurrentUserProfile();
          if (profile?.skills) {
            setMySkills(profile.skills.map((s: any) => s.skill));
          }
        } catch (error) {
          console.error("Failed to fetch skills", error);
        }
      };
      fetchSkills();
    }
  }, [isOpen]);

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
        toast({
          title: "Success!",
          description: result.message,
        });
        setIsOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setModality("Remote");
        setOfferedSkill("");
        setNeededSkills("");
        setIsCustomSkill(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Something went wrong.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Post a Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create a Proposal
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Share what you can teach and what you want to learn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Teaching Python for Spanish"
              required
              minLength={5}
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Describe your offer in detail..."
              required
              minLength={20}
              maxLength={500}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modality" className="text-right font-medium">
              Modality
            </Label>
            <Select
              onValueChange={(value: "Remote" | "In-Person") =>
                setModality(value)
              }
              defaultValue={modality}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select modality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offeredSkill" className="text-right font-medium">
              Offered Skill
            </Label>
            <div className="col-span-3 space-y-2">
              {!isCustomSkill ? (
                <Select
                  value={offeredSkill}
                  onValueChange={(val) => {
                    if (val === "custom_option") {
                      setIsCustomSkill(true);
                      setOfferedSkill("");
                    } else {
                      setOfferedSkill(val);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill you have" />
                  </SelectTrigger>
                  <SelectContent>
                    {mySkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.name}>
                        {skill.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom_option" className="font-semibold text-primary">
                      + Add a different skill
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="offeredSkill"
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    placeholder="e.g. React"
                    required
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCustomSkill(false)}
                    title="Back to list"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="neededSkills" className="text-right font-medium">
              Needed Skills
            </Label>
            <Input
              id="neededSkills"
              value={neededSkills}
              onChange={(e) => setNeededSkills(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Piano, French (comma separated)"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}