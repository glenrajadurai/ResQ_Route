import React from 'react';
import { ShieldAlert, MapPin, Key, RefreshCw, Radio, HeartHandshake, FileText } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  openConfigModal, 
  onSeedData, 
  isSeeding, 
  unclaimedCount 
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Emergency Pulse Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-lg shadow-red-900/30">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ResQ-Route
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60">
                  LIVE SOS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Hyper-Local Disaster Resource Matcher</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Disaster Map</span>
              {unclaimedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-900 text-red-200 border border-red-700">
                  {unclaimedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'submit'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Submit SOS Request</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'volunteer'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Volunteer Feed</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              title="Reset and seed demo SOS dataset"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSeeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Demo Data</span>
            </button>

            <button
              onClick={openConfigModal}
              title="Configure OpenAI API Key"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-slate-950/95 px-2 py-1.5 justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-md text-[11px] font-medium ${
            activeTab === 'dashboard' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          Map
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex flex-col items-center py-1 px-3 rounded-md text-[11px] font-medium ${
            activeTab === 'submit' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-4 h-4 mb-0.5" />
          Submit SOS
        </button>
        <button
          onClick={() => setActiveTab('volunteer')}
          className={`flex flex-col items-center py-1 px-3 rounded-md text-[11px] font-medium ${
            activeTab === 'volunteer' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <HeartHandshake className="w-4 h-4 mb-0.5" />
          Volunteer Feed
        </button>
      </div>
    </header>
  );
}
