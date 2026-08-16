import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  PlusCircle,
  QrCode,
  CreditCard,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const DepositSection: React.FC = () => {
  const { currentUser, deposits, submitDepositRequest, settings, formatINR } = useWallet();

  const [amount, setAmount] = useState<number>(1000);
  const [utr, setUtr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'QR_CODE' | 'WALLET_GW'>('UPI');
  const [note, setNote] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const myDeposits = deposits.filter((d) => d.user_id === currentUser.id);

  const copyUpi = () => {
    navigator.clipboard.writeText(settings.admin_upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const res = submitDepositRequest(amount, utr, paymentMethod, screenshotUrl, note);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setUtr('');
      setNote('');
      setScreenshotUrl('');
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  if (!settings.deposit_enabled) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-center space-y-4 max-w-xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white">Deposit System Unavailable</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Manual deposits are currently turned OFF by system administrator for routine maintenance. Please check back shortly or contact support.
        </p>
      </div>
    );
  }

  const calculatedFee = (amount * settings.deposit_charge_percent) / 100;
  const calculatedNet = amount - calculatedFee;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <PlusCircle className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Manual Verification Deposit Portal
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Deposit Money to Wallet</h2>
            <p className="text-xs text-slate-300 mt-1">
              Transfer funds via UPI/Bank, enter your UTR number, and upload payment screenshot for instant credit.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-right shrink-0 font-mono">
            <div className="text-[10px] text-slate-400">Min Deposit</div>
            <div className="text-lg font-black text-emerald-400">{formatINR(settings.minimum_deposit)}</div>
            <div className="text-[10px] text-slate-400">Fee: {settings.deposit_charge_percent}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Instructions & Admin UPI Details */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Step 1: Admin Payment Details</span>
            </h3>

            {/* UPI ID Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Official Admin UPI VPA
              </div>
              <div className="flex items-center justify-between font-mono font-black text-base text-emerald-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span>{settings.admin_upi_id}</span>
                <button
                  onClick={copyUpi}
                  className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <div className="text-xs font-bold text-slate-300">Scan Admin QR Code</div>
              <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto shadow-lg flex items-center justify-center">
                <img
                  src={settings.admin_qr_url}
                  alt="Admin Payment QR"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <p className="text-[10px] text-slate-400">Accepts GPay, PhonePe, Paytm, BHIM & All UPI Apps</p>
            </div>

            {/* Bank Transfer Instructions */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-1 font-mono text-slate-300">
              <div className="font-bold text-indigo-300 mb-1">IMPS / NEFT Bank Details:</div>
              <div>Bank: HDFC Bank Ltd</div>
              <div>Account Name: SR Gateway Payments</div>
              <div>Account No: 50200088192031</div>
              <div>IFSC Code: HDFC0001092</div>
            </div>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-3 text-[11px] text-indigo-300 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>
              Always copy the exact 12-digit UTR/Ref number from your payment app after completing the transfer.
            </span>
          </div>
        </div>

        {/* Deposit Request Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Step 2: Submit Deposit Request
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

          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Payment Method Used</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / VPA', icon: QrCode },
                  { id: 'BANK_TRANSFER', label: 'Bank IMPS', icon: CreditCard },
                  { id: 'QR_CODE', label: 'QR Scan', icon: PlusCircle },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deposit Amount Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Deposit Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  min={settings.minimum_deposit}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-white font-mono font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[500, 1000, 5000, 10000, 25000].map((val) => (
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

            {/* UTR Number Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Transaction UTR / Ref Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 20260812998101"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">12-digit bank reference code from payment confirmation</p>
            </div>

            {/* Screenshot URL or Upload Simulator */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Screenshot Image URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setScreenshotUrl('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80')
                  }
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Sample</span>
                </button>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount:</span>
                <span className="text-white font-bold">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deposit Fee ({settings.deposit_charge_percent}%):</span>
                <span className="text-emerald-400 font-bold">{formatINR(calculatedFee)}</span>
              </div>
              <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-1.5 font-extrabold text-sm">
                <span>Net Credit to Wallet:</span>
                <span className="text-emerald-400">{formatINR(calculatedNet)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              Submit Deposit Request ⚡
            </button>
          </form>
        </div>
      </div>

      {/* User Deposit History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white">Your Deposit Requests History</h3>

        <div className="divide-y divide-slate-800">
          {myDeposits.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs">No deposit requests submitted yet.</p>
          ) : (
            myDeposits.map((dep) => (
              <div key={dep.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm font-mono">{formatINR(dep.amount)}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      {dep.payment_method}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    UTR: <span className="text-indigo-300 font-bold">{dep.utr}</span> • Ref: {dep.id}
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(dep.created_at).toLocaleString()}</div>
                  {dep.rejection_reason && (
                    <div className="text-[11px] text-rose-400 font-medium bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      Rejection Reason: {dep.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black font-mono uppercase px-3 py-1 rounded-full ${
                      dep.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : dep.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {dep.status === 'SUCCESS' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {dep.status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                    {dep.status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
                    <span>{dep.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Net Credited: {formatINR(dep.net_amount)}
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
