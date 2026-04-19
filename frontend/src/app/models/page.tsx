"use client";

import { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/GlassCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { 
  CheckCircle2, 
  Trophy,
  Database
} from "lucide-react";
import { motion } from "framer-motion";

export default function ModelComparison() {
  const [modelMetrics, setModelMetrics] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("http://localhost:8001/model-comparison");
        if (res.ok) {
          const json = await res.json();
          // Backend already orders by MAE ASC — no extra sorting needed
          setModelMetrics(json.map((m: any) => ({
            name: m.model_name,
            mae: m.mae,
            rmse: m.rmse,
          })));
        }
      } catch (e) {
        setModelMetrics([]);
      }
    };

    const fetchFeatures = async () => {
      try {
        const res = await fetch("http://localhost:8001/feature-importance");
        if (res.ok) {
          const json = await res.json();
          setFeatureImportance(json.map((f: any) => ({
            name: f.feature,
            score: f.importance
          })));
        }
      } catch (e) {
        setFeatureImportance([]);
      }
    };

    fetchModels();
    fetchFeatures();
  }, []);

  // Derived dynamically — the model with lowest MAE wins
  const bestModel = useMemo(() => {
    if (!modelMetrics.length) return null;
    return modelMetrics.reduce((b, m) => (m.mae < b.mae ? m : b), modelMetrics[0]);
  }, [modelMetrics]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Model Comparison</h1>
        <p className="text-slate-400">
          KNN, Decision Tree and XGBoost benchmarked on real sleep data.{" "}
          {bestModel && (
            <span className="text-accent-purple font-semibold">{bestModel.name} leads with MAE {bestModel.mae}.</span>
          )}
        </p>
      </header>

      {/* Model Cards */}
      <div className={`grid grid-cols-1 gap-6 ${modelMetrics.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
        {modelMetrics.map((model, idx) => {
          const isBest = bestModel?.name === model.name;
          return (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className={`text-center p-8 relative ${isBest ? "ring-1 ring-accent-purple/40" : ""}`} glow={isBest ? "purple" : "none"}>
                {isBest && (
                  <div className="absolute top-4 right-4">
                    <Trophy className="w-4 h-4 text-accent-purple" />
                  </div>
                )}
                <p className="text-slate-400 text-sm mb-3">{model.name}</p>
                <h2 className="text-3xl font-bold text-white mb-1 font-mono">{model.mae}</h2>
                <p className="text-xs text-slate-500 font-medium mb-1">MAE (lower = better)</p>
                <p className="text-xs text-slate-600 font-mono">RMSE {model.rmse}</p>
                {isBest && (
                  <div className="mt-4 py-1 px-3 bg-accent-purple/10 border border-accent-purple/20 rounded-full text-[10px] text-accent-purple font-bold uppercase tracking-wider inline-block">
                    Best Performer
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Error Metrics Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard title="Error Metrics Comparison" subtitle="MAE vs RMSE — lower is better">
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #ffffff20" }} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="mae" name="MAE" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rmse" name="RMSE" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Feature Importance */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard title="XGBoost Feature Importance" subtitle="Which sensor factor drives sleep quality prediction" glow="purple">
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => v.toFixed(2)} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #ffffff20" }}
                    formatter={(v: any) => [v.toFixed(4), "Importance"]}
                  />
                  <Bar dataKey="score" name="Importance" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.12} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Detailed Table — no fake training time */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard title="Detailed Performance Data" subtitle="All metrics computed on real sleep logs from the database">
          {modelMetrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Database className="w-10 h-10 mb-4 opacity-30" />
              <p className="text-sm">No model metrics found. Run <code className="bg-white/5 px-2 py-0.5 rounded text-slate-300">python3 calculate_metrics.py</code> to compute them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-white/5">
                    <th className="pb-4 font-medium">Rank</th>
                    <th className="pb-4 font-medium">Model</th>
                    <th className="pb-4 font-medium">MAE ↑</th>
                    <th className="pb-4 font-medium">RMSE</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {modelMetrics.map((model, idx) => (
                    <tr key={model.name} className="border-b border-white/5 last:border-0">
                      <td className="py-4 text-slate-500 font-mono text-sm">#{idx + 1}</td>
                      <td className="py-4 text-white font-semibold flex items-center gap-2">
                        {model.name}
                        {bestModel?.name === model.name && (
                          <span className="text-[10px] bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full font-bold uppercase">Best</span>
                        )}
                      </td>
                      <td className="py-4 font-mono">{model.mae}</td>
                      <td className="py-4 font-mono">{model.rmse}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs uppercase font-bold tracking-tight text-emerald-400/80">Trained</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
