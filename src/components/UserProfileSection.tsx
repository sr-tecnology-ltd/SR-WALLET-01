import React, { useState, useEffect } from 'react';
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
  Mail,
} from 'lucide-react';

export const UserProfileSection: React.FC<{
  onOpenDeveloper?: () => void;
  onLogout?: () => void;
}> = ({ onOpenDeveloper, onLogout }) => {
  const { currentUser, currentWallet, transactions, formatINR, openRpinModal, logoutUser, updateProfile } = useWallet();

  const [showFullPhone, setShowFullPhone] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState(currentUser.full_name || 'Account Holder');
  const [editingPhone, setEditingPhone] = useState(false);
  const [userPhone, setUserPhone] = useState(currentUser.mobile || '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [userEmail, setUserEmail] = useState(currentUser.email || '');
  const [editingTelegram, setEditingTelegram] = useState(false);
  const [telegramNode, setTelegramNode] = useState(currentUser.telegram_chat_id || currentUser.telegram_id || '');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Sync state whenever currentUser fields change (only if not actively typing)
  useEffect(() => {
    if (!editingName) setUserName(currentUser.full_name || 'Account Holder');
    if (!editingPhone) setUserPhone(currentUser.mobile || '');
    if (!editingEmail) setUserEmail(currentUser.email || '');
    if (!editingTelegram) setTelegramNode(currentUser.telegram_chat_id || currentUser.telegram_id || '');
  }, [
    currentUser.full_name,
    currentUser.mobile,
    currentUser.email,
    currentUser.telegram_chat_id,
    currentUser.telegram_id,
    editingName,
    editingPhone,
    editingEmail,
    editingTelegram,
  ]);

  const myTransactions = transactions.filter((t) => t.user_id === currentUser.id || t.user_id === currentUser.user_custom_id);

  const maskedPhone = showFullPhone
    ? userPhone || 'Not Set'
    : userPhone && userPhone.length >= 6
    ? `${userPhone.slice(0, 3)}XXXX${userPhone.slice(-3)}`
    : userPhone || 'Not Set';

  const handleSaveName = () => {
    if (!userName.trim()) return;
    const res = updateProfile({ full_name: userName.trim() });
    setEditingName(false);
    setMsg(res.message || 'Name updated successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSavePhone = () => {
    if (!userPhone.trim()) return;
    const res = updateProfile({ mobile: userPhone.trim() });
    setEditingPhone(false);
    setMsg(res.message || 'Mobile number updated successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveEmail = () => {
    const res = updateProfile({ email: userEmail.trim() });
    setEditingEmail(false);
    setMsg(res.message || 'Email updated successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveTelegram = () => {
    const cleanTg = telegramNode.trim();
    const isChatId = /^[0-9]+$/.test(cleanTg);
    const res = updateProfile({
      telegram_chat_id: isChatId ? cleanTg : undefined,
      telegram_id: isChatId ? undefined : cleanTg.startsWith('@') ? cleanTg : cleanTg ? `@${cleanTg}` : undefined,
    });
    setEditingTelegram(false);
    setMsg(res.message || 'Telegram Node ID updated successfully!');
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
          `"${t.id}","${t.type}",${t.amount},${t.fee},${t.net_amount},"${t.status}","${t.reference_id}","${(t.description || '').replace(
            /"/g,
            '""'
          )}",${t.balance_before || 0},${t.balance_after || 0},"${t.created_at}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SR_GATEWAY_Statement_${currentUser.user_custom_id}_${Date.now()}.csv`;
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
                {(currentUser.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>{currentUser.full_name}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              User ID: <span className="text-indigo-400 font-bold">{currentUser.user_custom_id}</span> • Status: <span className="text-emerald-400 font-bold uppercase">{currentUser.status}</span>
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
          PERSONAL IDENTITY & CONTACT (VERIFIED)
        </h3>

        {/* Full Name */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex-1 mr-2">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Full Legal Name</div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-900 border border-indigo-500 rounded-xl px-3 py-1 text-sm text-white font-bold focus:outline-none w-full max-w-xs"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-base font-black text-white mt-0.5">{currentUser.full_name}</div>
            )}
          </div>
          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Phone Number */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 mr-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Registered Mobile Number (Wallet A/C)</div>
              {editingPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="bg-slate-900 border border-indigo-500 rounded-xl px-3 py-1 text-sm text-white font-mono font-bold focus:outline-none w-full max-w-xs"
                  />
                  <button
                    onClick={handleSavePhone}
                    className="p-1.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-mono font-bold text-white mt-0.5">{maskedPhone}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!editingPhone && (
              <>
                <button
                  onClick={() => setShowFullPhone(!showFullPhone)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition cursor-pointer"
                  title="Show/Hide Full Phone"
                >
                  {showFullPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setEditingPhone(true)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition cursor-pointer"
                  title="Edit Mobile Number"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Email Address (Gmail) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 mr-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Registered Email (Gmail Alerts)</div>
              {editingEmail ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="bg-slate-900 border border-purple-500 rounded-xl px-3 py-1 text-sm text-white font-mono focus:outline-none w-full max-w-xs"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="p-1.5 bg-purple-500 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-mono font-bold text-purple-300 mt-0.5">
                  {currentUser.email || 'No email registered'}
                </div>
              )}
            </div>
          </div>
          {!editingEmail && (
            <button
              onClick={() => setEditingEmail(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Security & Theme Settings Card */}
      <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
          SECURITY & TELEGRAM ALERT SETTINGS
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
              <div className="text-[10px] text-slate-400 font-mono">OTP via Telegram Bot &amp; Email Node</div>
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
          <div className="flex items-center gap-3 flex-1 mr-2">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <Send className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase">TELEGRAM NODE / CHAT ID</div>
              {editingTelegram ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={telegramNode}
                    onChange={(e) => setTelegramNode(e.target.value)}
                    placeholder="Enter Telegram Chat ID or @username"
                    className="bg-slate-900 border border-sky-500 rounded-xl px-3 py-1 text-xs text-white font-mono font-bold w-full max-w-xs focus:outline-none"
                  />
                  <button
                    onClick={handleSaveTelegram}
                    className="p-1.5 bg-sky-500 text-slate-950 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">
                  {currentUser.telegram_chat_id || currentUser.telegram_id || 'Not connected'}
                </div>
              )}
            </div>
          </div>
          {!editingTelegram && (
            <button
              onClick={() => setEditingTelegram(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition cursor-pointer"
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
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-mono text-xs font-bold transition cursor-pointer"
          >
            MODIFY
          </button>
        </div>
      </div>

      {/* Account Statement Section */}
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
            logoutUser();
            setMsg('Account Logged Out Successfully! 🔒');
            setTimeout(() => {
              if (onLogout) onLogout();
            }, 500);
          }}
          className="w-full py-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/30 active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-rose-400/30"
        >
          <LogOut className="h-4 w-4 text-white" />
          <span>LOG OUT (EXIT SESSION)</span>
        </button>
      </div>
    </div>
  );
};
