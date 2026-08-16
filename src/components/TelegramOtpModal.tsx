import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, Bot, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, Lock, MessageSquare } from 'lucide-react';

export const TelegramOtpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, sendTelegramOtp, verifyTelegramOtp, settings } = useWallet();

  const botHandle = settings.otp_telegram_bot_username || '@PAYZYBOT';
  const botCleanHandle = botHandle.replace('@', '');

  const [telegramHandle, setTelegramHandle] = useState(currentUser.telegram_id || '@rahul_sharma');
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    setStatusMsg(null);
    setIsSending(true);
    try {
      const res = await sendTelegramOtp(telegramHandle);
      setOtpDispatched(true);
      if (res.telegramSent) {
        setStatusMsg({
          type: 'success',
          text: `✅ OTP delivered directly to ${telegramHandle} via Telegram Bot (${botHandle})! Please check your Telegram app.`,
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: res.message || `OTP dispatched to ${telegramHandle}. Open ${botHandle} in Telegram app and click START if you haven't yet!`,
        });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to request OTP. Please check your network and try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = verifyTelegramOtp(otpCode);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Telegram account verified and linked successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-white">
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
              <span>Telegram Bot OTP Integration</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                ENCRYPTED & HARDENED
              </span>
            </h3>
            <p className="text-xs text-slate-400">Official Telegram Authentication Bot ({botHandle})</p>
          </div>
        </div>

        {/* Status alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* HARDENED SECURITY BOX: NO PLAIN-TEXT OTP SHOWN ON WEB */}
        {otpDispatched ? (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <span>OTP DISPATCHED TO TELEGRAM</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-slate-300">
                  Target Handle: <strong className="text-sky-300">{telegramHandle}</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Strict Security Protocol Active</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                For complete account security, verification OTPs are <strong>NEVER displayed on screen</strong>. Open your Telegram app, view the message sent by <strong>{botHandle}</strong>, and enter the 6-digit code below.
              </p>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono">
                💡 Haven't received the code yet? Make sure you searched <strong>{botHandle}</strong> in Telegram and clicked <strong className="text-emerald-400">START</strong>!
              </div>
            </div>

            <a
              href={`https://t.me/${botCleanHandle}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/20 active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Open Telegram Bot ({botHandle})</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  🤖
                </div>
                <div>
                  <div className="text-xs font-bold text-white">SR GATEWAY Telegram Bot</div>
                  <div className="text-[9px] text-emerald-400 font-mono">● Online & Listening</div>
                </div>
              </div>
              <a
                href={`https://t.me/${botCleanHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20"
              >
                <span>Open in Telegram</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                To verify via Telegram, enter your Telegram handle below and click <strong>"Request OTP"</strong>.
              </p>
              <div className="text-center py-3 text-[11px] text-slate-400 font-mono bg-slate-950/60 rounded-xl border border-slate-800">
                🔒 OTP will be sent directly to your Telegram app chat.
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Telegram Username (@handle) ya Numeric Chat ID</label>
              <span className="text-[10px] text-sky-400 font-mono">Chat ID recommended</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="e.g. 5839201948 or @your_username"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSending}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSending ? 'animate-spin' : ''}`} />
                <span>{isSending ? 'Sending...' : 'Request OTP'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              💡 <strong>Zaroori Step:</strong> Pehle Telegram me <strong>{botHandle}</strong> ko khol kar <strong className="text-emerald-400">START</strong> click karein, tabhi Telegram bot aapko message bhej payega.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Enter Received 6-Digit OTP</label>
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
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Verify & Link Telegram Account</span>
          </button>
        </form>
      </div>
    </div>
  );
};
