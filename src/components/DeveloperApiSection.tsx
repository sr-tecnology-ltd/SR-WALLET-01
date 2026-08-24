import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Code,
  Key,
  Terminal,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Zap,
  Bot,
  ExternalLink,
  ShieldCheck,
  Server,
  Play,
  KeyRound,
  CheckCircle2,
  Wallet as WalletIcon,
  Sparkles,
  Activity,
  AlertTriangle,
  RefreshCw,
  FileCode2,
  CheckCheck,
  MessageSquare,
  ArrowRightLeft,
  Smartphone,
  Globe,
} from 'lucide-react';

export const DeveloperApiSection: React.FC = () => {
  const { currentUser, apiKeys, createApiKey, revokeApiKey, currentWallet, formatINR, settings, refreshFromBackend } = useWallet();

  const [newKeyName, setNewKeyName] = useState('Telegram Bot & Merchant Key');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBalanceUrl, setCopiedBalanceUrl] = useState(false);
  const [copiedTransferUrl, setCopiedTransferUrl] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedWebhookCurl, setCopiedWebhookCurl] = useState(false);
  const [copiedTemplateUrl, setCopiedTemplateUrl] = useState(false);

  // Active View Tab: 'TELEGRAM_SIMULATOR' | 'SANDBOX' | 'CODE_DOCS'
  const [activeViewTab, setActiveViewTab] = useState<'TELEGRAM_SIMULATOR' | 'SANDBOX' | 'CODE_DOCS'>('SANDBOX');
  const [selectedLanguage, setSelectedLanguage] = useState<'php' | 'curl' | 'nodejs' | 'python'>('php');
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  // Filter API keys for the current user to guarantee isolation
  const userApiKeys = apiKeys.filter(
    (k) => k.user_id === currentUser.id || k.user_id === currentUser.user_custom_id
  );
  
  // Active API Key strictly tied to current user's wallet
  const activeApiKey = userApiKeys[0]?.api_key_prefix || (apiKeys.find(k => k.user_id === currentUser.user_custom_id || k.user_id === currentUser.id)?.api_key_prefix) || `sr_live_${(currentUser.user_custom_id || 'usr').toLowerCase().replace(/[^a-z0-9]/g, '')}_${currentUser.id ? currentUser.id.slice(-4) : '981a'}`;

  const handleResetApiKey = () => {
    // Revoke all existing keys for current user
    userApiKeys.forEach((k) => revokeApiKey(k.id));
    // Generate fresh key connected to this wallet
    const res = createApiKey('Active Live Wallet Bot Key', [
      'balance.read',
      'transfer.write',
      'deposit.request',
      'withdraw.request',
    ]);
    setCreatedSecret(res.secretKey);
    setCustomApiKey(res.apiKey.api_key_prefix);
    setResetSuccessMsg('✅ Old key revoked! New Live API Key generated & auto-connected to your wallet.');
    setTimeout(() => setResetSuccessMsg(null), 4000);
  };

  // Smart non-self recipient defaults
  const defaultRecipientNumber = '9876543210';

  // API Tester state
  const [activeEndpoint, setActiveEndpoint] = useState<string>('GET /Api/api.php (Token + Paytm Query URL)');
  const [customApiKey, setCustomApiKey] = useState(activeApiKey);
  const [customNumber, setCustomNumber] = useState(defaultRecipientNumber);
  const [customAmount, setCustomAmount] = useState('100');
  const [customComment, setCustomComment] = useState('Payment_Transfer');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sync API Key, recipient and username when switching user accounts
  useEffect(() => {
    setCustomApiKey(activeApiKey);
    setCustomNumber(defaultRecipientNumber);
    setBotCommandInput(`/pay ${defaultRecipientNumber} 100 Coffee_Payout`);
    if (currentUser.telegram_id) {
      setBotSimUsername(currentUser.telegram_id);
    } else {
      setBotSimUsername(`@${(currentUser.full_name || 'user').toLowerCase().replace(/\s+/g, '_')}`);
    }
  }, [currentUser.id, currentUser.user_custom_id, activeApiKey]);

  // Telegram Bot Simulator State
  const [botCommandInput, setBotCommandInput] = useState(`/pay ${defaultRecipientNumber} 100 Coffee_Payout`);
  const [botSimUsername, setBotSimUsername] = useState(currentUser.telegram_id || '@user_gateway');
  const [botSimChatId, setBotSimChatId] = useState('638291048');
  const [botSimLogs, setBotSimLogs] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; txn?: any }>>([
    {
      sender: 'bot',
      text: `👋 Welcome to SR GATEWAY Bot!\n\nUse /pay <number> <amount> to transfer funds directly between wallets, or /balance to check live wallet balance.`,
      time: 'Just now',
    },
  ]);
  const [isBotRunning, setIsBotRunning] = useState(false);

  // Permanent Gateway Production URL (Always fixed to https://srgateway-5jj4.onrender.com)
  const permanentAppUrl = settings.app_url || 'https://srgateway-5jj4.onrender.com';
  const currentOrigin = permanentAppUrl;

  const requestedApiUrl = `${permanentAppUrl}/Api/api.php?token=${activeApiKey}&paytm=${defaultRecipientNumber}&amount=100&comment=Payment_Transfer`;
  const requestedApiTemplate = `${permanentAppUrl}/Api/api.php?token=${activeApiKey}&paytm={wallet}&amount={amount}&comment={comment}`;
  const phpTransferUrl = `${permanentAppUrl}/Api/api.php?token=${activeApiKey}&paytm=${defaultRecipientNumber}&amount=100&comment=Payment_Order_101`;
  const phpBalanceUrl = `${permanentAppUrl}/Api/api.php?token=${activeApiKey}&action=balance`;
  const phpCheckUserUrl = `${permanentAppUrl}/Api/api.php?token=${activeApiKey}&action=check_user&number=${defaultRecipientNumber}`;
  const restTransferUrl = `${permanentAppUrl}/api/v1/transfer`;
  const restBalanceUrl = `${permanentAppUrl}/api/v1/balance?user_id=${currentUser.user_custom_id}`;
  const telegramWebhookUrl = `${permanentAppUrl}/api/telegram-webhook`;
  const webhookSetCurl = `curl -F "url=${telegramWebhookUrl}" https://api.telegram.org/bot${settings.otp_telegram_bot_token || 'YOUR_BOT_TOKEN'}/setWebhook`;

  const copyUrl = (url: string, type: 'balance' | 'transfer' | 'webhook' | 'curl' | 'template' | 'check_user' | 'rest') => {
    navigator.clipboard.writeText(url);
    if (type === 'balance') {
      setCopiedBalanceUrl(true);
      setTimeout(() => setCopiedBalanceUrl(false), 2000);
    } else if (type === 'transfer') {
      setCopiedTransferUrl(true);
      setTimeout(() => setCopiedTransferUrl(false), 2000);
    } else if (type === 'webhook') {
      setCopiedWebhookUrl(true);
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    } else if (type === 'template') {
      setCopiedTemplateUrl(true);
      setTimeout(() => setCopiedTemplateUrl(false), 2000);
    } else {
      setCopiedWebhookCurl(true);
      setTimeout(() => setCopiedWebhookCurl(false), 2000);
    }
  };

  // Send Bot Simulation Command
  const sendBotCommand = async (cmdToSend?: string) => {
    const cmd = cmdToSend || botCommandInput;
    if (!cmd.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBotSimLogs((prev) => [...prev, { sender: 'user', text: cmd, time: timeStr }]);
    setBotCommandInput('');
    setIsBotRunning(true);

    try {
      const res = await fetch('/api/v1/telegram-bot/simulate-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          username: botSimUsername,
          chat_id: botSimChatId,
        }),
      });

      const data = await res.json();
      setBotSimLogs((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.bot_response || data.message || JSON.stringify(data),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txn: data.result,
        },
      ]);
      
      // Auto-refresh balances and transactions on frontend
      await refreshFromBackend();
    } catch (err: any) {
      setBotSimLogs((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `❌ Error connecting to Bot API: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsBotRunning(false);
    }
  };

  const executeApiTest = async () => {
    setIsExecuting(true);
    try {
      let endpoint = '/Api/api.php';
      let method = 'GET';
      let body: any = null;

      if (activeEndpoint.includes('GET /Api/api.php (Token + Paytm Query URL)')) {
        endpoint = `/Api/api.php?token=${encodeURIComponent(customApiKey)}&paytm=${encodeURIComponent(customNumber)}&amount=${encodeURIComponent(customAmount)}&comment=${encodeURIComponent(customComment)}`;
        method = 'GET';
      } else if (activeEndpoint.includes('POST /api.php (JSON Transfer)')) {
        endpoint = '/Api/api.php';
        method = 'POST';
        body = JSON.stringify({
          token: customApiKey || activeApiKey,
          paytm: customNumber || '9876543210',
          amount: parseFloat(customAmount) || 100,
          comment: customComment || 'API_Payment_Test',
          sender_id: currentUser.user_custom_id,
        });
      } else if (activeEndpoint.includes('Receiver User Check') || activeEndpoint.includes('check_user')) {
        endpoint = `/Api/api.php?token=${encodeURIComponent(customApiKey)}&action=check_user&number=${encodeURIComponent(customNumber)}`;
        method = 'GET';
      } else if (activeEndpoint.includes('REST Receiver Verify')) {
        endpoint = `/api/v1/user/verify?number=${encodeURIComponent(customNumber)}`;
        method = 'GET';
      } else if (activeEndpoint.includes('POST /api.php (JSON Balance)')) {
        endpoint = '/Api/api.php';
        method = 'POST';
        body = JSON.stringify({
          token: customApiKey || activeApiKey,
          action: 'balance',
          sender_id: currentUser.user_custom_id,
        });
      } else if (activeEndpoint.includes('GET /api.php (Balance)')) {
        endpoint = `/Api/api.php?token=${encodeURIComponent(customApiKey)}&action=balance&sender_id=${currentUser.user_custom_id}`;
        method = 'GET';
      } else if (activeEndpoint.includes('/balance')) {
        endpoint = `/api/v1/balance?user_id=${currentUser.user_custom_id}`;
      } else if (activeEndpoint.includes('/transfer')) {
        endpoint = '/api/v1/transfer';
        method = 'POST';
        body = JSON.stringify({
          sender_id: currentUser.user_custom_id,
          recipient_id: customNumber || '9876543210',
          amount: parseFloat(customAmount) || 100,
          note: customComment || 'Developer API Test Transfer',
        });
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': customApiKey || activeApiKey,
        },
        body: method === 'POST' ? body : undefined,
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
      
      // Auto-refresh balances and transactions on frontend
      await refreshFromBackend();
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: 'Failed to connect to API endpoint', details: err.message }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    executeApiTest();
  }, [activeEndpoint]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Code className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                SR Gateway Developer API & Telegram Bot Architecture
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Merchant & Bot API Integration</h2>
            <p className="text-xs text-slate-300 mt-1">
              Connect Telegram Bots, PHP Websites, Python Scripts, or NodeJS apps directly to your SR GATEWAY Wallet for instant User-to-User transfers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-right font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[10px] text-emerald-300 uppercase font-extrabold flex items-center justify-end gap-1.5">
                  <span>Permanent Gateway App URL</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">PROD</span>
                </div>
                <div className="text-xs font-bold text-white font-mono">{permanentAppUrl}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveViewTab('SANDBOX')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'SANDBOX'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>API Credentials & Tester</span>
        </button>

        <button
          onClick={() => setActiveViewTab('CODE_DOCS')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'CODE_DOCS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="h-4 w-4" />
          <span>API Endpoints & Code SDKs</span>
        </button>

        <button
          onClick={() => setActiveViewTab('TELEGRAM_SIMULATOR')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'TELEGRAM_SIMULATOR'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Telegram Bot Simulator</span>
        </button>
      </div>

      {/* VIEW 1: TELEGRAM BOT SIMULATOR */}
      {activeViewTab === 'TELEGRAM_SIMULATOR' && (
        <div className="space-y-6">
          {/* Quick Setup Card */}
          <div className="rounded-[2rem] bg-slate-900 border border-blue-500/30 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Official Telegram Bot Webhook Integration</h3>
                  <p className="text-xs text-slate-400">
                    Hook your Telegram bot directly to the SR Gateway webhook to handle <code className="text-amber-300">/pay</code>, <code className="text-emerald-300">/balance</code>, and <code className="text-indigo-300">/history</code> automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyUrl(telegramWebhookUrl, 'webhook')}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedWebhookUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedWebhookUrl ? 'Copied Webhook URL!' : 'Copy Webhook URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans font-bold">
                <span>1-Click Telegram Webhook Setup Command (cURL):</span>
                <button
                  onClick={() => copyUrl(webhookSetCurl, 'curl')}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                >
                  {copiedWebhookCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedWebhookCurl ? 'Copied cURL!' : 'Copy Command'}</span>
                </button>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl text-amber-300 overflow-x-auto select-all text-[11px]">
                {webhookSetCurl}
              </div>
            </div>
          </div>

          {/* Interactive Telegram Bot Chat Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bot Chat Window */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>SR GATEWAY Wallet Bot</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Online</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">{settings.otp_telegram_bot_username || '@PAYZYBOT'}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[10px] text-slate-400">Active Wallet</div>
                  <div className="text-emerald-400 font-bold">{formatINR(currentWallet.available_balance)}</div>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {botSimLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                        log.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-950 text-slate-200 border border-slate-800/80 rounded-tl-none font-mono'
                      }`}
                    >
                      <pre className="font-sans whitespace-pre-wrap leading-relaxed">{log.text}</pre>
                      <div
                        className={`text-[9px] mt-1 ${
                          log.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'
                        }`}
                      >
                        {log.time}
                      </div>
                    </div>
                  </div>
                ))}
                {isBotRunning && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
                    <span>Bot is processing transaction...</span>
                  </div>
                )}
              </div>

              {/* Chat Input & Fast Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2 mt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-sans font-bold">Quick Actions:</span>
                  <button
                    onClick={() => sendBotCommand('/balance')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-[11px] font-mono transition"
                  >
                    /balance
                  </button>
                  <button
                    onClick={() => sendBotCommand(`/pay ${defaultRecipientNumber} 100 Payout_Test`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 hover:text-amber-200 hover:border-amber-500/40 text-[11px] font-mono transition"
                  >
                    /pay {defaultRecipientNumber} 100
                  </button>
                  <button
                    onClick={() => sendBotCommand('/history')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-[11px] font-mono transition"
                  >
                    /history
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type command (e.g. /pay 9876543210 500)"
                    value={botCommandInput}
                    onChange={(e) => setBotCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendBotCommand()}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => sendBotCommand()}
                    disabled={isBotRunning}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition shadow-md shadow-blue-600/30"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Sender Profile & Instructions */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Smartphone className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Simulation User Settings
                </h4>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">Simulated Telegram Username</label>
                  <input
                    type="text"
                    value={botSimUsername}
                    onChange={(e) => setBotSimUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">Simulated Telegram Chat ID</label>
                  <input
                    type="text"
                    value={botSimChatId}
                    onChange={(e) => setBotSimChatId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                  <span>How User-to-User Transfer Works:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                  <li>Sender executes <code className="text-amber-300">/pay 9876543210 100</code> on Telegram.</li>
                  <li>Server resolves recipient by Mobile Number or User ID.</li>
                  <li>Funds deducted instantly from sender's wallet.</li>
                  <li>Funds credited instantly to recipient's wallet.</li>
                  <li>Dual transactions created: <code className="text-rose-300">TRANSFER_OUT</code> and <code className="text-emerald-300">TRANSFER_IN</code>.</li>
                  <li>Real-time receipt delivered to both parties!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE SANDBOX & LIVE CREDENTIALS */}
      {activeViewTab === 'SANDBOX' && (
        <div className="space-y-6">
          {/* Your Live Wallet Credentials & API Key Card */}
          <div className="rounded-[2rem] bg-slate-900 border border-indigo-500/30 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Your Live Wallet API Credentials</h3>
                  <p className="text-xs text-slate-400">Use these credentials in your API queries & Telegram bot scripts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono">
                  Balance: {formatINR(currentWallet.available_balance)}
                </div>
                <button
                  onClick={handleResetApiKey}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset / Generate New Key</span>
                </button>
              </div>
            </div>

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono">
                {resetSuccessMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">User Custom ID</div>
                <div className="text-indigo-300 font-bold text-sm">{currentUser.user_custom_id}</div>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Wallet Account Number</div>
                <div className="text-emerald-300 font-bold text-sm">{currentUser.mobile}</div>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Primary API Key (Token)</div>
                <div className="text-amber-300 font-bold text-sm truncate select-all">{activeApiKey}</div>
              </div>
            </div>
          </div>

          {/* PHP / Direct Gateway URL Endpoints (Single 1-Click Copyable) */}
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Live Endpoint URL Formats (Ready to Use)</span>
            </h3>

            {/* GET Query Template URL */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">1. Instant Transfer URL (Template with Placeholders):</span>
                <button
                  onClick={() => copyUrl(requestedApiTemplate, 'template')}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  {copiedTemplateUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedTemplateUrl ? 'Copied Template!' : 'Copy Template URL'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto select-all">
                {requestedApiTemplate}
              </div>
            </div>

            {/* GET Transfer URL with live values */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-400">2. Active Live Transfer URL (With your Active Token):</span>
                <button
                  onClick={() => copyUrl(requestedApiUrl, 'transfer')}
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  {copiedTransferUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedTransferUrl ? 'Copied Live URL!' : 'Copy Live URL'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto select-all">
                {requestedApiUrl}
              </div>
            </div>

            {/* Balance Check URL */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-400">3. Live Balance Check URL:</span>
                <button
                  onClick={() => copyUrl(phpBalanceUrl, 'balance')}
                  className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  {copiedBalanceUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBalanceUrl ? 'Copied Balance URL!' : 'Copy Balance URL'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-sky-300 overflow-x-auto select-all">
                {phpBalanceUrl}
              </div>
            </div>
          </div>

          {/* Interactive API Request Tester */}
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>Interactive API Tester & Simulator</span>
                </h3>
                <p className="text-xs text-slate-400">Test live requests directly from your browser to verify instant ledger response.</p>
              </div>

              <button
                onClick={executeApiTest}
                disabled={isExecuting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Play className={`h-3.5 w-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Sending Request...' : 'Send Live Request'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Select Endpoint Format (Base: {permanentAppUrl})</label>
                  <select
                    value={activeEndpoint}
                    onChange={(e) => setActiveEndpoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GET /Api/api.php (Token + Paytm Query URL)">GET {permanentAppUrl}/Api/api.php?token=...&paytm=...&amount=...</option>
                    <option value="POST /api.php (JSON Transfer)">POST {permanentAppUrl}/Api/api.php (JSON Transfer)</option>
                    <option value="GET /Api/api.php (Receiver User Check / Registration Verification)">GET {permanentAppUrl}/Api/api.php?token=...&action=check_user</option>
                    <option value="GET /api.php (Balance)">GET {permanentAppUrl}/Api/api.php?token=...&action=balance</option>
                    <option value="POST /api.php (JSON Balance)">POST {permanentAppUrl}/Api/api.php (JSON Balance Check)</option>
                    <option value="POST /transfer">POST {permanentAppUrl}/api/v1/transfer (REST P2P)</option>
                    <option value="GET /balance">GET {permanentAppUrl}/api/v1/balance (REST Balance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">API Token (Key)</label>
                  <input
                    type="text"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Paytm / Mobile / User ID</label>
                    <input
                      type="text"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Comment / Reference Note</label>
                  <input
                    type="text"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* JSON Response Window */}
              <div className="lg:col-span-6 flex flex-col">
                <label className="block text-slate-300 font-bold mb-1 text-xs font-sans">Live JSON Response</label>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-auto max-h-[300px] select-all shadow-inner">
                  {apiResponse ? (
                    <pre>{apiResponse}</pre>
                  ) : (
                    <span className="text-slate-500 italic">Click 'Send Live Request' to inspect JSON output...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CODE SDKS & OFFICIAL API ENDPOINTS DOCUMENTATION */}
      {activeViewTab === 'CODE_DOCS' && (
        <div className="space-y-6">
          {/* Base URL Master Card */}
          <div className="rounded-[2rem] bg-slate-900 border border-emerald-500/30 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>SR Gateway Official Production Base URL</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      LIVE PRODUCTION
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use this permanent base URL for all external API requests, merchant checkouts, and scripts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(permanentAppUrl);
                    setCopiedTemplateUrl(true);
                    setTimeout(() => setCopiedTemplateUrl(false), 2000);
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5"
                >
                  {copiedTemplateUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedTemplateUrl ? 'Copied Base URL!' : 'Copy Base URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-sm text-emerald-400 flex items-center justify-between">
              <span className="font-bold select-all">{permanentAppUrl}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">HTTPS SSL SECURED</span>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-400" />
              <span>Full API Endpoints Specification</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Endpoint Path</th>
                    <th className="py-2.5 px-3 font-sans">Parameters / Payload</th>
                    <th className="py-2.5 px-3 font-sans">Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GET</span></td>
                    <td className="py-3 px-3 text-white font-bold">/Api/api.php</td>
                    <td className="py-3 px-3 text-amber-300">?token, ?paytm, ?amount, ?comment</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">Instant direct wallet-to-wallet transfer</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">POST</span></td>
                    <td className="py-3 px-3 text-white font-bold">/Api/api.php</td>
                    <td className="py-3 px-3 text-amber-300">{`{ token, paytm, amount, comment }`}</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">JSON payload instant wallet transfer</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">GET</span></td>
                    <td className="py-3 px-3 text-white font-bold">/Api/api.php</td>
                    <td className="py-3 px-3 text-sky-300">?token=YOUR_TOKEN&action=balance</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">Live wallet balance inquiry</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">GET</span></td>
                    <td className="py-3 px-3 text-white font-bold">/Api/api.php</td>
                    <td className="py-3 px-3 text-amber-300">?token=YOUR_TOKEN&action=check_user&number=9876543210</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">Lookup recipient name & wallet validity</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">POST</span></td>
                    <td className="py-3 px-3 text-white font-bold">/api/telegram-webhook</td>
                    <td className="py-3 px-3 text-purple-300">Telegram Bot Update Payload</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">Automated Telegram Bot Webhook endpoint</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">POST</span></td>
                    <td className="py-3 px-3 text-white font-bold">/api/v1/transfer</td>
                    <td className="py-3 px-3 text-amber-300">{`{ recipient, amount, note }`}</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">REST API authenticated P2P transfer</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">GET</span></td>
                    <td className="py-3 px-3 text-white font-bold">/api/v1/balance</td>
                    <td className="py-3 px-3 text-sky-300">?user_id=SR-10029</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-300">REST API wallet balance check</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-Language Ready Code Snippets */}
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <FileCode2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Ready Integration Code Snippets</h3>
                  <p className="text-xs text-slate-400">Copy and paste into your backend to accept or dispatch automated payments</p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                {(['php', 'curl', 'nodejs', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg uppercase font-bold transition ${
                      selectedLanguage === lang
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'nodejs' ? 'Node.js' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Box */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
              <button
                onClick={() => {
                  let codeToCopy = '';
                  if (selectedLanguage === 'php') {
                    codeToCopy = `<?php
// SR GATEWAY - PHP Instant Transfer Integration
$token = "${activeApiKey}";
$paytm = "9876543210"; // Recipient Mobile or User ID
$amount = 100;
$comment = "Order_Payment_101";

$apiUrl = "${permanentAppUrl}/Api/api.php?token=" . urlencode($token) . "&paytm=" . urlencode($paytm) . "&amount=" . $amount . "&comment=" . urlencode($comment);

$response = file_get_contents($apiUrl);
$result = json_decode($response, true);

if ($result && isset($result['status']) && $result['status'] === 'success') {
    echo "Payment Successful! Txn ID: " . $result['txn_id'];
} else {
    echo "Payment Failed: " . ($result['message'] ?? 'Unknown Error');
}
?>`;
                  } else if (selectedLanguage === 'curl') {
                    codeToCopy = `curl -X GET "${permanentAppUrl}/Api/api.php?token=${activeApiKey}&paytm=9876543210&amount=100&comment=API_Payout"`;
                  } else if (selectedLanguage === 'nodejs') {
                    codeToCopy = `// Node.js (fetch / axios)
const apiUrl = "${permanentAppUrl}/Api/api.php";

async function makePayment() {
  const params = new URLSearchParams({
    token: "${activeApiKey}",
    paytm: "9876543210",
    amount: "100",
    comment: "Order_101"
  });

  const response = await fetch(\`\${apiUrl}?\${params.toString()}\`);
  const data = await response.json();
  console.log("SR Gateway Response:", data);
}

makePayment();`;
                  } else if (selectedLanguage === 'python') {
                    codeToCopy = `import requests

url = "${permanentAppUrl}/Api/api.php"
params = {
    "token": "${activeApiKey}",
    "paytm": "9876543210",
    "amount": "100",
    "comment": "Python_Payout"
}

response = requests.get(url, params=params)
data = response.json()
print("Payment Result:", data)`;
                  }
                  navigator.clipboard.writeText(codeToCopy);
                  setCopiedCodeSnippet(true);
                  setTimeout(() => setCopiedCodeSnippet(false), 2000);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans font-bold flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedCodeSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCodeSnippet ? 'Copied Code!' : 'Copy Code'}</span>
              </button>

              <pre className="text-slate-200 leading-relaxed overflow-x-auto pt-2">
                {selectedLanguage === 'php' && `<?php
// SR GATEWAY - PHP Instant Transfer Integration
$token = "${activeApiKey}";
$paytm = "9876543210"; // Recipient Mobile or User ID
$amount = 100;
$comment = "Order_Payment_101";

$apiUrl = "${permanentAppUrl}/Api/api.php?token=" . urlencode($token) . "&paytm=" . urlencode($paytm) . "&amount=" . $amount . "&comment=" . urlencode($comment);

$response = file_get_contents($apiUrl);
$result = json_decode($response, true);

if ($result && isset($result['status']) && $result['status'] === 'success') {
    echo "Payment Successful! Txn ID: " . $result['txn_id'];
} else {
    echo "Payment Failed: " . ($result['message'] ?? 'Unknown Error');
}
?>`}

                {selectedLanguage === 'curl' && `# cURL CLI Instant Request
curl -X GET "${permanentAppUrl}/Api/api.php?token=${activeApiKey}&paytm=9876543210&amount=100&comment=API_Payout"`}

                {selectedLanguage === 'nodejs' && `// Node.js (fetch / axios)
const apiUrl = "${permanentAppUrl}/Api/api.php";

async function makePayment() {
  const params = new URLSearchParams({
    token: "${activeApiKey}",
    paytm: "9876543210",
    amount: "100",
    comment: "Order_101"
  });

  const response = await fetch(\`\${apiUrl}?\${params.toString()}\`);
  const data = await response.json();
  console.log("SR Gateway Response:", data);
}

makePayment();`}

                {selectedLanguage === 'python' && `import requests

url = "${permanentAppUrl}/Api/api.php"
params = {
    "token": "${activeApiKey}",
    "paytm": "9876543210",
    "amount": "100",
    "comment": "Python_Payout"
}

response = requests.get(url, params=params)
data = response.json()
print("Payment Result:", data)`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
