import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Send,
  Search,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Wallet,
  CheckCircle2,
  X,
  ArrowUpRight,
  Sparkles,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const InternalTransferSection: React.FC = () => {
  const { currentUser, currentWallet, allProfiles, transferBalance, formatINR, transactions, openRpinModal } = useWallet();

  const [recipientQuery, setRecipientQuery] = useState<string>('');
  const [amount, setAmount] = useState<number>(500);
  const [note, setNote] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Success Confirmation Modal
  const [successModalData, setSuccessModalData] = useState<{
    txnId: string;
    amount: number;
    senderName: string;
    senderMobile: string;
    receiverName: string;
    receiverMobile: string;
    receiverCustomId: string;
    status: string;
    note?: string;
    date: string;
    newBalance: number;
  } | null>(null);

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
    if (currentWallet.available_balance <= 0 || currentWallet.available_balance < amount) {
      setStatusMsg({
        type: 'error',
        text: `Insufficient wallet balance! Your available balance is ${formatINR(currentWallet.available_balance)}. Please deposit funds first.`,
      });
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
          if (res.transferData) {
            setSuccessModalData(res.transferData);
          }
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
                  placeholder="Enter Registered Mobile Number, User ID, or Email"
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
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Enter registered 10-digit mobile number or User ID to search recipient.
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Transfer Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  max={currentWallet.available_balance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-white font-mono font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 2000, 5000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-mono font-bold text-slate-300"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Payment Remark / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Freelance invoice, Bill split, Server payment"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={currentWallet.available_balance < amount || currentWallet.available_balance <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl transition shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Money Instantly ⚡</span>
            </button>
          </form>
        </div>

        {/* Info & Safety Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>P2P Transfer Rules</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Transfer Speed:</span>
                <span className="font-bold text-emerald-400 font-mono">⚡ Real-time (Instant)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Platform Transaction Fee:</span>
                <span className="font-bold text-emerald-400 font-mono">₹0.00 (Free)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Min Transfer Amount:</span>
                <span className="font-bold text-white font-mono">₹1.00</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once completed, peer-to-peer transfers cannot be reversed. Please verify the recipient's mobile number before confirming payment.
            </p>
          </div>
        </div>
      </div>

      {/* P2P Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Recent Internal P2P Transfers</h3>

        <div className="divide-y divide-slate-800">
          {p2pTransactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs">No P2P transfer transactions yet.</p>
          ) : (
            p2pTransactions.map((tx) => (
              <div key={tx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-black text-sm ${
                        tx.type === 'TRANSFER_IN' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'TRANSFER_IN' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                      {tx.type}
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium">{tx.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref: {tx.reference_id || tx.id} • {new Date(tx.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>SUCCESS</span>
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Balance After: {formatINR(tx.balance_after)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Receipt / Feedback Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-white animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSuccessModalData(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white">Transfer Successful!</h3>
              <p className="text-xs text-slate-300">
                Funds have been transferred and credited instantly to the recipient's wallet.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Status:</span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20">
                  ✅ {successModalData.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Amount Transferred:</span>
                <span className="text-white font-bold text-base">{formatINR(successModalData.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Recipient Name:</span>
                <span className="text-indigo-300 font-bold">{successModalData.receiverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Recipient Mobile / ID:</span>
                <span className="text-slate-200">{successModalData.receiverMobile} ({successModalData.receiverCustomId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Transaction ID:</span>
                <span className="text-amber-400 font-bold">{successModalData.txnId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Your New Balance:</span>
                <span className="text-emerald-400 font-bold">{formatINR(successModalData.newBalance)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Date & Time:</span>
                <span className="text-slate-400">{new Date(successModalData.date).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSuccessModalData(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Done / Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
