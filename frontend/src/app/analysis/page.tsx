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
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Volume2, 
  Activity, 
  Sun,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function NightAnalysis() {
  const [data, setData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8001/disturbance-timeline/${selectedDate}`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          setData([]);
        }
      } catch (e) {
        setData([]);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Night Analysis</h1>
          <p className="text-slate-400">Detailed sensor breakdown for your selected sleep period</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-slate-300 focus-within:border-accent-purple/50 transition-colors">
          <Calendar className="w-4 h-4 text-accent-purple" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-white cursor-pointer"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Noise Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard title="Acoustic Disturbance (dB)" className="h-[400px]">
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={11} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }} />
                <Area type="monotone" dataKey="noise" stroke="#f43f5e" strokeWidth={2} fill="url(#noiseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Vibration & Light Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard title="Vibration Intensity" className="h-[350px]">
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={11} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }} />
                  <Line type="stepAfter" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard title="Ambient Light (Lux)" className="h-[350px]">
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={11} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }} />
                  <Area type="monotone" dataKey="light" stroke="#fbbf24" strokeWidth={2} fill="url(#lightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
