"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Activity, Sun, BatteryCharging, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center -m-4 lg:-m-8 pb-12">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#020617]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-cyan/20 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="w-20 h-20 bg-accent-purple/20 rounded-3xl flex items-center justify-center mb-8 border border-accent-purple/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          <Moon className="w-10 h-10 text-accent-purple" />
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Somnus Analytics
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          An advanced data analytics platform for indirect sleep quality estimation. 
          We combine IoT sensor data, self-reported metrics, and external APIs to uncover the real factors affecting your rest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-accent-purple rounded-full hover:bg-accent-purple/90 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-accent-purple/30 transition-colors">
            <Activity className="w-8 h-8 text-accent-cyan mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">IoT Sensors</h3>
            <p className="text-slate-400 text-sm">
              Continuous monitoring of environmental variables including noise peaks, vibration frequency, light exposure, and PM2.5 levels throughout the night.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-accent-purple/30 transition-colors">
            <BatteryCharging className="w-8 h-8 text-accent-purple mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Self-Reported Data</h3>
            <p className="text-slate-400 text-sm">
              Daily logs of sleep duration, subjective sleep quality, and morning mood scores integrated seamlessly via Google Forms.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-accent-purple/30 transition-colors">
            <Sun className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Machine Learning</h3>
            <p className="text-slate-400 text-sm">
              Advanced predictive modeling using XGBoost, Decision Trees, and KNN to correlate environmental disturbances with your overall rest quality.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
