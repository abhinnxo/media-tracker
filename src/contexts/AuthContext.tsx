import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (password: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkOnboarding = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userId)
        .single();

      if (!data || !data.username) {
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/onboarding" &&
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/register") &&
          !currentPath.startsWith("/reset-password") &&
          !currentPath.startsWith("/update-password")
        ) {
          window.location.href = "/onboarding";
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkOnboarding(session.user.id);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        checkOnboarding(session.user.id);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error) {
        toast({
          title: "Signup successful!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        toast({
          title: "Login successful!",
          description: "Welcome back!",
        });
      }

      return { error };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

    window.location.href = "/login";
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (!error) {
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for the reset link.",
        });
      }

      return { error };
    } catch (error) {
      console.error("Password reset request error:", error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (!error) {
        toast({
          title: "Password updated",
          description: "Your password has been successfully reset.",
        });
      }

      return { error };
    } catch (error) {
      console.error("Password reset error:", error);
      return { error: error as AuthError };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
