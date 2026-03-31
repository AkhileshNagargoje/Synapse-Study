import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/use-auth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-[#122117]">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-[#586254]">Restoring your study workspace...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}