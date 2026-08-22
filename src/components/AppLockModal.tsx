import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Bot,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AppLockModalProps {
  onUnlock: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({ onUnlock }) => {
  const {
    currentUser,
    currentWallet,
    verifyUserRpin,
    setUserRpin,
    resetRpinWithOtp,
    sendTelegramOtp,
    verifyTelegramOtp,
    logoutUser,
    formatINR,
    settings,
  } = useWallet();

  const isFirstTimeSetup = !currentUser.rpin;

  const [pin, setPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<'SEND_OTP' | 'VERIFY_OTP' | 'NEW_PIN'>('SEND_OTP');

  // Create / Set RPIN States (for new registered users)
  const [createPin, setCreatePin] = useState(['', '', '', '']);
  const [confirmCreatePin, setConfirmCreatePin] = useState(['', '', '', '']);
  const [activePinField, setActivePinField] = useState<'CREATE' | 'CONFIRM'>('CREATE');

  // Reset states
  const [otpCode, setOtpCode] = useState('');
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmNewPin, setConfirmNewPin] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Standard unlock digit input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const nextPin = [...pin];
    nextPin[index] = clean;
    setPin(nextPin);
    setErrorMsg(null);

    // Auto submit when 4th digit entered
    if (clean && index === 3) {
      const fullPin = nextPin.join('');
      if (fullPin.length === 4) {
        validateAndUnlock(fullPin);
      }
    } else if (clean && index < 3) {
      const nextInput = document.getElementById(`lock-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`lock-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const validateAndUnlock = (enteredPin: string) => {
    setErrorMsg(null);
    const userRpin = currentUser.rpin || '1234';

    if (enteredPin === userRpin) {
      setSuccessMsg('✅ Security RPIN Verified! Unlocking wallet...');
      setTimeout(() => {
        onUnlock();
      }, 400);
    } else {
      setErrorMsg('❌ Incorrect 4-digit RPIN. Please try again or use Telegram OTP to reset.');
      setPin(['', '', '', '']);
      const firstInput = document.getElementById('lock-digit-0');
      if (firstInput) firstInput.focus();
    }
  };

  // Keypad click for Create Mode or Unlock Mode
  const handleKeypadClick = (digit: string) => {
    if (isFirstTimeSetup) {
      // Create mode keypad handling
      if (digit === 'DEL') {
        if (activePinField === 'CONFIRM') {
          const lastIdx = confirmCreatePin.map((d) => d !== '').lastIndexOf(true);
          if (lastIdx >= 0) {
            const next = [...confirmCreatePin];
            next[lastIdx] = '';
            setConfirmCreatePin(next);
          } else {
            setActivePinField('CREATE');
          }
        } else {
          const lastIdx = createPin.map((d) => d !== '').lastIndexOf(true);
          if (lastIdx >= 0) {
            const next = [...createPin];
            next[lastIdx] = '';
            setCreatePin(next);
          }
        }
      } else {
        if (activePinField === 'CREATE') {
          const emptyIdx = createPin.indexOf('');
          if (emptyIdx !== -1) {
            const next = [...createPin];
            next[emptyIdx] = digit;
            setCreatePin(next);
            if (emptyIdx === 3) {
              setActivePinField('CONFIRM');
              const firstConfirm = document.getElementById('create-confirm-digit-0');
              if (firstConfirm) firstConfirm.focus();
            } else {
              const nextEl = document.getElementById(`create-digit-${emptyIdx + 1}`);
              if (nextEl) nextEl.focus();
            }
          } else {
            setActivePinField('CONFIRM');
          }
        } else {
          const emptyIdx = confirmCreatePin.indexOf('');
          if (emptyIdx !== -1) {
            const next = [...confirmCreatePin];
            next[emptyIdx] = digit;
            setConfirmCreatePin(next);
            if (emptyIdx < 3) {
              const nextEl = document.getElementById(`create-confirm-digit-${emptyIdx + 1}`);
              if (nextEl) nextEl.focus();
            }
          }
        }
      }
      return;
    }

    // Normal Unlock Keypad Handling
    if (digit === 'DEL') {
      const lastIndex = pin.map((d) => d !== '').lastIndexOf(true);
      if (lastIndex >= 0) {
        const next = [...pin];
        next[lastIndex] = '';
        setPin(next);
      }
    } else {
      const emptyIndex = pin.indexOf('');
      if (emptyIndex !== -1) {
        handleDigitChange(emptyIndex, digit);
      }
    }
  };

  // Submit Handler for First Time RPIN Creation (New User)
  const handleSaveInitialRpin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const p1 = createPin.join('');
    const p2 = confirmCreatePin.join('');

    if (p1.length !== 4) {
      setErrorMsg('Please enter a 4-digit Security RPIN.');
      setActivePinField('CREATE');
      return;
    }
    if (p2.length !== 4) {
      setErrorMsg('Please enter and confirm your 4-digit RPIN.');
      setActivePinField('CONFIRM');
      return;
    }
    if (p1 !== p2) {
      setErrorMsg('❌ RPIN and Confirm RPIN do not match. Please re-enter.');
      setConfirmCreatePin(['', '', '', '']);
      setActivePinField('CONFIRM');
      const firstConfirm = document.getElementById('create-confirm-digit-0');
      if (firstConfirm) firstConfirm.focus();
      return;
    }

    const res = setUserRpin(p1);
    if (res.success) {
      setSuccessMsg('🎉 4-Digit Security RPIN created successfully! Unlocking your wallet...');
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Reset RPIN via Telegram Bot OTP
  const handleSendResetOtp = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const targetIdentifier =
        currentUser.telegram_chat_id || currentUser.telegram_id || currentUser.mobile;
      const res = await sendTelegramOtp(targetIdentifier);
      if (res.success) {
        setResetStep('VERIFY_OTP');
        setOtpTimer(300);
        setSuccessMsg(res.message || 'OTP sent to your linked Telegram Bot Chat!');
      } else {
        setErrorMsg(res.message || 'Failed to send OTP. Ensure your Telegram Bot is connected.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpForReset = () => {
    setErrorMsg(null);
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on Telegram.');
      return;
    }
    const res = verifyTelegramOtp(otpCode);
    if (res.success) {
      setResetStep('NEW_PIN');
      setSuccessMsg('Telegram OTP verified! Enter your new 4-digit Security RPIN.');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSaveNewRpin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const p1 = newPin.join('');
    const p2 = confirmNewPin.join('');

    if (p1.length !== 4) {
      setErrorMsg('Please enter a complete 4-digit RPIN.');
      return;
    }
    if (p1 !== p2) {
      setErrorMsg('New RPIN and Confirm RPIN do not match.');
      return;
    }

    const res = setUserRpin(p1);
    if (res.success) {
      setSuccessMsg('New Security RPIN created successfully! App Unlocked.');
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 p-4 overflow-y-auto">
      {/* Background Animated Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-emerald-600/30 via-teal-600/20 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/10 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-indigo-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 backdrop-blur-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header App Identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isFirstTimeSetup ? 'SECURITY PIN SETUP (STEP 2)' : 'PERSONAL WALLET SECURITY'}</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-emerald-300">
              {isFirstTimeSetup ? 'CREATE SECURITY RPIN' : 'SR GATEWAY IN'}
            </h1>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            {isFirstTimeSetup
              ? 'Choose a secure 4-Digit RPIN to protect your wallet, transfers & payouts.'
              : 'Enter your 4-Digit Security RPIN to unlock your wallet dashboard'}
          </p>
        </div>

        {/* User Account Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {currentUser.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.full_name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {currentUser.user_custom_id}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                +91 {currentUser.mobile}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logoutUser();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition text-xs flex items-center gap-1 cursor-pointer"
            title="Log Out & Switch Account"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold">Logout</span>
          </button>
        </div>

        {/* Alerts Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SCENARIO 1: FIRST-TIME SETUP -> CREATE 4-DIGIT RPIN */}
        {isFirstTimeSetup ? (
          <form onSubmit={handleSaveInitialRpin} className="space-y-5">
            {/* Enter New 4 Digits */}
            <div className="space-y-1.5 text-center">
              <div className="flex items-center justify-between text-[11px] font-mono px-2">
                <span className="text-indigo-300 font-bold uppercase tracking-wider">
                  1. ENTER 4-DIGIT RPIN
                </span>
                {createPin.every((d) => d !== '') && (
                  <span className="text-emerald-400 font-bold">✓ Entered</span>
                )}
              </div>

              <div className="flex justify-center gap-2.5">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`create-digit-${idx}`}
                    id={`create-digit-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={createPin[idx]}
                    onFocus={() => setActivePinField('CREATE')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      const next = [...createPin];
                      next[idx] = val;
                      setCreatePin(next);
                      setErrorMsg(null);
                      if (val && idx < 3) {
                        const nextEl = document.getElementById(`create-digit-${idx + 1}`);
                        if (nextEl) nextEl.focus();
                      } else if (val && idx === 3) {
                        setActivePinField('CONFIRM');
                        const confirmEl = document.getElementById('create-confirm-digit-0');
                        if (confirmEl) confirmEl.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !createPin[idx] && idx > 0) {
                        const prev = document.getElementById(`create-digit-${idx - 1}`);
                        if (prev) prev.focus();
                      }
                    }}
                    className={`w-13 h-14 bg-slate-950 border-2 rounded-2xl text-center text-2xl font-mono font-black transition-all focus:outline-none ${
                      createPin[idx]
                        ? 'border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-800 text-slate-400 focus:border-indigo-500'
                    }`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Confirm 4 Digits */}
            <div className="space-y-1.5 text-center">
              <div className="flex items-center justify-between text-[11px] font-mono px-2">
                <span className="text-emerald-300 font-bold uppercase tracking-wider">
                  2. CONFIRM 4-DIGIT RPIN
                </span>
                {confirmCreatePin.every((d) => d !== '') && (
                  <span className="text-emerald-400 font-bold">✓ Confirmed</span>
                )}
              </div>

              <div className="flex justify-center gap-2.5">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`create-confirm-digit-${idx}`}
                    id={`create-confirm-digit-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={confirmCreatePin[idx]}
                    onFocus={() => setActivePinField('CONFIRM')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      const next = [...confirmCreatePin];
                      next[idx] = val;
                      setConfirmCreatePin(next);
                      setErrorMsg(null);
                      if (val && idx < 3) {
                        const nextEl = document.getElementById(`create-confirm-digit-${idx + 1}`);
                        if (nextEl) nextEl.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !confirmCreatePin[idx] && idx > 0) {
                        const prev = document.getElementById(`create-confirm-digit-${idx - 1}`);
                        if (prev) prev.focus();
                      }
                    }}
                    className={`w-13 h-14 bg-slate-950 border-2 rounded-2xl text-center text-2xl font-mono font-black transition-all focus:outline-none ${
                      confirmCreatePin[idx]
                        ? 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'border-slate-800 text-slate-400 focus:border-emerald-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* On-Screen Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'DEL'].map((k) => {
                if (k === 'CLEAR') {
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setCreatePin(['', '', '', '']);
                        setConfirmCreatePin(['', '', '', '']);
                        setActivePinField('CREATE');
                        const firstInput = document.getElementById('create-digit-0');
                        if (firstInput) firstInput.focus();
                      }}
                      className="h-11 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 text-[10px] font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      CLEAR
                    </button>
                  );
                }
                if (k === 'DEL') {
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadClick('DEL')}
                      className="h-11 rounded-2xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      ⌫ DEL
                    </button>
                  );
                }
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadClick(k)}
                    className="h-11 rounded-2xl bg-slate-950 hover:bg-indigo-600/30 border border-slate-800/80 hover:border-indigo-500/40 text-white font-mono text-base font-black transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            {/* Submit Create Button */}
            <button
              type="submit"
              disabled={createPin.join('').length !== 4 || confirmCreatePin.join('').length !== 4}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              <span>SAVE 4-DIGIT RPIN &amp; UNLOCK WALLET</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : !isResetMode ? (
          /* SCENARIO 2: RETURNING USER -> STANDARD RPIN UNLOCK MODE */
          <div className="space-y-6">
            {/* 4 Digit PIN Masked Boxes */}
            <div className="space-y-2 text-center">
              <label className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                SECURITY RPIN (4 DIGITS)
              </label>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={`lock-digit-${idx}`}
                    id={`lock-digit-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-14 h-16 bg-slate-950 border-2 rounded-2xl text-center text-3xl font-mono font-black transition-all duration-150 focus:outline-none ${
                      pin[idx]
                        ? 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                        : 'border-slate-800 text-slate-400 focus:border-indigo-500'
                    }`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* On-Screen Numeric Keypad for Mobile/Desktop Touch */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'RESET', '0', 'DEL'].map((k) => {
                if (k === 'RESET') {
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setResetStep('SEND_OTP');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="h-12 rounded-2xl bg-slate-950/60 hover:bg-sky-500/20 border border-slate-800 hover:border-sky-500/30 text-sky-400 text-[10px] font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      FORGOT?
                    </button>
                  );
                }
                if (k === 'DEL') {
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadClick('DEL')}
                      className="h-12 rounded-2xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      ⌫ DEL
                    </button>
                  );
                }
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadClick(k)}
                    className="h-12 rounded-2xl bg-slate-950 hover:bg-indigo-600/30 border border-slate-800/80 hover:border-indigo-500/40 text-white font-mono text-lg font-black transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-500 font-mono text-[11px]">Personal Security PIN</span>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setResetStep('SEND_OTP');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer flex items-center gap-1"
              >
                <Bot className="h-3.5 w-3.5 text-sky-400" />
                <span>Forgot RPIN? Reset via Telegram</span>
              </button>
            </div>
          </div>
        ) : (
          /* SCENARIO 3: TELEGRAM OTP RPIN RESET FLOW */
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Reset RPIN via Telegram Bot</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to Lock
              </button>
            </div>

            {/* STEP 1: SEND OTP */}
            {resetStep === 'SEND_OTP' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Telegram OTP Verification Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    To reset your 4-digit Security RPIN, a 6-digit verification code will be sent to your linked Telegram Bot Chat ID (
                    <strong className="text-white font-mono">
                      {currentUser.telegram_chat_id || currentUser.telegram_id || `Account ${currentUser.user_custom_id}`}
                    </strong>
                    ).
                  </p>
                </div>

                <a
                  href={settings.otp_telegram_bot_url || `https://t.me/${(settings.otp_telegram_bot_username || 'PAYZYBOT').replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-sky-500/40 rounded-xl text-sky-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Bot className="h-4 w-4" />
                  <span>Open Alert Bot ({settings.otp_telegram_bot_username || '@PAYZYBOT'})</span>
                </a>

                <button
                  type="button"
                  onClick={handleSendResetOtp}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-sky-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send 6-Digit OTP to Telegram</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: VERIFY OTP */}
            {resetStep === 'VERIFY_OTP' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400 font-bold">
                      ENTER 6-DIGIT OTP CODE
                    </label>
                    {otpTimer > 0 ? (
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        Expires: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendResetOtp}
                        className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="849201"
                    className="w-full py-3 bg-slate-950 border border-sky-500 rounded-2xl text-center text-2xl tracking-[0.4em] text-white font-mono font-black focus:outline-none transition shadow-inner"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtpForReset}
                  disabled={otpCode.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify OTP Code</span>
                </button>
              </div>
            )}

            {/* STEP 3: SET NEW RPIN */}
            {resetStep === 'NEW_PIN' && (
              <form onSubmit={handleSaveNewRpin} className="space-y-4">
                <div>
                  <label className="block text-center text-xs font-bold text-slate-300 mb-2 font-mono">
                    Enter New 4-Digit RPIN
                  </label>
                  <div className="flex justify-center gap-2.5">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={`new-pin-${idx}`}
                        id={`new-pin-${idx}`}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={newPin[idx]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-1);
                          const next = [...newPin];
                          next[idx] = val;
                          setNewPin(next);
                          if (val && idx < 3) {
                            const nextEl = document.getElementById(`new-pin-${idx + 1}`);
                            if (nextEl) nextEl.focus();
                          }
                        }}
                        className="w-12 h-14 bg-slate-950 border border-indigo-500 focus:border-indigo-400 rounded-2xl text-center text-xl font-mono font-black text-indigo-400 focus:outline-none transition"
                        required
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-center text-xs font-bold text-slate-300 mb-2 font-mono">
                    Confirm New 4-Digit RPIN
                  </label>
                  <div className="flex justify-center gap-2.5">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={`confirm-pin-${idx}`}
                        id={`confirm-pin-${idx}`}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={confirmNewPin[idx]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-1);
                          const next = [...confirmNewPin];
                          next[idx] = val;
                          setConfirmNewPin(next);
                          if (val && idx < 3) {
                            const nextEl = document.getElementById(`confirm-pin-${idx + 1}`);
                            if (nextEl) nextEl.focus();
                          }
                        }}
                        className="w-12 h-14 bg-slate-950 border border-emerald-500 focus:border-emerald-400 rounded-2xl text-center text-xl font-mono font-black text-emerald-400 focus:outline-none transition"
                        required
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Save New RPIN &amp; Unlock</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
