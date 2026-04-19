"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Smile, 
  Frown, 
  Info,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

export default function MoodVSleep() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8001/mood-correlation");
        if (response.ok) {
          const json = await response.json();
          // Map backend fields to chart x,y
          const mapped = json.map((d: any) => ({
            x: d.sleep_quality,
            y: d.mood_score,
            name: d.date
          }));
          setData(mapped);
        }
      } catch (e) {
        setData([]);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Mood & Cognitive Correlation</h1>
        <p className="text-slate-400">Discover how your sleep quality affects your daily mood.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Insight Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <GlassCard glow="purple" className="h-full">
            <div className="p-4 bg-accent-purple/20 rounded-3xl w-fit mb-6">
              <Brain className="w-8 h-8 text-accent-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Positive Correlation</h2>
            <div className="text-5xl font-extrabold text-white mb-2">0.82</div>
            <p className="text-slate-400 leading-relaxed mb-6">
              Your sleep quality has a <strong>strong positive correlation</strong> with your mood. 
              Higher sleep scores consistently lead to improved mood ratings.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <Smile className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-300">Peak mood at 90+ score</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <Frown className="w-5 h-5 text-rose-400" />
                <span className="text-sm text-slate-300">Mood drops significantly below 70 score</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Scatter Plot */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
          <GlassCard title="Sleep Quality vs Mood Level" subtitle="Correlation of the last 14 days">
            <div className="h-[450px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Sleep Quality" 
                    unit=" pts" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Mood Score" 
                    unit="/5" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    domain={[1, 5]}
                    ticks={[1,2,3,4,5]}
                  />
                  <ZAxis type="number" range={[80, 300]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }} 
                    formatter={(v: any, name: string) => [v, name]}
                  />
                  <Scatter name="Days" data={data} fill="#8b5cf6">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.y > 3 ? '#8b5cf6' : '#6366f1'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
