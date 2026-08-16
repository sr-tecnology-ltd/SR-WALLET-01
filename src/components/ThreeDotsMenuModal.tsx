import React from 'react';
import { useWallet } from '../context/WalletContext';
import {
  X,
  LogIn,
  UserPlus,
  Bot,
  Code,
  Gift,
  QrCode,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  FileText,
} from 'lucide-react';

interface ThreeDotsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER' | 'TELEGRAM_OTP') => void;
  onOpenTelegramOtp: () => void;
  onOpenApiSimulator: () => void;
  onOpenDeveloper?: () => void;
  onOpenRewards: () => void;
  onOpenScanPay: () => void;
  onOpenSupport: () => void;
}

export const ThreeDotsMenuModal: React.FC<ThreeDotsMenuProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenTelegramOtp,
  onOpenApiSimulator,
  onOpenDeveloper,
  onOpenRewards,
  onOpenScanPay,
  onOpenSupport,
}) => {
  const {
    currentUser,
    activeRole,
    toggleRoleMode,
    allProfiles,
    switchUser,
    resetDemoData,
    formatINR,
    currentWallet,
  } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
            SR
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">Quick Control Center</h3>
            <p className="text-xs text-slate-400">SR GATEWAY IN • System Features & Account Tools</p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white font-extrabold flex items-center justify-center text-sm shadow">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white text-xs">{currentUser.full_name}</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {currentUser.user_custom_id} • {formatINR(currentWallet.available_balance)}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-1 rounded-full bg-slate-800 text-slate-300 font-bold">
            {currentUser.role}
          </span>
        </div>

        {/* FEATURE CATEGORIES GRID */}
        <div className="space-y-4">
          {/* Section 1: Authentication & Account */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              🔐 Authentication & Accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('LOGIN');
                }}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="h-4 w-4 text-indigo-400" />
                  <div>
                    <div className="font-bold text-xs text-white">Login</div>
                    <div className="text-[9px] text-slate-400">Existing User</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('REGISTER');
                }}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-xs text-white">Register</div>
                    <div className="text-[9px] text-emerald-400 font-bold">+ ₹100 Bonus</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>
            </div>
          </div>

          {/* Section 2: Integrations & Telegram Bot */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              🤖 Telegram Bot & API Gateway
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenTelegramOtp();
                }}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Telegram Bot OTP Verification</div>
                    <div className="text-[10px] text-slate-400">
                      Connect Telegram (@SRGatewayINBot) for passwordless OTP logins
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenApiSimulator();
                }}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Code className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">API Transaction System / Merchant Gateway</div>
                    <div className="text-[10px] text-slate-400">
                      Simulate Merchant API Payment Checkout & Webhook Callbacks
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenDeveloper?.();
                }}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Developer REST API & Secret Keys</div>
                    <div className="text-[10px] text-slate-400">
                      Manage Secret API Tokens, Webhooks & REST API Tester
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>
            </div>
          </div>

          {/* Section 3: Rewards & Quick Transfers */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              🎁 Utilities & Rewards
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenRewards();
                }}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-xs text-white">Daily Rewards</div>
                    <div className="text-[9px] text-slate-400">Scratch & Win</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenScanPay();
                }}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="h-4 w-4 text-indigo-400" />
                  <div>
                    <div className="font-bold text-xs text-white">Scan & Pay</div>
                    <div className="text-[9px] text-slate-400">QR Payment</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
              </button>
            </div>
          </div>

          {/* Section 4: Demo Account Switcher */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              👥 Account Switcher
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Demo User Switcher</div>
              <div className="grid grid-cols-3 gap-1.5">
                {allProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      onClose();
                    }}
                    className={`p-2 rounded-xl text-left text-[11px] font-bold transition border ${
                      p.id === currentUser.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{p.full_name}</div>
                    <div className="text-[9px] font-mono opacity-70">{p.user_custom_id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
            className="text-slate-400 hover:text-sky-400 transition flex items-center gap-1.5 font-bold"
          >
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>24/7 Telegram Support</span>
          </button>
          <span className="text-[10px] text-slate-600 font-mono">SR GATEWAY v3.2</span>
        </div>
      </div>
    </div>
  );
};
