import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  ShieldCheck,
  Users,
  PlusCircle,
  ArrowUpRight,
  FileText,
  Settings,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Minus,
  Ban,
  RotateCcw,
  Eye,
  Check,
  DollarSign,
  Lock,
  Megaphone,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Bot,
  KeyRound,
  RefreshCw,
  Gift,
  Sparkles,
  Mail,
  Send,
  Inbox,
  Trash2,
} from 'lucide-react';
import { UserProfile, DepositRequest, WithdrawalRequest, Wallet } from '../types';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    allProfiles,
    allWallets,
    deposits,
    approveDeposit,
    rejectDeposit,
    withdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    markWithdrawalPaid,
    transactions,
    addBalanceByAdmin,
    cutBalanceByAdmin,
    banUser,
    unbanUser,
    settings,
    updateSettings,
    auditLogs,
    formatINR,
  } = useWallet();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'DASHBOARD' | 'USERS' | 'DEPOSITS' | 'WITHDRAWALS' | 'TRANSACTIONS' | 'SETTINGS' | 'AUDIT_LOGS'
  >('DASHBOARD');

  // Search & Filter state
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserProfile | null>(null);
  const [adminActionModal, setAdminActionModal] = useState<'ADD_BAL' | 'CUT_BAL' | 'BAN' | null>(null);
  const [modalAmount, setModalAmount] = useState<number>(1000);
  const [modalReason, setModalReason] = useState<string>('');

  // Fixed Master Admin Security Password Protection (7477661867Ss)
  const MASTER_ADMIN_PASS = '7477661867Ss';
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isPassAuthed, setIsPassAuthed] = useState<boolean>(() => {
    return sessionStorage.getItem('sr_admin_authed') === 'true';
  });
  const [passError, setPassError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === MASTER_ADMIN_PASS) {
      setIsPassAuthed(true);
      sessionStorage.setItem('sr_admin_authed', 'true');
      setPassError(null);
    } else {
      setPassError('❌ Incorrect Master Admin Password. Access Denied!');
    }
  };

  const handleAdminLock = () => {
    setIsPassAuthed(false);
    sessionStorage.removeItem('sr_admin_authed');
  };

  // Rejection Modals
  const [rejectDepositId, setRejectDepositId] = useState<string | null>(null);
  const [depositRejectReason, setDepositRejectReason] = useState<string>('UTR mismatch / Invalid screenshot');

  const [rejectWithdrawalId, setRejectWithdrawalId] = useState<string | null>(null);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState<string>('Incorrect UPI ID or security flag');

  const [markPaidWithdrawalId, setMarkPaidWithdrawalId] = useState<string | null>(null);
  const [markPaidUtr, setMarkPaidUtr] = useState<string>('');

  // Admin Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  // Email Test & Logs State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('sk190rihan@gmail.com');
  const [testEmailType, setTestEmailType] = useState<'LOGIN_ALERT' | 'DEPOSIT_ALERT' | 'WITHDRAW_ALERT'>('LOGIN_ALERT');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    log_id?: string;
    mode?: string;
  } | null>(null);
  const [emailLogsList, setEmailLogsList] = useState<any[]>([]);
  const [isLoadingEmailLogs, setIsLoadingEmailLogs] = useState<boolean>(false);

  const fetchEmailLogs = async () => {
    setIsLoadingEmailLogs(true);
    try {
      const res = await fetch('/api/v1/admin/email-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.logs)) {
          setEmailLogsList(data.logs);
        }
      }
    } catch (e) {
      console.error('Failed to fetch email logs:', e);
    } finally {
      setIsLoadingEmailLogs(false);
    }
  };

  const handleClearEmailLogs = async () => {
    try {
      const res = await fetch('/api/v1/admin/email-logs', { method: 'DELETE' });
      if (res.ok) {
        setEmailLogsList([]);
        showAlert('Email dispatch logs cleared successfully!');
      }
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showAlert('Please enter a valid Gmail / recipient email address.');
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/v1/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailRecipient,
          test_type: testEmailType,
        }),
      });
      const data = await res.json();
      setTestEmailResult({
        success: data.status === 'success',
        message: data.message || (data.status === 'success' ? 'Email test passed!' : 'Email test failed'),
        log_id: data.log_id,
        mode: data.mode,
      });
      fetchEmailLogs();
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || 'Failed to dispatch test email request.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === 'SETTINGS') {
      fetchEmailLogs();
    }
  }, [activeAdminTab]);

  // Status message
  const [adminAlertMsg, setAdminAlertMsg] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAdminAlertMsg(msg);
    setTimeout(() => setAdminAlertMsg(null), 3500);
  };

  // Metrics
  const totalUsersCount = allProfiles.filter((p) => p.role !== 'ADMIN').length;
  const activeUsersCount = allProfiles.filter((p) => p.role !== 'ADMIN' && p.status === 'ACTIVE').length;
  const bannedUsersCount = allProfiles.filter((p) => p.role !== 'ADMIN' && p.status === 'BANNED').length;

  const totalSystemBalance = (Object.values(allWallets) as Wallet[]).reduce((sum, w) => sum + w.available_balance, 0);
  const totalLockedBalance = (Object.values(allWallets) as Wallet[]).reduce((sum, w) => sum + w.locked_balance, 0);

  const pendingDeposits = deposits.filter((d) => d.status === 'PENDING');
  const pendingDepositsSum = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'APPROVED');
  const pendingWithdrawalsSum = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Filtered Users
  const filteredUsers = allProfiles
    .filter((p) => p.role !== 'ADMIN')
    .filter((p) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.user_custom_id.toLowerCase().includes(q) ||
        p.mobile.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.telegram_id && p.telegram_id.toLowerCase().includes(q))
      );
    });

  const handleAdminAddBalance = () => {
    if (!selectedUserForModal) return;
    const res = addBalanceByAdmin(selectedUserForModal.id, modalAmount, modalReason || 'Manual Admin Top-up');
    if (res.success) {
      showAlert(res.message);
      setAdminActionModal(null);
      setModalReason('');
    } else {
      showAlert(res.message);
    }
  };

  const handleAdminCutBalance = () => {
    if (!selectedUserForModal) return;
    const res = cutBalanceByAdmin(selectedUserForModal.id, modalAmount, modalReason || 'Manual Admin Adjustment');
    if (res.success) {
      showAlert(res.message);
      setAdminActionModal(null);
      setModalReason('');
    } else {
      showAlert(res.message);
    }
  };

  const handleDepositApprove = (id: string) => {
    const res = approveDeposit(id);
    showAlert(res.message);
  };

  const handleDepositReject = () => {
    if (!rejectDepositId) return;
    const res = rejectDeposit(rejectDepositId, depositRejectReason);
    showAlert(res.message);
    setRejectDepositId(null);
  };

  const handleWithdrawalApprove = (id: string) => {
    const res = approveWithdrawal(id);
    showAlert(res.message);
  };

  const handleWithdrawalMarkPaid = () => {
    if (!markPaidWithdrawalId) return;
    const utr = markPaidUtr.trim() || `BANK-UTR-${Date.now().toString().slice(-8)}`;
    const res = markWithdrawalPaid(markPaidWithdrawalId, utr);
    showAlert(res.message);
    setMarkPaidWithdrawalId(null);
    setMarkPaidUtr('');
  };

  const handleWithdrawalReject = () => {
    if (!rejectWithdrawalId) return;
    const res = rejectWithdrawal(rejectWithdrawalId, withdrawalRejectReason);
    showAlert(res.message);
    setRejectWithdrawalId(null);
  };

  const saveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    showAlert('✅ System settings and Bank details updated successfully!');
  };

  const handleAdminQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSettingsForm({
          ...settingsForm,
          admin_qr_url: event.target.result as string,
        });
        showAlert('✅ QR code image loaded from device! Click Save Settings to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  // If not authenticated with Master Password, render dedicated Gatekeeper Screen
  if (!isPassAuthed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/40 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 text-center text-white relative">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-white tracking-tight">Super Admin Security Gate</h3>
            <p className="text-xs text-slate-400">
              Enter the authorized Master Security Password to access Admin Portal controls & ledger management.
            </p>
          </div>

          {passError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-bold font-mono">
              {passError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                Master Security Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password..."
                value={adminPassInput}
                onChange={(e) => {
                  setAdminPassInput(e.target.value);
                  setPassError(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl shadow-rose-600/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Unlock Admin Portal ⚡</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Protected by SR GATEWAY Master Key Protocol
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Admin Top Header Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                SR GATEWAY Super Admin Control Panel
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Administrator Dashboard & Controls</h2>
            <p className="text-xs text-slate-300 mt-1">
              Manual deposit/withdrawal verification, atomic balance adjustments, settings toggles & audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Admin Mode Active</span>
            </span>
            <button
              onClick={handleAdminLock}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold font-mono transition flex items-center gap-1.5"
              title="Lock Admin Session"
            >
              <Lock className="h-3 w-3 text-rose-400" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-rose-500/20">
          {[
            { id: 'DASHBOARD', label: 'Overview', icon: ShieldCheck },
            { id: 'USERS', label: `Users (${totalUsersCount})`, icon: Users },
            { id: 'DEPOSITS', label: `Deposits (${pendingDeposits.length})`, icon: PlusCircle, badge: pendingDeposits.length },
            { id: 'WITHDRAWALS', label: `Withdrawals (${pendingWithdrawals.length})`, icon: ArrowUpRight, badge: pendingWithdrawals.length },
            { id: 'TRANSACTIONS', label: 'Master Ledger', icon: FileText },
            { id: 'SETTINGS', label: 'Extra Controls', icon: Settings },
            { id: 'AUDIT_LOGS', label: 'Audit Logs', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/20'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="bg-amber-400 text-slate-950 font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {adminAlertMsg && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white font-mono font-bold text-xs shadow-xl animate-bounce">
          ⚡ {adminAlertMsg}
        </div>
      )}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeAdminTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Box 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Registered Users</div>
              <div className="text-3xl font-mono font-black text-white">{totalUsersCount}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Active: <span className="text-emerald-400 font-bold">{activeUsersCount}</span> • Banned:{' '}
                <span className="text-rose-400 font-bold">{bannedUsersCount}</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total System Wallet Balance</div>
              <div className="text-2xl font-mono font-black text-emerald-400">{formatINR(totalSystemBalance)}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Locked Payouts: <span className="text-amber-400 font-bold">{formatINR(totalLockedBalance)}</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Deposit Queue</div>
              <div className="text-2xl font-mono font-black text-amber-400">{pendingDeposits.length} Request(s)</div>
              <div className="text-[11px] text-slate-400 font-mono">Volume: {formatINR(pendingDepositsSum)}</div>
            </div>

            {/* Box 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Withdrawal Queue</div>
              <div className="text-2xl font-mono font-black text-indigo-400">{pendingWithdrawals.length} Request(s)</div>
              <div className="text-[11px] text-slate-400 font-mono">Volume: {formatINR(pendingWithdrawalsSum)}</div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Administrator Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveAdminTab('DEPOSITS')}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition"
              >
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                <div className="font-bold text-xs text-white">Verify Deposits</div>
                <div className="text-[10px] text-slate-400">{pendingDeposits.length} Awaiting</div>
              </button>

              <button
                onClick={() => setActiveAdminTab('WITHDRAWALS')}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition"
              >
                <ArrowUpRight className="h-5 w-5 text-indigo-400" />
                <div className="font-bold text-xs text-white">Process Payouts</div>
                <div className="text-[10px] text-slate-400">{pendingWithdrawals.length} Awaiting</div>
              </button>

              <button
                onClick={() => setActiveAdminTab('USERS')}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition"
              >
                <Users className="h-5 w-5 text-amber-400" />
                <div className="font-bold text-xs text-white">Manage Users</div>
                <div className="text-[10px] text-slate-400">Add/Cut Balances</div>
              </button>

              <button
                onClick={() => setActiveAdminTab('SETTINGS')}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition"
              >
                <Settings className="h-5 w-5 text-rose-400" />
                <div className="font-bold text-xs text-white">System Controls</div>
                <div className="text-[10px] text-slate-400">Toggles & Fees</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Registered Users Directory</h3>
              <p className="text-xs text-slate-400">Add balance, cut balance, or suspend user accounts</p>
            </div>

            <div className="relative sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Name, SR-ID, Mobile..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800 font-mono text-xs">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No matching user accounts found.</p>
            ) : (
              filteredUsers.map((user) => {
                const wallet = allWallets[user.id] || { available_balance: 0, locked_balance: 0 };
                return (
                  <div key={user.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm font-sans">{user.full_name}</span>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                          {user.user_custom_id}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mobile: {user.mobile} • Email: {user.email} {user.telegram_id ? `• TG: ${user.telegram_id}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="text-sm font-black text-emerald-400">{formatINR(wallet.available_balance)}</div>
                        {wallet.locked_balance > 0 && (
                          <div className="text-[10px] text-amber-300">Locked: {formatINR(wallet.locked_balance)}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedUserForModal(user);
                            setAdminActionModal('ADD_BAL');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUserForModal(user);
                            setAdminActionModal('CUT_BAL');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md"
                        >
                          <Minus className="h-3.5 w-3.5" />
                          <span>Cut</span>
                        </button>

                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => banUser(user.id, 'Admin manual account restriction')}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl transition border border-rose-500/30"
                            title="Ban User"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-xl transition border border-emerald-500/30"
                            title="Unban User"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEPOSIT VERIFICATION QUEUE */}
      {activeAdminTab === 'DEPOSITS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Deposit Verification Queue</h3>
              <p className="text-xs text-slate-400">Review user UTR numbers & payment screenshots for instant wallet credit</p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
              {pendingDeposits.length} Pending Approval
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {deposits.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No deposit requests found in system.</p>
            ) : (
              deposits.map((dep) => (
                <div
                  key={dep.id}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    dep.status === 'PENDING'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : dep.status === 'SUCCESS'
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="font-extrabold text-white text-sm font-sans">{dep.user_name}</div>
                      <div className="text-[11px] text-slate-400">
                        User ID: <span className="text-indigo-300 font-bold">{dep.user_custom_id}</span> • Ref: {dep.id}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400">{formatINR(dep.amount)}</div>
                      <div className="text-[10px] text-slate-400">
                        Net Credit: {formatINR(dep.net_amount)} (Fee: {formatINR(dep.fee)})
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-bold">Transaction UTR:</div>
                      <div className="font-black text-indigo-300 text-sm">{dep.utr}</div>
                      <div className="text-slate-400">Method: {dep.payment_method}</div>
                      {dep.note && <div className="text-slate-300 font-sans mt-1">Note: "{dep.note}"</div>}
                    </div>

                    {dep.screenshot_url && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 font-bold">Screenshot Attached</div>
                          <a
                            href={dep.screenshot_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-[10px] underline flex items-center gap-1 mt-1"
                          >
                            <span>Open Image Preview</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <img
                          src={dep.screenshot_url}
                          alt="UTR Screenshot"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {dep.status === 'PENDING' ? (
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => {
                          setRejectDepositId(dep.id);
                        }}
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDepositApprove(dep.id)}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        Approve & Credit Wallet ⚡
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] font-bold">
                      Status:{' '}
                      <span
                        className={
                          dep.status === 'SUCCESS' ? 'text-emerald-400 uppercase' : 'text-rose-400 uppercase'
                        }
                      >
                        {dep.status}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WITHDRAWAL MANAGEMENT QUEUE */}
      {activeAdminTab === 'WITHDRAWALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Withdrawal Payout Queue</h3>
              <p className="text-xs text-slate-400">Authorize payouts, mark paid with bank reference UTR, or reject</p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
              {pendingWithdrawals.length} Pending Action
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {withdrawals.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No withdrawal requests found in system.</p>
            ) : (
              withdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    wd.status === 'PENDING' || wd.status === 'APPROVED'
                      ? 'bg-indigo-950/20 border-indigo-500/30'
                      : wd.status === 'SUCCESS'
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="font-extrabold text-white text-sm font-sans">{wd.user_name}</div>
                      <div className="text-[11px] text-slate-400">
                        User ID: <span className="text-indigo-300 font-bold">{wd.user_custom_id}</span> • Ref: {wd.id}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-rose-400">{formatINR(wd.amount)}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        Net Payout: {formatINR(wd.net_payout)} (Fee: {formatINR(wd.fee)})
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-bold">Target UPI ID / Bank Identifier:</div>
                    <div className="font-black text-indigo-300 text-sm">{wd.payment_identifier}</div>
                    {wd.payment_reference && (
                      <div className="text-emerald-400 text-[11px] font-bold mt-1">
                        Paid UTR Ref: {wd.payment_reference}
                      </div>
                    )}
                  </div>

                  {wd.status === 'PENDING' || wd.status === 'APPROVED' ? (
                    <div className="flex flex-wrap gap-2 justify-end pt-2">
                      <button
                        onClick={() => setRejectWithdrawalId(wd.id)}
                        className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition"
                      >
                        Reject
                      </button>

                      {wd.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdrawalApprove(wd.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition shadow-md"
                        >
                          Authorize Payout
                        </button>
                      )}

                      <button
                        onClick={() => setMarkPaidWithdrawalId(wd.id)}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        Mark Paid (Enter UTR) 💸
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] font-bold">
                      Status:{' '}
                      <span
                        className={
                          wd.status === 'SUCCESS' ? 'text-emerald-400 uppercase' : 'text-rose-400 uppercase'
                        }
                      >
                        {wd.status}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MASTER TRANSACTIONS LEDGER */}
      {activeAdminTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
          <h3 className="text-lg font-black text-white">System-Wide Master Financial Ledger</h3>
          <p className="text-xs text-slate-400">All user transactions, deposits, withdrawals & admin credits</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Net Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-white font-sans whitespace-nowrap">{tx.user_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-950 border border-slate-800 text-indigo-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">{tx.description}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">{formatINR(tx.net_amount)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: EXTRA CONTROLS & SYSTEM SETTINGS */}
      {activeAdminTab === 'SETTINGS' && (
        <form onSubmit={saveSystemSettings} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              <span>System Extra Controls & Financial Rules</span>
            </h3>

            {/* Deposit & Withdraw ON/OFF Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Deposit Gateway Requests</div>
                  <div className="text-[10px] text-slate-400">Allow users to submit deposit requests</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.deposit_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deposit_enabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Withdrawal Payout Requests</div>
                  <div className="text-[10px] text-slate-400">Allow users to request UPI withdrawals</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.withdraw_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, withdraw_enabled: e.target.checked })}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Thresholds & Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Minimum Deposit (₹)</label>
                <input
                  type="number"
                  value={settingsForm.minimum_deposit}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minimum_deposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Minimum Withdraw (₹)</label>
                <input
                  type="number"
                  value={settingsForm.minimum_withdraw}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minimum_withdraw: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deposit Charge (%)</label>
                <input
                  type="number"
                  value={settingsForm.deposit_charge_percent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deposit_charge_percent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Withdraw Charge (%)</label>
                <input
                  type="number"
                  value={settingsForm.withdraw_charge_percent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, withdraw_charge_percent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            {/* Signup Welcome Bonus Configuration (Admin Controlled) */}
            <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>User Signup Welcome Bonus Control</span>
                      {settingsForm.signup_bonus_enabled && Number(settingsForm.signup_bonus_amount) > 0 ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ACTIVE (₹{settingsForm.signup_bonus_amount})
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                          DISABLED (₹0)
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      By default, new users get ₹0 on registration. Enable this and set an amount only if you want Admin to grant automatic welcome credits.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.signup_bonus_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, signup_bonus_enabled: e.target.checked })}
                  className="w-5 h-5 accent-purple-500 cursor-pointer"
                />
              </div>

              {settingsForm.signup_bonus_enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                      Signup Bonus Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50 or 100"
                      value={settingsForm.signup_bonus_amount}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, signup_bonus_amount: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Amount automatically credited to new user wallet upon registration
                    </p>
                  </div>
                  <div className="flex items-center p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                    <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mr-2" />
                    <span className="text-[11px] text-purple-200">
                      When enabled, new users will receive ₹{settingsForm.signup_bonus_amount || 0} in their wallet upon completing Telegram-verified registration.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notice Banner Editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-400" />
                  <span>Dashboard Live Notice Banner</span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.notice_banner_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, notice_banner_enabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={settingsForm.notice_banner_title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, notice_banner_title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
                <textarea
                  placeholder="Notice Message Body"
                  value={settingsForm.notice_banner_message}
                  onChange={(e) => setSettingsForm({ ...settingsForm, notice_banner_message: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs h-20"
                />
              </div>
            </div>

            {/* Official Deposit QR Code & Telegram Settings */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span>Deposit QR Code Photo & Admin Accounts Configuration</span>
              </div>

              {/* Deposit QR Code Photo Editor */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold text-xs font-mono">
                    Deposit QR Code Photo (Upload from Gallery or Enter URL)
                  </label>
                  <label className="cursor-pointer px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Upload QR Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminQrUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-24 h-24 bg-white p-2 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border border-slate-700 shadow-md">
                    <img
                      src={settingsForm.admin_qr_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80'}
                      alt="Deposit QR Preview"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full text-xs">
                    <input
                      type="text"
                      placeholder="https://your-domain.com/deposit-qr.png or image URL"
                      value={settingsForm.admin_qr_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admin_qr_url: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 font-mono">
                      Upload any QR code screenshot from your phone/computer or paste an image URL to update the official deposit QR code immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* IMPS / NEFT Bank Details Configuration */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-indigo-300 font-bold text-xs font-mono flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-indigo-400" />
                  <span>Admin Bank Account Details (Shown on User Deposit Page)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank Ltd"
                      value={settingsForm.admin_bank_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admin_bank_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SR Gateway Payments"
                      value={settingsForm.admin_bank_account_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admin_bank_account_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50200088192031"
                      value={settingsForm.admin_bank_account_no || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admin_bank_account_no: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001092"
                      value={settingsForm.admin_bank_ifsc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, admin_bank_ifsc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Telegram Channel Name</label>
                  <input
                    type="text"
                    placeholder="Telegram Channel Name"
                    value={settingsForm.telegram_channel_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_channel_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Telegram Channel URL</label>
                  <input
                    type="text"
                    placeholder="Telegram Channel URL"
                    value={settingsForm.telegram_channel_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_channel_url: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Admin UPI ID for Deposits</label>
                  <input
                    type="text"
                    placeholder="Admin UPI ID for Deposits"
                    value={settingsForm.admin_upi_id}
                    onChange={(e) => setSettingsForm({ ...settingsForm, admin_upi_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Admin Support URL</label>
                  <input
                    type="text"
                    placeholder="Admin Support URL"
                    value={settingsForm.support_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_url: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* OTP Alert Telegram Bot Configuration Section */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>OTP Alert Telegram Bot Manager</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        ACTIVE BOT
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Change or replace the Telegram Bot used for sending login/transaction OTP alerts to users
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                    Telegram Bot Username (Handle)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="@PAYZYBOT"
                      value={settingsForm.otp_telegram_bot_username || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, otp_telegram_bot_username: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    e.g. @PAYZYBOT or @SRGatewayINBot
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                    Telegram Bot API Token (HTTP API)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="7829103847:AAHx..."
                      value={settingsForm.otp_telegram_bot_token || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, otp_telegram_bot_token: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Bot Father token for dispatching OTP alerts
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300 text-[11px]">
                    Active Bot Hook: <strong className="text-cyan-400">{settingsForm.otp_telegram_bot_username || '@PAYZYBOT'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => showAlert(`Bot ${settingsForm.otp_telegram_bot_username || '@PAYZYBOT'} synchronized successfully!`)}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Test Bot Sync</span>
                </button>
              </div>
            </div>

            {/* 24/7 Support Bot Configuration Section */}
            <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>24/7 Support Bot Configuration</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        USER HELP BOT
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Set the Telegram Support Bot handle. Users clicking "24/7 Support Bot" will automatically redirect to this bot.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                    24/7 Support Bot Username (Handle)
                  </label>
                  <input
                    type="text"
                    placeholder="@SRGateway_Support_Bot"
                    value={settingsForm.support_telegram_bot_username || ''}
                    onChange={(e) => {
                      const cleanBot = e.target.value;
                      const botHandle = cleanBot.startsWith('@') ? cleanBot : `@${cleanBot}`;
                      setSettingsForm({
                        ...settingsForm,
                        support_telegram_bot_username: cleanBot,
                        support_url: `https://t.me/${botHandle.replace('@', '')}`,
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    e.g. @SRGateway_Support_Bot or @srgateway_help_bot
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                    Direct Support Redirect URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://t.me/SRGateway_Support_Bot"
                    value={settingsForm.support_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_url: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    User panel redirect destination URL
                  </p>
                </div>
              </div>
            </div>

            {/* Automated Gmail / Email Alert System (Login, Deposit, Withdrawal Alerts) */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>Automated Gmail & Email Notification Engine</span>
                      {settingsForm.email_alerts_enabled ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ACTIVE ENGINE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                          DISABLED
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Automatically send real-time HTML security and transaction alerts to user registered Gmail IDs (Login, Deposit & Withdrawal with full details)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.email_alerts_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email_alerts_enabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Individual Alert Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">🔐 Login Alerts</div>
                    <div className="text-[10px] text-slate-400 font-mono">IP, Device & Location email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.email_login_alert_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email_login_alert_enabled: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">💰 Deposit Alerts</div>
                    <div className="text-[10px] text-slate-400 font-mono">UTR submission & credit update</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.email_deposit_alert_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email_deposit_alert_enabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">💸 Withdrawal Alerts</div>
                    <div className="text-[10px] text-slate-400 font-mono">Payout requested & dispatched</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.email_withdraw_alert_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email_withdraw_alert_enabled: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* SMTP Connection Configuration */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-bold text-white text-xs font-mono flex items-center gap-2 text-slate-200">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SMTP Mail Server Parameters (Gmail SMTP / Custom Server)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">SMTP Host</label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={settingsForm.smtp_host || 'smtp.gmail.com'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_host: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={settingsForm.smtp_port || 587}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_port: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">SMTP Username / Gmail ID</label>
                    <input
                      type="text"
                      placeholder="support@srgateway.in or gmail"
                      value={settingsForm.smtp_user || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_user: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">App Password / Secret</label>
                    <input
                      type="password"
                      placeholder="Google App Password (16-char)"
                      value={settingsForm.smtp_pass || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_pass: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Sender Brand Display Name</label>
                    <input
                      type="text"
                      placeholder="SR GATEWAY Security & Alerts"
                      value={settingsForm.smtp_from_name || 'SR GATEWAY Alerts'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_from_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Sender From Email Address</label>
                    <input
                      type="text"
                      placeholder="alerts@srgateway.in"
                      value={settingsForm.smtp_from_email || 'alerts@srgateway.in'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtp_from_email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Live SMTP Dispatch & Testing Console */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <Send className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Live Test Email Notification Sender</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchEmailLogs}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingEmailLogs ? 'animate-spin' : ''}`} />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Test Recipient Gmail ID</label>
                    <input
                      type="email"
                      placeholder="sk190rihan@gmail.com"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Test Event Type</label>
                    <select
                      value={testEmailType}
                      onChange={(e: any) => setTestEmailType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    >
                      <option value="LOGIN_ALERT">🔐 Login Alert Email</option>
                      <option value="DEPOSIT_ALERT">💰 Deposit Credited Email</option>
                      <option value="WITHDRAW_ALERT">💸 Withdrawal Payout Email</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isSendingTestEmail}
                    onClick={handleSendTestEmail}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <Send className={`h-3.5 w-3.5 ${isSendingTestEmail ? 'animate-pulse' : ''}`} />
                    <span>{isSendingTestEmail ? 'Dispatching Live Email...' : 'Send Live Test Email 🚀'}</span>
                  </button>

                  {testEmailResult && (
                    <div
                      className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                        testEmailResult.success
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {testEmailResult.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      <span>{testEmailResult.message}</span>
                      {testEmailResult.mode && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {testEmailResult.mode}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Dispatch Audit Log Preview */}
                {emailLogsList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Inbox className="h-3 w-3 text-emerald-400" />
                        <span>Recent Email Dispatch Ledger ({emailLogsList.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearEmailLogs}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px]"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear History</span>
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                      {emailLogsList.slice(0, 8).map((log: any) => (
                        <div
                          key={log.id}
                          className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/70 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                log.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {log.type}
                            </span>
                            <span className="text-slate-200 truncate">{log.to}</span>
                            <span className="text-slate-500 truncate hidden sm:inline">{log.subject}</span>
                          </div>
                          <div className="text-slate-400 shrink-0">
                            {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-rose-600/25 active:scale-95"
            >
              Save All System Configuration Settings 💾
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeAdminTab === 'AUDIT_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4 font-mono text-xs">
          <h3 className="text-lg font-black text-white font-sans">Immutable Administrative Audit Trail</h3>
          <p className="text-slate-400 font-sans">
            Every balance modification, deposit verification, payout release, and setting change is permanently logged.
          </p>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400">{log.action}</span>
                    <span className="text-[10px] text-slate-400">by {log.admin_name}</span>
                  </div>
                  <p className="text-slate-300 font-sans">{log.reason}</p>
                  {log.target_user_name && (
                    <div className="text-[10px] text-indigo-300">
                      Target User: {log.target_user_name}
                      {log.amount ? ` • Amount: ${formatINR(log.amount)}` : ''}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 shrink-0 text-right">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / CUT BALANCE */}
      {adminActionModal && selectedUserForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <h3 className="text-base font-extrabold text-white font-sans">
              {adminActionModal === 'ADD_BAL' ? 'Credit Balance to User' : 'Deduct Balance from User'}
            </h3>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div className="font-bold text-white font-sans">{selectedUserForModal.full_name}</div>
              <div className="text-[10px] text-slate-400">ID: {selectedUserForModal.user_custom_id}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-bold">
                Current Balance: {formatINR(allWallets[selectedUserForModal.id]?.available_balance || 0)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                min={1}
                value={modalAmount}
                onChange={(e) => setModalAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason / Remarks (Required)</label>
              <input
                type="text"
                placeholder="e.g. Manual bank deposit verification or reward credit"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdminActionModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={adminActionModal === 'ADD_BAL' ? handleAdminAddBalance : handleAdminCutBalance}
                className={`px-5 py-2 text-xs font-black rounded-xl text-slate-950 ${
                  adminActionModal === 'ADD_BAL' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                Confirm {adminActionModal === 'ADD_BAL' ? 'Credit' : 'Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT DEPOSIT */}
      {rejectDepositId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-extrabold text-rose-400 font-sans">Reject Deposit Request</h3>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Enter Rejection Reason</label>
              <textarea
                value={depositRejectReason}
                onChange={(e) => setDepositRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-24"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectDepositId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDepositReject} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARK WITHDRAWAL PAID */}
      {markPaidWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-extrabold text-emerald-400 font-sans">Mark Withdrawal PAID</h3>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Bank Payment Reference / UTR Number</label>
              <input
                type="text"
                placeholder="e.g. IMPS-UTR-99182736"
                value={markPaidUtr}
                onChange={(e) => setMarkPaidUtr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setMarkPaidWithdrawalId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleWithdrawalMarkPaid} className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl">
                Confirm & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT WITHDRAWAL */}
      {rejectWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-extrabold text-rose-400 font-sans">Reject Withdrawal Request</h3>
            <p className="text-slate-400 text-[11px]">
              Rejecting will automatically return the locked funds back into the user's available balance.
            </p>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Rejection Reason</label>
              <textarea
                value={withdrawalRejectReason}
                onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white h-24"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectWithdrawalId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleWithdrawalReject} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl">
                Confirm Reject & Unlock Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
