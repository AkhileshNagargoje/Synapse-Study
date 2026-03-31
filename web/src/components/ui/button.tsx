import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142218]/20 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-[#142218] text-[#fdfaf5] shadow-lg shadow-[#142218]/10",
        secondary: "border-[#142218]/12 bg-white/88 text-[#142218]",
        accent: "border-transparent bg-[#c7633a] text-[#fffaf6] shadow-lg shadow-[#c7633a]/20 hover:bg-[#ab4f2b]",
        ghost: "border-transparent bg-transparent text-[#142218]"
      }
    },
    defaultVariants: { variant: "primary" }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
