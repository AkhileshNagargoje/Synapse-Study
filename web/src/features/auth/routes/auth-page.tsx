import { Link, Navigate, useLocation } from "react-router-dom";
import { AuthCard } from "../components/auth-card";
import { AuthForm } from "../components/auth-form";
import { useAuth } from "../hooks/use-auth";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const location = useLocation();
  const { status } = useAuth();

  if (status === "authenticated") {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate replace to={redirectTo} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthCard
        title={mode === "login" ? "Welcome back" : "Create your workspace"}
        subtitle={
          mode === "login"
            ? "Log in to continue your spaces, subjects, topics, and saved study packs."
            : "Sign up to start turning your study material into structured packs and AI-guided learning."
        }
        footer={
          mode === "login" ? (
            <span>
              Need an account? <Link className="font-semibold text-[#122117]" to="/signup">Create one</Link>
            </span>
          ) : (
            <span>
              Already have an account? <Link className="font-semibold text-[#122117]" to="/login">Log in</Link>
            </span>
          )
        }
      >
        <AuthForm mode={mode} />
      </AuthCard>
    </div>
  );
}