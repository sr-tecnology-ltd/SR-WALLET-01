import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Send, Search, UserCheck, ShieldCheck, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

export const InternalTransferSection: React.FC = () => {
  const { currentUser, currentWallet, allProfiles, transferBalance, formatINR, transactions, openRpinModal } = useWallet();

  const [recipientQuery, setRecipientQuery] = useState<string>('9812345678');
  const [amount, setAmount] = useState<number>(500);
  const [note, setNote] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Filter matched user
  const cleanQuery = recipientQuery.trim().toLowerCase();
  const matchedUser = allProfiles.find(
    (p) =>
      p.id !== currentUser.id &&
      (p.mobile.toLowerCase().includes(cleanQuery) ||
        p.user_custom_id.toLowerCase() === cleanQuery ||
        p.email.toLowerCase() === cleanQuery ||
        (p.telegram_id && p.telegram_id.toLowerCase() === cleanQuery))
  );

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (amount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid transfer amount.' });
      return;
    }
    if (currentWallet.available_balance < amount) {
      setStatusMsg({ type: 'error', text: `Insufficient balance. Available: ${formatINR(currentWallet.available_balance)}.` });
      return;
    }

    // Require 4-digit RPIN verification before completing payment
    openRpinModal({
      mode: currentUser.rpin ? 'VERIFY' : 'SET',
      title: currentUser.rpin ? '🔑 Authorize Transfer' : '🔒 Set 4-Digit Security RPIN',
      description: currentUser.rpin
        ? `Enter your 4-digit Security RPIN to authorize transfer of ${formatINR(amount)}.`
        : 'Set a 4-digit Security RPIN before completing your transfer.',
      amount,
      recipientName: matchedUser ? `${matchedUser.full_name} (${matchedUser.mobile})` : recipientQuery,
      onSuccessCallback: () => {
        const res = transferBalance(recipientQuery, amount, note);
        if (res.success) {
          setStatusMsg({ type: 'success', text: res.message });
          setNote('');
        } else {
          setStatusMsg({ type: 'error', text: res.message });
        }
      },
    });
  };

  const p2pTransactions = transactions.filter(
    (t) => t.user_id === currentUser.id && (t.type === 'TRANSFER_IN' || t.type === 'TRANSFER_OUT')
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Send className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Peer-to-Peer Internal Wallet Transfer
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Instant Balance Transfer</h2>
            <p className="text-xs text-slate-300 mt-1">
              Send internal wallet funds instantly to any registered SR Gateway user with 0% transfer fee.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-right shrink-0 font-mono">
            <div className="text-[10px] text-slate-400">Your Balance</div>
            <div className="text-lg font-black text-emerald-400">{formatINR(currentWallet.available_balance)}</div>
            <div className="text-[10px] text-indigo-300 font-bold">Transfer Fee: 0% Free</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Transfer Details
          </h3>

          {statusMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold font-mono ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            {/* Recipient Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Recipient Registered Mobile Number (Wallet A/C) <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 7478338867, 9812345678, or priya@srgateway.in"
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Matched User Card Preview */}
              {matchedUser ? (
                <div className="mt-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">{matchedUser.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Wallet A/C: {matchedUser.mobile} • {matchedUser.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Verified User
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-amber-400 mt-1 font-mono">
                  Enter registered mobile number (e.g. 9812345678) to verify recipient.
                </p>
              )}
            </div>

            {/* Quick Select Preset Recipients */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">Preset Demo Accounts</label>
              <div className="flex flex-wrap gap-2">
                {allProfiles
                  .filter((p) => p.id !== currentUser.id && p.role !== 'ADMIN')
                  .map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setRecipientQuery(p.mobile)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="font-bold">{p.full_name}</span>
                      <span className="text-[10px] text-indigo-400">({p.mobile})</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Transfer Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  min={1}
                  max={currentWallet.available_balance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-white font-mono font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Payment Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Shared bill split or service payment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!matchedUser || amount > currentWallet.available_balance}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-indigo-600/25 active:scale-95"
            >
              Transfer {formatINR(amount)} Instantly ⚡
            </button>
          </form>
        </div>

        {/* Transfer Safety Banner */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Atomic Transfer Guarantee</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Internal balance transfers execute in a single atomic transaction. Funds leave your wallet and enter the recipient’s wallet instantly without delay.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-400">Transfer Limits & Fees:</div>
              <div className="flex justify-between text-white font-bold">
                <span>Fee:</span>
                <span className="text-emerald-400">0% (Free)</span>
              </div>
              <div className="flex justify-between text-white font-bold">
                <span>Execution Time:</span>
                <span className="text-emerald-400">&lt; 100ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Transfer History */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Your Internal Transfer History</h3>

        <div className="divide-y divide-slate-800">
          {p2pTransactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs">No internal transfers found.</p>
          ) : (
            p2pTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-white">{tx.description}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Ref: {tx.reference_id} • {new Date(tx.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-black text-sm ${
                      tx.type === 'TRANSFER_IN' ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'TRANSFER_IN' ? '+' : '-'}{formatINR(tx.net_amount)}
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    COMPLETED
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
