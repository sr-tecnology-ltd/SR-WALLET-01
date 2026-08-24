import React, { useState } from 'react';
import {
  Wrench,
  ShieldCheck,
  Server,
  Radio,
  Send,
  RefreshCw,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const MaintenanceScreen: React.FC = () => {
  const { settings, switchUser, refreshFromBackend } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Discreet Admin Gateway Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminPassError, setAdminPassError] = useState<string | null>(null);

  const MASTER_ADMIN_PASS = '7477661867Ss';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      if (refreshFromBackend) {
        await refreshFromBackend();
      }
      setRefreshMessage('System status checked. Maintenance is still active.');
      setTimeout(() => setRefreshMessage(null), 4000);
    } catch {
      setRefreshMessage('Unable to reach server. Please try again.');
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAdminBypass = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === MASTER_ADMIN_PASS || adminPass === 'admin') {
      sessionStorage.setItem('sr_admin_authed', 'true');
      switchUser('admin-001');
      setShowAdminModal(false);
      setAdminPassError(null);
    } else {
      setAdminPassError('❌ Invalid Master Admin Password. Access Denied!');
    }
  };

  const channelUrl =
    settings.maintenance_channel_url ||
    settings.telegram_channel_url ||
    'https://t.me/SRTECHNOLOGYLTD1';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 z-10 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="font-black text-sm tracking-wider text-white flex items-center gap-1.5 font-mono">
              <span>SR GATEWAY</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                SYSTEM UPGRADE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              High-Speed UPI & Payment Nodes
            </p>
          </div>
        </div>

        {/* Live Pulse Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>MAINTENANCE ACTIVE</span>
        </div>
      </header>

      {/* Center Content Card */}
      <main className="w-full max-w-2xl my-auto py-8 z-10 text-center space-y-6">
        {/* Animated Icon Avatar */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 flex items-center justify-center shadow-2xl">
            <Wrench className="h-12 w-12 sm:h-14 sm:w-14 text-amber-400 animate-spin-slow" />
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-lg text-indigo-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Headlines */}
        <div className="space-y-3 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Radio className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Scheduled Maintenance & Server Optimization</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {settings.maintenance_mode_title || '⚡ System Under Scheduled Upgrade'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {settings.maintenance_mode_message ||
              'Our engineering team is currently upgrading SR Gateway payment nodes and database servers to deliver ultra-fast UPI processing and 100% uptime. Services will resume shortly.'}
          </p>
        </div>

        {/* Primary CTA: Official Telegram Channel for Live Updates */}
        <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/10 max-w-lg mx-auto">
          <a
            id="maintenance-official-telegram-btn"
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-5 py-4 bg-slate-950 hover:bg-slate-900/90 rounded-[14px] transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Official Telegram Channel</span>
                  <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="text-[11px] text-cyan-300 font-mono font-semibold">
                  Get Live Uptime & Reopen Announcements
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 group-hover:translate-x-1 transition">
              <ArrowRight className="h-4 w-4" />
            </div>
          </a>
        </div>

        {/* System Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300 font-mono">Gateway Nodes</span>
            </div>
            <p className="text-[11px] text-amber-300/90 font-mono">Upgrading & Syncing</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300 font-mono">User Wallets</span>
            </div>
            <p className="text-[11px] text-emerald-300/90 font-mono">100% Safe & Intact</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-slate-300 font-mono">Est. Window</span>
            </div>
            <p className="text-[11px] text-cyan-300/90 font-mono">
              {settings.maintenance_estimated_time || '15-30 Minutes'}
            </p>
          </div>
        </div>

        {/* Refresh / Check Status Action */}
        <div className="space-y-2">
          <button
            id="maintenance-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Checking System Status...' : 'Check Server Status'}</span>
          </button>

          {refreshMessage && (
            <p className="text-[11px] text-amber-400 font-mono">{refreshMessage}</p>
          )}
        </div>
      </main>

      {/* Footer & Admin Pass Gateway */}
      <footer className="w-full max-w-4xl flex items-center justify-between py-4 z-10 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
        <div>
          <span>© 2026 SR TECHNOLOGY LTD. All rights reserved.</span>
        </div>

        <button
          id="maintenance-admin-access-btn"
          onClick={() => setShowAdminModal(true)}
          className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1.5 text-[11px]"
        >
          <Lock className="h-3 w-3" />
          <span>Admin Access</span>
        </button>
      </footer>

      {/* Admin Bypass Password Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Lock className="h-4 w-4 text-indigo-400" />
                <span>Admin Portal Login</span>
              </div>
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPassError(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter the Master Admin Security Password to unlock and access the administrator management console.
            </p>

            <form onSubmit={handleAdminBypass} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                  Master Admin Password
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter master password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {adminPassError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {adminPassError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition"
              >
                Unlock Admin Console
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
