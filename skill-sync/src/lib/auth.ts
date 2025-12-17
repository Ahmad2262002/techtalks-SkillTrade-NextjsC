"use server"; // Add this because signOut is a Server Action

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * Signs the user out, invalidates their session, and redirects to the homepage.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Gets the current user's ID from the Supabase session and ensures they exist in the Prisma database.
 * This function is wrapped in `React.cache` to ensure it only hits the database ONCE per request.
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (dbUser) {
    return dbUser.id;
  }

  const newUser = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.full_name || "New User",
      avatarUrl: user.user_metadata.avatar_url || null,
    },
  });

  return newUser.id;
});