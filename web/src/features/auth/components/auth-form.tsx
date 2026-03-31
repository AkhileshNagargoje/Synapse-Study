import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { hasSupabaseEnv, supabase } from "../../../integrations/supabase/client";

const authSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password should be at least 6 characters."),
});

type AuthValues = z.infer<typeof authSchema>;

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AuthValues) => {
    if (!hasSupabaseEnv()) {
      setServerMessage("Add your Supabase URL and anon key to .env before auth can go live.");
      return;
    }

    setServerMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword(values);
      setServerMessage(error?.message ?? null);
      return;
    }

    const { error } = await supabase.auth.signUp(values);
    setServerMessage(error?.message ?? "Check your email if confirmation is enabled for this project.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[#122117]">Email</span>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-2xl border border-[#122117]/10 bg-white/70 px-4 py-3 text-[#122117] outline-none transition focus:border-[#122117]/25"
          placeholder="you@example.com"
        />
        {errors.email ? <span className="mt-2 block text-sm text-[#b44830]">{errors.email.message}</span> : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[#122117]">Password</span>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-2xl border border-[#122117]/10 bg-white/70 px-4 py-3 text-[#122117] outline-none transition focus:border-[#122117]/25"
          placeholder="At least 6 characters"
        />
        {errors.password ? <span className="mt-2 block text-sm text-[#b44830]">{errors.password.message}</span> : null}
      </label>

      {serverMessage ? <div className="rounded-2xl bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{serverMessage}</div> : null}

      <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
        {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}