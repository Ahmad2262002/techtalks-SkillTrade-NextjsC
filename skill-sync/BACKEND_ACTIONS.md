## Backend Actions Overview

This document summarizes the server actions and helpers implemented for the SkillTrade backend.  
All actions are regular async functions in `src/actions/*` that you can call from Server Components or via `<form action={...}>` server actions.

### Auth / User Identity

- **`getCurrentUserId()`** – `src/lib/auth.ts`  
  - Returns the ID of a single **test user**.  
  - If the user does not exist yet, it is created with:
    - `email = process.env.TEST_USER_EMAIL ?? "test-user@example.com"`.
  - Used by almost all actions to know “who is the current user” without relying on Supabase cookies during development.

### Profile

- **`getCurrentUserProfile()`** – `src/actions/profile.ts`  
  - Input: none (uses current user).  
  - Returns the `User` row including visible skills and reviews.
- **`upsertProfile({ name?, industry?, bio?, avatarUrl?, phoneNumber? })`**  
  - Creates or updates the current user’s profile fields.

### Skills

- **`searchSkills(query: string, limit?: number)`** – `src/actions/skills.ts`  
  - Text search on `Skill.name`, used for typeahead.
- **`addSkillToCurrentUser({ name })`**  
  - Upserts `Skill` by name and creates/ensures a `UserSkill` for the current user (source: `MANUAL`).
- **`removeManualSkillFromCurrentUser(userSkillId)`**  
  - Deletes a `UserSkill` if it belongs to the current user and `source === "MANUAL"`.
- **`setUserSkillVisibility({ userSkillId, isVisible })`**  
  - Toggles visibility of a `UserSkill` (manual or endorsed).
- **`endorseUserSkill({ userId, skillId })`**  
  - Increments `endorsementCount` and sets `source = "ENDORSED"` for the target user’s skill.

### Proposals (Skill Market)

- **`createProposal({ title, description, modality, offeredSkillIds, neededSkillIds })`** – `src/actions/proposals.ts`  
  - Creates a proposal owned by the current user and connects the given skills.
- **`listPublicProposals({ wantSkillIds?, haveSkillIds?, modality?, search?, take?, skip? })`**  
  - Returns open proposals with owner, skills, and counts of applications and swaps.
  - Used by the **public landing page** at `/` to show and filter proposals.
- **`listMyProposals()`**  
  - Lists proposals where `ownerId = currentUserId`.
- **`getProposalById(proposalId)`**  
  - Loads a proposal with owner, skills, applications (with applicants), and swaps.
- **`updateProposalStatus({ proposalId, status })`**  
  - Owner-only. Changes `status` (`OPEN`, `IN_PROGRESS`, `CLOSED`).
- **`rescindProposal(proposalId)`**  
  - Owner-only. Closes a proposal if it has **no swaps** yet.

### Applications (Requests / Pitches)

- **`createApplication({ proposalId, pitchMessage })`** – `src/actions/applications.ts`  
  - Creates an application for the current user against the given proposal.
- **`listApplicationsForProposal(proposalId)`**  
  - Owner-only. Returns all applications for that proposal, with applicants.
- **`listMyApplications()`**  
  - Returns applications where `applicantId = currentUserId`.
- **`updateApplicationStatus({ applicationId, status })`**  
  - Owner-only. Moves an application from `PENDING` → `ACCEPTED` / `REJECTED`.

### Swaps (Swap Contracts)

- **`createSwapFromApplication(applicationId)`** – `src/actions/swaps.ts`  
  - Owner-only. Creates a `Swap` where:
    - `teacherId = proposal.ownerId`
    - `studentId = application.applicantId`
  - Marks the application as `ACCEPTED` and the proposal as `IN_PROGRESS`.
- **`listMySwaps()`**  
  - Swaps where current user is either teacher or student, with proposal and participants.
- **`updateSwapStatus({ swapId, status })`**  
  - Participant-only. Updates swap status (`ACTIVE`, `COMPLETED`, `CANCELLED`); sets `completedAt` when completed.

### Reviews & Reputation

- **`createReview({ swapId, rating, comment? })`** – `src/actions/reviews.ts`  
  - Participant-only. Creates a review from the current user to the other party in the swap.
- **`listReviewsForUser(userId)`**  
  - All reviews where `receiverId = userId`, including author and swap/proposal.
- **`getReputationStats(userId)`**  
  - Returns:
    - `completedSwaps`
    - `totalReviews`
    - `positiveReviews` (rating ≥ 4)
    - `battingAverage` (a simple ratio for now).

### Dashboard Aggregate

- **`getDashboardOverview()`** – `src/actions/dashboard.ts`  
  - For the current user, returns a single object:
    - `user` + visible skills
    - `proposals` (with counts)
    - `applications` (recent, with proposal + owner)
    - `swaps` (recent, with proposal + participants)
    - `reputation` (from `getReputationStats`)
  - Used by `/dashboard` test UI to render everything at once.

### Chat (Planned)

- **`sendMessage()` / `listMessages()`** – `src/actions/chat.ts`  
  - Currently throw a “not implemented” error; they will be wired once a `Message` model is added to `prisma/schema.prisma`.

---

### How to call these from the GUI

- **Server Components**: import and `await` any action directly:

```ts
import { getDashboardOverview } from "@/actions/dashboard";

const overview = await getDashboardOverview();
```

- **Mutations from forms**:
  - Create a small `use server` wrapper that accepts `FormData` and delegates to an action.
  - Use that wrapper as `<form action={wrapper}>` in your component.

See `src/app/(dashboard)/dashboard/page.tsx` for multiple concrete examples of this pattern.


