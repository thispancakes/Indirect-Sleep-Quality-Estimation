"use client";

import { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/GlassCard";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import { 
  Wind, 
  Thermometer, 
  Droplets,
  CloudLightning,
  Sun,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

export default function EnvironmentImpact() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8001/environment-impact");
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (e) {
        setData([]);
      }
    };
    fetchData();
  }, []);

  // Real derived insights from actual data
  const insights = useMemo(() => {
    if (!data.length) return null;
    const maxAqiDay = data.reduce((b, d) => d.aqi > b.aqi ? d : b, data[0]);
    const bestSleepDay = data.reduce((b, d) => d.sleep > b.sleep ? d : b, data[0]);
    const hottest = data.reduce((b, d) => d.temp > b.temp ? d : b, data[0]);
    const coolest = data.reduce((b, d) => d.temp < b.temp ? d : b, data[0]);
    const avgTemp = (data.reduce((s, d) => s + d.temp, 0) / data.length).toFixed(1);
    return { maxAqiDay, bestSleepDay, hottest, coolest, avgTemp };
  }, [data]);

  // Tight Y-axis domain for temperature so the line fills the chart
  const tempDomain = useMemo(() => {
    if (!data.length) return ['auto', 'auto'];
    const temps = data.map(d => d.temp).filter(t => t > 0);
    if (!temps.length) return ['auto', 'auto'];
    const min = Math.floor(Math.min(...temps)) - 1;
    const max = Math.ceil(Math.max(...temps)) + 1;
    return [min, max];
  }, [data]);

  if (!data.length) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Environmental Impact</h1>
          <p className="text-slate-400">Comparing PM2.5, temperature against sleep performance.</p>
        </header>
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Minus className="w-10 h-10 mb-3 opacity-30" />
          <p>No environmental data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Environmental Impact</h1>
        <p className="text-slate-400">
          Sensor-measured PM2.5 and temperature across {data.length} recorded nights.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PM2.5 vs Sleep */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard title="PM2.5 vs Sleep Quality" subtitle="Air quality (sensor) impact on recovery">
            <div className="h-[320px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sleepColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }}
                    formatter={(v: any, name: string) => [typeof v === 'number' ? v.toFixed(1) : v, name]}
                  />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="aqi" name="PM2.5 (µg/m³)" stroke="#ef4444" strokeWidth={2} fill="url(#aqiColor)" dot={{ r: 3, fill: '#ef4444' }} />
                  <Area type="monotone" dataKey="sleep" name="Sleep Quality" stroke="#8b5cf6" strokeWidth={2} fill="url(#sleepColor)" dot={{ r: 3, fill: '#8b5cf6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {insights && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <Wind className="w-4 h-4 inline mr-2" />
                Highest PM2.5 on <strong>{insights.maxAqiDay.day}</strong> ({insights.maxAqiDay.aqi} µg/m³).
                Best sleep on <strong>{insights.bestSleepDay.day}</strong> ({insights.bestSleepDay.sleep} pts).
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Temp vs Sleep */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard title="Temperature vs Sleep Quality" subtitle="Room temperature measured by sensor" glow="cyan">
            <div className="h-[320px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} tickLine={false} axisLine={false} domain={tempDomain as [number, number]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }}
                    formatter={(v: any, name: string) => [typeof v === 'number' ? v.toFixed(1) : v, name]}
                  />
                  <Legend iconType="circle" />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep Quality"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {insights && (
              <div className="mt-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
                <Thermometer className="w-4 h-4 inline mr-2" />
                Range: <strong>{insights.coolest.temp}°C</strong> ({insights.coolest.day}) to{" "}
                <strong>{insights.hottest.temp}°C</strong> ({insights.hottest.day}).
                Avg {insights.avgTemp}°C across all recorded nights.
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500"><Sun className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Best Sleep Night</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {insights
              ? <><strong className="text-white">{insights.bestSleepDay.day}</strong> scored <strong className="text-emerald-400">{insights.bestSleepDay.sleep} pts</strong> with temp {insights.bestSleepDay.temp}°C and PM2.5 {insights.bestSleepDay.aqi} µg/m³.</>
              : "Loading…"}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><Droplets className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Highest Pollution</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {insights
              ? <><strong className="text-white">{insights.maxAqiDay.day}</strong> had the worst air quality at <strong className="text-rose-400">{insights.maxAqiDay.aqi} µg/m³ PM2.5</strong> — sleep score was {insights.maxAqiDay.sleep}.</>
              : "Loading…"}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-500"><CloudLightning className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Temperature Range</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {insights
              ? <>Room temp ranged from <strong className="text-cyan-400">{insights.coolest.temp}°C</strong> to <strong className="text-amber-400">{insights.hottest.temp}°C</strong> with an average of <strong className="text-white">{insights.avgTemp}°C</strong>.</>
              : "Loading…"}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
