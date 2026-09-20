import React, { useState } from 'react';
import { Sparkles, Radio, MapPin, AlertTriangle, User, Phone, CheckCircle, Package, HeartPulse, LifeBuoy } from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    label: "🌊 Flood Trap & Insulin",
    text: "URGENT! Water rising fast at 104 Riverside Dr. 2 elderly trapped upstairs. Need insulin and drinking water ASAP!"
  },
  {
    label: "🫁 Asthma Emergency",
    text: "Asthma emergency at 310 Oak Wood Ln. 12yo child having severe breathing difficulty, inhaler lost in floodwater."
  },
  {
    label: "🥫 Shelter Ration Need",
    text: "Evacuees sheltering at Central High Shelter near gym need clean drinking water and non-perishable canned food for 6 people."
  },
  {
    label: "🧑‍🦽 Wheelchair Evac",
    text: "Need evacuation transport at 78 Park Ave. Wheelchair user with leg injury needs ride to regional shelter."
  }
];

export default function SOSForm({ onSOSCreated, apiKey, parserMode = 'RULE_BASED' }) {
  const [rawText, setRawText] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePreset = (templateText) => {
    setRawText(templateText);
    setParsedPreview(null);
    setErrorMsg('');
  };

  const handleAnalyzeAI = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please type or select an emergency SOS message text first.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/parse-sos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText,
          openai_key: apiKey || null,
          parser_mode: parserMode || 'RULE_BASED'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setParsedPreview(data);
      } else {
        setErrorMsg(data.error || 'Failed to analyze text.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API. Please verify backend server is running on http://127.0.0.1:8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitSOS = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMsg('Please provide emergency SOS text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/create-sos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText,
          openai_key: apiKey || null,
          parser_mode: parserMode || 'RULE_BASED',
          contact_name: contactName || 'Disaster Victim',
          contact_phone: contactPhone || ''
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        onSOSCreated(data);
        setRawText('');
        setParsedPreview(null);
        setContactName('');
        setContactPhone('');
      } else {
        setErrorMsg(data.error || 'Failed to submit SOS request.');
      }
    } catch (err) {
      setErrorMsg('Network error submitting SOS request. Please verify backend server is running on http://127.0.0.1:8000.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-950 text-red-400 border-red-800 animate-pulse';
      case 'HIGH': return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MEDIUM': return 'bg-amber-950 text-amber-300 border-amber-800';
      default: return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 p-6 rounded-2xl border border-red-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <LifeBuoy className="w-48 h-48 text-red-500" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 font-heading">
              Natural Language Disaster SOS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Submit Natural Language Assistance Request
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Type anything in plain English (or select a template). Our AI model automatically extracts urgency level, critical items, location coordinates, and plots a red pin on the live emergency map.
          </p>
        </div>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Quick Preset Disaster Scenarios (1-Click Test)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_TEMPLATES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreset(preset.text)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/40 text-xs text-slate-300 transition group"
            >
              <span className="font-bold block text-slate-100 group-hover:text-red-400 transition mb-0.5">
                {preset.label}
              </span>
              <span className="text-slate-400 line-clamp-1">{preset.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SOS Form Input */}
      <form onSubmit={handleSubmitSOS} className="space-y-6">
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Natural Language Request Text</span>
              <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-slate-500">{rawText.length} characters</span>
          </div>

          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              if (parsedPreview) setParsedPreview(null);
            }}
            placeholder="Example: Water rising in my house at 104 Riverside Dr. 2 people trapped on roof. Need rescue boat and diabetic insulin!"
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm leading-relaxed"
          />
        </div>

        {/* Optional Victim Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact Name (Optional)</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sarah Miller"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact Phone (Optional)</span>
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +1 555-0192"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons: Preview AI vs Direct Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleAnalyzeAI}
            disabled={isAnalyzing || !rawText.trim()}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <Sparkles className={`w-4 h-4 text-amber-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing with AI...' : 'Preview AI JSON Extraction'}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !rawText.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-950 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{isSubmitting ? 'Broadcasting SOS...' : 'Broadcast SOS to Live Map'}</span>
          </button>
        </div>

      </form>

      {/* AI Extraction JSON Preview Card */}
      {parsedPreview && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100 font-heading">
                AI Extracted Disaster Intent
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Engine: {parsedPreview.parsed_by || 'ResQ AI'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Urgency */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Urgency Level</span>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getUrgencyBadgeColor(parsedPreview.urgency)}`}>
                {parsedPreview.urgency}
              </span>
            </div>

            {/* Category */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                {parsedPreview.category}
              </span>
            </div>

            {/* Location & Coordinates */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1 text-slate-400">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Geocoded Location</span>
              </span>
              <p className="text-xs font-bold text-slate-200 truncate">{parsedPreview.address}</p>
              <p className="text-[10px] font-mono text-slate-500">
                ({parsedPreview.latitude}, {parsedPreview.longitude})
              </p>
            </div>

          </div>

          {/* Items Extracted */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Extracted Needed Items / Services</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {parsedPreview.items && parsedPreview.items.length > 0 ? (
                parsedPreview.items.map((item, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">General emergency assistance</span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
