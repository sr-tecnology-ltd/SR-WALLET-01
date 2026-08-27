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
  Download,
  Image as ImageIcon,
  X,
  FileCheck,
} from 'lucide-react';

export const DepositSection: React.FC = () => {
  const { currentUser, deposits, submitDepositRequest, settings, formatINR } = useWallet();

  const [amount, setAmount] = useState<number>(settings.minimum_deposit || 10);
  const [utr, setUtr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'QR_CODE' | 'WALLET_GW'>('UPI');
  const [note, setNote] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Deposit Confirmation Popup Modal
  const [submittedDepositModal, setSubmittedDepositModal] = useState<{
    id: string;
    amount: number;
    netAmount: number;
    utr: string;
    method: string;
    status: string;
    date: string;
  } | null>(null);

  const myDeposits = deposits.filter((d) => d.user_id === currentUser.id);

  const copyUpi = () => {
    navigator.clipboard.writeText(settings.admin_upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyBankDetails = () => {
    const bankText = `Bank: ${settings.admin_bank_name || 'HDFC Bank Ltd'}\nAccount Name: ${settings.admin_bank_account_name || 'SR Gateway Payments'}\nAccount No: ${settings.admin_bank_account_no || '50200088192031'}\nIFSC: ${settings.admin_bank_ifsc || 'HDFC0001092'}`;
    navigator.clipboard.writeText(bankText);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setScreenshotData(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadQr = async () => {
    const qrUrl = settings.admin_qr_url || 'https://cdn.phototourl.com/free/2026-08-27-63157f0f-6206-4166-a6c1-150d1d4bb343.png';
    try {
      // 1. First attempt download via server-side attachment proxy (100% reliable across all browsers & iframes)
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(qrUrl)}&name=SR_Gateway_Payment_QR.png`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'SR_Gateway_Payment_QR.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
        return;
      }
    } catch (err) {
      console.warn('Proxy download failed, trying direct blob:', err);
    }

    // 2. Direct blob fallback
    try {
      const response = await fetch(qrUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'SR_Gateway_Payment_QR.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
        return;
      }
    } catch (err) {
      console.warn('Direct fetch failed, falling back to window open:', err);
    }

    // 3. Fallback: Open in new tab for manual long-press / save
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'SR_Gateway_Payment_QR.png';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (amount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid deposit amount.' });
      return;
    }
    if (amount < settings.minimum_deposit) {
      setStatusMsg({ type: 'error', text: `Minimum deposit amount is ${formatINR(settings.minimum_deposit)}.` });
      return;
    }
    if (!utr.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter the 12-digit transaction UTR / Reference number.' });
      return;
    }

    const calculatedFee = (amount * settings.deposit_charge_percent) / 100;
    const calculatedNet = amount - calculatedFee;

    const res = submitDepositRequest(amount, utr.trim(), paymentMethod, screenshotData, note);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setSubmittedDepositModal({
        id: `DEP-${Date.now().toString().slice(-6)}`,
        amount,
        netAmount: calculatedNet,
        utr: utr.trim(),
        method: paymentMethod,
        status: 'PENDING',
        date: new Date().toLocaleString(),
      });
      setUtr('');
      setNote('');
      setScreenshotData('');
      setScreenshotFileName('');
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
  const calculatedNet = Math.max(0, amount - calculatedFee);

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
                Payment UPI ID
              </div>
              <div className="flex items-center justify-between font-mono font-black text-base text-emerald-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span>{settings.admin_upi_id || 'sk190rihan@mvhdfc'}</span>
                <button
                  onClick={copyUpi}
                  className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* QR Code Preview with Download Button */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span>Scan Payment QR Code</span>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Download QR</span>
                </button>
              </div>
              
              {/* Official UPI Payment QR Photo */}
              <div className="w-60 max-w-full bg-white p-2 rounded-2xl mx-auto shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
                <img
                  src={settings.admin_qr_url || 'https://cdn.phototourl.com/free/2026-08-27-63157f0f-6206-4166-a6c1-150d1d4bb343.png'}
                  alt="Official Payment QR Code"
                  className="w-full h-auto object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-[10px] text-slate-400">Accepts PhonePe, GPay, Paytm, BHIM & All UPI Apps</p>
            </div>

            {/* Dynamic Bank Transfer Details with Copy Button */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-indigo-300 text-xs">IMPS / NEFT Bank Details:</span>
                <button
                  type="button"
                  onClick={copyBankDetails}
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition font-sans"
                >
                  {copiedBank ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBank ? 'Copied Details!' : 'Copy Bank Details'}</span>
                </button>
              </div>
              <div className="space-y-1 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 text-[11px]">
                <div><span className="text-slate-500 font-sans">Bank:</span> <strong className="text-white">{settings.admin_bank_name || 'AIRTEL PAYMENT BANK'}</strong></div>
                <div><span className="text-slate-500 font-sans">Account Name:</span> <strong className="text-white">{settings.admin_bank_account_name || 'SK SAHIL'}</strong></div>
                <div><span className="text-slate-500 font-sans">Account No:</span> <strong className="text-emerald-400 font-bold">{settings.admin_bank_account_no || '7477661867'}</strong></div>
                <div><span className="text-slate-500 font-sans">IFSC Code:</span> <strong className="text-amber-300">{settings.admin_bank_ifsc || 'AIRP0000001'}</strong></div>
              </div>
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
              <label className="block text-xs font-bold text-slate-300 mb-2">Payment Method</label>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-300">UPI / BANK</div>
                    <div className="text-[10px] text-slate-400">Direct VPA, UPI App or IMPS/NEFT Transfer</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  ACTIVE
                </span>
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

            {/* Upload Payment Screenshot Proof (Gallery / Device Upload) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Upload Payment Screenshot Proof
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-1.5">
                    <Upload className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {screenshotFileName ? screenshotFileName : 'Click to Upload Screenshot from Gallery / Files'}
                    </span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP receipts</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {screenshotData && (
                    <div className="w-16 h-16 rounded-xl border border-slate-700 overflow-hidden bg-slate-950 shrink-0 relative group">
                      <img src={screenshotData} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotData('');
                          setScreenshotFileName('');
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition"
                      >
                        <X className="h-4 w-4 text-rose-400" />
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Deposit Submitted Confirmation Modal Popup */}
      {submittedDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-white animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSubmittedDepositModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <FileCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-white">Deposit Request Submitted!</h3>
              <p className="text-xs text-slate-300">
                Your deposit request has been sent for admin verification.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Status:</span>
                <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20">
                  ⏳ {submittedDepositModal.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Amount:</span>
                <span className="text-white font-bold text-sm">{formatINR(submittedDepositModal.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Net Credit to Wallet:</span>
                <span className="text-emerald-400 font-bold">{formatINR(submittedDepositModal.netAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Bank UTR / Ref:</span>
                <span className="text-indigo-300 font-bold">{submittedDepositModal.utr}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Payment Mode:</span>
                <span className="text-slate-200">{submittedDepositModal.method}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Submitted At:</span>
                <span className="text-slate-400">{submittedDepositModal.date}</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 text-center">
              ⚡ Verification completes within 2–5 minutes. Your wallet balance will automatically update.
            </div>

            <button
              type="button"
              onClick={() => setSubmittedDepositModal(null)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Okay, Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
