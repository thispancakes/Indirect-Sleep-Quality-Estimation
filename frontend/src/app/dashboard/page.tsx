"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
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
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

function qualityLabel(q: number) {
  if (q >= 85) return { text: "Excellent recovery", icon: "good" };
  if (q >= 65) return { text: "Good sleep", icon: "good" };
  if (q >= 45) return { text: "Fair quality", icon: "warn" };
  return { text: "Poor sleep detected", icon: "bad" };
}

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
  const prevScore = data[data.length - 2] || {};

  // Derived real stats
  const qualityTrend = lastScore.quality && prevScore.quality
    ? lastScore.quality - prevScore.quality
    : null;
  const disturbanceTrend = lastScore.disturbance && prevScore.disturbance
    ? lastScore.disturbance - prevScore.disturbance
    : null;
  const ql = qualityLabel(lastScore.quality || 0);

  const avgQuality = data.length
    ? Math.round(data.reduce((s, d) => s + d.quality, 0) / data.length)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sleep Overview</h1>
          <p className="text-slate-400">
            {data.length
              ? `Showing all ${data.length} recorded nights · avg quality ${avgQuality}/100`
              : "Loading sleep data…"}
          </p>
        </div>
        {lastScore.date && (
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Latest Entry</p>
            <p className="text-sm text-slate-300 font-medium">{lastScore.date}</p>
          </div>
        )}
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
              {qualityTrend !== null && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  qualityTrend >= 0
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                }`}>
                  {qualityTrend >= 0 ? "+" : ""}{qualityTrend.toFixed(1)} pts
                </span>
              )}
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Sleep Quality Score</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.quality ?? "--"}</h2>
                <span className="text-slate-500 font-medium">/ 100</span>
              </div>
              {lastScore.date && (
                <p className="text-xs text-slate-500 mt-1">Last Night · {lastScore.date}</p>
              )}
            </div>
            <div className={`mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm ${
              ql.icon === "good" ? "text-emerald-400" : ql.icon === "warn" ? "text-amber-400" : "text-rose-400"
            }`}>
              {ql.icon === "good" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{lastScore.quality ? ql.text : "No data yet"}</span>
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
              {disturbanceTrend !== null && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  disturbanceTrend <= 0
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }`}>
                  {disturbanceTrend >= 0 ? "+" : ""}{disturbanceTrend.toFixed(1)} pts
                </span>
              )}
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Disturbance Score</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.disturbance ?? "--"}</h2>
                <span className="text-slate-500 font-medium">pts</span>
              </div>
              {lastScore.date && (
                <p className="text-xs text-slate-500 mt-1">Last Night · {lastScore.date}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-slate-400 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{lastScore.disturbance !== undefined
                ? lastScore.disturbance < 15 ? "Low disturbance night" : lastScore.disturbance < 35 ? "Moderate disturbances" : "High disturbance night"
                : "No data"
              }</span>
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
              {lastScore.duration && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  lastScore.duration >= 7
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }`}>
                  {lastScore.duration >= 7 ? "Optimal" : "Short"}
                </span>
              )}
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Sleep Duration</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold text-white">{lastScore.duration ?? "--"}</h2>
                <span className="text-slate-500 font-medium">hrs</span>
              </div>
              {lastScore.date && (
                <p className="text-xs text-slate-500 mt-1">Last Night · {lastScore.date}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-slate-400 text-sm">
              {lastScore.duration >= 7
                ? <><TrendingUp className="w-4 h-4 text-accent-purple" /><span>Within recommended 7–9 hr range</span></>
                : lastScore.duration
                ? <><TrendingDown className="w-4 h-4 text-amber-500" /><span>Below the 7 hr target</span></>
                : <><Minus className="w-4 h-4" /><span>No data recorded</span></>
              }
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Main Chart — all dates */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard
          title="Sleep Quality Trend"
          subtitle={data.length ? `${data[0]?.date} → ${data[data.length - 1]?.date} · ${data.length} nights recorded` : ""}
        >
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
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.slice(5).replace("-", "/")}
                  interval={data.length > 10 ? Math.floor(data.length / 7) : 0}
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
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="quality"
                  name="Sleep Quality"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorQual)"
                  animationDuration={1500}
                  dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Bottom Row — real derived insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Data Summary">
          <div className="space-y-3 mt-4">
            {[
              {
                label: "Best night",
                value: data.length ? `${data.reduce((b, d) => d.quality > b.quality ? d : b, data[0])?.date} · ${Math.max(...data.map(d => d.quality))} pts` : "—",
                color: "emerald"
              },
              {
                label: "Worst night",
                value: data.length ? `${data.reduce((b, d) => d.quality < b.quality ? d : b, data[0])?.date} · ${Math.min(...data.map(d => d.quality))} pts` : "—",
                color: "rose"
              },
              {
                label: "Average duration",
                value: data.length ? `${(data.reduce((s, d) => s + d.duration, 0) / data.length).toFixed(1)} hrs` : "—",
                color: "cyan"
              },
              {
                label: "Total nights logged",
                value: `${data.length}`,
                color: "purple"
              }
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-sm font-mono font-semibold text-${item.color}-400`}>{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Quality Distribution">
          <div className="space-y-3 mt-4">
            {[
              { label: "Excellent (≥85)", color: "emerald", filter: (d: any) => d.quality >= 85 },
              { label: "Good (65–84)",   color: "cyan",    filter: (d: any) => d.quality >= 65 && d.quality < 85 },
              { label: "Fair (45–64)",   color: "amber",   filter: (d: any) => d.quality >= 45 && d.quality < 65 },
              { label: "Poor (<45)",     color: "rose",    filter: (d: any) => d.quality < 45 },
            ].map(band => {
              const count = data.filter(band.filter).length;
              const pct = data.length ? Math.round((count / data.length) * 100) : 0;
              return (
                <div key={band.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{band.label}</span>
                    <span className={`font-mono text-${band.color}-400`}>{count} nights ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full bg-${band.color}-400`}
                      style={{ width: `${pct}%`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
