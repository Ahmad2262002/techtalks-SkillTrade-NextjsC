// Type definitions for the SkillSwap application

export interface User {
    id: string;
    email: string;
    name: string | null;
    industry: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    createdAt: Date;
}

export interface Skill {
    id: string;
    name: string;
}

export interface UserSkill {
    id: string;
    userId: string;
    skillId: string;
    skill: Skill;
    source: "MANUAL" | "ENDORSED";
    isVisible: boolean;
    endorsementCount: number;
}

export interface Proposal {
    id: string;
    ownerId: string;
    owner?: User & { skills?: UserSkill[] };
    title: string;
    description: string;
    modality: "REMOTE" | "IN_PERSON";
    status: "OPEN" | "IN_PROGRESS" | "CLOSED";
    createdAt: Date;
    offeredSkills: Skill[];
    neededSkills: Skill[];
    _count?: {
        applications: number;
        swaps: number;
    };
}

export interface Application {
    id: string;
    proposalId: string;
    applicantId: string;
    proposal: Proposal;
    applicant: User;
    pitchMessage: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: Date;
}

export interface Swap {
    id: string;
    proposalId: string;
    proposal: Proposal;
    teacherId: string;
    studentId: string;
    teacher: User;
    student: User;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    startedAt: Date;
    completedAt: Date | null;
}

export interface Review {
    id: string;
    swapId: string;
    swap: Swap;
    authorId: string;
    author: User;
    receiverId: string;
    receiver: User;
    rating: number;
    comment: string | null;
    createdAt: Date;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    swapId: string | null;
    swap: Swap | null;
    createdAt: Date;
    isRead: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    user: User;
    type: "APPLICATION_RECEIVED" | "APPLICATION_ACCEPTED" | "APPLICATION_REJECTED" | "SWAP_STARTED" | "MESSAGE_RECEIVED" | "REVIEW_RECEIVED";
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
}

export interface DashboardOverview {
    user: User & { skills?: UserSkill[] };
    proposals: Proposal[];
    applications: Application[];
    sentApplications?: Application[];
    swaps: Swap[];
    reputation?: {
        averageRating: number;
        completedSwaps: number;
        totalEndorsements: number;
    };
}

export interface ProfileData {
    id: string;
    name: string | null;
    industry: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    skills: Array<{
        id: string;
        name: string;
        source: "MANUAL" | "ENDORSED";
        isVisible: boolean;
    }>;
    reputation: {
        averageRating: number;
        completedSwaps: number;
        totalEndorsements: number;
    };
}

// Form input types
export interface CreateProposalInput {
    title: string;
    description: string;
    modality: string;
    offeredSkillIds: string[];
    neededSkillIds: string[];
}

export interface CreateApplicationInput {
    proposalId: string;
    pitchMessage: string;
}

export interface UpsertProfileInput {
    name?: string | null;
    industry?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
}

export interface AddSkillInput {
    name: string;
}

export interface CreateReviewInput {
    swapId: string;
    receiverId: string;
    rating: number;
    comment?: string;
}

export interface SendMessageInput {
    receiverId: string;
    swapId?: string;
    content: string;
}

// API Response types
export interface ApiResponse<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Component prop types
export interface ProposalCardProps {
    proposal: Proposal;
    isOwner?: boolean;
}

export interface ProposalDetailsModalProps {
    proposal: Proposal;
    isOwner: boolean;
}

export interface DashboardClientContentProps {
    overview: DashboardOverview;
    myProposals: Proposal[];
    publicOnlyProposals: Proposal[];
    search: string;
    rawModality: string;
    activeTab: string;
    swaps: Swap[];
    applications: Application[];
}

export interface ProfileClientContentProps {
    profileData: ProfileData;
    isOwnProfile: boolean;
    useMockData: boolean;
}
