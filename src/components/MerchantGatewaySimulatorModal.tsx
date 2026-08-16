import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { X, Code, QrCode, ArrowRight, CheckCircle2, ShieldCheck, Zap, Laptop, Copy, ExternalLink, Play } from 'lucide-react';

export const MerchantGatewaySimulatorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, processMerchantApiPayment, apiKeys, formatINR } = useWallet();

  // Order Details Form State
  const [amount, setAmount] = useState('500');
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customerName, setCustomerName] = useState('Amit Sharma');
  const [payMethod, setPayMethod] = useState<'UPI_QR' | 'PHONEPE' | 'GPAY' | 'PAYTM' | 'NETBANKING'>('UPI_QR');

  // Gateway Simulation State
  const [checkoutStep, setCheckoutStep] = useState<'CONFIG' | 'CHECKOUT' | 'SUCCESS'>('CONFIG');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0) return;
    setCheckoutStep('CHECKOUT');
  };

  const handleSimulatePayment = () => {
    const amt = parseFloat(amount);
    const res = processMerchantApiPayment(amt, orderId, customerName, payMethod);
    if (res.success) {
      setCheckoutStep('SUCCESS');
      setStatusMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xl">
            ⚡
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>API Gateway & Transaction System</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                SANDBOX
              </span>
            </h3>
            <p className="text-xs text-slate-400">Simulate Merchant API Checkout & Webhook Callbacks</p>
          </div>
        </div>

        {/* STEP 1: CONFIG FORM */}
        {checkoutStep === 'CONFIG' && (
          <form onSubmit={handleLaunchCheckout} className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">ACTIVE MERCHANT API KEY</div>
              <div className="text-xs font-bold font-mono text-indigo-400">
                {apiKeys[0]?.api_key_prefix || 'sr_live_demo_key_99'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Order Amount (INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Merchant Order ID</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Payment Option</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI_QR', label: 'Dynamic QR' },
                  { id: 'PHONEPE', label: 'PhonePe' },
                  { id: 'GPAY', label: 'Google Pay' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayMethod(m.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      payMethod === m.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* API Payload Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1 font-mono text-[10px]">
              <div className="text-slate-500 font-bold">API REQUEST PAYLOAD (POST /api/v1/checkout/create)</div>
              <pre className="text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded-lg">
                {JSON.stringify(
                  {
                    api_key: apiKeys[0]?.api_key_prefix || 'sr_live_demo_key_99',
                    order_id: orderId,
                    amount: parseFloat(amount) || 0,
                    currency: 'INR',
                    customer_name: customerName,
                    redirect_url: 'https://merchant.example.com/callback',
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-xs"
            >
              <Play className="h-4 w-4" />
              <span>Launch Merchant Gateway Checkout Page</span>
            </button>
          </form>
        )}

        {/* STEP 2: CHECKOUT SIMULATOR SCREEN */}
        {checkoutStep === 'CHECKOUT' && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-slate-400 font-mono">ORDER #{orderId}</span>
                <span className="font-extrabold text-indigo-400 font-mono text-sm">{formatINR(parseFloat(amount))}</span>
              </div>

              {/* QR Code Graphic */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=srgateway@upi%26pn=SR%20GATEWAY%20IN%26am=${amount}%26tr=${orderId}`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Scan using PhonePe, Paytm, Google Pay, or BHIM</p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 font-mono">
                Customer: <strong>{customerName}</strong> • Mode: <strong>{payMethod}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCheckoutStep('CONFIG')}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                onClick={handleSimulatePayment}
                className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simulate Successful Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CALLBACK SCREEN */}
        {checkoutStep === 'SUCCESS' && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">Payment Received!</h4>
              <p className="text-xs text-slate-400 mt-1">{statusMsg}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-left space-y-2 font-mono text-[10px]">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>SIMULATED WEBHOOK EVENT TRIGGERED</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">HTTP 200 OK</span>
              </div>
              <pre className="text-slate-300 p-2 bg-slate-900 rounded-lg overflow-x-auto">
                {JSON.stringify(
                  {
                    event: 'payment.success',
                    order_id: orderId,
                    amount: parseFloat(amount),
                    status: 'COMPLETED',
                    timestamp: new Date().toISOString(),
                    merchant_id: currentUser.user_custom_id,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              onClick={() => {
                setCheckoutStep('CONFIG');
                setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition text-xs"
            >
              Test Another API Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
