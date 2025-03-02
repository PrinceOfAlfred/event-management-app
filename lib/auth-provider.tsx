"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

// Types
type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  avatar_url?: string | undefined;
  bio?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any } | undefined>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any } | undefined>;
  resetPassword: (newPassword: string) => Promise<{ error: any } | undefined>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Fetch user profile data
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            created_at: profileData.created_at,
          });
        }
      }

      setLoading(false);
    };

    checkSession();

    // Set up auth subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Fetch user profile data
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            created_at: profileData.created_at,
          });
        }
      } else {
        setUser(null);
      }

      // Refresh page content
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Error signing in:", error);
        return { error };
      }

      console.log("User signed in successfully");
      router.push("/dashboard");
    } catch (error) {
      console.log("Error signing in:", error);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        console.log("Error signing up:", error);
        return { error };
      }

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
          },
        ]);
        console.log("User successfully added to `profiles` table");

        if (profileError) {
          console.log("Error creating profile:", profileError);
          return { error: profileError };
        }
      }
      console.log("User created successfully");
      setTimeout(() => {
        console.log("Delay Redirecting to dashboard");
        router.push("/dashboard");
      }, 5000);
    } catch (error) {
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    console.log("User signed out");
    router.push("/");
  };

  // Password reset request
  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }
    } catch (error) {
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      router.push("/login");
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
