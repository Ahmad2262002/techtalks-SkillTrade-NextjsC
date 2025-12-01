"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-lg shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-zinc-900">
          {mode === "signin" ? "Sign in" : "Sign up"} to SkillTrade
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded bg-blue-600 text-white text-sm font-medium py-1.5 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>
        <button
          type="button"
          onClick={() =>
            setMode((m) => (m === "signin" ? "signup" : "signin"))
          }
          className="w-full text-xs text-zinc-600 underline mt-2"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}


