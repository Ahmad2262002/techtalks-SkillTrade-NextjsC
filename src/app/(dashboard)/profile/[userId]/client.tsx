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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser, removeManualSkillFromCurrentUser } from "@/actions/skills";
import { countries } from "@/lib/countries";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

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
    const [formData, setFormData] = useState({
        name: profileData.name,
        industry: profileData.industry,
        bio: profileData.bio,
        avatarUrl: profileData.avatarUrl,
        phoneNumber: profileData.phoneNumber,
    });

    // Phone number state
    const [countryCode, setCountryCode] = useState("+1");
    const [localNumber, setLocalNumber] = useState("");

    // Initialize phone number state
    React.useEffect(() => {
        if (profileData.phoneNumber) {
            const sortedCountries = [...countries].sort((a, b) => b.dial_code.length - a.dial_code.length);
            let found = false;
            for (const country of sortedCountries) {
                if (profileData.phoneNumber.startsWith(country.dial_code)) {
                    setCountryCode(country.dial_code);
                    setLocalNumber(profileData.phoneNumber.slice(country.dial_code.length).trim());
                    found = true;
                    break;
                }
            }
            if (!found) {
                setLocalNumber(profileData.phoneNumber);
            }
        }
    }, [profileData.phoneNumber]);

    const [newSkill, setNewSkill] = useState("");
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const visibleSkills = profileData.skills.filter(
        (skill) => skill.isVisible !== false
    );
    const endorsedSkills = visibleSkills.filter(
        (skill) => skill.source === "ENDORSED"
    );
    const manualSkills = visibleSkills.filter(
        (skill) => skill.source !== "ENDORSED"
    );

    const handleDeleteAccount = () => {
        // In production, this would call a server action
        alert("Delete account functionality would be implemented here");
        setShowDeleteDialog(false);
    };

    const handleSave = async () => {
        await upsertProfile({
            name: formData.name,
            industry: formData.industry,
            bio: formData.bio,
            avatarUrl: formData.avatarUrl,
            phoneNumber: `${countryCode}${localNumber}`,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const supabase = getSupabaseBrowserClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${profileData.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Try to upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                console.warn("Upload to 'avatars' bucket failed, falling back to Data URL. Error:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const urlWithCacheBust = `${data.publicUrl}?t=${Date.now()}`;
            setFormData({ ...formData, avatarUrl: urlWithCacheBust });
        } catch (error) {
            // Fallback: read as data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrlWithCacheBust = `${reader.result as string}#${Date.now()}`;
                setFormData({ ...formData, avatarUrl: dataUrlWithCacheBust });
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveSkill = async (userSkillId: string) => {
        try {
            await removeManualSkillFromCurrentUser(userSkillId);
            router.refresh();
        } catch (error) {
            console.error("Failed to remove skill", error);
        }
    };

    return (
        <>
            {/* Header with Back Button */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 dark:bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 shadow-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    SkillSwap
                                </h1>
                                <p className="text-xs text-muted-foreground hidden sm:block">
                                    Learn by Teaching
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard")}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Header Section */}
            <div className="bg-white dark:bg-gray-900 border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        {/* Avatar */}
                        <div className="flex justify-center mb-6 relative group">
                            <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-2xl">
                                <AvatarImage src={formData.avatarUrl || "https://placehold.co/150"} key={formData.avatarUrl || "default"} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-4xl">
                                    {profileData.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            {editMode && (
                                <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full shadow-lg border">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Name, Industry, Phone, Avatar URL */}
                        <div className="flex flex-col items-center justify-center gap-2 mb-2">
                            {editMode ? (
                                <div className="space-y-3 w-full max-w-md bg-card p-6 rounded-xl border shadow-sm">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="text-center font-bold"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Industry</label>
                                        <Input
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="text-center"
                                            placeholder="Your Industry"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center justify-center gap-1">
                                            <Phone className="w-3 h-3" /> Phone Number
                                        </Label>
                                        <div className="flex gap-2">
                                            <Select value={countryCode} onValueChange={setCountryCode}>
                                                <SelectTrigger className="w-[110px]">
                                                    <SelectValue placeholder="Code" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={`${country.code}-${country.dial_code}`} value={country.dial_code}>
                                                            <span className="flex items-center gap-2">
                                                                <span>{country.code}</span>
                                                                <span className="text-muted-foreground">{country.dial_code}</span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={localNumber}
                                                onChange={(e) => setLocalNumber(e.target.value)}
                                                className="flex-1"
                                                placeholder="Phone number"
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase flex items-center justify-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Avatar
                                        </Label>
                                        <Tabs defaultValue="url" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="url">Image URL</TabsTrigger>
                                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="url">
                                                <Input
                                                    value={formData.avatarUrl || ""}
                                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                                    className="text-center"
                                                    placeholder="https://example.com/avatar.jpg"
                                                />
                                            </TabsContent>
                                            <TabsContent value="upload">
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            {isUploading ? (
                                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground">Click to upload</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        <input
                                                            id="avatar-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleFileUpload}
                                                            disabled={isUploading}
                                                        />
                                                    </label>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                                            {profileData.name}
                                        </h1>
                                        {isOwnProfile && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditMode(!editMode)}
                                                title="Edit Profile"
                                                className="hover:bg-muted"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        {profileData.industry}
                                    </p>
                                    {profileData.phoneNumber && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Phone className="w-3 h-3" />
                                            {profileData.phoneNumber}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mock Data Warning */}
                        {useMockData && (
                            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                    Using mock data - backend not available
                                </span>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex justify-center gap-8 sm:gap-12 mt-8">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {profileData.reputation.completedSwaps}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                                    Swaps
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {profileData.reputation.totalEndorsements}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                                    Endorsements
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {visibleSkills.length}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                                    Skills
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* About Section */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">About</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editMode ? (
                                <Textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={5}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-muted-foreground leading-relaxed">
                                    {profileData.bio || "This user hasn't added a bio yet."}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Skills Section */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Skills</CardTitle>
                            <CardDescription>
                                {endorsedSkills.length > 0 && (
                                    <span className="text-sm">
                                        <Award className="w-4 h-4 inline mr-1" />
                                        Endorsed skills are verified through completed swaps
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
                                {visibleSkills.length > 0 ? (
                                    <>
                                        {/* Endorsed Skills */}
                                        {endorsedSkills.map((skill) => (
                                            <Badge
                                                key={skill.id}
                                                className="px-4 py-2 text-sm bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300"
                                            >
                                                <Award className="w-3 h-3 mr-1.5" />
                                                {skill.name}
                                            </Badge>
                                        ))}

                                        {/* Manual Skills */}
                                        {manualSkills.map((skill) => (
                                            <Badge
                                                key={skill.id}
                                                variant="secondary"
                                                className="px-4 py-2 text-sm group relative pr-8"
                                            >
                                                {skill.name}
                                                {editMode && isOwnProfile && (
                                                    <button
                                                        onClick={() => handleRemoveSkill(skill.id)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                                                        title="Remove skill"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </Badge>
                                        ))}
                                    </>
                                ) : (
                                    !editMode && (
                                        <p className="text-sm text-muted-foreground italic w-full">
                                            No skills added yet
                                        </p>
                                    )
                                )}

                                {/* Add Skill Input */}
                                {editMode && isOwnProfile && (
                                    <div className="flex items-center gap-2 ml-2">
                                        <Input
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add a skill..."
                                            className="h-8 w-40 text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddSkill();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleAddSkill}
                                            disabled={!newSkill.trim() || isAddingSkill}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reputation Section */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Reputation</CardTitle>
                            <CardDescription>
                                Built through successful skill swaps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <span className="flex items-center text-sm font-medium">
                                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                                        Average Rating
                                    </span>
                                    <Badge variant="secondary" className="text-lg font-bold">
                                        {profileData.reputation.averageRating
                                            ? profileData.reputation.averageRating.toFixed(1)
                                            : "N/A"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <span className="flex items-center text-sm font-medium">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                        Completed Swaps
                                    </span>
                                    <Badge variant="secondary" className="text-lg font-bold">
                                        {profileData.reputation.completedSwaps ?? 0}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save/Cancel Buttons */}
                    {editMode && (
                        <div className="flex justify-center gap-4 sticky bottom-6 z-10">
                            <Button variant="outline" onClick={() => setEditMode(false)} className="shadow-lg bg-background">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600">
                                Save Changes
                            </Button>
                        </div>
                    )}

                    {/* Danger Zone - Only for own profile in edit mode */}
                    {isOwnProfile && editMode && (
                        <Card className="border-2 border-red-200 dark:border-red-900 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Irreversible actions - proceed with caution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">
                            Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete your account? This action cannot
                            be undone. All your proposals, swaps, and reputation will be
                            permanently lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Delete My Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
