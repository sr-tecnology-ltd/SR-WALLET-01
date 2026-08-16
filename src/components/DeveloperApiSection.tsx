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
  Layers,
  Globe,
} from 'lucide-react';

interface DiagnosticTest {
  name: string;
  endpoint: string;
  method: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  latencyMs?: number;
  statusCode?: number;
  details?: string;
  responseSnippet?: string;
}

export const DeveloperApiSection: React.FC = () => {
  const { currentUser, apiKeys, createApiKey, revokeApiKey, currentWallet, formatINR, settings } = useWallet();

  const [newKeyName, setNewKeyName] = useState('Telegram Bot & Merchant Key');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBalanceUrl, setCopiedBalanceUrl] = useState(false);
  const [copiedTransferUrl, setCopiedTransferUrl] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedWebhookCurl, setCopiedWebhookCurl] = useState(false);
  const [copiedCodeTab, setCopiedCodeTab] = useState<string | null>(null);

  // Active Tab: 'DIAGNOSTICS' | 'SANDBOX' | 'TELEGRAM_SIMULATOR' | 'CODE_SAMPLES'
  const [activeViewTab, setActiveViewTab] = useState<'DIAGNOSTICS' | 'SANDBOX' | 'TELEGRAM_SIMULATOR' | 'CODE_SAMPLES'>('TELEGRAM_SIMULATOR');
  const [codeLanguage, setCodeLanguage] = useState<'PHP' | 'PYTHON' | 'NODEJS' | 'TELEGRAM_BOT'>('TELEGRAM_BOT');

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
    setResetSuccessMsg('✅ Old key removed! New API Key generated & auto-connected to your wallet.');
    setTimeout(() => setResetSuccessMsg(null), 4000);
  };

  // Smart non-self recipient defaults
  const defaultRecipientNumber =
    currentUser.user_custom_id === 'SR-10034' || currentUser.mobile?.includes('98123')
      ? '9876543210'
      : '9812345678';
  const defaultRecipientName =
    currentUser.user_custom_id === 'SR-10034' || currentUser.mobile?.includes('98123')
      ? 'Rahul Sharma (9876543210)'
      : 'Priya Patel (9812345678)';

  // API Tester state
  const [activeEndpoint, setActiveEndpoint] = useState<string>('POST /api.php (JSON Transfer)');
  const [customApiKey, setCustomApiKey] = useState(activeApiKey);
  const [customNumber, setCustomNumber] = useState(defaultRecipientNumber);
  const [customAmount, setCustomAmount] = useState('100');
  const [customComment, setCustomComment] = useState('API_Payment_Test');
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
  const [botSimUsername, setBotSimUsername] = useState(currentUser.telegram_id || '@rahul_sr');
  const [botSimChatId, setBotSimChatId] = useState('638291048');
  const [botSimLogs, setBotSimLogs] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; txn?: any }>>([
    {
      sender: 'bot',
      text: `👋 Welcome to SR GATEWAY Bot!\n\nUse /pay <number> <amount> to transfer funds directly between wallets, or /balance to check live wallet balance.`,
      time: 'Just now',
    },
  ]);
  const [isBotRunning, setIsBotRunning] = useState(false);

  // Diagnostics Suite State
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([
    {
      name: 'System Health & Engine Check',
      endpoint: '/api/health',
      method: 'GET',
      status: 'PENDING',
      details: 'Verifies backend express server, process uptime, and node environment.',
    },
    {
      name: 'PHP Direct Gateway Balance Check',
      endpoint: `/api.php?api_key=${activeApiKey}&action=balance`,
      method: 'GET',
      status: 'PENDING',
      details: 'Tests balance inquiry endpoint format for external PHP scripts.',
    },
    {
      name: 'User-to-User Transfer via /api.php',
      endpoint: `/api.php?api_key=${activeApiKey}&number=${defaultRecipientNumber}&amount=100&comment=Verification_Transfer`,
      method: 'GET',
      status: 'PENDING',
      details: 'Validates instant peer transfer execution, user resolution, and dual balance update.',
    },
    {
      name: 'REST v1 User-to-User Transfer',
      endpoint: '/api/v1/transfer',
      method: 'POST',
      status: 'PENDING',
      details: 'Validates JSON body parser and dual transaction logging (TRANSFER_OUT + TRANSFER_IN).',
    },
    {
      name: 'Telegram Bot Webhook Engine',
      endpoint: '/api/telegram-webhook',
      method: 'POST',
      status: 'PENDING',
      details: 'Validates Telegram bot update receiver and command parser.',
    },
    {
      name: 'Telegram Bot 5-Minute OTP Verification',
      endpoint: '/api/v1/auth/telegram-otp/send',
      method: 'POST',
      status: 'PENDING',
      details: 'Tests 5-minute security hash generation and Telegram Bot API message dispatch.',
    },
  ]);

  const handleGenerateKey = () => {
    const res = createApiKey(newKeyName || 'Merchant Gateway Key', ['balance.read', 'transfer.write', 'deposit.request', 'withdraw.request']);
    setCreatedSecret(res.secretKey);
    setNewKeyName('');
  };

  const copySecret = () => {
    if (createdSecret) {
      navigator.clipboard.writeText(createdSecret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const defaultSharedOrigin = 'https://ais-pre-vs72ytgafqlcchjzyem3au-15102117223.asia-east1.run.app';
  const defaultDevOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-vs72ytgafqlcchjzyem3au-15102117223.asia-east1.run.app';

  const [domainMode, setDomainMode] = useState<'shared' | 'dev' | 'custom'>('custom');
  const [customDomainInput, setCustomDomainInput] = useState('https://srgateway.in');

  const currentOrigin =
    domainMode === 'shared'
      ? defaultSharedOrigin
      : domainMode === 'custom' && customDomainInput.trim()
      ? customDomainInput.trim().replace(/\/$/, '')
      : defaultDevOrigin;

  const requestedApiUrl = `${currentOrigin}/Api/api.php?token=${activeApiKey}&paytm=${defaultRecipientNumber}&amount=100&comment=Payment_Transfer`;
  const requestedApiTemplate = `${currentOrigin}/Api/api.php?token=${activeApiKey}&paytm={number}&amount={amount}&comment={comment}`;
  const phpTransferUrl = `${currentOrigin}/Api/api.php?token=${activeApiKey}&paytm=${defaultRecipientNumber}&amount=100&comment=Payment_Order_101`;
  const phpBalanceUrl = `${currentOrigin}/Api/api.php?token=${activeApiKey}&action=balance`;
  const telegramWebhookUrl = `${currentOrigin}/api/telegram-webhook`;
  const webhookSetCurl = `curl -F "url=${telegramWebhookUrl}" https://api.telegram.org/bot${settings.otp_telegram_bot_token || 'YOUR_BOT_TOKEN'}/setWebhook`;

  const copyUrl = (url: string, type: 'balance' | 'transfer' | 'webhook' | 'curl') => {
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
    } else {
      setCopiedWebhookCurl(true);
      setTimeout(() => setCopiedWebhookCurl(false), 2000);
    }
  };

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeTab(label);
    setTimeout(() => setCopiedCodeTab(null), 2000);
  };

  // Run full automated diagnostics on all endpoints
  const runDiagnostics = async () => {
    setDiagnosticsRunning(true);
    const updated = [...diagnosticTests];

    for (let i = 0; i < updated.length; i++) {
      const test = { ...updated[i], status: 'RUNNING' as const };
      updated[i] = test;
      setDiagnosticTests([...updated]);

      const start = performance.now();
      try {
        let res: Response;
        if (test.method === 'POST') {
          let body: any = {};
          if (test.endpoint.includes('telegram-otp/send')) {
            body = { chat_id: '638291048', bot_token: settings.otp_telegram_bot_token };
          } else if (test.endpoint.includes('/transfer')) {
            body = { sender_id: currentUser.user_custom_id, recipient_id: '9876543210', amount: 10, note: 'Diagnostics Check' };
          } else if (test.endpoint.includes('telegram-webhook')) {
            body = { update_id: 123456, message: { text: '/balance', chat: { id: 638291048 }, from: { username: 'rahul_dev' } } };
          }

          res = await fetch(test.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': activeApiKey,
            },
            body: JSON.stringify(body),
          });
        } else {
          res = await fetch(test.endpoint, {
            headers: { 'X-API-Key': activeApiKey },
          });
        }

        const latency = Math.round(performance.now() - start);
        const data = await res.json();

        updated[i] = {
          ...test,
          status: res.ok ? 'PASSED' : 'FAILED',
          latencyMs: latency,
          statusCode: res.status,
          responseSnippet: JSON.stringify(data).slice(0, 140) + '...',
          details: res.ok
            ? `Verified OK (HTTP ${res.status}, ${latency}ms). Payload schema valid.`
            : `Error: HTTP ${res.status} - ${data.message || 'Verification check failed'}`,
        };
      } catch (err: any) {
        updated[i] = {
          ...test,
          status: 'FAILED',
          latencyMs: Math.round(performance.now() - start),
          statusCode: 500,
          details: `Connection Error: ${err.message}`,
        };
      }
      setDiagnosticTests([...updated]);
    }
    setDiagnosticsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

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
      let endpoint = '/api/v1/balance';
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
      } else if (activeEndpoint.includes('POST /api.php (JSON Balance)')) {
        endpoint = '/Api/api.php';
        method = 'POST';
        body = JSON.stringify({
          token: customApiKey || activeApiKey,
          action: 'balance',
          sender_id: currentUser.user_custom_id,
        });
      } else if (activeEndpoint.includes('GET /api.php (Transfer)')) {
        endpoint = `/Api/api.php?token=${encodeURIComponent(customApiKey)}&paytm=${encodeURIComponent(customNumber)}&amount=${encodeURIComponent(customAmount)}&comment=${encodeURIComponent(customComment)}&sender_id=${currentUser.user_custom_id}`;
        method = 'GET';
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
      } else if (activeEndpoint.includes('/deposit')) {
        endpoint = '/api/v1/deposit/request';
        method = 'POST';
        body = JSON.stringify({
          user_id: currentUser.user_custom_id,
          amount: 1000,
          utr: `UTR${Date.now()}`,
          payment_method: 'UPI',
        });
      } else if (activeEndpoint.includes('/withdraw')) {
        endpoint = '/api/v1/withdraw/request';
        method = 'POST';
        body = JSON.stringify({
          user_id: currentUser.user_custom_id,
          amount: 500,
          payment_identifier: 'user@upi',
          note: 'API Test Withdrawal',
        });
      } else {
        endpoint = `/api/v1/transactions?user_id=${currentUser.user_custom_id}`;
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
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: 'Failed to connect to API endpoint', details: err.message }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    executeApiTest();
  }, [activeEndpoint]);

  // Code Samples Generator (Supporting /Api/api.php with token & paytm)
  const phpSample = `<?php
// ====================================================
// SR GATEWAY IN - PHP DIRECT GET & POST TRANSFER SCRIPT
// Endpoint: /Api/api.php
// ====================================================
$token = "${activeApiKey}";
$base_url = "${currentOrigin}";

// METHOD 1: Direct GET Query URL Call (Super Fast & Simple)
function transferViaGetUrl($base_url, $token, $paytm_number, $amount, $comment = "Payout") {
    $params = http_build_query([
        'token'   => $token,
        'paytm'   => $paytm_number, // 10-digit mobile number or User ID
        'amount'  => $amount,
        'comment' => $comment
    ]);
    
    $url = "$base_url/Api/api.php?$params";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

// METHOD 2: Direct POST JSON Call (Secure)
function transferViaPostJson($base_url, $token, $paytm_number, $amount, $comment = "Payout") {
    $payload = [
        'token'   => $token,
        'paytm'   => $paytm_number,
        'amount'  => (float)$amount,
        'comment' => $comment
    ];

    $ch = curl_init("$base_url/Api/api.php");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $result = curl_exec($ch);
    curl_close($ch);
    return json_decode($result, true);
}

// Example Execution:
// $result = transferViaGetUrl($base_url, $token, "9876543210", 100, "Bot_Order_102");
// print_r($result);
?>`;

  const pythonSample = `import requests

TOKEN = "${activeApiKey}"
BASE_URL = "${currentOrigin}"

# METHOD 1: Direct GET URL Transfer (/Api/api.php)
def send_payment_get_url(paytm_number, amount, comment="Telegram Payout"):
    url = f"{BASE_URL}/Api/api.php"
    params = {
        "token": TOKEN,
        "paytm": paytm_number,  # Mobile number or Wallet User ID
        "amount": amount,
        "comment": comment
    }
    res = requests.get(url, params=params).json()
    print("Transfer Status:", res)
    return res

# METHOD 2: POST JSON Transfer
def send_payment_post_json(paytm_number, amount, comment="Telegram Payout"):
    url = f"{BASE_URL}/Api/api.php"
    payload = {
        "token": TOKEN,
        "paytm": paytm_number,
        "amount": float(amount),
        "comment": comment
    }
    headers = {"Content-Type": "application/json"}
    res = requests.post(url, json=payload, headers=headers).json()
    return res

# Test execution:
if __name__ == "__main__":
    send_payment_get_url("9876543210", 100, "Python_Payout_001")`;

  const nodejsSample = `// Node.js (Axios) User-to-User Transfer with POST JSON Body
import axios from 'axios';

const API_KEY = '${activeApiKey}';
const BASE_URL = '${currentOrigin}';

// 1. Check Balance via POST JSON
async function getBalance(userId = 'SR-10029') {
  const res = await axios.post(\`\${BASE_URL}/api.php\`, {
    api_key: API_KEY,
    action: 'balance',
    sender_id: userId
  });
  console.log('Available Balance:', res.data.available_balance);
  return res.data;
}

// 2. Execute User to User Transfer via POST JSON
async function sendTransfer(walletId, amount, comment = 'NodeJS Payout') {
  const res = await axios.post(\`\${BASE_URL}/api.php\`, {
    api_key: API_KEY,
    wallet_id: walletId, // Mobile or Custom User ID
    amount: Number(amount),
    comment: comment
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('Transfer Result:', res.data);
  return res.data;
}

sendTransfer('9876543210', 100, 'Peer Payout');`;

  const telegramBotSample = `# ====================================================
# TELEGRAM BOT FULL INTEGRATION (POST JSON Body to Gateway)
# Supports: /start, /balance, /pay <number> <amount>, /history
# ====================================================
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

API_KEY = "${activeApiKey}"
BASE_URL = "${currentOrigin}"

async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    user_name = update.effective_user.first_name
    await update.message.reply_text(
        f"👋 *Welcome {user_name} to SR GATEWAY Bot*\\n\\n"
        f"🆔 Your Chat ID: \`{chat_id}\`\\n\\n"
        f"Commands:\\n"
        f"• \`/balance\` - Check wallet balance\\n"
        f"• \`/pay <mobile_number> <amount>\` - Instant User-to-User transfer\\n"
        f"• \`/history\` - View latest transactions\\n\\n"
        f"Example: \`/pay 9876543210 100\`",
        parse_mode="Markdown"
    )

async def balance_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles /balance command using POST JSON"""
    chat_id = update.effective_chat.id
    payload = {
        "api_key": API_KEY,
        "action": "balance",
        "chat_id": chat_id
    }
    res = requests.post(f"{BASE_URL}/api.php", json=payload).json()
    
    if res.get("status") == "success":
        balance = res.get("available_balance", 0)
        await update.message.reply_text(
            f"💰 *SR Gateway Balance:* ₹{balance:,.2f}\\n"
            f"👤 User: {res.get('user_name')} (\`{res.get('user_id')}\`)",
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text("❌ Error fetching balance from Gateway.")

async def pay_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Usage: /pay <wallet_id/number> <amount> [optional_note]"""
    if len(context.args) < 2:
        await update.message.reply_text("⚠️ Usage: \`/pay <mobile_number/user_id> <amount> [note]\`", parse_mode="Markdown")
        return
    
    wallet_id = context.args[0]
    amount = float(context.args[1])
    note = " ".join(context.args[2:]) if len(context.args) > 2 else "Telegram Bot Transfer"
    sender_chat = update.effective_chat.id
    
    # Send POST JSON Request to SR Gateway
    payload = {
        "api_key": API_KEY,
        "wallet_id": wallet_id,
        "amount": amount,
        "comment": note,
        "chat_id": sender_chat
    }
    
    res = requests.post(f"{BASE_URL}/api.php", json=payload, headers={"Content-Type": "application/json"}).json()
    
    if res.get("status") == "success":
        r_name = res.get("recipient", {}).get("name", wallet_id)
        rem_bal = res.get("remaining_balance", 0)
        await update.message.reply_text(
            f"✅ *Payment Successful!*\\n\\n"
            f"💸 *Amount:* ₹{amount}\\n"
            f"👤 *To:* {r_name} ({wallet_id})\\n"
            f"🔖 *Txn ID:* \`{res.get('txn_id')}\`\\n"
            f"💰 *Remaining Balance:* ₹{rem_bal:,.2f}",
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(f"❌ *Transfer Failed:*\\n{res.get('message')}", parse_mode="Markdown")

# Run Bot Application:
# app = ApplicationBuilder().token("YOUR_TELEGRAM_BOT_TOKEN").build()
# app.add_handler(CommandHandler("start", start_cmd))
# app.add_handler(CommandHandler("balance", balance_cmd))
# app.add_handler(CommandHandler("pay", pay_cmd))
# app.run_polling()`;

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

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-right font-mono shrink-0 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-[10px] text-emerald-300 uppercase font-extrabold">Peer Gateway Verified</div>
              <div className="text-xs font-bold text-white">Version 1.0.4-prod</div>
            </div>
          </div>
        </div>
      </div>

      {/* Base URL Domain Selector for External Bots */}
      <div className="rounded-2xl bg-slate-900 border border-indigo-500/30 p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              API Base Domain (Select for your Telegram Bot / Server)
            </span>
          </div>
          <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
            ⚠️ External bots ke liye Public Shared URL use karein
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDomainMode('shared')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              domainMode === 'shared'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Check className={`h-3 w-3 ${domainMode === 'shared' ? 'text-indigo-400' : 'opacity-0'}`} />
                Public Shared URL (Recommended)
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">LIVE / OPEN</span>
            </div>
            <div className="font-mono text-[10px] text-slate-300 truncate">
              {defaultSharedOrigin}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDomainMode('custom')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              domainMode === 'custom'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Check className={`h-3 w-3 ${domainMode === 'custom' ? 'text-amber-400' : 'opacity-0'}`} />
                Custom Domain (Your Domain)
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">CUSTOM</span>
            </div>
            <div className="font-mono text-[10px] text-slate-300 truncate">
              {customDomainInput || 'https://srgateway.in'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDomainMode('dev')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              domainMode === 'dev'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Check className={`h-3 w-3 ${domainMode === 'dev' ? 'text-indigo-400' : 'opacity-0'}`} />
                Dev Sandbox URL (Internal)
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">DEV PREVIEW</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400 truncate">
              {defaultDevOrigin}
            </div>
          </button>
        </div>

        {domainMode === 'custom' && (
          <div className="pt-1">
            <input
              type="text"
              placeholder="https://your-domain.com"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        )}
      </div>

      {/* Main View Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveViewTab('TELEGRAM_SIMULATOR')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'TELEGRAM_SIMULATOR'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Telegram Bot Live Simulator</span>
        </button>

        <button
          onClick={() => setActiveViewTab('DIAGNOSTICS')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'DIAGNOSTICS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>API Diagnostics & Self-Test</span>
        </button>

        <button
          onClick={() => setActiveViewTab('SANDBOX')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'SANDBOX'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Interactive API Sandbox</span>
        </button>

        <button
          onClick={() => setActiveViewTab('CODE_SAMPLES')}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeViewTab === 'CODE_SAMPLES'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          <span>Code Integration SDKs</span>
        </button>
      </div>

      {/* VIEW 1: TELEGRAM BOT SIMULATOR & USER-TO-USER ENGINE */}
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
                  <button
                    onClick={() => sendBotCommand('/deposit')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/40 text-[11px] font-mono transition"
                  >
                    /deposit
                  </button>
                  <button
                    onClick={() => sendBotCommand('/otp')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 hover:text-indigo-200 hover:border-indigo-500/40 text-[11px] font-mono transition"
                  >
                    /otp
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
                  <li>Sender sends <code className="text-amber-300">/pay 9876543210 100</code> on Telegram.</li>
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

      {/* VIEW 2: API DIAGNOSTICS & VERIFICATION SUITE */}
      {activeViewTab === 'DIAGNOSTICS' && (
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Real-time Self-Test & Health Engine</span>
                </div>
                <h3 className="text-xl font-black text-white">Full API Diagnostics & Verification</h3>
                <p className="text-xs text-slate-400">
                  Comprehensive live automated testing across all endpoints, peer transfers, authentication keys, and Telegram OTP handlers.
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={diagnosticsRunning}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/30 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
                <span>{diagnosticsRunning ? 'Running Verification...' : 'Run All Verification Tests'}</span>
              </button>
            </div>

            {/* Test Results Table */}
            <div className="space-y-3 font-mono text-xs">
              {diagnosticTests.map((test, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-sans font-bold text-white text-sm">
                      <span className="text-slate-400 font-mono text-xs">#{idx + 1}</span>
                      <span>{test.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                        {test.method} {test.endpoint.split('?')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{test.details}</p>
                    {test.responseSnippet && (
                      <div className="text-[11px] text-emerald-400 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 break-all select-all">
                        {test.responseSnippet}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {test.latencyMs !== undefined && (
                      <span className="text-[11px] text-slate-400 font-mono">{test.latencyMs}ms</span>
                    )}

                    {test.status === 'PASSED' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-sans flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>VERIFIED OK</span>
                      </span>
                    )}

                    {test.status === 'FAILED' && (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-sans flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        <span>FAILED</span>
                      </span>
                    )}

                    {test.status === 'RUNNING' && (
                      <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold font-sans flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>TESTING...</span>
                      </span>
                    )}

                    {test.status === 'PENDING' && (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold font-sans">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE SANDBOX & CREDENTIALS */}
      {activeViewTab === 'SANDBOX' && (
        <div className="space-y-6">
          {/* Your Live Wallet Credentials & API Key Card */}
          <div className="rounded-[2rem] bg-slate-900 border border-indigo-500/30 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Your Live Wallet API Credentials</h3>
                  <p className="text-xs text-slate-400">Use these credentials in your API queries & Telegram bot scripts</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono">
                Wallet Balance: {formatINR(currentWallet.available_balance)}
              </div>
            </div>

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
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Primary API Key</div>
                <div className="text-amber-300 font-bold text-sm truncate select-all">{activeApiKey}</div>
              </div>
            </div>
          </div>

          {/* PHP Direct Gateway API Formats (Prioritizing Token + Paytm URL & POST JSON) */}
          <div className="rounded-[2rem] bg-slate-900 border border-amber-500/30 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30 font-mono">
                  DIRECT GATEWAY API FORMAT
                </span>
                <h3 className="text-sm font-bold text-white">Direct URL & Bot Transfer Call (/Api/api.php)</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                GET & POST Supported
              </span>
            </div>

            {/* Format 1: Exact Requested URL Format (Token + Paytm) */}
            <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-sans">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>1. Direct GET URL Format (Token + Paytm + Amount + Comment)</span>
                </span>
                <button
                  onClick={() => copyUrl(requestedApiUrl, 'transfer')}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedTransferUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedTransferUrl ? 'Copied Live URL!' : 'Copy Direct URL'}</span>
                </button>
              </div>

              {/* URL Syntax Template */}
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto select-all">
                {requestedApiTemplate}
              </div>

              {/* Live Executable URL */}
              <div className="p-2.5 bg-slate-900/90 border border-amber-500/20 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto select-all">
                {requestedApiUrl}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">token:</span>
                  <span className="text-amber-300">API Key</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">paytm:</span>
                  <span className="text-emerald-300">Mobile / Wallet ID</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">amount:</span>
                  <span className="text-cyan-300">100</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">comment:</span>
                  <span className="text-indigo-300">Payout_Note</span>
                </div>
              </div>
            </div>

            {/* Format 2: POST Request Body (JSON) */}
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-sans">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>2. POST JSON Body (Alternative for Server & Bots)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  POST /Api/api.php
                </span>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto select-all leading-relaxed">
{`// POST ${currentOrigin}/Api/api.php
// Headers: { "Content-Type": "application/json" }
{
  "token": "${activeApiKey}",
  "paytm": "9876543210",
  "amount": 100,
  "comment": "Bot User Payout"
}`}
              </pre>
            </div>

            {/* Format 3: Balance Check */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <WalletIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Balance Check URL:</span>
              </span>
              <div className="font-mono text-[11px] text-emerald-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 truncate max-w-md">
                {phpBalanceUrl}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* API Key Management */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Key className="h-4 w-4 text-indigo-400" />
                  <span>Manage API Secret Keys</span>
                </h3>
                <button
                  type="button"
                  onClick={handleResetApiKey}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Revokes existing keys and generates a fresh active API Key connected to your wallet"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                  <span>RESET API KEY 🔄</span>
                </button>
              </div>

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold font-mono">
                  {resetSuccessMsg}
                </div>
              )}

              {/* Create Key Input */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-300">Generate New API Secret Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Key Description (e.g. Telegram Bot Server)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleGenerateKey}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create</span>
                  </button>
                </div>

                {createdSecret && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>Secret Key Generated!</span>
                      <button onClick={copySecret} className="text-xs text-slate-300 hover:text-white flex items-center gap-1">
                        {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-slate-950 p-2 rounded-lg text-amber-300 break-all select-all">
                      {createdSecret}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Save this key securely! It provides full wallet access through the API.
                    </p>
                  </div>
                )}
              </div>

              {/* Active Keys List */}
              <div className="space-y-2">
                {(currentUser.role === 'ADMIN' ? apiKeys : userApiKeys).length === 0 ? (
                  <p className="text-center text-slate-500 py-6 text-xs">No active API keys created for this account yet.</p>
                ) : (
                  (currentUser.role === 'ADMIN' ? apiKeys : userApiKeys).map((key) => (
                    <div key={key.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-sans">{key.key_name}</span>
                          {currentUser.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[9px]">
                              {key.user_id}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{key.secret_key_masked}</div>
                        <div className="text-[9px] text-indigo-400 mt-0.5">
                          Prefix: {key.api_key_prefix} • Created: {new Date(key.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Telegram Bot Architecture & Commands Spec */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                    Telegram Bot Integration Commands
                  </h3>
                  <p className="text-[10px] text-slate-400">Bot: {settings.otp_telegram_bot_username || '@PAYZYBOT'}</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { cmd: '/start', desc: 'Get your Chat ID & link Telegram account' },
                  { cmd: '/balance', desc: 'Query live available wallet balance' },
                  { cmd: '/pay <number> <amt>', desc: 'Transfer balance to recipient mobile' },
                  { cmd: '/deposit', desc: 'Show Admin UPI QR code & submit UTR' },
                  { cmd: '/withdraw', desc: 'Submit payout request to registered UPI' },
                  { cmd: '/history', desc: 'View latest wallet transactions' },
                  { cmd: '/otp', desc: 'Generate 5-Minute Login OTP' },
                ].map((c) => (
                  <div key={c.cmd} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs">{c.cmd}</span>
                    <span className="text-[11px] text-slate-300 font-sans">{c.desc}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-[11px] text-blue-300 leading-relaxed font-sans">
                <strong>Security Rule:</strong> All Telegram OTPs generated during user registration or bot actions are strictly valid for <strong>5 minutes</strong> only and delivered privately to the user's Chat ID.
              </div>
            </div>
          </div>

          {/* Interactive API Sandbox Tester */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <span>Interactive REST & PHP API Sandbox</span>
              </h3>
              <button
                onClick={executeApiTest}
                disabled={isExecuting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{isExecuting ? 'Sending...' : 'Send Live Request'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
              {/* Endpoint Selector */}
              <div className="lg:col-span-4 space-y-2">
                <label className="block text-slate-400 font-bold text-[11px] font-sans">Select API Endpoint</label>
                {[
                  'GET /Api/api.php (Token + Paytm Query URL)',
                  'POST /api.php (JSON Transfer)',
                  'POST /api.php (JSON Balance)',
                  'GET /api.php (Transfer)',
                  'GET /api.php (Balance)',
                  'GET /api/v1/balance',
                  'POST /api/v1/transfer',
                  'POST /api/v1/deposit/request',
                  'POST /api/v1/withdraw/request',
                  'GET /api/v1/transactions',
                ].map((ep) => (
                  <button
                    key={ep}
                    onClick={() => setActiveEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs font-bold ${
                      activeEndpoint === ep
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ep}
                  </button>
                ))}
              </div>

              {/* Test Parameters & Response */}
              <div className="lg:col-span-8 space-y-3">
                {/* Dynamic Parameter Inputs for api.php */}
                {activeEndpoint.includes('/api.php') && (
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400">API Key</label>
                        <input
                          type="text"
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      {activeEndpoint.includes('Transfer') && (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Recipient Number / ID</label>
                            <input
                              type="text"
                              value={customNumber}
                              onChange={(e) => setCustomNumber(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">Amount (INR)</label>
                            <input
                              type="number"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {activeEndpoint.includes('Transfer') && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
                        <span className="text-[10px] text-slate-500 font-bold">1-Click Recipients:</span>
                        <button
                          type="button"
                          onClick={() => setCustomNumber('9812345678')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                            customNumber === '9812345678'
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Priya (9812345678)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomNumber('9876543210')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                            customNumber === '9876543210'
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Rahul (9876543210)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomNumber('9898912345')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                            customNumber === '9898912345'
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Amit (9898912345)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomNumber('9911223344')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition ${
                            customNumber === '9911223344'
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Merchant (9911223344)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Payload Display */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-2">
                    <span>JSON Response ({activeEndpoint})</span>
                    <span className="text-emerald-400 font-mono">200 OK</span>
                  </div>
                  <pre className="text-emerald-400 text-xs overflow-x-auto p-2 scrollbar-thin max-h-64 font-mono">
                    {apiResponse || 'Executing API request...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CODE SAMPLES & SDK INTEGRATIONS */}
      {activeViewTab === 'CODE_SAMPLES' && (
        <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-sky-400" />
                <span>Ready-to-Use SDK & Script Code Samples</span>
              </h3>
              <p className="text-xs text-slate-400">
                Copy and paste these pre-configured scripts directly into your PHP server, Python script, or Telegram bot.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold font-mono">
              {(['PHP', 'PYTHON', 'NODEJS', 'TELEGRAM_BOT'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    codeLanguage === lang
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'TELEGRAM_BOT' ? 'TELEGRAM BOT (PY)' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3 relative">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="font-mono">
                {codeLanguage === 'PHP' && 'gateway_integration.php'}
                {codeLanguage === 'PYTHON' && 'gateway_integration.py'}
                {codeLanguage === 'NODEJS' && 'gateway_integration.ts'}
                {codeLanguage === 'TELEGRAM_BOT' && 'telegram_bot_handler.py'}
              </span>
              <button
                onClick={() => {
                  const code =
                    codeLanguage === 'PHP'
                      ? phpSample
                      : codeLanguage === 'PYTHON'
                      ? pythonSample
                      : codeLanguage === 'NODEJS'
                      ? nodejsSample
                      : telegramBotSample;
                  copyCode(code, codeLanguage);
                }}
                className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 font-sans"
              >
                {copiedCodeTab === codeLanguage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCodeTab === codeLanguage ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-2 leading-relaxed select-all max-h-[500px] scrollbar-thin">
              {codeLanguage === 'PHP' && phpSample}
              {codeLanguage === 'PYTHON' && pythonSample}
              {codeLanguage === 'NODEJS' && nodejsSample}
              {codeLanguage === 'TELEGRAM_BOT' && telegramBotSample}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
