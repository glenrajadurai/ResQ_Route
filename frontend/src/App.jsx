import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AnalyticsBanner from './components/AnalyticsBanner';
import LandingHero from './components/LandingHero';
import MapView from './components/MapView';
import SOSForm from './components/SOSForm';
import VolunteerFeed from './components/VolunteerFeed';
import ClaimModal from './components/ClaimModal';
import AIConfigModal from './components/AIConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'submit', 'volunteer'
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total_sos: 0,
    critical_active: 0,
    high_active: 0,
    unclaimed: 0,
    claimed: 0,
    in_progress: 0,
    resolved: 0,
    resolution_rate_percent: 0
  });

  const [activeMapFilter, setActiveMapFilter] = useState('ALL');
  const [selectedSOSForClaim, setSelectedSOSForClaim] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('resq_openai_key') || '');
  const [parserMode, setParserMode] = useState(() => localStorage.getItem('resq_parser_mode') || 'RULE_BASED');
  const [isSeeding, setIsSeeding] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Fetch Requests and Stats from Django API
  const fetchData = async () => {
    try {
      const [reqRes, statsRes] = await Promise.all([
        fetch('/api/requests/'),
        fetch('/api/stats/')
      ]);
      
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error("Error connecting to backend API", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s for live feel
    return () => clearInterval(interval);
  }, []);

  // Toast Notification helper
  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Seed Demo Data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed/', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        showToast('Successfully seeded realistic disaster SOS dataset!');
      }
    } catch (e) {
      showToast('Error seeding demo dataset.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Callback when new SOS is created via SOSForm
  const handleSOSCreated = (newSOS) => {
    setRequests(prev => [newSOS, ...prev]);
    fetchData();
    showToast(`🚨 New SOS Broadcast created at ${newSOS.address}!`);
    setActiveTab('dashboard');
  };

  // Claim SOS submit
  const handleClaimSubmit = async (sosId, volunteerData) => {
    try {
      const res = await fetch(`/api/requests/${sosId}/claim/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerData)
      });
      if (res.ok) {
        await fetchData();
        showToast('Emergency claimed! Volunteer response assigned.');
      }
    } catch (e) {
      showToast('Failed to claim emergency.');
    }
  };

  // Update Status (e.g. RESOLVED)
  const handleUpdateStatus = async (sosId, newStatus) => {
    try {
      const res = await fetch(`/api/requests/${sosId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
        showToast('Emergency status updated to Resolved!');
      }
    } catch (e) {
      showToast('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-red-400 text-xs font-bold animate-bounce flex items-center space-x-2">
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openConfigModal={() => setIsConfigOpen(true)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
        unclaimedCount={stats.unclaimed || 0}
      />

      {/* Analytics Metric Bar */}
      <AnalyticsBanner stats={stats} />

      {/* Main Tab Routing Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <div>
            <LandingHero
              onGoToMap={() => setActiveTab('dashboard')}
              onGoToSubmit={() => setActiveTab('submit')}
              onGoToVolunteer={() => setActiveTab('volunteer')}
              stats={stats}
            />
            <div className="p-2 sm:p-4">
              <MapView
                requests={requests}
                onSelectSOS={(sos) => setSelectedSOSForClaim(sos)}
                onClaimSOS={(sos) => setSelectedSOSForClaim(sos)}
                activeFilter={activeMapFilter}
                setActiveFilter={setActiveMapFilter}
              />
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <SOSForm
            onSOSCreated={handleSOSCreated}
            apiKey={apiKey}
            parserMode={parserMode}
          />
        )}

        {activeTab === 'volunteer' && (
          <VolunteerFeed
            requests={requests}
            onClaimSOS={(sos) => setSelectedSOSForClaim(sos)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Modals */}
      <ClaimModal
        targetSOS={selectedSOSForClaim}
        onClose={() => setSelectedSOSForClaim(null)}
        onSubmitClaim={handleClaimSubmit}
      />

      <AIConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        parserMode={parserMode}
        setParserMode={setParserMode}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ResQ-Route • Hyper-Local Disaster Resource Matcher</p>
          <p className="text-[11px] text-slate-400">Powered by Django + React + Tailwind CSS + OpenStreetMap Leaflet + OpenAI NLP</p>
        </div>
      </footer>

    </div>
  );
}
