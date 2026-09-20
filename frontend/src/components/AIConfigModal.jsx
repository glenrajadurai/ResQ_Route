import React, { useState } from 'react';
import { Key, X, Cpu, Sparkles, ShieldCheck, Check, Zap } from 'lucide-react';

export default function AIConfigModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  setApiKey,
  parserMode,
  setParserMode
}) {
  const [selectedMode, setSelectedMode] = useState(parserMode || 'RULE_BASED');
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setParserMode(selectedMode);
    setApiKey(inputKey.trim());
    localStorage.setItem('resq_parser_mode', selectedMode);
    localStorage.setItem('resq_openai_key', inputKey.trim());
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-heading">
              AI NLP Parsing Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Select OpenAI API model or rule-based parser without any keys
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Engine Selector Radio Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Parsing Engine Selector
            </label>

            <div className="grid grid-cols-1 gap-3">
              
              {/* Option 1: Rule-Based Parser (No Keys) */}
              <div
                onClick={() => setSelectedMode('RULE_BASED')}
                className={`cursor-pointer p-4 rounded-xl border transition flex items-start space-x-3 ${
                  selectedMode === 'RULE_BASED'
                    ? 'bg-amber-950/30 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${selectedMode === 'RULE_BASED' ? 'bg-amber-900/60 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Rule-Based NLP Engine</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      NO API KEY NEEDED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    100% offline heuristic parser. Instantly extracts urgency levels, geocoded coordinates, categories, and requested items via local pattern matching.
                  </p>
                </div>
              </div>

              {/* Option 2: OpenAI API Model */}
              <div
                onClick={() => setSelectedMode('OPENAI')}
                className={`cursor-pointer p-4 rounded-xl border transition flex items-start space-x-3 ${
                  selectedMode === 'OPENAI'
                    ? 'bg-amber-950/30 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${selectedMode === 'OPENAI' ? 'bg-amber-900/60 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">OpenAI API Model (gpt-4o-mini)</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      LLM Powered
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses OpenAI GPT for complex intent extraction. Provide an API key below (or leave blank to use server environment key).
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* OpenAI API Key Input field (if OpenAI mode or optional key) */}
          {selectedMode === 'OPENAI' && (
            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 animate-fade-in">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>OpenAI API Key</span>
                </span>
                <span className="text-[10px] text-slate-500">Optional if server key configured</span>
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          {/* Status Indicator */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Active Engine: <strong className="text-amber-300">{selectedMode === 'RULE_BASED' ? 'Rule-Based Engine (Zero Keys Required)' : 'OpenAI API Model (gpt-4o-mini)'}</strong>
            </span>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Configuration Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
