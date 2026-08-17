import React from 'react';
import { useWallet } from '../context/WalletContext';
import {
  X,
  Bot,
  Zap,
  KeyRound,
  MessageSquare,
  ChevronRight,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ThreeDotsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTelegramOtp: () => void;
  onOpenUpiApiGateway?: () => void;
  onOpenDeveloper?: () => void;
  onOpenSupport: () => void;
}

export const ThreeDotsMenuModal: React.FC<ThreeDotsMenuProps> = ({
  isOpen,
  onClose,
  onOpenTelegramOtp,
  onOpenUpiApiGateway,
  onOpenDeveloper,
  onOpenSupport,
}) => {
  const {
    currentUser,
    formatINR,
    currentWallet,
    settings,
    logoutUser,
  } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
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
            <h3 className="text-lg font-black tracking-tight text-white">Menu & Services</h3>
            <p className="text-xs text-slate-400">SR GATEWAY IN • System Features</p>
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

        {/* System Services List */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            ⚡ Quick Actions & Tools
          </div>

          {/* UPI API Gateway Coming Soon Trigger */}
          <button
            onClick={() => {
              onClose();
              if (onOpenUpiApiGateway) onOpenUpiApiGateway();
            }}
            className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Zap className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-2">
                  <span>UPI API Gateway</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    COMING SOON
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Instant Merchant UPI API Integration & Webhooks
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
          </button>

          {/* Telegram Bot OTP */}
          <button
            onClick={() => {
              onClose();
              onOpenTelegramOtp();
            }}
            className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Telegram Bot OTP Verification</div>
                <div className="text-[10px] text-slate-400">
                  Connect Telegram (@SRGatewayINBot) for passwordless OTP
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
          </button>

          {/* Developer REST API */}
          <button
            onClick={() => {
              onClose();
              onOpenDeveloper?.();
            }}
            className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Devloper api setting</div>
                <div className="text-[10px] text-slate-400">
                  Manage Secret API Tokens, Webhooks & REST API
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
          </button>

          {/* Official Channel */}
          <a
            href={settings.telegram_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Official Telegram Channel</div>
                <div className="text-[10px] text-sky-400 font-mono">
                  {settings.telegram_channel_name}
                </div>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-white transition" />
          </a>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
            className="text-slate-400 hover:text-sky-400 transition flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>24/7 Support</span>
          </button>

          <button
            onClick={() => {
              onClose();
              logoutUser();
            }}
            className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 font-bold cursor-pointer px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20"
          >
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
