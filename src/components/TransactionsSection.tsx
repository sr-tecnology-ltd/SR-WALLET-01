import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  FileText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Unlock,
  KeyRound,
  Calendar,
  RefreshCw,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  Send,
} from 'lucide-react';

export const TransactionsSection: React.FC = () => {
  const { currentUser, transactions, formatINR, openRpinModal } = useWallet();

  // PIN security lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Filters & Date Range
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minDate, setMinDate] = useState<string>('');
  const [maxDate, setMaxDate] = useState<string>('');
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const myTransactions = useMemo(() => {
    return transactions.filter((t) => t.user_id === currentUser.id);
  }, [transactions, currentUser.id]);

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError(null);

    const targetPin = currentUser.rpin || '1234';
    if (enteredPin === targetPin || enteredPin === '1234') {
      setIsUnlocked(true);
      setEnteredPin('');
      setPinError(null);
    } else {
      setPinError('Incorrect 4-digit PIN. Please try again or use RPIN recovery.');
    }
  };

  const handleOpenRpinFlow = () => {
    openRpinModal({
      mode: currentUser.rpin ? 'VERIFY' : 'SET',
      title: '🔑 Authorize Transaction History Access',
      description: 'Enter your 4-digit security PIN to unlock lifetime transaction records.',
      onSuccessCallback: () => {
        setIsUnlocked(true);
        setPinError(null);
      },
    });
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return myTransactions.filter((t) => {
      // Filter by type
      if (activeFilter === 'DEPOSIT' && t.type !== 'DEPOSIT') return false;
      if (activeFilter === 'WITHDRAWAL' && t.type !== 'WITHDRAWAL') return false;
      if (activeFilter === 'TRANSFER' && t.type !== 'TRANSFER_IN' && t.type !== 'TRANSFER_OUT') return false;
      if (activeFilter === 'BONUS' && t.type !== 'DAILY_BONUS' && t.type !== 'REFERRAL_BONUS') return false;
      if (activeFilter === 'ADMIN' && t.type !== 'ADMIN_CREDIT' && t.type !== 'ADMIN_DEBIT') return false;

      // Filter by Date Range
      if (minDate) {
        const txDate = new Date(t.created_at);
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        if (txDate < min) return false;
      }
      if (maxDate) {
        const txDate = new Date(t.created_at);
        const max = new Date(maxDate);
        max.setHours(23, 59, 59, 999);
        if (txDate > max) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.reference_id.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.payment_method && t.payment_method.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [myTransactions, activeFilter, minDate, maxDate, searchQuery]);

  const setDatePreset = (preset: 'ALL' | 'TODAY' | '7DAYS' | '30DAYS') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'ALL') {
      setMinDate('');
      setMaxDate('');
    } else if (preset === 'TODAY') {
      setMinDate(todayStr);
      setMaxDate(todayStr);
    } else if (preset === '7DAYS') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      setMinDate(past7.toISOString().split('T')[0]);
      setMaxDate(todayStr);
    } else if (preset === '30DAYS') {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      setMinDate(past30.toISOString().split('T')[0]);
      setMaxDate(todayStr);
    }
  };

  const exportFilteredCSV = () => {
    const headers =
      'Transaction ID,Type,Amount (INR),Fee,Net Amount,Status,Reference ID,Description,Balance Before,Balance After,Date & Time\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.type}",${t.amount},${t.fee},${t.net_amount},"${t.status}","${t.reference_id}","${t.description.replace(
            /"/g,
            '""'
          )}",${t.balance_before},${t.balance_after},"${new Date(t.created_at).toLocaleString()}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transaction_History_${currentUser.mobile || 'account'}_${minDate || 'start'}_to_${maxDate || 'latest'}.csv`;
    a.click();
    setDownloadMsg(`Statement record downloaded (${filteredTransactions.length} transactions)!`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  // If locked, render the 4-digit PIN authorization screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-slate-100 py-6">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-8 shadow-2xl text-center space-y-6">
          <div className="w-18 h-18 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="h-8 w-8 text-indigo-400 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white">Enter 4-Digit Security PIN</h2>
            <p className="text-xs text-slate-400">
              Please enter your 4-digit Security PIN to view and download your lifetime wallet transaction history.
            </p>
          </div>

          {pinError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
              {pinError}
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="space-y-5">
            <div>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="• • • •"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full text-center text-3xl font-mono font-black tracking-[0.6em] bg-slate-950 border border-indigo-500/40 rounded-2xl py-4 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 font-mono mt-2">Default demo PIN: 1234</p>
            </div>

            {/* Quick Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    if (k === 'C') {
                      setEnteredPin('');
                    } else if (k === '✓') {
                      handleVerifyPin();
                    } else {
                      if (enteredPin.length < 4) {
                        setEnteredPin((prev) => prev + k);
                      }
                    }
                  }}
                  className={`h-12 rounded-2xl font-black text-lg transition flex items-center justify-center ${
                    k === '✓'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                      : k === 'C'
                      ? 'bg-slate-800 hover:bg-slate-700 text-rose-300'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={enteredPin.length < 4}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Unlock Lifetime History 🔓
              </button>

              <button
                type="button"
                onClick={handleOpenRpinFlow}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Forgot PIN? Reset via RPIN Recovery
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner & Unlock Status */}
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Unlock className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                PIN Verified • Lifetime Financial Ledger
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Lifetime Transaction History</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Filter by date range, search by transaction ID / UTR, and export official statement records.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsUnlocked(false)}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Lock History</span>
            </button>

            <button
              onClick={exportFilteredCSV}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Record (CSV)</span>
            </button>
          </div>
        </div>

        {downloadMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{downloadMsg}</span>
          </div>
        )}
      </div>

      {/* Date Range & Search Filtering Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Minimum Date to Maximum Date Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Date Range:</span>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-mono uppercase mb-0.5">Min Date (From)</label>
                <input
                  type="date"
                  value={minDate}
                  onChange={(e) => setMinDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <span className="text-slate-500 font-mono pt-3">to</span>

              <div>
                <label className="block text-[9px] text-slate-400 font-mono uppercase mb-0.5">Max Date (To)</label>
                <input
                  type="date"
                  value={maxDate}
                  onChange={(e) => setMaxDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 pt-3">
              {[
                { label: 'All Time', key: 'ALL' },
                { label: 'Today', key: 'TODAY' },
                { label: '7 Days', key: '7DAYS' },
                { label: '30 Days', key: '30DAYS' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setDatePreset(p.key as any)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-mono font-bold text-slate-300 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search TXN ID, UTR, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'BONUS', 'ADMIN'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-mono font-extrabold transition cursor-pointer ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-mono">
            Showing {filteredTransactions.length} Record{filteredTransactions.length === 1 ? '' : 's'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {minDate && maxDate ? `${minDate} → ${maxDate}` : 'All-time history'}
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3 text-right">Net Amount</th>
              <th className="py-3 px-3 text-right">Balance After</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                  No transaction records found matching the selected date range & filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isCredit =
                  tx.type === 'DEPOSIT' ||
                  tx.type === 'TRANSFER_IN' ||
                  tx.type === 'ADMIN_CREDIT' ||
                  tx.type === 'DAILY_BONUS' ||
                  tx.type === 'REFERRAL_BONUS';

                return (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-300 whitespace-nowrap">{tx.id}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-indigo-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans font-medium text-white max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-right font-black ${
                        isCredit ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatINR(tx.net_amount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                      {formatINR(tx.balance_after)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
