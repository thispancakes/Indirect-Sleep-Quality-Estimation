"use client";

import React from "react";

interface MoonVisualProps {
  phase: string;
  illumination: number;
}

export const MoonVisual = ({ phase, illumination }: MoonVisualProps) => {
  // Northern Hemisphere Logic: Waxing = Right lit, Waning = Left lit
  const isWaning = phase.toLowerCase().includes("waning") || phase.toLowerCase().includes("last");
  
  const r = 45;
  const rx = r * Math.abs(1 - 2 * illumination);
  
  // Lit Side Logic
  const isCrescent = illumination < 0.5;
  const litSideSweep = isWaning ? 0 : 1;
  const terminatorSweep = isCrescent ? (isWaning ? 1 : 0) : (isWaning ? 0 : 1);

  return (
    <div className="relative w-full h-full">
       {/* Background Glow */}
       <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
       
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <defs>
             <linearGradient id="moonGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
             </linearGradient>
          </defs>

          {/* Shadow Base (New Moon) */}
          <circle cx="50" cy="50" r={r} fill="#0f172a" />
          
          {/* Lit Portion */}
          <path 
             d={`
                M 50,${50-r} 
                A ${r},${r} 0 0 ${litSideSweep} 50,${50+r} 
                A ${rx},${r} 0 0 ${terminatorSweep} 50,${50-r}
             `}
             fill="url(#moonGradient)"
             className="transition-all duration-700 ease-in-out"
          />

          {/* Subtle Crater Details */}
          <g opacity="0.05" fill="black">
             <circle cx="35" cy="45" r="4" />
             <circle cx="55" cy="35" r="6" />
             <circle cx="45" cy="65" r="5" />
          </g>
       </svg>
    </div>
  );
};
