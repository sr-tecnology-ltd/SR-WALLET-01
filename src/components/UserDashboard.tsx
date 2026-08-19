import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Send,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Lock,
  Code,
  Bot,
  KeyRound,
  FileText,
  ShieldCheck,
  User,
  Power,
  Zap,
  Sparkles,
  Gift,
  Timer,
  AlertCircle,
} from 'lucide-react';

export const UserDashboard: React.FC<{
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenTransfer: () => void;
  onOpenTransactions: () => void;
  onOpenDeveloper?: () => void;
  onOpenSupport?: () => void;
  onOpenTelegramOtp?: () => void;
  onOpenUpiApiGateway?: () => void;
  onOpenProfile?: () => void;
}> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onOpenTransactions,
  onOpenDeveloper,
  onOpenSupport,
  onOpenTelegramOtp,
  onOpenUpiApiGateway,
  onOpenProfile,
}) => {
  const {
    currentUser,
    currentWallet,
    deposits,
    withdrawals,
    transactions,
    settings,
    formatINR,
    toggleRoleMode,
  } = useWallet();

  // User-specific metrics
  const myDeposits = deposits.filter((d) => d.user_id === currentUser.id || d.user_id === currentUser.user_custom_id);
  const totalDepositAmount = myDeposits
    .filter((d) => d.status === 'SUCCESS')
    .reduce((sum, d) => sum + d.net_amount, 0);
  const pendingDepositCount = myDeposits.filter((d) => d.status === 'PENDING').length;
  const pendingDepositSum = myDeposits
    .filter((d) => d.status === 'PENDING')
    .reduce((sum, d) => sum + d.amount, 0);

  const myWithdrawals = withdrawals.filter((w) => w.user_id === currentUser.id || w.user_id === currentUser.user_custom_id);
  const totalWithdrawalAmount = myWithdrawals
    .filter((w) => w.status === 'SUCCESS')
    .reduce((sum, w) => sum + w.net_payout, 0);
  const pendingWithdrawalCount = myWithdrawals.filter((w) => w.status === 'PENDING').length;
  const pendingWithdrawalSum = myWithdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amount, 0);

  const myTransactions = transactions.filter(
    (t) =>
      t.user_id === currentUser.id ||
      t.user_id === currentUser.user_custom_id ||
      t.user_custom_id === currentUser.user_custom_id ||
      (currentUser.mobile && t.description?.includes(currentUser.mobile.replace(/[^0-9]/g, '').slice(-10)))
  );

  // System Services Grid Configuration (Cleaned & Updated as requested)
  const systemServices = [
    {
      id: 1,
      title: 'Deposit INR',
      subtitle: '0% Fee UPI & QR',
      icon: PlusCircle,
      badge: 'INSTANT',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      action: onOpenDeposit,
    },
    {
      id: 2,
      title: 'Withdraw Money',
      subtitle: 'Bank Payout',
      icon: ArrowUpRight,
      badge: 'FAST',
      color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
      action: onOpenWithdraw,
    },
    {
      id: 3,
      title: 'USER TO USER SEND',
      subtitle: 'P2P SR Wallet Transfer',
      icon: Send,
      badge: '0% FEE',
      color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
      action: onOpenTransfer,
    },
    {
      id: 4,
      title: 'UPI API Gateway',
      subtitle: 'Coming Soon • Telegram Info',
      icon: Zap,
      badge: 'SOON',
      color: 'from-indigo-500/20 to-purple-600/10 border-indigo-500/30 text-indigo-400',
      action: onOpenUpiApiGateway || onOpenDeveloper,
    },
    {
      id: 5,
      title: 'Telegram Bot OTP',
      subtitle: 'Passwordless Login',
      icon: Bot,
      badge: 'ACTIVE',
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
      action: onOpenTelegramOtp,
    },
    {
      id: 6,
      title: 'Devloper api setting',
      subtitle: 'Secret Key & PAT Docs',
      icon: KeyRound,
      badge: 'KEYS',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      action: () => {
        onOpenDeveloper?.();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 7,
      title: 'Official Channel',
      subtitle: settings.telegram_channel_name,
      icon: MessageSquare,
      badge: 'JOIN',
      color: 'from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-300',
      action: () => window.open(settings.telegram_channel_url, '_blank'),
    },
    {
      id: 8,
      title: '24/7 Support Bot',
      subtitle: 'Instant Help Desk',
      icon: MessageSquare,
      badge: 'ONLINE',
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-300',
      action: onOpenSupport,
    },
  ];

  // Dynamic Welcome Bonus calculation & countdown
  const bonusAmount =
    currentUser.welcome_bonus_amount !== undefined
      ? currentUser.welcome_bonus_amount
      : (settings.signup_bonus_amount !== undefined ? settings.signup_bonus_amount : 5);
  const isBonusPending =
    currentUser.welcome_bonus_status === 'PENDING' ||
    (currentUser.welcome_bonus_status === undefined &&
      settings.signup_bonus_enabled &&
      bonusAmount > 0 &&
      !currentUser.has_made_first_transaction);

  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isBonusExpiredState, setIsBonusExpiredState] = useState(false);

  useEffect(() => {
    if (!isBonusPending) return;

    const calculateRemaining = () => {
      const expiry = currentUser.welcome_bonus_expires_at
        ? new Date(currentUser.welcome_bonus_expires_at).getTime()
        : new Date(currentUser.created_at || Date.now()).getTime() + (settings.welcome_bonus_expiry_hours || 24) * 60 * 60 * 1000;

      const diff = expiry - Date.now();
      if (diff <= 0) {
        setTimeLeftStr('Expired');
        setIsBonusExpiredState(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
        setIsBonusExpiredState(false);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [currentUser, settings, isBonusPending]);

  return (
    <div className="space-y-6">
      {/* ⚠️ DEMO ACCOUNT RESTRICTION NOTICE */}
      {currentUser.is_demo && (
        <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">Demo Account (Read-Only Mode)</div>
              <div className="text-[11px] text-amber-200/80 font-mono">
                This is a demo account. Real transactions, deposits, withdrawals, and balance transfers are strictly disabled.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black bg-amber-500/30 text-amber-200 border border-amber-500/50 px-2.5 py-1 rounded-full uppercase shrink-0">
            DEMO MODE
          </span>
        </div>
      )}

      {/* 🎁 DYNAMIC WELCOME BONUS BANNER (Pending 1st Transaction) */}
      {isBonusPending && !isBonusExpiredState && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Gift className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-black text-amber-300 tracking-wide">
                  🎁 ₹{bonusAmount} Welcome Bonus Auto-Unlock Offer
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  <span>Expires in: {timeLeftStr || '24h'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                ⚡ <strong>Condition:</strong> Make your 1st transaction (Min. <strong>₹1</strong> Send/Transfer) within <strong>24 Hours</strong> to claim and instantly credit ₹{bonusAmount} to your wallet!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTransfer}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Send ₹1 & Claim ₹{bonusAmount}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Claimed Welcome Bonus Confirmation Tag */}
      {currentUser.welcome_bonus_status === 'CLAIMED' && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-300">Welcome Bonus Claimed: </span>
              <span className="text-slate-300 font-mono">₹{bonusAmount} was successfully credited to your wallet upon your 1st transaction.</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
            CLAIMED ⚡
          </span>
        </div>
      )}

      {/* High Quality Wallet Card Section (Screenshots #17 & #20 match) */}
      <div className="grid grid-cols-12 gap-5">
        {/* Main Wallet Hero Card */}
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Merchant Status Row */}
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase font-mono">
                  VERIFIED MERCHANT
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Sk
                </span>
              </div>
              <button
                onClick={onOpenProfile}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-800 transition"
                title="Account Profile"
              >
                <Power className="h-4 w-4 text-emerald-400" />
              </button>
            </div>

            {/* Net Vault Balance Box */}
            <div className="space-y-1">
              <div className="text-[11px] font-mono tracking-widest text-emerald-300 font-extrabold uppercase">
                NET VAULT BALANCE
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono">
                {formatINR(currentWallet.available_balance)}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Wallet A/C No: <span className="text-emerald-400 font-bold">{currentUser.mobile}</span>
              </p>

              {currentWallet.locked_balance > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit font-mono font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Locked Funds in Pending Withdrawal: {formatINR(currentWallet.locked_balance)}</span>
                </div>
              )}
            </div>

            {/* UPI API Gateway Bar Sub-Card */}
            <button
              onClick={onOpenUpiApiGateway || onOpenDeveloper}
              className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/25 hover:border-emerald-400 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <span>UPI API Gateway</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      COMING SOON
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Announcement in our official Telegram channel</div>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            {/* Inflow / Outflow Summary */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-2 text-xs">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Verified Deposits</div>
                  <div className="font-extrabold font-mono text-emerald-400 text-xs">
                    {formatINR(totalDepositAmount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-2 text-xs">
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Verified Withdrawals</div>
                  <div className="font-extrabold font-mono text-rose-400 text-xs">
                    {formatINR(totalWithdrawalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 mt-6 pt-5 border-t border-emerald-500/15 flex flex-wrap gap-3">
            <button onClick={onOpenDeposit} className="btn-system-emerald">
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span>Deposit Money</span>
            </button>

            <button onClick={onOpenWithdraw} className="btn-system-primary">
              <ArrowUpRight className="h-4 w-4" />
              <span>Withdraw Payout</span>
            </button>

            <button onClick={onOpenTransfer} className="btn-system-glass">
              <Send className="h-4 w-4" />
              <span>USER TO USER SEND</span>
            </button>
          </div>
        </div>

        {/* Pending Requests Queue Status Side Box */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
              Pending Queue Status
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Pending Deposits</div>
                    <div className="text-[10px] text-slate-400 font-mono">{pendingDepositCount} Request(s)</div>
                  </div>
                </div>
                <div className="font-mono font-extrabold text-amber-400 text-xs">
                  {formatINR(pendingDepositSum)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Pending Withdrawals</div>
                    <div className="text-[10px] text-slate-400 font-mono">{pendingWithdrawalCount} Request(s)</div>
                  </div>
                </div>
                <div className="font-mono font-extrabold text-indigo-400 text-xs">
                  {formatINR(pendingWithdrawalSum)}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenTransactions}
            className="w-full mt-4 py-3 bg-slate-950 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-bold text-xs rounded-2xl border border-slate-800 transition text-center cursor-pointer flex items-center justify-center gap-2"
          >
            <span>View Transaction History</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* UNIFIED SR GATEWAY SYSTEM SERVICES CONTROL PANEL */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>⚡ SR GATEWAY System Services & Controls</span>
            </h2>
            <p className="text-xs text-slate-400">
              Cohesive system action buttons for wallet operations, merchant API, Telegram bots, and admin controls.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {systemServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.id}
                onClick={svc.action}
                className="p-4 rounded-3xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-200 active:scale-95 shadow-xl group cursor-pointer flex flex-col justify-between min-h-[120px] space-y-3"
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2.5 rounded-2xl bg-gradient-to-br ${svc.color} border shadow-md flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400">
                    {svc.badge}
                  </span>
                </div>

                <div>
                  <div className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                    {svc.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {svc.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Recent Transaction Ledger</h3>
            <p className="text-xs text-slate-400">
              Live ledger for Deposits, Withdrawals, P2P Transfers & Wallet Payments
            </p>
          </div>
          <button
            onClick={onOpenTransactions}
            className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Full History</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {myTransactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-xs font-mono">No transaction history found.</p>
          ) : (
            myTransactions.slice(0, 7).map((tx) => {
              const isCredit =
                tx.type === 'DEPOSIT' ||
                tx.type === 'TRANSFER_IN' ||
                tx.type === 'ADMIN_CREDIT' ||
                tx.type === 'DAILY_BONUS' ||
                tx.type === 'REFERRAL_BONUS';

              const txnId = tx.id.startsWith('SR-') ? tx.id : `SR-${tx.id.toUpperCase()}`;

              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black text-xs shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                      }`}
                    >
                      <span className="text-sm font-black leading-none">{isCredit ? '↓' : '↑'}</span>
                      <span className="text-[8px] font-mono uppercase tracking-tighter mt-0.5">
                        {isCredit ? 'CR' : 'DR'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                        <span>{tx.description}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sky-300 font-bold">TXN ID: {txnId}</span>
                        <span>•</span>
                        <span>{new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div
                      className={`font-mono font-black text-sm flex items-center justify-end gap-1 ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{isCredit ? '+' : '-'}{formatINR(tx.net_amount)}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider ${
                          isCredit
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isCredit ? 'RECEIVED' : 'DEBIT'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
