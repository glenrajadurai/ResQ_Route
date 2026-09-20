import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ requests, onSelectSOS, onClaimSOS, activeFilter, setActiveFilter }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default Houston disaster area coordinates
      const map = L.map(mapContainerRef.current, {
        center: [29.7604, -95.3698],
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Mode OpenStreetMap Tile Layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map persistent across render cycles
    };
  }, []);

  // Update Markers when requests or active filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    const filteredRequests = requests.filter(r => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'UNCLAIMED') return r.status === 'UNCLAIMED';
      if (activeFilter === 'CLAIMED') return r.status === 'CLAIMED';
      if (activeFilter === 'RESOLVED') return r.status === 'RESOLVED';
      return r.urgency === activeFilter;
    });

    const bounds = [];

    filteredRequests.forEach(req => {
      const lat = req.latitude || 29.7604;
      const lng = req.longitude || -95.3698;
      bounds.push([lat, lng]);

      // Determine marker style & color
      let markerBg = 'bg-red-600';
      let pinBorder = 'border-red-400';
      let isPulse = false;

      if (req.status === 'RESOLVED') {
        markerBg = 'bg-emerald-600';
        pinBorder = 'border-emerald-300';
      } else if (req.urgency === 'CRITICAL') {
        markerBg = 'bg-red-600';
        pinBorder = 'border-red-400';
        isPulse = true;
      } else if (req.urgency === 'HIGH') {
        markerBg = 'bg-orange-500';
        pinBorder = 'border-orange-300';
      } else if (req.urgency === 'MEDIUM') {
        markerBg = 'bg-amber-500';
        pinBorder = 'border-amber-300';
      } else {
        markerBg = 'bg-blue-500';
        pinBorder = 'border-blue-300';
      }

      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${markerBg} border-2 ${pinBorder} shadow-lg flex items-center justify-center text-white text-xs font-black ${isPulse ? 'marker-critical ring-4 ring-red-500/40' : ''}">
            ${req.urgency === 'CRITICAL' ? '🚨' : req.status === 'RESOLVED' ? '✓' : '📍'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create popup content HTML
      const itemsListHtml = (req.items || []).map(item => `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700 mr-1 mb-1">${item}</span>`).join('');

      const popupHtml = `
        <div class="p-1 space-y-2 text-xs font-sans min-w-[240px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
              req.urgency === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
              req.urgency === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
              req.urgency === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-blue-950 text-blue-300 border border-blue-800'
            }">${req.urgency} SOS</span>
            
            <span class="font-bold text-[10px] ${
              req.status === 'RESOLVED' ? 'text-emerald-400' :
              req.status === 'CLAIMED' ? 'text-amber-300' : 'text-orange-400'
            }">${req.status}</span>
          </div>

          <div>
            <p class="font-bold text-slate-100 text-sm mb-0.5">${req.address}</p>
            <p class="text-slate-300 text-xs italic line-clamp-2">"${req.raw_text}"</p>
          </div>

          ${itemsListHtml ? `<div class="pt-1">${itemsListHtml}</div>` : ''}

          <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-400">Victim: ${req.contact_name}</span>
            <button 
              id="claim-btn-${req.id}" 
              class="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-lg text-[11px] shadow transition"
            >
              ${req.status === 'CLAIMED' ? 'View Claimed Details' : 'Claim Emergency'}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`claim-btn-${req.id}`);
          if (btn) {
            btn.onclick = () => {
              onClaimSOS(req);
            };
          }
        }, 100);
      });

      marker.addTo(layerGroup);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [requests, activeFilter]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] bg-slate-950">
      
      {/* Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Urgency Filter Toolbar Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 bg-slate-950/90 p-2 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md max-w-[90vw]">
        {[
          { key: 'ALL', label: 'All Pins' },
          { key: 'CRITICAL', label: '🚨 Critical' },
          { key: 'HIGH', label: '🟧 High' },
          { key: 'MEDIUM', label: '🟨 Medium' },
          { key: 'UNCLAIMED', label: 'Unclaimed' },
          { key: 'CLAIMED', label: 'Claimed' },
          { key: 'RESOLVED', label: '✓ Resolved' },
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeFilter === filter.key
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-4 z-20 hidden sm:flex items-center space-x-3 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md text-[11px] text-slate-300">
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span>Critical</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Medium</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Resolved</span>
        </span>
      </div>

    </div>
  );
}
