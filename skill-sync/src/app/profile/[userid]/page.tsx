import { getCurrentUserId } from "@/actions/auth";
import ProfileClientContent from "./client";
import { getUserProfile } from "@/actions/profile";
import { redirect } from "next/navigation";

export default async function ProfilePage({
    params,
}: {
    // We define both types to handle file system casing differences (Windows/Mac vs Linux)
    params: Promise<{ userId?: string; userid?: string }>;
}) {
    const resolvedParams = await params;
    
    // FIX: Check for 'userId' (CamelCase) OR 'userid' (lowercase)
    const userId = resolvedParams.userId || resolvedParams.userid;
    const currentUserId = await getCurrentUserId();

    if (!userId) {
        console.error("ProfilePage: Missing userId in params", resolvedParams);
        redirect("/dashboard");
    }

    // Determine if we are viewing our own profile
    // (If not logged in, currentUserId is null, so isOwnProfile is false)
    const isOwnProfile = currentUserId === userId;

    let profileData: any;
    let useMockData = false;

    try {
        profileData = await getUserProfile(userId);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        useMockData = true;
        // Fallback data so the page doesn't crash, but shows empty state
        profileData = {
            id: userId,
            name: "Unknown User",
            industry: "N/A",
            bio: "Could not load profile data.",
            skills: [],
            reputation: { averageRating: 0, completedSwaps: 0, totalEndorsements: 0 }
        };
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 transition-colors duration-300">
            <ProfileClientContent
                profileData={profileData}
                isOwnProfile={isOwnProfile}
                useMockData={useMockData}
            />
        </main>
    );
}