"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Star,
  CheckCircle,
  Award,
  Trash2,
  Zap,
  Phone,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Loader2,
  Briefcase,
  AlertTriangle
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser, removeManualSkillFromCurrentUser } from "@/actions/skills";
import { countries } from "@/lib/countries";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// --- Types ---
interface ProfileData {
  id: string;
  name: string;
  industry: string;
  bio: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  skills: Array<{
    id: string;
    name: string;
    source: string;
    isVisible: boolean;
  }>;
  reputation: {
    averageRating: number;
    completedSwaps: number;
    totalEndorsements: number;
  };
}

interface ProfileClientContentProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  useMockData: boolean;
}

export default function ProfileClientContent({
  profileData,
  isOwnProfile,
  useMockData,
}: ProfileClientContentProps) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: profileData.name || "",
    industry: profileData.industry || "",
    bio: profileData.bio || "",
    avatarUrl: profileData.avatarUrl || "",
    phoneNumber: profileData.phoneNumber || "",
  });

  const [countryCode, setCountryCode] = useState("+1");
  const [localNumber, setLocalNumber] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Phone
  React.useEffect(() => {
    if (profileData.phoneNumber) {
      const sortedCountries = [...countries].sort((a, b) => b.dial_code.length - a.dial_code.length);
      const country = sortedCountries.find(c => profileData.phoneNumber?.startsWith(c.dial_code));
      if (country) {
        setCountryCode(country.dial_code);
        setLocalNumber(profileData.phoneNumber.slice(country.dial_code.length).trim());
      } else {
        setLocalNumber(profileData.phoneNumber);
      }
    }
  }, [profileData.phoneNumber]);

  // Skill Filters
  const visibleSkills = profileData.skills.filter(s => s.isVisible !== false);
  const endorsedSkills = visibleSkills.filter(s => s.source === "ENDORSED");
  const manualSkills = visibleSkills.filter(s => s.source !== "ENDORSED");

  // Actions
  const handleSave = async () => {
    await upsertProfile({
      ...formData,
      phoneNumber: localNumber ? `${countryCode}${localNumber}` : null,
    });
    setEditMode(false);
    router.refresh();
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    setIsAddingSkill(true);
    try {
      await addSkillToCurrentUser({ name: newSkill.trim() });
      setNewSkill("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add skill", error);
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (id: string) => {
    await removeManualSkillFromCurrentUser(id);
    router.refresh();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    // Data URL fallback
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans pb-20 selection:bg-sky-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-8 pt-6">
        
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          {isOwnProfile && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </header>

        {/* --- WARNING BANNER (If Database Fetch Failed) --- */}
        {useMockData && (
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Profile Data Unavailable</p>
              <p className="opacity-80">We couldn't load the real profile data. You are viewing a placeholder.</p>
            </div>
          </div>
        )}

        {/* --- PROFILE CARD --- */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
          
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-6">
              <Avatar className="h-32 w-32 border-4 border-slate-950 shadow-2xl">
                <AvatarImage src={formData.avatarUrl || ""} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                  {formData.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              {editMode && (
                <label className="absolute bottom-0 right-0 p-2 bg-sky-500 rounded-full cursor-pointer shadow-lg hover:bg-sky-400 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              )}
            </div>

            {/* Editable Info */}
            {editMode ? (
              <div className="w-full max-w-md space-y-4 animate-in fade-in">
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="text-center text-lg font-bold bg-slate-950/50 border-slate-700" 
                  placeholder="Your Name"
                />
                <Input 
                  value={formData.industry} 
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  className="text-center bg-slate-950/50 border-slate-700" 
                  placeholder="Industry / Title"
                />
                <div className="flex gap-2 justify-center">
                  <select 
                    value={countryCode} 
                    onChange={e => setCountryCode(e.target.value)}
                    className="w-24 rounded-md border border-slate-700 bg-slate-950/50 px-2 text-sm focus:border-sky-500 outline-none"
                  >
                    {countries.map(c => <option key={c.code} value={c.dial_code}>{c.code}</option>)}
                  </select>
                  <Input 
                    value={localNumber}
                    onChange={e => setLocalNumber(e.target.value)}
                    className="w-40 bg-slate-950/50 border-slate-700"
                    placeholder="123 456 7890"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">{profileData.name || "Unknown User"}</h1>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Briefcase className="w-4 h-4" />
                  <span>{profileData.industry || "No industry listed"}</span>
                </div>
                {profileData.phoneNumber && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{profileData.phoneNumber}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 flex gap-8 md:gap-12 border-t border-slate-800 pt-6">
              <StatItem label="Swaps" value={profileData.reputation.completedSwaps} icon={Zap} color="text-sky-400" />
              <StatItem label="Rating" value={profileData.reputation.averageRating || "-"} icon={Star} color="text-yellow-400" />
              <StatItem label="Endorsed" value={profileData.reputation.totalEndorsements} icon={CheckCircle} color="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* --- DETAILS GRID --- */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* ABOUT SECTION */}
          <GlassSection title="About">
            {editMode ? (
              <Textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="min-h-[150px] bg-slate-950/50 border-slate-700 text-slate-200"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {profileData.bio || "No bio added yet."}
              </p>
            )}
          </GlassSection>

          {/* SKILLS SECTION */}
          <GlassSection title="Skills">
            <div className="flex flex-wrap gap-2">
              {/* Endorsed Skills */}
              {endorsedSkills.map(skill => (
                <span key={skill.id} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  {skill.name}
                </span>
              ))}

              {/* Manual Skills */}
              {manualSkills.map(skill => (
                <span key={skill.id} className="group relative inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300">
                  {skill.name}
                  {editMode && isOwnProfile && (
                    <button 
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="ml-1 rounded-full bg-slate-700 p-0.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              {editMode && (
                <div className="flex items-center gap-2">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add skill..."
                    className="w-24 rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
                  />
                  <button 
                    onClick={handleAddSkill} 
                    disabled={isAddingSkill}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-600 text-slate-400 hover:border-sky-500 hover:text-sky-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </GlassSection>
        </div>

        {/* --- EDIT ACTIONS --- */}
        {editMode && (
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center gap-4">
            <button 
              onClick={() => setEditMode(false)}
              className="rounded-full bg-slate-900 border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 shadow-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/20 hover:bg-sky-400"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* --- DELETE ACCOUNT (Hidden unless editing own profile) --- */}
        {editMode && isOwnProfile && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowDeleteDialog(true)}
              className="text-xs text-rose-500 hover:text-rose-400 hover:underline"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* --- DIALOGS --- */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-rose-500">Delete Account</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone. All your data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setShowDeleteDialog(false)} className="px-4 py-2 text-sm text-slate-300 hover:text-white">
              Cancel
            </button>
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700">
              Delete Forever
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Subcomponents for Clean Layout ---

function StatItem({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-2xl font-bold ${color || "text-white"}`}>{value}</div>
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
    </div>
  );
}

function GlassSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </div>
  );
}