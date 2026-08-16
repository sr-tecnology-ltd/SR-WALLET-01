import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, QrCode, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ScanPayModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentWallet, transferBalance, formatINR } = useWallet();

  const [upiId, setUpiId] = useState('SR-10029');
  const [amount, setAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid transfer amount.' });
      return;
    }

    const res = transferBalance(upiId, amt, 'Scan & Pay QR Payment');
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto text-xl">
            📲
          </div>
          <h3 className="text-xl font-black text-white">Scan & Pay QR Code</h3>
          <p className="text-xs text-slate-400">Instant internal UPI transfer from your SR Wallet balance</p>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Recipient Custom ID / UPI ID / Mobile</label>
            <input
              type="text"
              required
              placeholder="e.g. SR-10029 or 9876543210"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Amount (INR)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
            <div className="text-[10px] text-slate-400 font-mono text-right">
              Available: {formatINR(currentWallet.available_balance)}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-xs"
          >
            <Send className="h-4 w-4" />
            <span>Pay Now From Wallet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
