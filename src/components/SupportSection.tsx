import React from 'react';
import { useWallet } from '../context/WalletContext';
import { MessageSquare, ExternalLink, ShieldCheck, HelpCircle, PhoneCall, Mail } from 'lucide-react';

export const SupportSection: React.FC = () => {
  const { settings } = useWallet();

  const botHandle = settings.support_telegram_bot_username || '@SRGateway_Support_Bot';
  const botCleanHandle = botHandle.startsWith('@') ? botHandle : `@${botHandle}`;
  const supportBotUrl = `https://t.me/${botCleanHandle.replace('@', '')}`;

  return (
    <div className="space-y-6 text-slate-100 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center mx-auto text-2xl">
          <MessageSquare className="h-8 w-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-white">24/7 Support Bot & Official Telegram</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Need assistance with deposit verification, UTR check, or payout status? Click below to immediately chat with our active 24/7 Support Bot on Telegram.
        </p>

        {/* Highlighted 24/7 Support Bot Action Box */}
        <div className="bg-slate-950/80 border border-indigo-500/40 rounded-3xl p-5 max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
              24/7 Support Bot Online
            </span>
          </div>
          <div className="text-sm font-black text-indigo-300 font-mono">
            Bot Username: {botCleanHandle}
          </div>
          <a
            href={supportBotUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/30 active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open 24/7 Support Bot ({botCleanHandle})</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {settings.telegram_channel_enabled && (
            <a
              href={settings.telegram_channel_url}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 transition shadow-lg shadow-blue-600/30 active:scale-95"
            >
              <span>Official Channel ({settings.telegram_channel_name})</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <a
            href={settings.support_url || supportBotUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 transition active:scale-95"
          >
            <span>Direct Admin Link</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 text-xs">
          {[
            {
              q: 'How long does deposit verification take?',
              a: 'All manual UPI & Bank transfers are verified by SR Gateway Admin within 2 to 5 minutes after submitting your UTR number.',
            },
            {
              q: 'What should I do if my deposit is rejected?',
              a: 'Check the rejection reason listed in your Deposit History. Ensure you copied the exact 12-digit bank UTR reference number.',
            },
            {
              q: 'Are internal peer-to-peer transfers instant?',
              a: 'Yes, P2P transfers between SR Gateway User IDs execute in under 100 milliseconds with 0% fee.',
            },
            {
              q: 'Is my wallet balance currency in Indian Rupees (₹)?',
              a: 'Yes, all balances, deposit requests, and withdrawal payouts operate strictly in INR (₹).',
            },
          ].map((faq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white text-xs sm:text-sm">{faq.q}</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
