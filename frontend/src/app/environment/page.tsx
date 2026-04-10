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
  Wind, 
  Thermometer, 
  Droplets,
  CloudLightning,
  Sun
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Environmental Impact</h1>
        <p className="text-slate-400">Comparing AQI, Temperature, and Humidity against sleep performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AQI vs Sleep */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard title="AQI vs Sleep Quality" subtitle="Air quality impact on recovery">
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="aqi" name="AQI (PM2.5)" stroke="#ef4444" strokeWidth={2} fill="url(#aqiColor)" />
                  <Area type="monotone" dataKey="sleep" name="Sleep Quality" stroke="#8b5cf6" strokeWidth={2} fill="url(#sleepColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <Wind className="w-4 h-4 inline mr-2" />
              Sleep drops on Thursday when AQI peaked (85).
            </div>
          </GlassCard>
        </motion.div>

        {/* Temp vs Sleep */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <GlassCard title="Temperature Variance" subtitle="Ideal range: 22°C - 24°C" glow="cyan">
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }} />
                  <Legend iconType="circle" />
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                  <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sleep Quality" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
              <Thermometer className="w-4 h-4 inline mr-2" />
              Highest sleep score (94) achieved at the lowest temperature (22°C).
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500"><Sun className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Heat Sensitivity</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your data shows a -0.65 correlation between temperature and sleep duration.
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><Droplets className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Humidity Impact</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Relative humidity above 65% triggers more micro-vibrations in your sleep cycle.
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-500"><CloudLightning className="w-6 h-6" /></div>
            <h3 className="font-bold text-white">Stormy Nights</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Atmospheric pressure changes correlate with deeper but shorter N3 sleep stages.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
