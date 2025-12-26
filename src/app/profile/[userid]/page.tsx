import { getCurrentUserId } from "@/actions/auth";
import ProfileClientContent from "./client";
import { getUserProfile } from "@/actions/profile";
import { redirect } from "next/navigation";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ userid?: string }>;
}) {
    const resolvedParams = await params;
    const userId = resolvedParams.userid;
    const currentUserId = await getCurrentUserId();

    if (!userId) {
        redirect("/dashboard");
    }

    const isOwnProfile = currentUserId === userId;

    let profileData: any;
    let useMockData = false;

    try {
        profileData = await getUserProfile(userId);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        useMockData = true;
        profileData = {
            id: userId, name: "Unknown User", industry: "N/A", bio: "Could not load profile data.",
            avatarUrl: null, phoneNumber: null, skills: [],
            reputation: {
                averageRating: 0,
                completedSwaps: 0,
                totalEndorsements: 0,
                level: 1,
                title: "Unknown",
                reputationPoints: 0,
                color: "text-slate-400"
            }
        };
    }

    return (
        <ProfileClientContent
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            useMockData={useMockData}
            currentUserId={currentUserId}
        />
    );
}