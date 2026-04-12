import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "student" | "owner";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  enrolled: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  enroll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Build an AuthUser from the Supabase auth user object.
 * This uses auth metadata (always available) so we don't depend on
 * the profiles table SELECT (which can fail due to RLS).
 */
function authUserFromSupabase(user: User): AuthUser {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    name: meta.name || meta.full_name || user.email?.split("@")[0] || "",
    role: (meta.role as UserRole) || "student",
    enrolled: meta.enrolled ?? false,
  };
}

/** Try to fetch profile from DB with a timeout — may return null if RLS blocks or times out */
async function fetchProfileWithTimeout(userId: string, timeoutMs = 3000): Promise<Profile | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .abortSignal(controller.signal);

    clearTimeout(timer);

    if (error) {
      console.warn("fetchProfile error (may be RLS):", error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn("fetchProfile timed out — using metadata fallback");
    } else {
      console.warn("fetchProfile unexpected error:", err);
    }
    return null;
  }
}

function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    enrolled: profile.enrolled,
  };
}

/**
 * Try to get the profile from DB; if not available (RLS issue or timeout),
 * fall back to auth metadata. Also attempt upsert if profile is missing.
 */
async function resolveAuthUser(user: User): Promise<AuthUser> {
  // Try to read profile from DB (with timeout)
  const profile = await fetchProfileWithTimeout(user.id, 3000);
  if (profile) {
    return profileToAuthUser(profile);
  }

  // Profile not readable — try to upsert it (also with a timeout)
  try {
    const meta = user.user_metadata || {};
    const { data: upserted, error: upsertErr } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email || "",
          name: meta.name || meta.full_name || "",
          phone: "",
          role: meta.role || "student",
          enrolled: false,
        },
        { onConflict: "id" }
      )
      .select()
      .maybeSingle();

    if (upserted) {
      return profileToAuthUser(upserted);
    }

    if (upsertErr) {
      console.warn("Profile upsert failed (RLS):", upsertErr.message);
    }
  } catch (err) {
    console.warn("Profile upsert error:", err);
  }

  // Last resort: build from auth metadata (always works)
  console.warn("Using auth metadata as profile fallback");
  return authUserFromSupabase(user);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let ready = false;

    const markReady = () => {
      if (!ready && mounted) {
        ready = true;
        setLoading(false);
      }
    };

    // Hard timeout — never stay on loading screen longer than 3 seconds
    const timeout = setTimeout(markReady, 3000);

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          // Set user immediately from metadata to avoid loading hang
          const quickUser = authUserFromSupabase(session.user);
          if (mounted) setUser(quickUser);
          markReady();

          // Then try to enrich from DB in background
          const authUser = await resolveAuthUser(session.user);
          if (mounted) setUser(authUser);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        markReady();
        clearTimeout(timeout);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        // Use auth metadata immediately for fast login
        const quickUser = authUserFromSupabase(session.user);
        if (mounted) setUser(quickUser);
        markReady();

        // Then try to get DB profile in background for accurate enrolled status
        const fullUser = await resolveAuthUser(session.user);
        if (mounted) setUser(fullUser);
      } else if (event === "SIGNED_OUT") {
        if (mounted) setUser(null);
      }
      markReady();
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Login failed — no user returned.");

    // Build user from auth metadata (instant, no RLS issues)
    const authUser = authUserFromSupabase(data.user);

    // Check role from metadata
    if (authUser.role !== role) {
      await supabase.auth.signOut();
      throw new Error(
        `This account is registered as "${authUser.role}", not "${role}".`
      );
    }

    // Set user immediately from metadata — this triggers navigation instantly
    setUser(authUser);

    // Try to get full profile from DB in background (for enrolled status)
    // This runs silently — failures don't block the user
    resolveAuthUser(data.user)
      .then((fullUser) => {
        if (fullUser.role !== role) {
          // Role mismatch from DB — sign out silently
          supabase.auth.signOut();
          setUser(null);
          return;
        }
        setUser(fullUser);
      })
      .catch((err) => {
        // Don't block user — metadata is sufficient
        console.warn("Background profile resolve failed:", err);
      });
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Signup failed — no user returned.");

    // Set user immediately from auth metadata
    const authUser = authUserFromSupabase(data.user);
    setUser(authUser);

    // Try to resolve full profile in background (trigger should create it)
    resolveAuthUser(data.user)
      .then((fullUser) => {
        setUser(fullUser);
      })
      .catch((err) => {
        console.warn("Background profile resolve after signup failed:", err);
      });
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const loginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    // Clear UI state immediately so user sees login page right away
    setUser(null);

    // Clear Supabase session from localStorage to prevent re-auth race
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // localStorage may not be available in some environments
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore signOut errors — user is already logged out in the UI
      console.warn("SignOut error (ignored):", err);
    }
  };

  const enroll = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ enrolled: true })
      .eq("id", user.id);
    if (error) throw error;

    // Also update auth metadata so it persists across sessions
    await supabase.auth.updateUser({
      data: { enrolled: true },
    });

    setUser({ ...user, enrolled: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        loginWithGithub,
        logout,
        enroll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
