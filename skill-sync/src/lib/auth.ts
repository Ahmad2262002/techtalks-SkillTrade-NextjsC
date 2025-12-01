import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";

export async function getCurrentUserId(): Promise<string | null> {
  // 1. Get the Supabase Session from the browser cookies
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // 2. Sync: Ensure this user exists in our Prisma Database
  // If they just signed up via Supabase, we create them in our DB here.
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      // Optional: Update avatar if they changed it in Google/Supabase
      // avatarUrl: user.user_metadata.avatar_url,
    },
    create: {
      id: user.id, // Keep IDs synced (Supabase Auth ID = Prisma DB ID)
      email: user.email,
      name: user.user_metadata.full_name || "New User",
      avatarUrl: user.user_metadata.avatar_url || null,
    },
  });

  return dbUser.id;
}