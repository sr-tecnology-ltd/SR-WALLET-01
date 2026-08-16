import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  User,
  ShieldCheck,
  Smartphone,
  Send,
  KeyRound,
  Download,
  FileText,
  Eye,
  EyeOff,
  Pencil,
  Check,
  LogOut,
  Sparkles,
  RefreshCw,
  Lock,
  Moon,
  Sun,
} from 'lucide-react';

export const UserProfileSection: React.FC<{
  onOpenDeveloper?: () => void;
  onLogout?: () => void;
}> = ({ onOpenDeveloper, onLogout }) => {
  const { currentUser, currentWallet, transactions, formatINR, switchUser, allProfiles, openRpinModal } = useWallet();

  const [showFullPhone, setShowFullPhone] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState(currentUser.full_name || 'SK SAHIL');
  const [editingTelegram, setEditingTelegram] = useState(false);
  const [telegramNode, setTelegramNode] = useState('6561010416');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  const myTransactions = transactions.filter((t) => t.user_id === currentUser.id);

  const maskedPhone = showFullPhone
    ? currentUser.mobile || '7478338867'
    : `${(currentUser.mobile || '7478338867').slice(0, 3)}XXXX${(currentUser.mobile || '7478338867').slice(-3)}`;

  const handleSaveName = () => {
    setEditingName(false);
    setMsg('Name updated successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveTelegram = () => {
    setEditingTelegram(false);
    setMsg('Telegram Node ID updated!');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleRPINRecovery = () => {
    openRpinModal({
      mode: 'SET',
      title: '🔒 Change 4-Digit Security RPIN',
      description: 'Enter a new 4-digit Security RPIN for your account.',
      onSuccessCallback: () => {
        setMsg('4-Digit Security RPIN updated successfully!');
        setTimeout(() => setMsg(null), 3000);
      },
    });
  };

  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    setMsg(nextMode ? '🌑 Dark / Night Mood Activated' : '☀️ Bright / Day Mood Activated');
    setTimeout(() => setMsg(null), 3000);
  };

  const downloadStatementCSV = () => {
    const headers =
      'Transaction ID,Type,Amount (INR),Fee,Net Amount,Status,Reference ID,Description,Balance Before,Balance After,Date\n';
    const rows = myTransactions
      .map(
        (t) =>
          `"${t.id}","${t.type}",${t.amount},${t.fee},${t.net_amount},"${t.status}","${t.reference_id}","${t.description.replace(
            /"/g,
            '""'
          )}",${t.balance_before},${t.balance_after},"${t.created_at}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SR_GATEWAY_Statement_${currentUser.mobile}_${Date.now()}.csv`;
    a.click();
    setMsg('Statement CSV downloaded successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-emerald-500 to-teal-400 p-1 shadow-xl shadow-indigo-600/30">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-3xl">
                {userName.charAt(0)}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>USER</span>
              <span className="text-emerald-400 underline underline-offset-4 decoration-emerald-500/50">PROFILE</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Registered Mobile: <span className="text-emerald-400 font-bold">{currentUser.mobile}</span> • Status: <span className="text-indigo-300 font-bold uppercase">{currentUser.status}</span>
            </p>
          </div>
        </div>

        {msg && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
            {msg}
          </div>
        )}
      </div>

      {/* User Info Details Card */}
      <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
          PERSONAL IDENTITY (VERIFIED)
        </h3>

        {/* Full Name */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">Full Legal Name</div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-900 border border-indigo-500 rounded-xl px-3 py-1 text-sm text-white font-bold focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-base font-black text-white mt-0.5">{userName}</div>
            )}
          </div>
          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Phone Number */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Registered Mobile Number (Wallet A/C)</div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">{maskedPhone}</div>
            </div>
          </div>
          <button
            onClick={() => setShowFullPhone(!showFullPhone)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition"
          >
            {showFullPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Security & Theme Settings Card */}
      <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
          SECURITY & DISPLAY SETTINGS
        </h3>

        {/* Dark / Bright Mood Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>{isDarkMode ? 'DARK 🌑 MOOD (NIGHT)' : 'BRIGHT ☀️ MOOD (DAY)'}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isDarkMode ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isDarkMode ? 'Night theme enabled for your profile' : 'Bright day theme enabled for your profile'}
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleTheme}
            className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${
              isDarkMode ? 'bg-indigo-600' : 'bg-amber-500'
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform flex items-center justify-center text-slate-950 shadow-md ${
                isDarkMode ? 'left-7.5' : 'left-0.5'
              }`}
            >
              {isDarkMode ? <Moon className="h-3 w-3 text-indigo-600" /> : <Sun className="h-3 w-3 text-amber-600" />}
            </div>
          </button>
        </div>

        {/* 2FA Verification */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">2FA VERIFICATION</div>
              <div className="text-[10px] text-slate-400 font-mono">OTP via Telegram Bot Node</div>
            </div>
          </div>
          <button
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                is2FAEnabled ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Telegram Node ID */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">TELEGRAM NODE ID</div>
              {editingTelegram ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={telegramNode}
                    onChange={(e) => setTelegramNode(e.target.value)}
                    className="bg-slate-900 border border-sky-500 rounded-xl px-3 py-1 text-xs text-white font-mono font-bold"
                  />
                  <button
                    onClick={handleSaveTelegram}
                    className="p-1.5 bg-sky-500 text-slate-950 rounded-xl font-bold text-xs"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">{telegramNode}</div>
              )}
            </div>
          </div>
          {!editingTelegram && (
            <button
              onClick={() => setEditingTelegram(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* RPIN Security */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">AUTHORIZATION</div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold">RPIN PROTECTED (4-DIGIT)</div>
            </div>
          </div>
          <button
            onClick={handleRPINRecovery}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-mono text-xs font-bold transition"
          >
            MODIFY
          </button>
        </div>
      </div>

      {/* Account Statement Section (Shifted from Transactions tab as requested) */}
      <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                ACCOUNT STATEMENT & LEDGER
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Available Wallet Balance: {formatINR(currentWallet.available_balance)}
              </p>
            </div>
          </div>
          <button
            onClick={downloadStatementCSV}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Statement</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Generate or download your official ledger statement for tax, merchant audits, and transaction verification.
        </p>
      </div>

      {/* Profile Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleRPINRecovery}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4 text-slate-950" />
          <span>INITIALISE RPIN RECOVERY</span>
        </button>

        <button
          onClick={() => {
            setMsg('Session securely authenticated & refreshed.');
            setTimeout(() => setMsg(null), 3000);
            if (onLogout) onLogout();
          }}
          className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>REFRESH SESSION</span>
        </button>
      </div>
    </div>
  );
};
