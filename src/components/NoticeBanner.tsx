import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Megaphone, ExternalLink, Zap } from 'lucide-react';

export const NoticeBanner: React.FC<{ onDepositClick: () => void }> = ({ onDepositClick }) => {
  const { settings } = useWallet();

  if (!settings.notice_banner_enabled) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 z-10">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl shrink-0">
          <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-white">{settings.notice_banner_title}</h4>
            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
              LIVE NOTICE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
            {settings.notice_banner_message}
          </p>
        </div>
      </div>

      <div className="shrink-0 z-10 flex items-center gap-2">
        <button
          onClick={onDepositClick}
          className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>{settings.notice_banner_button_text}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
