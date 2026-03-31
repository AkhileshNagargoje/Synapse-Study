import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("glass-panel rounded-[26px] p-4 sm:rounded-[28px] sm:p-6", className)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="display-title text-[1.65rem] leading-tight text-[#142218] sm:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4f5b52]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
