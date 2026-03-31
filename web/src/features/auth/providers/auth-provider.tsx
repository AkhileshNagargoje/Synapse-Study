import { type PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabase } from "../../../integrations/supabase/client";
import type { AuthContextValue, AuthStatus } from "../types/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User | null) {
  if (!user || !hasSupabaseEnv()) return;

  try {
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
      avatar_url: user.user_metadata.avatar_url ?? null,
    });
  } catch (error) {
    console.warn("Profile sync skipped:", error);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>(hasSupabaseEnv() ? "loading" : "anonymous");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setStatus("anonymous");
      setSession(null);
      setUser(null);
      return;
    }

    let mounted = true;

    const syncSession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession?.user ? "authenticated" : "anonymous");
      void ensureProfile(nextSession?.user ?? null);
    };

    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user,
      isConfigured: hasSupabaseEnv(),
      signOut: async () => {
        if (!hasSupabaseEnv()) return;
        await supabase.auth.signOut();
      },
    }),
    [session, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}