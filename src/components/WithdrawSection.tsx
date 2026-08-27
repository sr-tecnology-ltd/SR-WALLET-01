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
  X,
  FileCheck,
} from 'lucide-react';

export const WithdrawSection: React.FC = () => {
  const { currentUser, currentWallet, withdrawals, submitWithdrawalRequest, settings, formatINR, openRpinModal } = useWallet();

  const [amount, setAmount] = useState<number>(settings.minimum_withdraw || 20);
  const [paymentIdentifier, setPaymentIdentifier] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Success Feedback Modal
  const [withdrawalModalData, setWithdrawalModalData] = useState<{
    id: string;
    amount: number;
    fee: number;
    netPayout: number;
    recipientUpi: string;
    status: string;
    date: string;
  } | null>(null);

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
    if (currentWallet.available_balance <= 0 || currentWallet.available_balance < amount) {
      setStatusMsg({
        type: 'error',
        text: `Insufficient wallet balance! Your available balance is ${formatINR(currentWallet.available_balance)}. You cannot withdraw more than your available balance.`,
      });
      return;
    }

    const calculatedFee = (amount * settings.withdraw_charge_percent) / 100;
    const calculatedNetPayout = Math.max(0, amount - calculatedFee);

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
          setWithdrawalModalData({
            id: `WTH-${Date.now().toString().slice(-6)}`,
            amount,
            fee: calculatedFee,
            netPayout: calculatedNetPayout,
            recipientUpi: paymentIdentifier,
            status: 'PENDING',
            date: new Date().toLocaleString(),
          });
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
                Recipient UPI ID / Bank Account Details <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@oksbi or A/C: 123456789 IFSC: SBIN0001234"
                value={paymentIdentifier}
                onChange={(e) => setPaymentIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your valid UPI Virtual Address (VPA) or Bank Account + IFSC.
              </p>
            </div>

            {/* Note / Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Note / Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly payout, Project withdrawal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Payout Calculation Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount:</span>
                <span className="text-white font-bold">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee ({settings.withdraw_charge_percent}%):</span>
                <span className="text-rose-400 font-bold">{formatINR(calculatedFee)}</span>
              </div>
              <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-1.5 font-extrabold text-sm">
                <span>Net Amount to Receive:</span>
                <span className="text-emerald-400">{formatINR(calculatedNetPayout)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={currentWallet.available_balance < amount || currentWallet.available_balance <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl transition shadow-xl shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Submit Payout Request ⚡</span>
            </button>
          </form>
        </div>

        {/* Withdrawal Terms */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-400" />
              <span>Withdrawal Security Guidelines</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Minimum Withdrawal:</span>
                <span className="font-bold text-white font-mono">{formatINR(settings.minimum_withdraw)}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Locked on Request:</span>
                <span className="font-bold text-amber-400 font-mono">100% Secure Hold</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Processing Window:</span>
                <span className="font-bold text-emerald-400 font-mono">Instant to 15 Mins</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you submit a withdrawal request, the requested amount is safely held in your wallet's locked balance until admin processes the bank payout.
            </p>
          </div>
        </div>
      </div>

      {/* User Withdrawal Requests History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Your Withdrawal Requests History</h3>

        <div className="divide-y divide-slate-800">
          {myWithdrawals.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs">No withdrawal requests submitted yet.</p>
          ) : (
            myWithdrawals.map((wth) => (
              <div key={wth.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm font-mono">{formatINR(wth.amount)}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      Payout to: {wth.payment_identifier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Ref ID: <span className="text-indigo-300 font-bold">{wth.id}</span>
                    {wth.payout_utr && (
                      <span className="text-emerald-400 font-bold ml-2">
                        • Bank UTR: {wth.payout_utr}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(wth.created_at).toLocaleString()}</div>
                  {wth.rejection_reason && (
                    <div className="text-[11px] text-rose-400 font-medium bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      Rejection Reason: {wth.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black font-mono uppercase px-3 py-1 rounded-full ${
                      wth.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : wth.status === 'APPROVED'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : wth.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {wth.status === 'PAID' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {wth.status === 'APPROVED' && <Clock className="h-3.5 w-3.5" />}
                    {wth.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                    {wth.status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
                    <span>{wth.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Net Payout: {formatINR(wth.net_amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdrawal Confirmation Feedback Modal */}
      {withdrawalModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-white animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setWithdrawalModalData(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
                <FileCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-white">Withdrawal Request Queued!</h3>
              <p className="text-xs text-slate-300">
                Your payout request has been queued for admin verification & bank transfer.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Status:</span>
                <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20">
                  ⏳ {withdrawalModalData.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Requested Amount:</span>
                <span className="text-white font-bold text-sm">{formatINR(withdrawalModalData.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Net Payout to Receive:</span>
                <span className="text-emerald-400 font-bold">{formatINR(withdrawalModalData.netPayout)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Payout UPI / Bank:</span>
                <span className="text-indigo-300 font-bold">{withdrawalModalData.recipientUpi}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Request Ref ID:</span>
                <span className="text-amber-400 font-bold">{withdrawalModalData.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Submitted At:</span>
                <span className="text-slate-400">{withdrawalModalData.date}</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 text-center">
              🔒 Funds are currently held safely in Locked Balance and will be disbursed via IMPS/UPI.
            </div>

            <button
              type="button"
              onClick={() => setWithdrawalModalData(null)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
