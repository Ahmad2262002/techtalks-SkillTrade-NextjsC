import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClientContent from "./client";
import { getUserProfile } from "@/actions/profile";

// Mock data fallback
const mockUserData = {
    id: "user-12345",
    name: "Alex Developer",
    industry: "Tech Industry",
    bio: "Passionate about open source and teaching. I love trading coding knowledge for practical life skills like cooking or languages. Based in Chicago but open to remote swaps.",
    skills: [
        { id: "s1", name: "JavaScript", source: "ENDORSED", isVisible: true },
        { id: "s2", name: "Python", source: "MANUAL", isVisible: true },
        { id: "s3", name: "PostgreSQL", source: "MANUAL", isVisible: true },
    ],
    reputation: {
        averageRating: 4.8,
        completedSwaps: 12,
        totalEndorsements: 8,
    },
};

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const currentUserId = await getCurrentUserId();

    // Check if viewing own profile
    const isOwnProfile = currentUserId === userId;

    let profileData: any;
    let useMockData = false;

    try {
        // Fetch user profile data
        profileData = await getUserProfile(userId);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        // Fallback to mock data
        useMockData = true;
        profileData = mockUserData;
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
