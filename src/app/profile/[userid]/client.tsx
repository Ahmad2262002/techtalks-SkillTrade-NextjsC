"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import {
  ArrowLeft, Settings, Star, CheckCircle, Award, Briefcase, Phone,
  Upload, Loader2, Plus, X, AlertTriangle, MessageSquare, Zap, Trophy, Shield, Medal
} from "lucide-react";

// UI & Action Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReputationBadge } from "@/components/ReputationBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser, removeManualSkillFromCurrentUser } from "@/actions/skills";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { findActiveSwapBetweenUsers } from "@/actions/swaps";
import { ChatModal } from "@/components/ChatModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+961", country: "�� Lebanon" },
  { code: "+1", country: "�� USA/Canada" },
  { code: "+44", country: "�� United Kingdom" },
  { code: "+91", country: "�� India" },
  { code: "+971", country: "�🇪 UAE" },
  { code: "+20", country: "�� Egypt" },
  { code: "+33", country: "�� France" },
  { code: "+49", country: "�� Germany" },
  { code: "+61", country: "�� Australia" },
  { code: "+81", country: "�� Japan" },
  { code: "+86", country: "�� China" },
  { code: "+55", country: "�� Brazil" },
  { code: "+34", country: "🇪🇸 Spain" },
  { code: "+39", country: "🇮🇹 Italy" },
  { code: "+52", country: "🇲🇽 Mexico" },
  { code: "+62", country: "🇮🇩 Indonesia" },
  { code: "+63", country: "🇵🇭 Philippines" },
  { code: "+66", country: "🇹🇭 Thailand" },
  { code: "+84", country: "🇻🇳 Vietnam" },
  { code: "+27", country: "🇿🇦 South Africa" },
];

// --- Type Definitions ---
interface ProfileData {
  id: string; name: string; industry: string; bio: string; avatarUrl: string | null; phoneNumber: string | null;
  skills: Array<{ id: string; name: string; source: string; isVisible: boolean; }>;
  reputation: {
    level: number;
    title: string;
    reputationPoints: number;
    color: string;
    averageRating: number;
    completedSwaps: number;
    totalEndorsements: number;
  };
}

interface ProfileClientContentProps {
  profileData: ProfileData; isOwnProfile: boolean; useMockData: boolean; currentUserId: string | null;
}

// --- Main Client Component ---
export default function ProfileClientContent({ profileData, isOwnProfile, useMockData, currentUserId }: ProfileClientContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'skills'>('about');

  const [formData, setFormData] = useState({
    name: profileData.name || "", industry: profileData.industry || "", bio: profileData.bio || "",
    avatarUrl: profileData.avatarUrl || "", phoneNumber: profileData.phoneNumber || "",
  });

  const [mutualSwapId, setMutualSwapId] = useState<string | null>(null);

  useEffect(() => {
    const findMutualSwap = async () => {
      if (!isOwnProfile && profileData.id) {
        const swap = await findActiveSwapBetweenUsers(profileData.id);
        if (swap) setMutualSwapId(swap.id);
      }
    };
    findMutualSwap();
  }, [isOwnProfile, profileData.id]);

  const handleSave = useCallback(async () => {
    await upsertProfile(formData);
    setEditMode(false);
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
    router.refresh();
  }, [formData, router, toast]);

  const handleCancel = useCallback(() => {
    setFormData({
      name: profileData.name || "", industry: profileData.industry || "", bio: profileData.bio || "",
      avatarUrl: profileData.avatarUrl || "", phoneNumber: profileData.phoneNumber || "",
    });
    setEditMode(false);
  }, [profileData]);

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <div className={cn(styles.profileLayout, "max-w-6xl mx-auto px-6 py-12")}>
        <ProfileHeader
          isOwnProfile={isOwnProfile}
          editMode={editMode}
          onEditToggle={() => setEditMode(true)}
        />

        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          <div className="lg:w-[350px] shrink-0">
            {useMockData && <MockDataWarning />}
            <ProfileSidebar
              profileData={profileData} formData={formData} setFormData={setFormData}
              editMode={editMode} isOwnProfile={isOwnProfile}
              currentUserId={currentUserId} mutualSwapId={mutualSwapId}
            />
          </div>

          <div className="flex-1">
            <ProfileMainContent
              profileData={profileData} formData={formData} setFormData={setFormData}
              editMode={editMode} activeTab={activeTab} setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </div>

      {editMode && <EditModeActions onSave={handleSave} onCancel={handleCancel} />}
    </div>
  );
}

