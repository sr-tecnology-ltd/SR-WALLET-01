import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  ShieldCheck,
  Bell,
  Eye,
  EyeOff,
  UserCheck,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Menu,
  User,
  LogIn,
  UserPlus,
  Bot,
  Code,
  Gift,
  QrCode,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { TelegramOtpModal } from './TelegramOtpModal';
import { MerchantGatewaySimulatorModal } from './MerchantGatewaySimulatorModal';
import { RewardsModal } from './RewardsModal';
import { ScanPayModal } from './ScanPayModal';
import { ThreeDotsMenuModal } from './ThreeDotsMenuModal';

export const Header: React.FC<{
  onOpenTelegram: () => void;
  onOpen3DotsMenu?: () => void;
  onOpenAuthModal?: (mode: 'LOGIN' | 'REGISTER' | 'TELEGRAM_OTP') => void;
  onOpenTelegramOtp?: () => void;
  onOpenApiSimulator?: () => void;
  onOpenRewards?: () => void;
  onOpenScanPay?: () => void;
  onOpenProfile?: () => void;
}> = ({
  onOpenTelegram,
  onOpen3DotsMenu,
  onOpenAuthModal,
  onOpenTelegramOtp,
  onOpenApiSimulator,
  onOpenRewards,
  onOpenScanPay,
  onOpenProfile,
}) => {
  const {
    currentUser,
    activeRole,
    switchUser,
    toggleRoleMode,
    allProfiles,
    currentWallet,
    formatINR,
    notifications,
    markNotificationRead,
    clearNotifications,
    resetDemoData,
    settings,
  } = useWallet();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Modals state
  const [show3DotsMenu, setShow3DotsMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'TELEGRAM_OTP'>('LOGIN');
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showApiSimulatorModal, setShowApiSimulatorModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showScanPayModal, setShowScanPayModal] = useState(false);

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
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">
                SR GATEWAY <span className="text-emerald-400 font-mono">IN</span>
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  activeRole === 'ADMIN'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
            title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
          >
            {isBalanceVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin / User Role Switch Pill */}
          <button
            onClick={toggleRoleMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-md active:scale-95 ${
              activeRole === 'ADMIN'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/20'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/25'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{activeRole === 'ADMIN' ? 'Switch to User View' : 'Admin Panel'}</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-full transition text-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono text-[10px] font-bold">
                {currentUser.full_name.charAt(0)}
              </div>
              <span className="hidden lg:inline max-w-[90px] truncate">{currentUser.full_name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-slate-400 text-[10px]">Active Demo Account</div>
                  <div className="font-bold text-white text-xs">{currentUser.full_name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">{currentUser.user_custom_id} • {currentUser.role}</div>
                </div>

                <div className="text-[10px] text-slate-500 font-bold px-3 py-1 uppercase tracking-wider">
                  Switch Account
                </div>

                {allProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                      p.id === currentUser.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{p.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.user_custom_id} ({p.role})</div>
                    </div>
                    {p.id === currentUser.id && <UserCheck className="h-4 w-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition relative"
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
                      className="text-[10px] text-slate-400 hover:text-rose-400 transition"
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

          {/* Reset Demo Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition"
            title="Reset Seed Data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* 3-LINES OPTIONS MENU BUTTON */}
          <button
            onClick={() => (onOpen3DotsMenu ? onOpen3DotsMenu() : setShow3DotsMenu(true))}
            className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-600/30 transition active:scale-95 border border-indigo-400/30"
            title="Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Fallback Modals (Only rendered if onOpen3DotsMenu is not provided) */}
      {!onOpen3DotsMenu && (
        <>
          <ThreeDotsMenuModal
            isOpen={show3DotsMenu}
            onClose={() => setShow3DotsMenu(false)}
            onOpenAuth={(mode) => {
              if (onOpenAuthModal) onOpenAuthModal(mode);
              else {
                setAuthMode(mode);
                setShowAuthModal(true);
              }
            }}
            onOpenTelegramOtp={() => (onOpenTelegramOtp ? onOpenTelegramOtp() : setShowTelegramModal(true))}
            onOpenApiSimulator={() => (onOpenApiSimulator ? onOpenApiSimulator() : setShowApiSimulatorModal(true))}
            onOpenRewards={() => (onOpenRewards ? onOpenRewards() : setShowRewardsModal(true))}
            onOpenScanPay={() => (onOpenScanPay ? onOpenScanPay() : setShowScanPayModal(true))}
            onOpenSupport={onOpenTelegram}
          />

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode={authMode}
          />

          <TelegramOtpModal
            isOpen={showTelegramModal}
            onClose={() => setShowTelegramModal(false)}
          />

          <MerchantGatewaySimulatorModal
            isOpen={showApiSimulatorModal}
            onClose={() => setShowApiSimulatorModal(false)}
          />

          <RewardsModal
            isOpen={showRewardsModal}
            onClose={() => setShowRewardsModal(false)}
          />

          <ScanPayModal
            isOpen={showScanPayModal}
            onClose={() => setShowScanPayModal(false)}
          />
        </>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-base text-white">Reset Application Data?</h3>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore all wallet balances, deposit requests, withdrawals, and system settings back to original SR GATEWAY IN defaults.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/20"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
