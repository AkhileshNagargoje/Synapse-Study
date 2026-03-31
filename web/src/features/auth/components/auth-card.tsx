import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <div className="glass-panel w-full max-w-[460px] rounded-[32px] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-[#6f7768]">Synapse Study</p>
      <h1 className="display-title mt-3 text-4xl text-[#122117]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#586254]">{subtitle}</p>
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 text-sm text-[#586254]">{footer}</div> : null}
    </div>
  );
}