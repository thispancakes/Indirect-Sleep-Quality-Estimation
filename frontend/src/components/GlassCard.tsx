"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  glow?: "purple" | "cyan" | "none";
}

export function GlassCard({ children, className, title, subtitle, glow = "none" }: GlassCardProps) {
  return (
    <div className={cn(
      "glass p-6 rounded-3xl transition-all duration-300 hover:scale-[1.01]",
      glow === "purple" && "glow-purple",
      glow === "cyan" && "glow-cyan",
      className
    )}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
