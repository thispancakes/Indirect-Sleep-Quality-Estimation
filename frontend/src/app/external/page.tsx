"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import {
  Wind,
  Thermometer,
  Droplets,
  Sunrise,
  Sunset,
  Zap,
  Activity,
  ArrowRight,
  RefreshCw,
  MapPin
} from "lucide-react";
import { MoonVisual } from "@/components/MoonVisual";

interface MoonData {
  phase: string;
  illumination: number;
  zodiac: string;
  timestamp: string;
}

interface ExternalData {
  weather?: { temp: number; humidity: number; wind_speed: number; location: string; timestamp: string };
  aqi?: { aqi: number; pm25: number; timestamp: string };
  sun?: { sunrise: string; sunset: string; timestamp: string };
  moon?: MoonData;
}

export default function ExternalInsights() {
  const [data, setData] = useState<ExternalData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8001/api/external-data");
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch external data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // AQI category derived from real value
  function aqiLabel(aqi: number): { text: string; color: string } {
    if (aqi <= 50)  return { text: "Good. Ideal for ventilation.", color: "emerald" };
    if (aqi <= 100) return { text: "Moderate. Sensitive groups should limit outdoor activity.", color: "amber" };
    if (aqi <= 150) return { text: "Unhealthy for sensitive groups. Keep windows closed.", color: "orange" };
    if (aqi <= 200) return { text: "Unhealthy. Avoid extended outdoor exposure.", color: "rose" };
    return { text: "Very Unhealthy. Stay indoors.", color: "red" };
  }

  // Compute daylight hours from actual sunrise/sunset strings (HH:MM)
  function daylightDuration(sunrise: string, sunset: string): string {
    const [sh, sm] = sunrise.split(":").map(Number);
    const [eh, em] = sunset.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  const illuminationPct = data?.moon?.illumination
    ? (data.moon.illumination < 1 ? Math.round(data.moon.illumination * 100) : Math.round(data.moon.illumination))
    : null;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">External Environment</h1>
          <p className="text-slate-400">Live data from global APIs integrated with your local sensors.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weather Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard title="Live Weather" subtitle="OpenWeatherMap API" glow="blue">
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Outdoor Temp</span>
                </div>
                <div className="text-3xl font-bold text-white">{data?.weather?.temp ?? "--"}°C</div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Humidity</span>
                </div>
                <div className="text-3xl font-bold text-white">{data?.weather?.humidity ?? "--"}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Wind className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Wind Speed</span>
                </div>
                <div className="text-3xl font-bold text-white">{data?.weather?.wind_speed ?? "--"} m/s</div>
              </div>
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                <div className="flex items-center gap-2 text-sky-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                </div>
                <div className="text-lg font-bold text-white truncate">{data?.weather?.location ?? "Bangkok, TH"}</div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 italic">
              <span>Last updated: {data?.weather?.timestamp ? new Date(data.weather.timestamp).toLocaleTimeString() : "Never"}</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Real-time sync</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Air Quality Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard title="Air Quality" subtitle="IQAir AirVisual API" glow="emerald">
            <div className="mt-6 flex items-center gap-8">
              <div className="flex-1">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-emerald-500"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 * (1 - (data?.aqi?.aqi ?? 0) / 300)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{data?.aqi?.aqi ?? "--"}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">AQI Index</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-2 uppercase tracking-widest">
                    <Activity className="w-3 h-3" /> PM 2.5 Level
                  </div>
                  <div className="text-2xl font-bold text-white">{data?.aqi?.pm25 ?? "--"} <span className="text-sm font-normal text-slate-500">µg/m³</span></div>
                </div>
                {data?.aqi && (() => {
                  const { text, color } = aqiLabel(data.aqi.aqi);
                  return (
                    <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                      <p className={`text-xs text-${color}-400 py-1`}>{text}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-500 italic">
              Last updated: {data?.aqi?.timestamp ? new Date(data.aqi.timestamp).toLocaleTimeString() : "Never"}
            </div>
          </GlassCard>
        </motion.div>

        {/* Solar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard title="Solar Cycle" subtitle="Sunrise-Sunset API" glow="orange">
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500"><Sunrise className="w-6 h-6" /></div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sunrise</div>
                    <div className="text-xl font-bold text-white">{data?.sun?.sunrise ?? "--:--"} AM</div>
                  </div>
                </div>
                <ArrowRight className="text-slate-700 w-6 h-6" />
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sunset</div>
                    <div className="text-xl font-bold text-white">{data?.sun?.sunset ?? "--:--"} PM</div>
                  </div>
                  <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-500"><Sunset className="w-6 h-6" /></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-slate-400">Daylight Duration:</span>
                <span className="text-white font-medium">
                  {data?.sun?.sunrise && data?.sun?.sunset
                    ? daylightDuration(data.sun.sunrise, data.sun.sunset)
                    : "--"}
                </span>
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-500 italic">
              Last updated: {data?.sun?.timestamp ? new Date(data.sun.timestamp).toLocaleTimeString() : "Never"}
            </div>
          </GlassCard>
        </motion.div>

        {/* Lunar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard title="Lunar Metrics" subtitle="Free Astro API" glow="purple">
            <div className="mt-6 flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Phase</div>
                  <div className="text-2xl font-bold text-white capitalize">{data?.moon?.phase ?? "Waning Gibbous"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Illumination</div>
                  <div className="text-2xl font-bold text-white">{illuminationPct ?? "--"}%</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Zodiac Sign</div>
                  <div className="text-xl font-bold text-accent-purple leading-tight">{data?.moon?.zodiac ?? "Pisces"}</div>
                </div>
              </div>

              <div className="w-32 h-32 relative">
                <MoonVisual
                  phase={data?.moon?.phase ?? "Full Moon"}
                  illumination={(data?.moon?.illumination ?? 0)}
                />
              </div>
            </div>
            <div className="mt-6 text-xs text-slate-500 italic">
              Last updated: {data?.moon?.timestamp ? new Date(data.moon.timestamp).toLocaleTimeString() : "Never"}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-center text-slate-600 text-xs">
          All data is synchronized with your local sensor station at 5-minute intervals.
          External API queries are cached to minimize network latency.
        </p>
      </motion.div>
    </div>
  );
}
