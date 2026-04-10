"use client";

import { GlassCard } from "@/components/GlassCard";

const MoonVisual = ({ phase, illumination }: { phase: string, illumination: number }) => {
  // Northern Hemisphere Logic: Waxing = Right lit, Waning = Left lit
  const isWaning = phase.toLowerCase().includes("waning") || phase.toLowerCase().includes("last");
  
  const r = 45;
  const rx = r * Math.abs(1 - 2 * illumination);
  
  // Lit Side Logic
  const isCrescent = illumination < 0.5;
  const litSideSweep = isWaning ? 0 : 1;
  const terminatorSweep = isCrescent ? (isWaning ? 1 : 0) : (isWaning ? 0 : 1);

  return (
    <div className="relative w-24 h-24 mx-auto">
       <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-lg" />
       
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
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

const phases = [
  { name: "New Moon", phase: "New Moon", illumination: 0.0 },
  { name: "Waxing Crescent", phase: "Waxing Crescent", illumination: 0.25 },
  { name: "First Quarter", phase: "First Quarter", illumination: 0.5 },
  { name: "Waxing Gibbous", phase: "Waxing Gibbous", illumination: 0.75 },
  { name: "Full Moon", phase: "Full Moon", illumination: 1.0 },
  { name: "Waning Gibbous", phase: "Waning Gibbous", illumination: 0.75 },
  { name: "Last Quarter", phase: "Last Quarter", illumination: 0.5 },
  { name: "Waning Crescent", phase: "Waning Crescent", illumination: 0.25 },
];

export default function DebugMoon() {
  return (
    <div className="p-8 space-y-8 bg-[#020617] min-h-screen text-white">
      <header>
        <h1 className="text-3xl font-bold">Moon Phase Accuracy Check (V2)</h1>
        <p className="text-slate-400">Verifying the fixed shadow/lit logic. New Moon should now be 100% dark.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {phases.map((p) => (
          <GlassCard key={p.name} title={p.name} subtitle={`${(p.illumination * 100).toFixed(0)}% Illumination`} className="p-4 text-center">
            <div className="py-6">
              <MoonVisual phase={p.phase} illumination={p.illumination} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-1">
              <div>isWaning: {p.phase.toLowerCase().includes("waning") || p.phase.toLowerCase().includes("last") ? "true" : "false"}</div>
              <div>rx: {(45 * Math.abs(1 - 2 * p.illumination)).toFixed(1)}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sm leading-relaxed max-w-2xl">
         <h3 className="font-bold mb-2 text-blue-400">Fixed Logic Details:</h3>
         <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><strong>New Moon Fix:</strong> When illumination is 0, the terminator arc now perfectly mirrors the outer arc, resulting in zero visible lit area.</li>
            <li><strong>Waxing Phase:</strong> Right side semi-circle is lit, shadow retreats towards the left.</li>
            <li><strong>Waning Phase:</strong> Left side semi-circle is lit, shadow advances towards the left.</li>
         </ul>
      </div>
    </div>
  );
}
