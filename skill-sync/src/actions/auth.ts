
"use server";

import { createClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // Ensure this user exists in our Prisma Database
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: {
      id: user.id, // Keep IDs synced
      email: user.email,
      name: user.user_metadata.full_name || "New User",
      avatarUrl: user.user_metadata.avatar_url || null,
    },
  });

  return dbUser.id;
}