import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  Wallet,
  Info,
} from 'lucide-react';

export const WithdrawSection: React.FC = () => {
  const { currentUser, currentWallet, withdrawals, submitWithdrawalRequest, settings, formatINR, openRpinModal } = useWallet();

  const [amount, setAmount] = useState<number>(1000);
  const [paymentIdentifier, setPaymentIdentifier] = useState<string>('rahulsharma@okicici');
  const [note, setNote] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const myWithdrawals = withdrawals.filter((w) => w.user_id === currentUser.id);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (amount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid withdrawal amount.' });
      return;
    }
    if (amount < settings.minimum_withdraw) {
      setStatusMsg({ type: 'error', text: `Minimum withdrawal amount is ${formatINR(settings.minimum_withdraw)}.` });
      return;
    }
    if (currentWallet.available_balance < amount) {
      setStatusMsg({ type: 'error', text: `Insufficient balance. Available: ${formatINR(currentWallet.available_balance)}.` });
      return;
    }

    // Open 4-digit RPIN Security Modal before processing payout request
    openRpinModal({
      mode: currentUser.rpin ? 'VERIFY' : 'SET',
      title: currentUser.rpin ? '🔑 Authorize Withdrawal' : '🔒 Set 4-Digit Security RPIN',
      description: currentUser.rpin
        ? `Enter your 4-digit Security RPIN to authorize payout of ${formatINR(amount)}.`
        : 'Set a 4-digit Security RPIN before completing your withdrawal.',
      amount,
      recipientName: paymentIdentifier,
      onSuccessCallback: () => {
        const res = submitWithdrawalRequest(amount, paymentIdentifier, note);
        if (res.success) {
          setStatusMsg({ type: 'success', text: res.message });
          setNote('');
        } else {
          setStatusMsg({ type: 'error', text: res.message });
        }
      },
    });
  };

  if (!settings.withdraw_enabled) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-center space-y-4 max-w-xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white">Withdrawal System Unavailable</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Withdrawal processing is currently paused by admin for scheduled banking batch settlement. Please try again later.
        </p>
      </div>
    );
  }

  const calculatedFee = (amount * settings.withdraw_charge_percent) / 100;
  const calculatedNetPayout = Math.max(0, amount - calculatedFee);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Wallet Withdrawal Portal
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Request Payout to UPI / Bank</h2>
            <p className="text-xs text-slate-300 mt-1">
              Transfer your available wallet balance directly to your UPI ID or Bank Account with instant tracking.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-right shrink-0 font-mono">
            <div className="text-[10px] text-slate-400">Available Balance</div>
            <div className="text-lg font-black text-emerald-400">{formatINR(currentWallet.available_balance)}</div>
            <div className="text-[10px] text-slate-400">Min: {formatINR(settings.minimum_withdraw)} • Fee: {settings.withdraw_charge_percent}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Submit Payout Request
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

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  min={settings.minimum_withdraw}
                  max={currentWallet.available_balance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-white font-mono font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000, 10000].map((val) => (
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

            {/* UPI ID / Payment Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                UPI ID or Bank Account Details <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. rahul@okicici or Bank Acc No / IFSC"
                value={paymentIdentifier}
                onChange={(e) => setPaymentIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Double check your UPI ID before submitting</p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Payout Note / Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Payout to personal savings account"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Calculation Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount:</span>
                <span className="text-white font-bold">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee ({settings.withdraw_charge_percent}%):</span>
                <span className="text-rose-400 font-bold">-{formatINR(calculatedFee)}</span>
              </div>
              <div className="flex justify-between text-slate-100 border-t border-slate-800 pt-2 font-black text-base">
                <span>Net You Receive in Bank:</span>
                <span className="text-emerald-400">{formatINR(calculatedNetPayout)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={amount > currentWallet.available_balance || amount < settings.minimum_withdraw}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-indigo-600/25 active:scale-95"
            >
              Request Withdrawal Now 💸
            </button>
          </form>
        </div>

        {/* Withdrawal Info & Rules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              <span>Withdrawal Policy & Locked Funds</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-medium">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>Atomic Balance Locking</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  When you submit a withdrawal request, the requested amount is moved into locked balance to prevent double spending.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white">Manual Verification</div>
                <p className="text-[11px] text-slate-400">
                  Withdrawal requests are processed manually or via authorized payout gateway by SR Gateway Admin.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white">Rejection Protection</div>
                <p className="text-[11px] text-slate-400">
                  If a withdrawal request is rejected by admin, the locked funds are immediately restored to your available wallet balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Your Withdrawal Requests History</h3>

        <div className="divide-y divide-slate-800">
          {myWithdrawals.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs">No withdrawal requests submitted yet.</p>
          ) : (
            myWithdrawals.map((wd) => (
              <div key={wd.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm font-mono">{formatINR(wd.amount)}</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      {wd.payment_identifier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Ref: {wd.id} {wd.payment_reference ? `• Paid UTR: ${wd.payment_reference}` : ''}
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(wd.created_at).toLocaleString()}</div>
                  {wd.rejection_reason && (
                    <div className="text-[11px] text-rose-400 font-medium bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      Rejection Reason: {wd.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black font-mono uppercase px-3 py-1 rounded-full ${
                      wd.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : wd.status === 'PENDING' || wd.status === 'APPROVED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {wd.status === 'SUCCESS' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {(wd.status === 'PENDING' || wd.status === 'APPROVED') && <Clock className="h-3.5 w-3.5" />}
                    {wd.status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
                    <span>{wd.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Net Payout: {formatINR(wd.net_payout)} (Fee: {formatINR(wd.fee)})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
