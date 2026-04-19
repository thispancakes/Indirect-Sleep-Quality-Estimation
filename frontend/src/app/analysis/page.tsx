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
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import { 
  Volume2, 
  Activity, 
  Sun,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

// How many ticks to skip so labels don't pile up
function tickInterval(len: number) {
  if (len <= 12) return 0;
  if (len <= 24) return 1;
  if (len <= 48) return 3;
  return Math.floor(len / 12);
}

export default function NightAnalysis() {
  const [data, setData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  // Real derived summary from the fetched data
  const summary = useMemo(() => {
    if (!data.length) return null;
    const maxNoise = Math.max(...data.map(d => d.noise));
    const maxNoiseTime = data.find(d => d.noise === maxNoise)?.time ?? "—";
    const vibSpikes = data.filter(d => d.vibration > 0).length;
    const avgLight = data.reduce((s, d) => s + d.light, 0) / data.length;
    const lightOn = data.filter(d => d.light > 5).length;
    const totalBuckets = data.length;
    const darkRatio = Math.round(((totalBuckets - lightOn) / totalBuckets) * 100);
    const avgPM25 = data.reduce((s, d) => s + d.pm25, 0) / data.length;
    const avgPM10 = data.reduce((s, d) => s + d.pm10, 0) / data.length;
    const avgHumidity = data.reduce((s, d) => s + d.humidity, 0) / data.length;
    const hasFullSensorData = avgPM10 > 0;  // Only Apr 7+ nights have PM10/humidity
    return { maxNoise, maxNoiseTime, vibSpikes, avgLight: Math.round(avgLight), darkRatio,
             avgPM25: Math.round(avgPM25 * 10) / 10,
             avgPM10: Math.round(avgPM10 * 10) / 10,
             avgHumidity: Math.round(avgHumidity * 10) / 10,
             hasFullSensorData };
  }, [data]);

  const interval = tickInterval(data.length);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Night Analysis</h1>
          <p className="text-slate-400">Sensor breakdown for your selected sleep period</p>
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

      {/* Real data summary derived from fetched readings */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Peak Noise</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{summary.maxNoise}</p>
              <p className="text-xs text-slate-500">peaks at {summary.maxNoiseTime}</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Vibration Spikes</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{summary.vibSpikes}</p>
              <p className="text-xs text-slate-500">5-min buckets with activity</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Avg Light</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{summary.avgLight}</p>
              <p className="text-xs text-slate-500">lux (lower = darker room)</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-2">
                {summary.darkRatio >= 80
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400" />
                }
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Dark Time</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{summary.darkRatio}%</p>
              <p className="text-xs text-slate-500">of sleep window in darkness</p>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {data.length === 0 && !loading && (
        <div className="text-center py-16 text-slate-500">
          <Minus className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No sensor data found for {selectedDate}. Try an earlier date.</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="grid grid-cols-1 gap-8">
          {/* Noise Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <GlassCard title="Acoustic Disturbance" subtitle={`Noise peaks per 5-min window · ${data.length} readings`}>
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                    <defs>
                      <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={interval} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                      labelFormatter={(t) => `Time: ${t}`}
                      formatter={(v: any) => [v, "Noise peaks"]}
                    />
                    {summary && summary.maxNoise > 0 && (
                      <ReferenceLine y={summary.maxNoise} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.5}
                        label={{ value: `Peak: ${summary.maxNoise}`, fill: "#f43f5e", fontSize: 10, position: "right" }}
                      />
                    )}
                    <Area type="monotone" dataKey="noise" name="Noise peaks" stroke="#f43f5e" strokeWidth={2} fill="url(#noiseGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Vibration & Light */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard title="Vibration Frequency" subtitle={`Spikes per 5-min window · ${summary?.vibSpikes ?? 0} active buckets`}>
                <div className="h-[250px] w-full mt-4">
                  {summary && summary.vibSpikes === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                      <Activity className="w-8 h-8 mb-3 opacity-25" />
                      <p className="text-sm font-medium text-slate-500">No vibration events this night</p>
                      <p className="text-xs text-slate-600 mt-1">Sensor threshold was not exceeded</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ left: 0, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={interval} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                          labelFormatter={(t) => `Time: ${t}`}
                          formatter={(v: any) => [v, "Vibration spikes"]}
                        />
                        <Line type="stepAfter" dataKey="vibration" name="Vibration" stroke="#06b6d4" strokeWidth={2} dot={false} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard title="Ambient Light" subtitle={`Room brightness in lux · ${summary?.darkRatio ?? 0}% of night in darkness`}>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                      <defs>
                        <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={interval} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                        labelFormatter={(t) => `Time: ${t}`}
                        formatter={(v: any) => [v, "Lux"]}
                      />
                      <Area type="monotone" dataKey="light" name="Lux" stroke="#fbbf24" strokeWidth={2} fill="url(#lightGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* PM & Humidity — only shown when full sensor data available (Apr 7+) */}
          {summary?.hasFullSensorData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* PM2.5 */}
                <GlassCard title="PM2.5" subtitle={`Avg ${summary.avgPM25} µg/m³ · fine particle concentration`}>
                  <div className="h-[220px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                        <defs>
                          <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={interval} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                          labelFormatter={(t) => `Time: ${t}`}
                          formatter={(v: any) => [`${v} µg/m³`, "PM2.5"]}
                        />
                        <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="#f97316" strokeWidth={2} fill="url(#pm25Gradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* PM10 */}
                <GlassCard title="PM10" subtitle={`Avg ${summary.avgPM10} µg/m³ · coarse particle concentration`}>
                  <div className="h-[220px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                        <defs>
                          <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={interval} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                          labelFormatter={(t) => `Time: ${t}`}
                          formatter={(v: any) => [`${v} µg/m³`, "PM10"]}
                        />
                        <Area type="monotone" dataKey="pm10" name="PM10" stroke="#ef4444" strokeWidth={2} fill="url(#pm10Gradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Humidity */}
                <GlassCard title="Humidity" subtitle={`Avg ${summary.avgHumidity}% RH · relative humidity`} glow="cyan">
                  <div className="h-[220px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                        <defs>
                          <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={interval} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[40, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#020617ee", borderRadius: "12px", border: "1px solid #ffffff10" }}
                          labelFormatter={(t) => `Time: ${t}`}
                          formatter={(v: any) => [`${v}%`, "Humidity"]}
                        />
                        <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#06b6d4" strokeWidth={2} fill="url(#humGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
