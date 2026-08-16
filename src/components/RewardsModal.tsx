import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, Gift, Sparkles, CheckCircle2, Award } from 'lucide-react';

export const RewardsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, currentWallet, formatINR, claimDailyBonus } = useWallet();

  const [scratched, setScratched] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScratch = () => {
    if (scratched) return;
    const res = claimDailyBonus();
    if (res.success) {
      setRewardAmount(10);
      setScratched(true);
      setMsg(res.message);
    } else {
      setMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-white text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl">
            🎁
          </div>
          <h3 className="text-xl font-black text-white">Daily Streak Rewards</h3>
          <p className="text-xs text-slate-400">Claim your daily wallet check-in bonus!</p>
        </div>

        {msg && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs text-indigo-300">
            {msg}
          </div>
        )}

        {/* Scratch Card Box */}
        <div
          onClick={handleScratch}
          className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
            scratched
              ? 'bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border-emerald-500/40 shadow-xl'
              : 'bg-gradient-to-tr from-indigo-600 to-indigo-900 border-indigo-500 hover:scale-102 shadow-2xl'
          }`}
        >
          {!scratched ? (
            <div className="space-y-3">
              <Gift className="h-12 w-12 text-amber-300 mx-auto animate-pulse" />
              <div className="font-black text-base text-white">Tap to Scratch Card</div>
              <p className="text-[10px] text-indigo-200">Win up to ₹100 instant wallet credit!</p>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <Sparkles className="h-10 w-10 text-amber-400 mx-auto" />
              <div className="text-2xl font-black text-emerald-400 font-mono">
                + {formatINR(rewardAmount || 10)}
              </div>
              <p className="text-xs font-bold text-white">Credited directly to your wallet!</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
        >
          Close Rewards
        </button>
      </div>
    </div>
  );
};
