import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Flame, Volume2, VolumeX, Activity } from 'lucide-react';

export default function AnalyticsBanner({ stats }) {
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const toggleSiren = () => {
    setSirenPlaying(!sirenPlaying);
    if (!sirenPlaying) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.log('Audio Context error', e);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Metric Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center space-x-3 shadow-inner">
            <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800/50">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Critical SOS</p>
              <p className="text-base font-extrabold text-red-400 font-heading">
                {stats.critical_active || 0}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center space-x-3 shadow-inner">
            <div className="p-2 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-800/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unclaimed</p>
              <p className="text-base font-extrabold text-orange-400 font-heading">
                {stats.unclaimed || 0}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center space-x-3 shadow-inner">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Volunteer Claimed</p>
              <p className="text-base font-extrabold text-amber-300 font-heading">
                {stats.claimed || 0}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center space-x-3 shadow-inner">
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved Cases</p>
              <p className="text-base font-extrabold text-emerald-400 font-heading">
                {stats.resolved || 0} <span className="text-xs font-normal text-slate-500">({stats.resolution_rate_percent || 0}%)</span>
              </p>
            </div>
          </div>

        </div>

        {/* Live Audio Siren & Status Ticker */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs">
            <Activity className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span className="font-medium">Live Feed Monitoring Active</span>
          </div>

          <button
            onClick={toggleSiren}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              sirenPlaying 
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/50' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {sirenPlaying ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{sirenPlaying ? 'Alert Tone On' : 'Test Alert Sound'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
