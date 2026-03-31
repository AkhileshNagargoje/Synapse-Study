import type { Session, User } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  signOut: () => Promise<void>;
};