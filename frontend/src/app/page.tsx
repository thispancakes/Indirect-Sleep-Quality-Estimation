"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  Moon,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8001/sleep-score");
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData([]);
        }
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lastScore = data[data.length - 1] || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sleep Overview</h1>
          <p className="text-slate-400">Welcome back! Here's your sleep analysis for this week.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button className="px-4 py-2 bg-accent-purple text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/20">7 Days</button>
          <button className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-colors">30 Days</button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard glow="purple" className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-accent-purple/20 rounded-2xl">
                <Moon className="w-6 h-6 text-accent-purple" />
              </div>
              <span className="text-xs font-bold text-accent-purple px-2 py-1 bg-accent-purple/10 rounded-full border border-accent-purple/20">+12%</span>
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Sleep Quality Score</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.quality || "--"}</h2>
                <span className="text-slate-500 font-medium">/ 100</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Excellent recovery tonight</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard glow="cyan" className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-accent-cyan/20 rounded-2xl">
                <Zap className="w-6 h-6 text-accent-cyan" />
              </div>
              <span className="text-xs font-bold text-accent-cyan px-2 py-1 bg-accent-cyan/10 rounded-full border border-accent-cyan/20">-5%</span>
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Disturbance Level</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.disturbance || "--"}</h2>
                <span className="text-slate-500 font-medium">%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-slate-400 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low noise peaks detected</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-800 rounded-2xl">
                <Clock className="w-6 h-6 text-slate-300" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Sleep Duration</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.duration || "--"}</h2>
                <span className="text-slate-500 font-medium">hrs</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-slate-400 text-sm">
              <TrendingUp className="w-4 h-4 text-accent-purple" />
              <span>Consistent with last week</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard title="Sleep Quality Trend" subtitle="Last 7 days of performance">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.split("-").slice(1).join("/")}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617ee",
                    borderRadius: "16px",
                    border: "1px solid #ffffff20",
                    backdropFilter: "blur(8px)",
                    color: "#fff"
                  }}
                  itemStyle={{ color: "#8b5cf6" }}
                />
                <Area
                  type="monotone"
                  dataKey="quality"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorQual)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Recommended Actions">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-purple/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-white">Reduce light exposure</p>
                <p className="text-sm text-slate-400">High light levels detected before 11 PM.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-white">Optimal Temperature</p>
                <p className="text-sm text-slate-400">Room temp is perfectly aligned with sleep cycles.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Environmental Sync">
          <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Correlation with AQI is currently strong (0.82)</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
