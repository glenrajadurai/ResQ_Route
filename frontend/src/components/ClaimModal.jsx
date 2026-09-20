import React, { useState } from 'react';
import { HeartHandshake, X, User, Phone, FileText, ShieldAlert } from 'lucide-react';

export default function ClaimModal({ targetSOS, onClose, onSubmitClaim }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetSOS) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitClaim(targetSOS.id, {
      volunteer_name: name || 'Verified Volunteer',
      volunteer_phone: phone || '',
      volunteer_notes: notes || 'Aid dispatched.'
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-heading">
              Claim Disaster Emergency Response
            </h3>
            <p className="text-xs text-slate-400">
              Confirm your assignment to assist this victim.
            </p>
          </div>
        </div>

        {/* SOS Request Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-red-400 uppercase">[{targetSOS.urgency}] {targetSOS.category}</span>
            <span className="text-slate-400 font-mono">ID #{targetSOS.id}</span>
          </div>
          <p className="text-sm font-bold text-slate-100">{targetSOS.address}</p>
          <p className="text-xs text-slate-300 italic">"{targetSOS.raw_text}"</p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Volunteer Name / Organization</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Alex Vance (Red Cross Vol)"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Contact Phone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-9988"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Response Plan / Notes for Victim</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatching boat with 20L drinking water & first aid kit. ETA 15 mins."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950 transition"
            >
              {isSubmitting ? 'Assigning...' : 'Confirm Claim Emergency'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
