import React, { useState } from 'react';
import { Search, HeartHandshake, MapPin, Phone, CheckCircle, Clock, Navigation, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

export default function VolunteerFeed({ requests, onClaimSOS, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.raw_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.items && req.items.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || req.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">🚨 CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-950 text-orange-400 border border-orange-800">🟧 HIGH URGENCY</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">🟨 MEDIUM</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">🟦 LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1"><CheckCircle className="w-3 h-3"/><span>Resolved</span></span>;
      case 'CLAIMED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center space-x-1"><Clock className="w-3 h-3"/><span>Claimed</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950/60 text-red-300 border border-red-800/80">Needs Volunteer</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white font-heading">
              Verified Volunteer Response Board
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of disaster SOS calls parsed by AI. Claim emergencies, navigate directly to victims, and log delivered aid.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search location, item (e.g. insulin, boat)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 font-semibold self-center mr-1">Status:</span>
          {['ALL', 'UNCLAIMED', 'CLAIMED', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 font-semibold self-center mr-1">Urgency:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(urg => (
            <button
              key={urg}
              onClick={() => setUrgencyFilter(urg)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                urgencyFilter === urg
                  ? 'bg-orange-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>

      </div>

      {/* SOS Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No matching SOS calls found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filter selections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map(req => (
            <div 
              key={req.id} 
              className={`bg-slate-900/90 rounded-2xl border ${
                req.urgency === 'CRITICAL' ? 'border-red-600/60 shadow-lg shadow-red-950/40' :
                req.urgency === 'HIGH' ? 'border-orange-600/40' : 'border-slate-800'
              } p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getUrgencyBadge(req.urgency)}
                  {getStatusBadge(req.status)}
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-heading leading-tight">{req.address}</h4>
                    <p className="text-[11px] text-slate-400">Victim: {req.contact_name}</p>
                  </div>
                </div>

                {/* Raw Message Snippet */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{req.raw_text}"
                  </p>
                </div>

                {/* Items Needed Tags */}
                {req.items && req.items.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Items Needed</span>
                    <div className="flex flex-wrap gap-1">
                      {req.items.map((item, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteer Claim Information (If already claimed) */}
                {req.status === 'CLAIMED' && req.volunteer_name && (
                  <div className="bg-amber-950/40 border border-amber-800/50 p-3 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Claimed by: {req.volunteer_name}</span>
                    </div>
                    {req.volunteer_notes && (
                      <p className="text-[11px] text-slate-300 italic">"{req.volunteer_notes}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                
                {/* Navigation Button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition border border-slate-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Directions</span>
                </a>

                {/* Phone Button */}
                {req.contact_phone && (
                  <a
                    href={`tel:${req.contact_phone}`}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call</span>
                  </a>
                )}

                {/* Claim / Resolve Button */}
                {req.status === 'UNCLAIMED' ? (
                  <button
                    onClick={() => onClaimSOS(req)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-red-950 transition"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Claim Emergency</span>
                  </button>
                ) : req.status === 'CLAIMED' ? (
                  <button
                    onClick={() => onUpdateStatus(req.id, 'RESOLVED')}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Aid Delivered & Resolved</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
                    ✓ Delivered & Resolved
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