// --- Sub-Components ---

function ProfileSidebar({ profileData, formData, setFormData, editMode, isOwnProfile, currentUserId, mutualSwapId }: {
  profileData: ProfileData, formData: any, setFormData: Function, editMode: boolean,
  isOwnProfile: boolean, currentUserId: string | null, mutualSwapId: string | null
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = getSupabaseBrowserClient();
    const filePath = `${profileData.id}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage.from("avatars").upload(filePath, file);

    if (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setFormData((prev: any) => ({ ...prev, avatarUrl: data.publicUrl }));
    }
    setIsUploading(false);
  };

  const nextLevelExp = profileData.reputation.level === 5 ? profileData.reputation.reputationPoints :
    profileData.reputation.level === 4 ? 1000 :
      profileData.reputation.level === 3 ? 400 :
        profileData.reputation.level === 2 ? 150 : 50;

  const progressPercent = Math.min(100, (profileData.reputation.reputationPoints / nextLevelExp) * 100);

  return (
    <aside className={cn(styles.sidebar, "shadow-2xl shadow-primary/5")}>
      <div className={styles.avatarWrapper}>
        <Avatar className="h-40 w-40 border-8 border-card shadow-xl group cursor-pointer overflow-hidden">
          <AvatarImage src={formData.avatarUrl || ""} className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary">{formData.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        {editMode && (
          <label className={cn(styles.avatarUploadButton, "hover:scale-110 active:scale-95 shadow-primary/20")}>
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center">
        {editMode ? (
          <div className="space-y-3 w-full">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Full Name</p>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your Name" className="text-center text-xl font-bold rounded-xl border-2" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Industry</p>
              <Input value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} placeholder="Industry / Title" className="text-center rounded-xl border-2" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Phone Number</p>
              <div className="flex gap-2">
                <Select
                  value={(() => {
                    const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                    return matched ? matched.code : "+1";
                  })()}
                  onValueChange={(code) => {
                    const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                    const currentNum = matched ? formData.phoneNumber!.slice(matched.code.length) : formData.phoneNumber;
                    setFormData({ ...formData, phoneNumber: code + (currentNum || "") });
                  }}
                >
                  <SelectTrigger className="w-[110px] h-12 rounded-xl border-2 font-black bg-background shrink-0">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border shadow-2xl">
                    {COUNTRY_CODES.map(c => (
                      <SelectItem key={c.code} value={c.code} className="font-bold cursor-pointer">
                        {c.country} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={(() => {
                    const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                    return matched ? formData.phoneNumber!.slice(matched.code.length) : formData.phoneNumber;
                  })() || ''}
                  onChange={e => {
                    const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                    const code = matched ? matched.code : "+1";
                    setFormData({ ...formData, phoneNumber: code + e.target.value });
                  }}
                  placeholder="Number"
                  className="flex-1 h-12 rounded-xl border-2 font-bold bg-background"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className={cn(styles.userName, "text-3xl font-black text-foreground")}>{profileData.name}</h1>
            <p className={cn(styles.userIndustry, "font-bold text-muted-foreground mb-4")}>
              <Briefcase className="w-4 h-4 text-primary" />
              {profileData.industry || "General Expert"}
            </p>
            <ReputationBadge reputation={profileData.reputation} size="md" />
            {profileData.phoneNumber && (
              <div className="mt-4 px-4 py-2 bg-muted/50 rounded-full border border-border flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Phone className="w-3 h-3 text-primary" />
                {profileData.phoneNumber}
              </div>
            )}
          </>
        )}
      </div>

      <div className={cn(styles.statsGrid, "grid grid-cols-3 gap-2 w-full mt-8 p-6 bg-muted/30 rounded-[2rem] border border-border/50")}>
        <StatItem value={profileData.reputation.completedSwaps} label="Swaps" />
        <StatItem value={profileData.reputation.averageRating > 0 ? profileData.reputation.averageRating.toFixed(1) : "—"} label="Rating" />
        <StatItem value={profileData.reputation.totalEndorsements} label="Kudos" />
      </div>

      <div className="w-full mt-6 space-y-3 px-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progression</span>
            <span className="text-sm font-black text-foreground">{profileData.reputation.reputationPoints} XP</span>
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-70">
            Next Level: {profileData.reputation.level === 5 ? "MAX" : `${nextLevelExp} XP`}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
          <div
            className={cn("h-full transition-all duration-1000 ease-out bg-gradient-to-r",
              profileData.reputation.level === 5 ? "from-amber-400 to-amber-600" :
                profileData.reputation.level === 4 ? "from-purple-400 to-purple-600" :
                  profileData.reputation.level === 3 ? "from-sky-400 to-sky-600" :
                    profileData.reputation.level === 2 ? "from-emerald-400 to-emerald-600" : "from-slate-400 to-slate-600"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!isOwnProfile && currentUserId && mutualSwapId && (
        <div className="mt-8 w-full">
          <ChatModal
            swapId={mutualSwapId}
            currentUserId={currentUserId}
            otherUserName={profileData.name}
            triggerClassName="w-full h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          />
        </div>
      )}
    </aside>
  );
}


// --- Other Unchanged Sub-Components ---
function ProfileHeader({ isOwnProfile, editMode, onEditToggle }: { isOwnProfile: boolean, editMode: boolean, onEditToggle: () => void }) {
  const router = useRouter();
  return (
    <header className="flex justify-between items-center w-full">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="rounded-xl font-bold hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Dashboard
      </Button>
      <div className="flex items-center gap-3">
        <ThemeCustomizer />
        {isOwnProfile && !editMode && (
          <Button onClick={onEditToggle} className="rounded-xl font-black px-6 shadow-lg hover:shadow-primary/20 transition-all bg-foreground text-background hover:bg-foreground/90">
            <Settings className="w-5 h-5 mr-2" /> Edit Profile
          </Button>
        )}
      </div>
    </header>
  );
}

function MockDataWarning() {
  return (
    <div className="mb-8 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-6 text-amber-500 flex items-start gap-4 animate-pulse">
      <AlertTriangle className="w-8 h-8 shrink-0" />
      <div className="text-sm">
        <p className="font-black uppercase tracking-widest text-xs mb-1">Developer Notice</p>
        <p className="font-bold leading-relaxed">This profile is currently using placeholder data because the specific record wasn't found in our database.</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string | number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-black text-foreground tabular-nums leading-none tracking-tight">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{label}</span>
    </div>
  );
}

function Milestone({ icon, label, active, color }: { icon: React.ReactNode, label: string, active: boolean, color: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-500",
      active
        ? cn("bg-card border-border/50 shadow-xl shadow-black/5 opacity-100", color)
        : "bg-muted/10 border-transparent opacity-20 grayscale"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500",
        active && "scale-110 rotate-3"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
      {active && <div className="mt-2 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
    </div>
  );
}

function ProfileMainContent({ profileData, formData, setFormData, editMode, activeTab, setActiveTab }: any) {
  return (
    <div className="bg-card/50 backdrop-blur-xl rounded-[3rem] p-10 border border-border shadow-2xl shadow-primary/5 h-full">
      <nav className="flex gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50 mb-10 w-fit">
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            "px-8 py-3 rounded-xl font-black text-sm transition-all",
            activeTab === 'about' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={cn(
            "px-8 py-3 rounded-xl font-black text-sm transition-all",
            activeTab === 'skills' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Skills & Endorsements
        </button>
      </nav>

      <div className="animate-fade-in">
        {activeTab === 'about' && (
          <div className="space-y-12">
            <AboutTab bio={formData.bio} setFormData={setFormData} editMode={editMode} defaultBio={profileData.bio} />

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h2 className="text-2xl font-black text-foreground">Milestones</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Milestone
                  icon={<Zap className="w-5 h-5" />}
                  label="Fast Responder"
                  active={profileData.reputation.completedSwaps > 0}
                  color="text-primary"
                />
                <Milestone
                  icon={<Trophy className="w-5 h-5" />}
                  label="Skill Master"
                  active={profileData.reputation.level >= 3}
                  color="text-primary"
                />
                <Milestone
                  icon={<CheckCircle className="w-5 h-5" />}
                  label="Certified Trusted"
                  active={profileData.reputation.averageRating >= 4.5}
                  color="text-primary"
                />
              </div>
            </section>
          </div>
        )}
        {activeTab === 'skills' && (
          <SkillsTab skills={profileData.skills} editMode={editMode} />
        )}
      </div>
    </div>
  );
}

function AboutTab({ bio, setFormData, editMode, defaultBio }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-primary rounded-full" />
        <h2 className="text-2xl font-black text-foreground">Background</h2>
      </div>
      {editMode ? (
        <Textarea
          value={bio}
          onChange={e => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell everyone about yourself, your skills, and what you're looking to learn..."
          rows={10}
          className="rounded-2xl border-2 border-border focus:border-primary transition-all p-6 text-lg font-medium leading-relaxed bg-background/50"
        />
      ) : (
        <div className="relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-muted rounded-full" />
          <p className="pl-8 text-xl leading-relaxed text-muted-foreground font-medium grayscale hover:grayscale-0 transition-all duration-700">
            {defaultBio || "This user hasn't written a biography yet. Knowledge exchange is better when you know who you're trading with!"}
          </p>
        </div>
      )}
    </div>
  );
}

function SkillsTab({ skills, editMode }: { skills: ProfileData['skills'], editMode: boolean }) {
  const router = useRouter();
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const visibleSkills = skills.filter(s => s.isVisible);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    setIsAddingSkill(true);
    await addSkillToCurrentUser({ name: newSkill.trim() });
    setNewSkill("");
    setIsAddingSkill(false);
    router.refresh();
  };

  const handleRemoveSkill = async (id: string) => {
    await removeManualSkillFromCurrentUser(id);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-black text-foreground">Expertise</h2>
        </div>
        {editMode && (
          <div className="flex items-center gap-2 bg-background border-2 border-border p-1.5 rounded-2xl shadow-sm group-focus-within:border-primary transition-all">
            <Input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
              placeholder="New skill..."
              className="border-none focus-visible:ring-0 font-bold w-[200px]"
            />
            <Button size="sm" onClick={handleAddSkill} disabled={isAddingSkill} className="rounded-xl h-10 w-10 p-0 shadow-lg shadow-primary/10">
              {isAddingSkill ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {visibleSkills.length === 0 ? (
          <p className="text-muted-foreground font-medium italic">No skills listed yet.</p>
        ) : visibleSkills.map(skill => (
          <div key={skill.id} className={cn(
            "group relative flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-all border-2 overflow-hidden",
            skill.source === 'ENDORSED'
              ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
              : "bg-background border-border text-foreground hover:border-primary/50"
          )}>
            {/* Background Glow for Endorsed Skills */}
            {skill.source === 'ENDORSED' && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent animate-shimmer pointer-events-none" />
            )}

            {skill.source === 'ENDORSED' && <Award size={18} className="fill-current animate-pulse shrink-0" />}
            <span className="relative z-10">{skill.name}</span>

            {editMode && skill.source !== 'ENDORSED' && (
              <button onClick={() => handleRemoveSkill(skill.id)} className="relative z-10 ml-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white p-1.5 transition-all">
                <X size={14} />
              </button>
            )}

            {skill.source === 'ENDORSED' && (
              <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-white text-[10px] font-black shadow-md">
                +1
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditModeActions({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-foreground p-3 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-background/10 backdrop-blur-xl animate-float">
      <Button variant="ghost" onClick={onCancel} className="h-14 px-8 rounded-2xl font-black text-background hover:bg-background/20 hover:text-background transition-all">
        Discard Changes
      </Button>
      <Button onClick={onSave} className="h-14 px-10 rounded-2xl font-black text-foreground bg-background hover:bg-primary hover:text-white transition-all shadow-xl">
        Confirm & Save
      </Button>
    </div>
  );
}