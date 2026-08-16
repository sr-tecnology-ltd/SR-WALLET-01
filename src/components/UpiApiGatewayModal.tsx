import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  X,
  Zap,
  Send,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  Radio,
} from 'lucide-react';

interface UpiApiGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpiApiGatewayModal: React.FC<UpiApiGatewayModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(settings.telegram_channel_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">UPI API Gateway</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 animate-pulse text-amber-400" />
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-400">SR GATEWAY IN • Next-Gen Merchant UPI Integration</p>
          </div>
        </div>

        {/* Coming Soon Hero Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-900 border border-indigo-500/30 text-center space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Clock className="h-7 w-7 text-indigo-300 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-black text-white tracking-wide">
              Coming Soon UPI API System
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Our automated high-speed UPI merchant gateway is currently under final testing and compliance rollout.
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Official announcements & live release dates will be posted on Telegram!</span>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Planned System Highlights
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>0% Zero Gateway Surcharge</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300">
              <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Instant QR & Dynamic UPI Intent</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300">
              <Radio className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Real-Time Server Webhook Callbacks</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300">
              <ExternalLink className="h-4 w-4 text-purple-400 shrink-0" />
              <span>RESTful API & Ready Code SDKs</span>
            </div>
          </div>
        </div>

        {/* Telegram Channel CTA Box */}
        <div className="p-4 bg-slate-950 border border-sky-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Official Telegram Channel</div>
                <div className="text-[10px] text-sky-400 font-mono">{settings.telegram_channel_name}</div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-1 text-[11px]"
              title="Copy Link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Join our official channel for launch dates, merchant onboarding updates, and API documentation announcements.
          </p>

          <a
            href={settings.telegram_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition cursor-pointer text-center"
          >
            <Send className="h-4 w-4" />
            <span>Join Official Telegram Channel</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
