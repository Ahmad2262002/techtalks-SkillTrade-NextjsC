"use client";

import { useState, useEffect } from "react";
import styles from "./ProposalModal.module.css";
import { createProposal } from "@/actions/proposal-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProposalModal({ isOpen, onClose, onSuccess }: ProposalModalProps) {
  const [title, setTitle] = useState("");
  const [modality, setModality] = useState("");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [neededSkill, setNeededSkill] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setModality("");
      setOfferedSkill("");
      setNeededSkill("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Basic Client-Side Validation
    if (!title || !modality || !offeredSkill || !neededSkill) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    // Map UI fields to Server Action format
    // Note: We construct a description automatically for compatibility with the backend schema
    const formData = {
      title,
      description: `Offering: ${offeredSkill}\nSeeking: ${neededSkill}\n\nLet's swap!`,
      modality: modality as "Remote" | "In-Person",
      offeredSkillName: offeredSkill,
      neededSkillNames: neededSkill,
    };

    try {
      const result = await createProposal(formData);
      
      if (result.success) {
        if (onSuccess) onSuccess();
        onClose();
        router.refresh();
      } else {
        // 2. Enhanced Error Handling
        if (result.errors) {
          // If Zod returns specific field errors, join them into a readable message
          const fieldErrors = Object.values(result.errors).flat();
          setError(fieldErrors.join(" "));
        } else {
          // Fallback to generic message
          setError(result.message || "Something went wrong.");
        }
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <div className={styles.glow} aria-hidden="true" />
        
        <div className={styles.cardInner}>
          <header className="flex items-start justify-between gap-4 border-b border-slate-700/40 px-6 pb-4 pt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.21em] text-sky-300/80">New skill trade</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-50">Post a proposal</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              &times;
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
            <div className="space-y-3">
              {/* Title Input */}
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Proposal Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 focus:border-sky-400 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Teach React for Guitar Lessons"
                />
              </div>

              {/* Modality & Needed Skill Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Modality</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 focus:border-sky-400 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select...</option>
                    <option value="Remote">Remote</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Needed Skill</label>
                  <input
                    value={neededSkill}
                    onChange={(e) => setNeededSkill(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 focus:border-sky-400 outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Piano"
                  />
                </div>
              </div>

              {/* Offered Skill (Textarea for detail) */}
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Offered Skill / Details</label>
                <textarea
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 focus:border-sky-400 outline-none resize-none transition-all placeholder:text-slate-600"
                  placeholder="Describe exactly what you can teach..."
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-500/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-2 text-xs font-bold text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Posting...
                  </span>
                ) : (
                  "Post Proposal"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}