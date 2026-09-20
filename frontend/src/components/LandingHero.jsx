import React from 'react';
import { ShieldAlert, MapPin, Radio, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingHero({ onGoToMap, onGoToSubmit, onGoToVolunteer, stats }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80">
      
      {/* Dynamic Background Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.12),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          {/* Disaster Response Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>HYPER-LOCAL DISASTER RESOURCE MATCHER</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white leading-tight">
            Turning Messy Disaster SOS Text into <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">Actionable Live Map Pins</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            During floods and severe storms, life-saving requests get swallowed by chaotic feeds. ResQ-Route uses AI to instantly extract urgency, needed supplies, and location coordinates—connecting victims with nearby verified volunteers.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            
            <button
              onClick={onGoToSubmit}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-red-950 flex items-center justify-center space-x-2 transition"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Submit Emergency SOS Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToMap}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition"
            >
              <MapPin className="w-4 h-4 text-red-400" />
              <span>View Live Map ({stats.unclaimed || 0} Unclaimed)</span>
            </button>

            <button
              onClick={onGoToVolunteer}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition"
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Volunteer Board</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
