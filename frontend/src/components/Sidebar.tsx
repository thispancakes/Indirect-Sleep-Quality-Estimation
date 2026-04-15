"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Moon,
  BarChart3,
  BrainCircuit,
  CloudSun,
  Sun,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Moon, label: "Night Analysis", href: "/analysis" },
  { icon: BrainCircuit, label: "Mood vs Sleep", href: "/mood" },
  { icon: CloudSun, label: "Environment", href: "/environment" },
  { icon: Sun, label: "External Insights", href: "/external" },
  { icon: History, label: "Model Comparison", href: "/models" },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <aside className="w-64 glass h-[calc(100vh-2rem)] sticky top-4 left-4 m-4 rounded-3xl p-6 flex flex-col hidden lg:flex">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="p-2 bg-accent-purple/20 rounded-xl">
          <Moon className="w-6 h-6 text-accent-purple" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Sleepy Analytics</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-accent-purple" : "text-slate-400 group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-purple shadow-[0_0_8px_#8b5cf6]" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
