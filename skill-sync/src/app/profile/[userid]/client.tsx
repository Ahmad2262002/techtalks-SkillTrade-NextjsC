"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import {
  ArrowLeft, Settings, Star, CheckCircle, Award, Briefcase, Phone,
  Upload, Loader2, Plus, X, AlertTriangle, MessageSquare
} from "lucide-react";

// UI & Action Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser, removeManualSkillFromCurrentUser } from "@/actions/skills";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { findActiveSwapBetweenUsers } from "@/actions/swaps";
import { ChatModal } from "@/components/ChatModal";

// --- Type Definitions ---
interface ProfileData {
  id: string; name: string; industry: string; bio: string; avatarUrl: string | null; phoneNumber: string | null;
  skills: Array<{ id: string; name: string; source: string; isVisible: boolean; }>;
  reputation: { averageRating: number; completedSwaps: number; totalEndorsements: number; };
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
    <div className="min-h-screen">
      <div className={styles.profileLayout}>
        <ProfileHeader
          isOwnProfile={isOwnProfile}
          editMode={editMode}
          onEditToggle={() => setEditMode(true)}
        />

        {useMockData && <MockDataWarning />}

        <ProfileSidebar
          profileData={profileData} formData={formData} setFormData={setFormData}
          editMode={editMode} isOwnProfile={isOwnProfile}
          currentUserId={currentUserId} mutualSwapId={mutualSwapId}
        />

        <ProfileMainContent
          profileData={profileData} formData={formData} setFormData={setFormData}
          editMode={editMode} activeTab={activeTab} setActiveTab={setActiveTab}
        />
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.avatarWrapper}>
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={formData.avatarUrl || ""} className="object-cover" />
          <AvatarFallback className="text-3xl font-bold">{formData.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        {editMode && (
          <label className={styles.avatarUploadButton}>
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5" />}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        )}
      </div>
      
      {editMode ? (
        <div className="space-y-2">
          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" className="text-center text-xl font-bold"/>
          <Input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="Industry / Title" className="text-center" />
        </div>
      ) : (
        <>
          <h1 className={styles.userName}>{profileData.name}</h1>
          <p className={styles.userIndustry}><Briefcase size={16} />{profileData.industry || "No industry listed"}</p>
        </>
      )}

      <div className={styles.statsGrid}>
        <StatItem value={profileData.reputation.completedSwaps} label="Swaps" />
        <StatItem value={profileData.reputation.averageRating || "-"} label="Rating" />
        <StatItem value={profileData.reputation.totalEndorsements} label="Endorsed" />
      </div>

      {/* --- CHAT BUTTON LOGIC --- */}
      {!isOwnProfile && currentUserId && mutualSwapId && (
        <div className="mt-4 mb-4 w-full">
          <ChatModal
            swapId={mutualSwapId}
            currentUserId={currentUserId}
            otherUserName={profileData.name}
            triggerClassName="w-full"
          />
        </div>
      )}
      
      {editMode ? (
        <Input value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="Phone Number" />
      ) : profileData.phoneNumber && (
        <p className={styles.contactInfo}><Phone size={14} />{profileData.phoneNumber}</p>
      )}
    </aside>
  );
}


// --- Other Unchanged Sub-Components ---
function ProfileHeader({ isOwnProfile, editMode, onEditToggle }: { isOwnProfile: boolean, editMode: boolean, onEditToggle: () => void }) {
  const router = useRouter();
  return (
    <header className={styles.header}>
      <Button variant="ghost" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        {isOwnProfile && !editMode && (
          <Button onClick={onEditToggle}>
            <Settings className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>
    </header>
  );
}

function MockDataWarning() {
  return (
    <div className="col-span-full mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5" />
      <div className="text-sm">
        <p className="font-semibold">Profile Data Unavailable</p>
        <p className="opacity-80">Could not load real profile data. You are viewing a placeholder.</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string | number, label: string }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function ProfileMainContent({ profileData, formData, setFormData, editMode, activeTab, setActiveTab }: any) {
  return (
    <div className={styles.mainContent}>
      <nav className={styles.tabNav}>
        <button onClick={() => setActiveTab('about')} className={cn(styles.tabButton, activeTab === 'about' && styles.active)}>About</button>
        <button onClick={() => setActiveTab('skills')} className={cn(styles.tabButton, activeTab === 'skills' && styles.active)}>Skills</button>
      </nav>
      
      {activeTab === 'about' && (
        <AboutTab bio={formData.bio} setFormData={setFormData} editMode={editMode} defaultBio={profileData.bio} />
      )}
      {activeTab === 'skills' && (
        <SkillsTab skills={profileData.skills} editMode={editMode} />
      )}
    </div>
  );
}

function AboutTab({ bio, setFormData, editMode, defaultBio }: any) {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.sectionTitle}>About</h2>
      {editMode ? (
        <Textarea value={bio} onChange={e => setFormData((prev: any) => ({...prev, bio: e.target.value}))} placeholder="Tell everyone about yourself..." rows={8} />
      ) : (
        <p className={styles.bioText}>{defaultBio || "No bio has been added yet."}</p>
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
    <div className={styles.tabContent}>
      <h2 className={styles.sectionTitle}>Skills</h2>
      <div className={styles.skillsContainer}>
        {visibleSkills.map(skill => (
          <div key={skill.id} className={cn(styles.skillTag, skill.source === 'ENDORSED' && styles.endorsed)}>
            {skill.source === 'ENDORSED' && <Award size={16} />}
            <span>{skill.name}</span>
            {editMode && skill.source !== 'ENDORSED' && (
              <button onClick={() => handleRemoveSkill(skill.id)} className="ml-2 rounded-full hover:bg-destructive/20 p-1">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <div className="flex items-center gap-2">
            <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} placeholder="Add new skill..." />
            <Button size="icon" onClick={handleAddSkill} disabled={isAddingSkill}>
              {isAddingSkill ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EditModeActions({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) {
  return (
    <div className={styles.editActions}>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave}>Save Changes</Button>
    </div>
  );
}