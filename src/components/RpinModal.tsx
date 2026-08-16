import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { KeyRound, ShieldCheck, Lock, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface RpinModalProps {
  isOpen: boolean;
  mode: 'SET' | 'VERIFY';
  title?: string;
  description?: string;
  amount?: number;
  recipientName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RpinModal: React.FC<RpinModalProps> = ({
  isOpen,
  mode: initialMode,
  title,
  description,
  amount,
  recipientName,
  onClose,
  onSuccess,
}) => {
  const { currentUser, setUserRpin, verifyUserRpin, formatINR } = useWallet();

  const [mode, setMode] = useState<'SET' | 'VERIFY'>(initialMode);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleDigitChange = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const targetState = isConfirm ? [...confirmPin] : [...pin];
    targetState[index] = clean;

    if (isConfirm) {
      setConfirmPin(targetState);
    } else {
      setPin(targetState);
    }

    // Auto focus next input
    if (clean && index < 3) {
      const nextInput = document.getElementById(
        `${isConfirm ? 'rpin-confirm' : 'rpin'}-${index + 1}`
      );
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    isConfirm: boolean = false
  ) => {
    if (e.key === 'Backspace') {
      const targetState = isConfirm ? confirmPin : pin;
      if (!targetState[index] && index > 0) {
        const prevInput = document.getElementById(
          `${isConfirm ? 'rpin-confirm' : 'rpin'}-${index - 1}`
        );
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleSetRpinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pinStr = pin.join('');
    const confirmPinStr = confirmPin.join('');

    if (pinStr.length < 4) {
      setErrorMsg('Please enter a complete 4-digit RPIN.');
      return;
    }

    if (pinStr !== confirmPinStr) {
      setErrorMsg('RPIN and Confirm RPIN do not match. Please re-enter.');
      return;
    }

    const res = setUserRpin(pinStr);
    if (res.success) {
      setSuccessMsg('4-Digit Security RPIN set successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pinStr = pin.join('');
    if (pinStr.length < 4) {
      setErrorMsg('Please enter your 4-digit Security RPIN.');
      return;
    }

    // If user has not set RPIN yet, default to 1234 or prompt to set
    if (!currentUser.rpin) {
      setErrorMsg('No RPIN set yet! Setting RPIN now...');
      setMode('SET');
      return;
    }

    const isValid = verifyUserRpin(pinStr);
    if (isValid) {
      setSuccessMsg('Security RPIN verified successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } else {
      setErrorMsg('Incorrect 4-digit RPIN! Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <KeyRound className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            {title || (mode === 'SET' ? 'Set 4-Digit Security RPIN' : 'Enter 4-Digit RPIN')}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {description ||
              (mode === 'SET'
                ? 'Create a 4-digit Security RPIN to authorize User-to-User Transfers and Withdrawals.'
                : 'Enter your 4-digit security RPIN to complete this transaction safely.')}
          </p>
        </div>

        {/* Transaction Summary Badge if Verifying */}
        {mode === 'VERIFY' && (amount || recipientName) && (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 text-center space-y-1 font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Transaction Details
            </div>
            {amount && (
              <div className="text-xl font-black text-emerald-400">{formatINR(amount)}</div>
            )}
            {recipientName && (
              <div className="text-xs text-slate-300">
                Recipient / Account: <strong className="text-cyan-300">{recipientName}</strong>
              </div>
            )}
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-bold font-mono text-center flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SET MODE FORM */}
        {mode === 'SET' ? (
          <form onSubmit={handleSetRpinSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold text-slate-300 mb-2 font-mono">
                  Enter 4-Digit RPIN
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={`pin-${idx}`}
                      id={`rpin-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={pin[idx]}
                      onChange={(e) => handleDigitChange(idx, e.target.value, false)}
                      onKeyDown={(e) => handleKeyDown(idx, e, false)}
                      className="w-12 h-14 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-center text-xl font-mono font-black text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                      required
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-center text-xs font-bold text-slate-300 mb-2 font-mono">
                  Confirm 4-Digit RPIN
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={`confirm-${idx}`}
                      id={`rpin-confirm-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={confirmPin[idx]}
                      onChange={(e) => handleDigitChange(idx, e.target.value, true)}
                      onKeyDown={(e) => handleKeyDown(idx, e, true)}
                      className="w-12 h-14 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl text-center text-xl font-mono font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                      required
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Save 4-Digit Security RPIN</span>
            </button>
          </form>
        ) : (
          /* VERIFY MODE FORM */
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-bold text-slate-300 mb-3 font-mono">
                Security RPIN (4 Digits)
              </label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`verify-pin-${idx}`}
                    id={`rpin-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value, false)}
                    onKeyDown={(e) => handleKeyDown(idx, e, false)}
                    className="w-12 h-14 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-2xl text-center text-2xl font-mono font-black text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs px-2">
              <span className="text-slate-400 font-mono text-[11px]">Default demo PIN: <strong>1234</strong></span>
              <button
                type="button"
                onClick={() => setMode('SET')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline"
              >
                Reset / Change RPIN
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="h-5 w-5" />
              <span>Authorize & Process Payment</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
