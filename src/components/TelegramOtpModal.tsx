import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  X,
  Bot,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Lock,
  MessageSquare,
  Bell,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

export const TelegramOtpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, sendTelegramOtp, updateTelegramChatId, settings } = useWallet();

  const botHandle = settings.otp_telegram_bot_username || '@SRGatewayBot';
  const botCleanHandle = botHandle.replace('@', '');

  const [newChatId, setNewChatId] = useState(currentUser.telegram_chat_id || currentUser.telegram_id || '');
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    if (!newChatId || !newChatId.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a Telegram Chat ID or Username first.' });
      return;
    }
    setStatusMsg(null);
    setIsSending(true);
    try {
      const res = await sendTelegramOtp(newChatId.trim());
      setOtpDispatched(true);
      if (res.telegramSent) {
        setStatusMsg({
          type: 'success',
          text: `✅ OTP delivered directly to Telegram Chat (${newChatId}) via Bot (${botHandle})! Please check your Telegram app.`,
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: res.message || `OTP dispatched to ${newChatId}. Make sure you clicked START on ${botHandle} in Telegram!`,
        });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to request OTP. Please check your connection and try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = updateTelegramChatId(newChatId, otpCode);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-black text-2xl">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Telegram Bot Alerts & OTP</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                1:1 ENCRYPTED
              </span>
            </h3>
            <p className="text-xs text-slate-400">Connect Telegram Chat ID for Live Transaction & Security Alerts</p>
          </div>
        </div>

        {/* Status alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed flex items-start gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Current Linked Status */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Current Account Chat ID</div>
              <div className="font-bold font-mono text-sky-300">
                {currentUser.telegram_chat_id || currentUser.telegram_id || 'Not Connected'}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
            Account: {currentUser.user_custom_id}
          </span>
        </div>

        {/* Strict 1:1 Connection Info Badge */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong>1 Telegram Chat ID = 1 Account Policy:</strong> Each Telegram Chat ID can only be linked to one user account. Attempting to link an already registered ID will be rejected.
          </div>
        </div>

        {/* OTP Dispatched Banner */}
        {otpDispatched && (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <span>OTP DISPATCHED VIA TELEGRAM</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-slate-300">
                  Target Chat: <strong className="text-sky-300 font-mono">{newChatId}</strong>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p>
                Open your Telegram app, copy the 6-digit OTP received from <strong>{botHandle}</strong>, and enter it below to confirm and activate alerts.
              </p>
            </div>

            <a
              href={`https://t.me/${botCleanHandle}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Open Bot in Telegram ({botHandle})</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleVerifyAndConnect} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">New Telegram Chat ID / Username</label>
              <span className="text-[10px] text-sky-400 font-mono">Numeric Chat ID Recommended</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                placeholder="e.g. 6561010416 or @your_username"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSending}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSending ? 'animate-spin' : ''}`} />
                <span>{isSending ? 'Sending...' : 'Send OTP'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              💡 <strong>Step:</strong> Open <strong>{botHandle}</strong> in Telegram and send <strong className="text-emerald-400">/start</strong> first, then click Send OTP.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Enter 6-Digit Telegram OTP Code</label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="Enter 6-Digit OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center font-mono text-lg font-bold text-emerald-400 tracking-widest focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Verify OTP & Connect New Chat ID</span>
          </button>
        </form>

        {/* Telegram Alert Types List */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-sky-400" />
            <span>Automated Telegram Alerts You Will Receive:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Deposit Success & Balance Added</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-rose-400 font-bold">●</span>
              <span>Deposit Rejected Alert</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-indigo-400 font-bold">●</span>
              <span>Withdrawal Request Submitted</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Withdrawal Paid with Bank UTR</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-amber-400 font-bold">●</span>
              <span>Withdrawal Rejected & Refund Alert</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-sky-400 font-bold">●</span>
              <span>User-to-User P2P Transfer (Sent/Received)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="text-teal-400 font-bold">●</span>
              <span>Merchant API Gateway Checkout Order</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-purple-500/30 text-purple-300 flex items-center gap-2 col-span-1 sm:col-span-2">
              <span className="text-purple-400 font-bold">●</span>
              <span><strong>New Login Security Alert:</strong> Real-time alerts with IP Address, Location (City/State), Device Name (OS/Browser) & Login Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
