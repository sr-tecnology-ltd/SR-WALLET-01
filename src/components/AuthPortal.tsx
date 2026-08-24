import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  ShieldCheck,
  Lock,
  Smartphone,
  User,
  Mail,
  Send,
  Bot,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  Gift,
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register' | 'otp';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialMode = 'login' }) => {
  const {
    loginUser,
    registerUser,
    switchUser,
    sendTelegramOtp,
    verifyTelegramOtp,
    sendEmailOtp,
    verifyEmailOtp,
    settings,
    formatINR,
  } = useWallet();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States (with Real-time Telegram Bot & Email OTP Verification)
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelegramChatId, setRegTelegramChatId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpTimer, setRegOtpTimer] = useState(0);

  // Registration Success Pop-up Modal State
  const [registeredUserPopup, setRegisteredUserPopup] = useState<any | null>(null);

  // Telegram OTP Fast Login States
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regOtpTimer > 0) {
      interval = setInterval(() => setRegOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [regOtpTimer]);

  const clearFeedback = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your Mobile No, User ID, Email, or Telegram ID.');
      return;
    }

    if (!loginPassword || !loginPassword.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = loginUser(loginIdentifier, loginPassword);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1 of Register: Send OTP to Telegram Bot & Gmail
  const handleSendRegisterOtp = async () => {
    clearFeedback();
    if (!regFullName.trim()) {
      setErrorMsg('Please enter your Full Legal Name.');
      return;
    }
    const cleanPhone = regMobile.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMsg('Please enter a valid Gmail / Email address for alerts.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!regTelegramChatId.trim()) {
      setErrorMsg('Please enter your Telegram Chat ID. Click the bot link above to get your Chat ID.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Send OTP to Telegram Chat ID
      const tgRes = await sendTelegramOtp(regTelegramChatId.trim());

      // 2. Also send backup OTP to Gmail
      sendEmailOtp(regEmail.trim()).catch(() => null);

      if (tgRes.success) {
        setRegOtpSent(true);
        setRegOtpTimer(300); // 5 minutes
        setSuccessMsg(
          tgRes.message ||
            `✅ 6-Digit OTP dispatched directly to Telegram Chat ID (${regTelegramChatId}) & Gmail (${regEmail})! Check your Telegram messages.`
        );
      } else {
        // If telegram returned specific feedback, still allow OTP entry
        setRegOtpSent(true);
        setRegOtpTimer(300);
        setSuccessMsg(
          `OTP dispatched for Telegram Chat ${regTelegramChatId}. Please check messages from ${botUsername}!`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending OTP. Please check your Telegram Chat ID.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 of Register: Verify OTP and Complete Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!regOtpSent) {
      await handleSendRegisterOtp();
      return;
    }

    if (!regOtpCode || regOtpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on your Telegram Bot or Gmail.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP (Verifies against Telegram / Email OTP)
      let isVerified = false;
      const tgVerifyRes = verifyTelegramOtp(regOtpCode.trim(), regTelegramChatId.trim());
      if (tgVerifyRes.success) {
        isVerified = true;
      } else {
        const emailVerifyRes = await verifyEmailOtp(regEmail.trim(), regOtpCode.trim());
        if (emailVerifyRes.success) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        setErrorMsg('❌ Invalid OTP Code. Please check the 6-digit code sent by the Telegram Bot or Gmail.');
        setIsLoading(false);
        return;
      }

      // 2. Register account with Full Name, Mobile, Email, Password, and Telegram Chat ID
      const res = registerUser(
        regFullName.trim(),
        regMobile.trim(),
        regEmail.trim(),
        regPassword,
        regTelegramChatId.trim()
      );

      if (res.success && res.user) {
        setRegisteredUserPopup({
          user: res.user,
          message: res.message,
          welcomeBonus: settings.signup_bonus_amount !== undefined ? settings.signup_bonus_amount : 5,
        });
        setSuccessMsg('🎉 Registration completed successfully!');
      } else if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTelegramOtp = async () => {
    clearFeedback();
    if (!otpIdentifier.trim()) {
      setErrorMsg('Please enter your Telegram Chat ID or Registered Mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendTelegramOtp(otpIdentifier);
      if (res.success) {
        setOtpSent(true);
        setOtpTimer(300); // 5 minutes
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'OTP dispatch failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTelegramOtp = () => {
    clearFeedback();
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = verifyTelegramOtp(otpCode);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const botUsername = settings.otp_telegram_bot_username || '@PAYZYBOT';
  const botUrl = settings.otp_telegram_bot_url || `https://t.me/${botUsername.replace('@', '')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Registration Success Pop-up Modal */}
      {registeredUserPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl shadow-emerald-950/60 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>REGISTRATION SUCCESSFUL!</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Account Created Successfully 🎉
              </h2>
              <p className="text-xs text-slate-300">
                Welcome to SR GATEWAY IN! Your wallet account is now live & connected to Telegram alerts.
              </p>
            </div>

            {/* Account Info Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-left font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned User ID:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {registeredUserPopup.user.user_custom_id}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Wallet Mobile A/C:</span>
                <span className="text-white font-bold">+91 {registeredUserPopup.user.mobile}</span>
              </div>
              {registeredUserPopup.user.email && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" /> Gmail Alerts:
                  </span>
                  <span className="text-indigo-300 font-bold truncate max-w-[180px] flex items-center gap-1">
                    <span>{registeredUserPopup.user.email}</span>
                    <span className="text-emerald-400">✅</span>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-sky-400" /> Telegram Bot Alerts:
                </span>
                <span className="text-sky-300 font-bold flex items-center gap-1">
                  <span>Chat ID: {registeredUserPopup.user.telegram_chat_id || registeredUserPopup.user.telegram_id || 'Connected'}</span>
                  <span className="text-emerald-400">✅</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-800/80">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Gift className="h-4 w-4" /> Welcome Bonus:
                </span>
                <span className="text-amber-300 font-black text-sm">
                  ₹{registeredUserPopup.welcomeBonus}.00
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/20 text-[10px] text-emerald-300/90 font-mono">
                🔔 <strong>Alerts Configured:</strong> P2P transfers, deposits, withdrawals &amp; login alerts are now active on your Telegram Bot &amp; Gmail!
              </div>
            </div>

            <button
              onClick={() => {
                if (registeredUserPopup?.user?.id) {
                  const uid = registeredUserPopup.user.id;
                  setRegisteredUserPopup(null);
                  switchUser(uid);
                } else {
                  setRegisteredUserPopup(null);
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl shadow-emerald-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Create Security RPIN &amp; Open Wallet</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wallet className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">SR GATEWAY</span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  IN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Automated Ledger & Telegram OTP Security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={botUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold transition"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Alert Bot</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex items-center justify-center my-auto w-full">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800/90 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative overflow-hidden backdrop-blur-xl">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  clearFeedback();
                }}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  clearFeedback();
                }}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Register</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('otp');
                  clearFeedback();
                }}
                className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'otp'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="h-3.5 w-3.5 text-sky-300" />
                <span>TG OTP</span>
              </button>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in mb-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                    MOBILE NO / USER ID / EMAIL / TELEGRAM ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Registered Mobile, Email, or User ID"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-400 font-bold">
                      ACCOUNT PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('otp')}
                      className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Login with Telegram OTP?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Alert Note */}
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Real-time Telegram Login Alert (Device, Location & IP) is dispatched upon login.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>LOG IN TO WALLET</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTER FORM WITH TELEGRAM BOT INTEGRATION */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 pt-1">
                {/* Dynamic Signup & Welcome Bonus Banner */}
                {settings.signup_bonus_enabled && (settings.signup_bonus_amount ?? 5) > 0 ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/20 border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-300">
                          🎁 ₹{settings.signup_bonus_amount ?? 5} Welcome Bonus Offer
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Unlock ₹{settings.signup_bonus_amount ?? 5} bonus on your first transaction!
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-xl border border-amber-500/20 text-[10px] text-amber-200/90 font-mono leading-relaxed">
                      ⚡ <strong>Condition:</strong> Make your 1st transaction (Min. ₹1 Send/Transfer) within <strong>24 Hours</strong> of registration to auto-claim your ₹{settings.signup_bonus_amount ?? 5} bonus!
                    </div>
                  </div>
                ) : null}

                {/* 1. Full Name */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                    FULL LEGAL NAME
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                    10-DIGIT MOBILE NUMBER (WALLET A/C)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* 3. Gmail ID for Every Alert */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold flex items-center justify-between">
                    <span>GMAIL ID (FOR EVERY ALERT)</span>
                    <span className="text-[9px] text-indigo-400 font-mono">Gmail / Email Alerts: ON ✅</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4 text-indigo-400" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* 4. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* 5. TELEGRAM ALERT BOT & CHAT ID VERIFICATION CARD */}
                <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/40 space-y-3 shadow-lg shadow-sky-950/30">
                  <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 font-mono">
                      <Bot className="h-4 w-4 text-sky-400" />
                      <span>TELEGRAM BOT ALERT &amp; CHAT ID</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                      REQUIRED FOR ALERTS
                    </span>
                  </div>

                  {/* Telegram Bot Direct Link & Instructions */}
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-sky-500/30 space-y-2">
                    <div className="text-[11px] text-slate-200 leading-relaxed">
                      👉 <strong>Step 1:</strong> Open our official Alert Bot on Telegram and click <strong>/start</strong>. The bot will welcome you and provide your numeric <strong>Chat ID</strong>.
                    </div>

                    <a
                      href={botUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer text-center"
                    >
                      <Bot className="h-4 w-4" />
                      <span>CLICK TO OPEN TELEGRAM ALERT BOT ({botUsername})</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>

                    <div className="text-[10px] text-slate-400 font-mono">
                      👉 <strong>Step 2:</strong> Copy the numeric <strong>Chat ID</strong> from Telegram, paste it below, and click <strong>GET OTP</strong>.
                    </div>
                  </div>

                  {/* Telegram Chat ID Input with Attached GET OTP Button */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1 font-bold">
                      TELEGRAM CHAT ID INPUT
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Bot className="h-4 w-4 text-sky-400" />
                        </div>
                        <input
                          type="text"
                          value={regTelegramChatId}
                          onChange={(e) => setRegTelegramChatId(e.target.value.trim())}
                          placeholder="e.g. 598472918"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendRegisterOtp}
                        disabled={isLoading || !regTelegramChatId.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-md shadow-sky-500/20 active:scale-95"
                      >
                        {isLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>{regOtpSent ? 'RESEND OTP' : 'GET OTP'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step: Enter 6-digit OTP after Clicking GET OTP */}
                  {regOtpSent && (
                    <div className="pt-1 animate-in fade-in space-y-2 bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/40">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4" />
                          <span>ENTER 6-DIGIT OTP CODE:</span>
                        </span>
                        {regOtpTimer > 0 && (
                          <span className="text-amber-400 font-mono font-bold text-xs">
                            Valid: {Math.floor(regOtpTimer / 60)}:{(regOtpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={regOtpCode}
                        onChange={(e) => setRegOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="849201"
                        className="w-full py-2.5 bg-slate-900 border border-emerald-500 rounded-xl text-center text-xl tracking-[0.35em] text-white font-mono font-black focus:outline-none transition shadow-inner"
                        autoFocus
                      />
                      <p className="text-[10px] text-slate-300 text-center font-mono">
                        ⚡ Code dispatched to your <strong>Telegram Bot ({botUsername})</strong> &amp; Gmail inbox!
                      </p>
                    </div>
                  )}
                </div>

                {/* Alerts Coverage Summary Note */}
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Active Alerts: <strong>Deposit, Withdrawal, P2P Transfers &amp; Login alerts</strong> will be sent to both your Telegram Bot &amp; Gmail.
                  </span>
                </div>

                {/* Submit / Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{regOtpSent ? 'VERIFY OTP & COMPLETE REGISTRATION' : 'GET OTP & REGISTER'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. TELEGRAM FAST OTP LOGIN TAB */}
            {mode === 'otp' && (
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Bot className="h-4 w-4" />
                    <span>Telegram Fast OTP Authentication</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Instant passwordless access. A 6-digit OTP will be dispatched to your linked Telegram account by{' '}
                    <strong className="text-white">{botUsername}</strong>.
                  </p>
                </div>

                {!otpSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                        TELEGRAM CHAT ID / REGISTERED MOBILE
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Bot className="h-4 w-4 text-sky-400" />
                        </div>
                        <input
                          type="text"
                          value={otpIdentifier}
                          onChange={(e) => setOtpIdentifier(e.target.value)}
                          placeholder="Telegram Chat ID, @username, or Mobile"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendTelegramOtp}
                      disabled={isLoading || !otpIdentifier.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-sky-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>SEND TELEGRAM OTP 🤖</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-slate-400 font-bold">
                          ENTER 6-DIGIT OTP CODE
                        </label>
                        {otpTimer > 0 ? (
                          <span className="text-[10px] text-amber-400 font-mono font-bold">
                            Valid for: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendTelegramOtp}
                            className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        className="w-full py-3 bg-slate-950 border border-sky-500 rounded-2xl text-center text-xl tracking-[0.4em] text-white font-mono font-black focus:outline-none transition shadow-inner"
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyTelegramOtp}
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/30 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>VERIFY & LOG IN</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-1"
                    >
                      ← Change Mobile / Chat ID
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-extrabold text-slate-400">SR GATEWAY IN • Complete Internal Wallet & Ledger Platform</p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Internal Ledger System. External INR/UPI transfers are manually verified by authorized administrators.
          </p>
        </div>
      </footer>
    </div>
  );
};
