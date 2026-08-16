import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  ShieldCheck,
  Bell,
  Eye,
  EyeOff,
  Menu,
  User,
} from 'lucide-react';

export const Header: React.FC<{
  onOpenTelegram: () => void;
  onOpen3DotsMenu?: () => void;
  onOpenProfile?: () => void;
}> = ({
  onOpenTelegram,
  onOpen3DotsMenu,
  onOpenProfile,
}) => {
  const {
    currentUser,
    activeRole,
    toggleRoleMode,
    currentWallet,
    formatINR,
    notifications,
    markNotificationRead,
    clearNotifications,
  } = useWallet();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter((n) => n.user_id === currentUser.id && !n.read);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            SR
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SR GATEWAY
              </span>
              <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                IN
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  activeRole === 'ADMIN'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {activeRole === 'ADMIN' ? '🛡️ Super Admin' : 'VPA Gateway'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Internal Wallet & Ledger Platform
            </p>
          </div>
        </div>

        {/* Center Wallet Balance Pill (User View) */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="text-slate-400 font-mono text-[11px]">Wallet Balance:</span>
            <span className="font-black text-sm text-emerald-400 font-mono tracking-tight">
              {isBalanceVisible ? formatINR(currentWallet.available_balance) : '••••••••'}
            </span>
          </div>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 cursor-pointer"
            title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
          >
            {isBalanceVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Show Exit Admin Button ONLY when currently in Admin Portal */}
          {activeRole === 'ADMIN' && (
            <button
              onClick={toggleRoleMode}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-md active:scale-95 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/20 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Exit Admin Portal</span>
            </button>
          )}

          {/* User Identifier Tag (Simple, clean, no switcher) */}
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-full transition text-slate-200 cursor-pointer"
            title="User Profile"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono text-[10px] font-bold">
              {currentUser.full_name.charAt(0)}
            </div>
            <span className="hidden lg:inline max-w-[90px] truncate">{currentUser.full_name}</span>
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-indigo-400" />
                    <span>Notifications Center</span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 scrollbar-thin">
                  {notifications.filter((n) => n.user_id === currentUser.id).length === 0 ? (
                    <p className="text-center text-slate-500 py-6 text-xs">No notifications yet.</p>
                  ) : (
                    notifications
                      .filter((n) => n.user_id === currentUser.id)
                      .map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            n.read
                              ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                              : 'bg-indigo-950/40 border-indigo-500/30 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-slate-200">{n.title}</div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="p-2 text-emerald-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 rounded-full transition cursor-pointer"
              title="User Profile"
            >
              <User className="h-4 w-4" />
            </button>
          )}

          {/* 3-LINES OPTIONS MENU BUTTON */}
          <button
            onClick={() => onOpen3DotsMenu && onOpen3DotsMenu()}
            className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-600/30 transition active:scale-95 border border-indigo-400/30 cursor-pointer"
            title="Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
