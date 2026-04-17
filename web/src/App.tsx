import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from "./features/auth/providers/auth-provider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="relative">
          <RouterProvider router={router} />
          <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4">
            <span className="rounded-full bg-[#fffaf2]/88 px-3 py-1 text-[11px] tracking-[0.18em] text-[#6f7768] shadow-sm backdrop-blur-sm">
              AKHILESH NAGARGOJE
            </span>
          </div>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
