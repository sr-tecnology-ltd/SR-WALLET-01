import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Wrench,
  Gauge,
  Database,
  Download,
  Upload,
  Copy,
  Key,
  EyeOff,
  Edit3,
  Zap,
  ArrowRightLeft,
  ArrowDownLeft,
  Filter,
  Crown,
  UserCog,
  UserCheck,
  UserX,
  ShieldOff,
  X,
} from 'lucide-react';
import { UserProfile, DepositRequest, WithdrawalRequest, Wallet, AppSettings } from '../types';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    activeRole,
    isOwner,
    isAdmin,
    ownerCreateSubAdmin,
    ownerUpdateSubAdmin,
    ownerDeleteSubAdmin,
    ownerFetchAdmins,
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
    resetAllUserBalances,
    wipeAllUserData,
    banUser,
    unbanUser,
    updateUserRequestLimit,
    resetUserDailyRequestCount,
    adminCreateUser,
    adminUpdateUserCredentials,
    restoreFullDatabase,
    settings,
    updateSettings,
    auditLogs,
    formatINR,
    refreshFromBackend,
  } = useWallet();

  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);

  // Add New User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRpin, setNewUserRpin] = useState('7477');
  const [newUserBalance, setNewUserBalance] = useState('0');
  const [newUserChatId, setNewUserChatId] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [createdUserResult, setCreatedUserResult] = useState<{
    user: UserProfile;
    password: string;
    rpin: string;
    balance: number;
  } | null>(null);
  const [copiedAllCreds, setCopiedAllCreds] = useState(false);

  const isMasterOwner = currentUser.role === 'OWNER' || activeRole === 'OWNER';
  const isSubAdmin = !isMasterOwner;

  const [activeAdminTab, setActiveAdminTab] = useState<
    'DASHBOARD' | 'USERS' | 'SUB_ADMINS' | 'DEPOSITS' | 'WITHDRAWALS' | 'TRANSACTIONS' | 'SETTINGS' | 'BACKUP' | 'AUDIT_LOGS'
  >('DASHBOARD');

  // Sub-Admin Management State (Owner Only)
  const [subAdminList, setSubAdminList] = useState<UserProfile[]>([]);
  const [isLoadingSubAdmins, setIsLoadingSubAdmins] = useState<boolean>(false);
  const [isAddSubAdminModalOpen, setIsAddSubAdminModalOpen] = useState<boolean>(false);
  const [newAdminFullName, setNewAdminFullName] = useState<string>('');
  const [newAdminMobile, setNewAdminMobile] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('Staff@123');
  const [newAdminRpin, setNewAdminRpin] = useState<string>('1234');
  const [newAdminTelegramChatId, setNewAdminTelegramChatId] = useState<string>('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState<boolean>(false);
  const [addSubAdminError, setAddSubAdminError] = useState<string | null>(null);

  // Edit Sub-Admin State
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<UserProfile | null>(null);
  const [editAdminForm, setEditAdminForm] = useState<{
    full_name: string;
    mobile: string;
    email: string;
    password: string;
    rpin: string;
    status: 'ACTIVE' | 'BANNED';
    telegram_chat_id: string;
  }>({
    full_name: '',
    mobile: '',
    email: '',
    password: '',
    rpin: '',
    status: 'ACTIVE',
    telegram_chat_id: '',
  });
  const [isSavingAdminEdit, setIsSavingAdminEdit] = useState<boolean>(false);
  const [showAdminPasswords, setShowAdminPasswords] = useState<Record<string, boolean>>({});
  const [showAdminRpins, setShowAdminRpins] = useState<Record<string, boolean>>({});

  const fetchSubAdmins = useCallback(async () => {
    setIsLoadingSubAdmins(true);
    try {
      const admins = await ownerFetchAdmins();
      setSubAdminList(admins);
    } catch (e) {
      console.warn('Failed to load sub-admins', e);
    } finally {
      setIsLoadingSubAdmins(false);
    }
  }, [ownerFetchAdmins]);

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins, allProfiles]);

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminFullName.trim() || !newAdminMobile.trim()) {
      setAddSubAdminError('Please provide Full Name and Mobile Number.');
      return;
    }
    setIsSubmittingAdmin(true);
    setAddSubAdminError(null);
    try {
      const res = await ownerCreateSubAdmin({
        full_name: newAdminFullName.trim(),
        mobile: newAdminMobile.trim(),
        email: newAdminEmail.trim() || undefined,
        password: newAdminPassword.trim() || 'Staff@123',
        rpin: newAdminRpin.trim() || '1234',
        telegram_chat_id: newAdminTelegramChatId.trim() || undefined,
      });
      if (res.success) {
        showAlert(res.message || '✅ Sub-Admin created successfully!');
        setIsAddSubAdminModalOpen(false);
        setNewAdminFullName('');
        setNewAdminMobile('');
        setNewAdminEmail('');
        setNewAdminPassword('Staff@123');
        setNewAdminRpin('1234');
        setNewAdminTelegramChatId('');
        await fetchSubAdmins();
      } else {
        setAddSubAdminError(res.message);
      }
    } catch (err: any) {
      setAddSubAdminError(err?.message || 'Failed to create sub-admin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleOpenEditSubAdmin = (admin: UserProfile) => {
    setSelectedAdminForEdit(admin);
    setEditAdminForm({
      full_name: admin.full_name || '',
      mobile: admin.mobile || '',
      email: admin.email || '',
      password: admin.password || '',
      rpin: admin.rpin || '1234',
      status: admin.status || 'ACTIVE',
      telegram_chat_id: admin.telegram_chat_id || '',
    });
  };

  const handleSaveSubAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForEdit) return;
    setIsSavingAdminEdit(true);
    try {
      const res = await ownerUpdateSubAdmin(selectedAdminForEdit.id, editAdminForm);
      if (res.success) {
        showAlert(res.message || '✅ Sub-Admin updated successfully!');
        setSelectedAdminForEdit(null);
        await fetchSubAdmins();
      } else {
        alert('Failed: ' + res.message);
      }
    } catch (e: any) {
      alert('Error updating sub-admin: ' + e?.message);
    } finally {
      setIsSavingAdminEdit(false);
    }
  };

  const handleToggleSubAdminBan = async (admin: UserProfile) => {
    const newStatus = admin.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    const actionLabel = newStatus === 'BANNED' ? 'BAN' : 'UNBAN';
    if (!window.confirm(`Are you sure you want to ${actionLabel} Sub-Admin ${admin.full_name} (${admin.user_custom_id})?`)) {
      return;
    }
    const res = await ownerUpdateSubAdmin(admin.id, { status: newStatus });
    if (res.success) {
      showAlert(`✅ Sub-Admin ${admin.full_name} is now ${newStatus}!`);
      await fetchSubAdmins();
    } else {
      alert('Failed: ' + res.message);
    }
  };

  const handleDeleteSubAdmin = async (admin: UserProfile) => {
    if (!window.confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to permanently REMOVE Sub-Admin ${admin.full_name} (${admin.user_custom_id})?\nTheir access to the staff portal will be revoked immediately.`)) {
      return;
    }
    const res = await ownerDeleteSubAdmin(admin.id);
    if (res.success) {
      showAlert(`✅ Sub-Admin ${admin.full_name} removed successfully!`);
      await fetchSubAdmins();
    } else {
      alert('Failed: ' + res.message);
    }
  };

  // Search & Filter state
  const [userSearch, setUserSearch] = useState<string>('');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'ADMIN'>('ALL');
  const [copiedLedgerId, setCopiedLedgerId] = useState<string | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserProfile | null>(null);
  const [adminActionModal, setAdminActionModal] = useState<'ADD_BAL' | 'CUT_BAL' | 'BAN' | 'SET_LIMIT' | 'RESET_QUOTA' | 'EDIT_CREDS' | null>(null);
  const [modalAmount, setModalAmount] = useState<number>(1000);
  const [modalReason, setModalReason] = useState<string>('');
  const [userQuotaLimitInput, setUserQuotaLimitInput] = useState<number>(10);

  // User Credentials Visibility & Editing State
  const [showUserPasswords, setShowUserPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [credsForm, setCredsForm] = useState<{
    full_name: string;
    password: string;
    rpin: string;
    telegram_chat_id: string;
    telegram_id: string;
    mobile: string;
    email: string;
    status: 'ACTIVE' | 'BANNED';
  }>({
    full_name: '',
    password: '',
    rpin: '1234',
    telegram_chat_id: '',
    telegram_id: '',
    mobile: '',
    email: '',
    status: 'ACTIVE',
  });
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Full Database Backup & Migration State
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isImportingDb, setIsImportingDb] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleShowPassword = (userId: string) => {
    setShowUserPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

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
  const [settingsForm, setSettingsForm] = useState<AppSettings>(settings);
  const [isSettingsDirty, setIsSettingsDirty] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    if (!isSettingsDirty) {
      setSettingsForm(settings);
    }
  }, [settings, isSettingsDirty]);

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setIsSettingsDirty(true);
    setSettingsForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    const updated: AppSettings = {
      ...settingsForm,
      maintenance_mode_enabled: enabled,
    };
    setSettingsForm(updated);
    setIsSettingsDirty(false);
    updateSettings(updated);

    try {
      await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      await fetch('/api/v1/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updated, isAdmin: true }),
      });
      showAlert(
        enabled
          ? '🔴 Maintenance Mode Activated! User panel is now locked for normal users.'
          : '🟢 Maintenance Mode Disabled! User panel is now fully accessible to users.'
      );
    } catch {
      showAlert('Maintenance Mode state updated locally.');
    }
  };

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

  // Telegram Bot Live Test State
  const [testTelegramChatId, setTestTelegramChatId] = useState<string>('6561010416');
  const [isTestingTelegram, setIsTestingTelegram] = useState<boolean>(false);
  const [testTelegramResult, setTestTelegramResult] = useState<{
    success: boolean;
    message: string;
    help?: string;
  } | null>(null);
  const [telegramStatusData, setTelegramStatusData] = useState<{
    ok: boolean;
    is_webhook_active?: boolean;
    webhook_url?: string;
    bot?: any;
    polling_active?: boolean;
    message?: string;
  } | null>(null);
  const [isCheckingBotStatus, setIsCheckingBotStatus] = useState<boolean>(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState<boolean>(false);

  const fetchTelegramBotStatus = async () => {
    setIsCheckingBotStatus(true);
    try {
      const res = await fetch('/api/v1/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setTelegramStatusData(data);
      }
    } catch {
      // Ignore
    } finally {
      setIsCheckingBotStatus(false);
    }
  };

  const handleSetRailwayWebhook = async () => {
    setIsSettingWebhook(true);
    try {
      const res = await fetch('/api/v1/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: 'https://sr-gateway-in.up.railway.app/api/v1/telegram-webhook',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showAlert(`✅ Telegram Webhook Connected: ${data.message}`);
        fetchTelegramBotStatus();
      } else {
        showAlert(`❌ Webhook Connection Failed: ${data.message}`);
      }
    } catch (e: any) {
      showAlert(`❌ Network Error: ${e?.message || 'Failed to connect webhook'}`);
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleDeleteWebhook = async () => {
    setIsSettingWebhook(true);
    try {
      const res = await fetch('/api/v1/telegram/delete-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      showAlert(`🔄 Switched to Polling: ${data.message || 'Webhook removed, polling active.'}`);
      fetchTelegramBotStatus();
    } catch (e: any) {
      showAlert(`❌ Error: ${e?.message || 'Failed to delete webhook'}`);
    } finally {
      setIsSettingWebhook(false);
    }
  };

  // System Maintenance & Reset Actions State
  const [isResetBalancesModalOpen, setIsResetBalancesModalOpen] = useState<boolean>(false);
  const [isResetBalancesLoading, setIsResetBalancesLoading] = useState<boolean>(false);
  const [isWipeUsersModalOpen, setIsWipeUsersModalOpen] = useState<boolean>(false);
  const [isWipeUsersLoading, setIsWipeUsersLoading] = useState<boolean>(false);
  const [resetConfirmText, setResetConfirmText] = useState<string>('');
  const [wipeConfirmText, setWipeConfirmText] = useState<string>('');
  const [actionAlertMsg, setActionAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirmResetAllBalances = async () => {
    setIsResetBalancesLoading(true);
    try {
      const res = await resetAllUserBalances();
      setActionAlertMsg({ type: 'success', text: res.message || 'All user balances have been reset to ₹0.00' });
      setIsResetBalancesModalOpen(false);
      setResetConfirmText('');
    } catch (e: any) {
      setActionAlertMsg({ type: 'error', text: e?.message || 'Failed to reset user balances.' });
    } finally {
      setIsResetBalancesLoading(false);
    }
  };

  const handleConfirmWipeAllUsers = async () => {
    setIsWipeUsersLoading(true);
    try {
      const res = await wipeAllUserData();
      setActionAlertMsg({ type: 'success', text: res.message || 'All user data wiped successfully. Users can now re-register.' });
      setIsWipeUsersModalOpen(false);
      setWipeConfirmText('');
    } catch (e: any) {
      setActionAlertMsg({ type: 'error', text: e?.message || 'Failed to wipe user data.' });
    } finally {
      setIsWipeUsersLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setAddUserError('Please enter full name of user.');
      return;
    }
    const cleanPhone = newUserMobile.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setAddUserError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
      setAddUserError('Please enter a valid Gmail / email address.');
      return;
    }
    const cleanRpin = newUserRpin.trim().replace(/[^0-9]/g, '');
    if (cleanRpin.length !== 4) {
      setAddUserError('R-PIN must be exactly 4 digits (e.g. 7477).');
      return;
    }

    setIsCreatingUser(true);
    setAddUserError(null);
    try {
      const result = await adminCreateUser({
        fullName: newUserName.trim(),
        mobile: cleanPhone,
        email: newUserEmail.trim(),
        password: newUserPassword.trim() || '123456',
        rpin: cleanRpin,
        initialBalance: Number(newUserBalance) || 0,
        telegramChatId: newUserChatId.trim() || undefined,
      });

      if (result.success && result.user) {
        setCreatedUserResult({
          user: result.user,
          password: newUserPassword.trim() || '123456',
          rpin: cleanRpin,
          balance: Number(newUserBalance) || 0,
        });
        showAlert(`✅ User ${result.user.full_name} (${result.user.user_custom_id}) created successfully!`);
      } else {
        setAddUserError(result.message || 'Failed to create user account.');
      }
    } catch (err: any) {
      setAddUserError(err?.message || 'Unexpected error creating user account.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCopyCreatedUserCreds = () => {
    if (!createdUserResult) return;
    const { user, password, rpin, balance } = createdUserResult;
    const text = `🎉 *SR GATEWAY • ACCOUNT CREDENTIALS*\n\n` +
      `👤 Name: ${user.full_name}\n` +
      `🆔 User ID: ${user.user_custom_id}\n` +
      `📱 Mobile / Login: ${user.mobile}\n` +
      `🔑 Password: ${password}\n` +
      `🔒 Security R-PIN: ${rpin}\n` +
      `💰 Opening Balance: ₹${balance}\n` +
      `🌐 Portal Login: https://sr-gateway-in.up.railway.app/\n\n` +
      `⚠️ *Important Security Advice:*\n` +
      `1. Log in to your account and go to Profile / Security.\n` +
      `2. Connect your Telegram Chat ID via the Telegram OTP Bot to enable two-factor protection on your wallet!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAllCreds(true);
      setTimeout(() => setCopiedAllCreds(false), 2500);
    });
  };

  const handleTestTelegramDispatch = async () => {
    if (!testTelegramChatId.trim()) {
      showAlert('Please enter a valid Telegram Chat ID (e.g. 6624207638).');
      return;
    }
    setIsTestingTelegram(true);
    setTestTelegramResult(null);
    try {
      const res = await fetch('/api/v1/admin/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: testTelegramChatId.trim(),
          bot_token: settingsForm.otp_telegram_bot_token || undefined,
          bot_username: settingsForm.otp_telegram_bot_username || '@SRGatewayBot',
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setTestTelegramResult({
          success: true,
          message: data.message || `Test message successfully delivered to Chat ID ${testTelegramChatId}!`,
        });
      } else {
        setTestTelegramResult({
          success: false,
          message: data.message || 'Telegram Bot rejected dispatch',
          help: data.help,
        });
      }
    } catch (e: any) {
      setTestTelegramResult({
        success: false,
        message: e?.message || 'Network error connecting to backend server',
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

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
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('/api/v1/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailRecipient,
          test_type: testEmailType,
          smtp_host: settingsForm.smtp_host,
          smtp_port: settingsForm.smtp_port,
          smtp_user: settingsForm.smtp_user,
          smtp_pass: settingsForm.smtp_pass,
          smtp_from_name: settingsForm.smtp_from_name,
          smtp_from_email: settingsForm.smtp_from_email,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
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
        message: err.name === 'AbortError' ? 'SMTP Test timed out (server took >6s). Check host/port/app-password.' : (err.message || 'Failed to dispatch test email request.'),
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

  // Metrics (Memoized for high UI responsiveness)
  const totalUsersCount = useMemo(() => allProfiles.filter((p) => p.role !== 'ADMIN').length, [allProfiles]);
  const activeUsersCount = useMemo(() => allProfiles.filter((p) => p.role !== 'ADMIN' && p.status === 'ACTIVE').length, [allProfiles]);
  const bannedUsersCount = useMemo(() => allProfiles.filter((p) => p.role !== 'ADMIN' && p.status === 'BANNED').length, [allProfiles]);

  const totalSystemBalance = useMemo(
    () => (Object.values(allWallets) as Wallet[]).reduce((sum, w) => sum + (w?.available_balance || 0), 0),
    [allWallets]
  );
  const totalLockedBalance = useMemo(
    () => (Object.values(allWallets) as Wallet[]).reduce((sum, w) => sum + (w?.locked_balance || 0), 0),
    [allWallets]
  );

  const pendingDeposits = useMemo(() => deposits.filter((d) => d.status === 'PENDING'), [deposits]);
  const pendingDepositsSum = useMemo(() => pendingDeposits.reduce((sum, d) => sum + d.amount, 0), [pendingDeposits]);

  const pendingWithdrawals = useMemo(() => withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'APPROVED'), [withdrawals]);
  const pendingWithdrawalsSum = useMemo(() => pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0), [pendingWithdrawals]);

  // Filtered Users (Memoized)
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return allProfiles
      .filter((p) => p.role !== 'ADMIN')
      .filter((p) => {
        if (!q) return true;
        return (
          (p.full_name || '').toLowerCase().includes(q) ||
          (p.user_custom_id || '').toLowerCase().includes(q) ||
          (p.mobile || '').toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q) ||
          (p.telegram_id && p.telegram_id.toLowerCase().includes(q))
        );
      });
  }, [allProfiles, userSearch]);

  const handleAdminAddBalance = async () => {
    if (!selectedUserForModal || isAdjustingBalance) return;
    setIsAdjustingBalance(true);
    try {
      const res = await addBalanceByAdmin(selectedUserForModal.id, modalAmount, modalReason || 'Manual Admin Top-up');
      if (res.success) {
        showAlert(res.message);
        setAdminActionModal(null);
        setModalReason('');
        await refreshFromBackend();
      } else {
        showAlert(res.message);
      }
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  const handleAdminCutBalance = async () => {
    if (!selectedUserForModal || isAdjustingBalance) return;
    setIsAdjustingBalance(true);
    try {
      const res = await cutBalanceByAdmin(selectedUserForModal.id, modalAmount, modalReason || 'Manual Admin Adjustment');
      if (res.success) {
        showAlert(res.message);
        setAdminActionModal(null);
        setModalReason('');
        await refreshFromBackend();
      } else {
        showAlert(res.message);
      }
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  const handleAdminUpdateQuota = () => {
    if (!selectedUserForModal) return;
    const res = updateUserRequestLimit(selectedUserForModal.id, userQuotaLimitInput);
    if (res.success) {
      showAlert(res.message);
      setAdminActionModal(null);
    } else {
      showAlert(res.message);
    }
  };

  const handleAdminResetQuotaCount = (targetUser?: UserProfile) => {
    const u = targetUser || selectedUserForModal;
    if (!u) return;
    const res = resetUserDailyRequestCount(u.id);
    if (res.success) {
      showAlert(res.message);
      setAdminActionModal(null);
    } else {
      showAlert(res.message);
    }
  };

  const handleDepositApprove = async (id: string) => {
    const res = await approveDeposit(id);
    showAlert(res.message);
    await refreshFromBackend();
  };

  const handleDepositReject = async () => {
    if (!rejectDepositId) return;
    const res = await rejectDeposit(rejectDepositId, depositRejectReason);
    showAlert(res.message);
    setRejectDepositId(null);
    await refreshFromBackend();
  };

  const handleWithdrawalApprove = async (id: string) => {
    const res = await approveWithdrawal(id);
    showAlert(res.message);
    await refreshFromBackend();
  };

  const handleWithdrawalMarkPaid = async () => {
    if (!markPaidWithdrawalId) return;
    const utr = markPaidUtr.trim() || `BANK-UTR-${Date.now().toString().slice(-8)}`;
    const res = await markWithdrawalPaid(markPaidWithdrawalId, utr);
    showAlert(res.message);
    setMarkPaidWithdrawalId(null);
    setMarkPaidUtr('');
    await refreshFromBackend();
  };

  const handleWithdrawalReject = async () => {
    if (!rejectWithdrawalId) return;
    const res = await rejectWithdrawal(rejectWithdrawalId, withdrawalRejectReason);
    showAlert(res.message);
    setRejectWithdrawalId(null);
    await refreshFromBackend();
  };

  const saveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      updateSettings(settingsForm);
      setIsSettingsDirty(false);

      await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      }).catch(() => null);

      await fetch('/api/v1/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsForm, isAdmin: true }),
      }).catch(() => null);

      showAlert('✅ System settings, QR code & Financial rules updated and saved successfully!');
    } catch (err: any) {
      showAlert('✅ System settings updated in local storage and memory!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAdminQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleSettingChange('admin_qr_url', event.target.result as string);
        showAlert('✅ QR code image loaded from device! Click Save Settings to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save User Credentials (Password, RPIN, Chat ID, Phone, Email)
  const handleSaveUserCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForModal) return;
    setIsSavingCreds(true);
    try {
      const res = await adminUpdateUserCredentials(selectedUserForModal.id, credsForm);
      if (res.success) {
        showAlert(res.message || 'Credentials updated successfully!');
        setAdminActionModal(null);
      } else {
        alert('Failed: ' + res.message);
      }
    } catch (e: any) {
      alert('Error updating credentials: ' + e?.message);
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Handle Export Database (Download .json file)
  const handleExportDatabase = async () => {
    try {
      setIsExportingDb(true);
      const res = await fetch('/api/v1/admin/export-database');
      if (!res.ok) throw new Error('Server error exporting database');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `srgateway_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showAlert('📦 Full Database JSON backup downloaded! Keep this file safe for migration.');
    } catch (e: any) {
      alert('Database export failed: ' + e?.message);
    } finally {
      setIsExportingDb(false);
    }
  };

  // Handle Copy Raw Database JSON to Clipboard
  const handleCopyRawDatabaseJson = async () => {
    try {
      const res = await fetch('/api/v1/admin/export-database');
      if (!res.ok) throw new Error('Failed to fetch database export');
      const data = await res.json();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      copyToClipboard('copied', 'RAW_DB_JSON');
      showAlert('📋 Full Database JSON copied to clipboard! You can paste it into Koyeb or any new server.');
    } catch (e: any) {
      alert('Failed to copy database: ' + e?.message);
    }
  };

  // Handle Restore Full Database from JSON
  const handleRestoreDatabase = async (jsonString: string) => {
    if (!jsonString || jsonString.trim() === '') {
      setImportFeedback({ type: 'error', message: 'Please provide valid JSON content to restore.' });
      return;
    }
    try {
      setIsImportingDb(true);
      setImportFeedback(null);
      const parsed = JSON.parse(jsonString.trim());
      const userCount = Array.isArray(parsed.users) ? parsed.users.length : 0;
      const walletCount = parsed.wallets ? Object.keys(parsed.wallets).length : 0;

      const confirmed = window.confirm(
        `Are you sure you want to restore this database backup?\n\n` +
        `• Users to load: ${userCount}\n` +
        `• Wallets: ${walletCount}\n` +
        `• Settings, Transactions & Ledgers included\n\n` +
        `This will instantly sync with the server disk (/data/srgateway_database.json) and update all balances!`
      );

      if (!confirmed) {
        setIsImportingDb(false);
        return;
      }

      const res = await restoreFullDatabase(parsed);
      if (res.success) {
        setImportFeedback({ type: 'success', message: res.message || `Loaded ${userCount} users & wallets successfully!` });
        showAlert(`✅ Database Restored! ${userCount} users & all balances synced!`);
        setImportJsonText('');
      } else {
        setImportFeedback({ type: 'error', message: res.message || 'Database restore failed on server.' });
      }
    } catch (e: any) {
      setImportFeedback({ type: 'error', message: 'Invalid JSON format: ' + e?.message });
    } finally {
      setIsImportingDb(false);
    }
  };

  // Handle file picker selection for database restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        handleRestoreDatabase(content);
      }
    };
    reader.readAsText(file);
  };

  // If not authenticated with Security Password, render dedicated Gatekeeper Screen
  if (!isPassAuthed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className={`bg-slate-900 border ${isMasterOwner ? 'border-amber-500/40' : 'border-indigo-500/40'} rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 text-center text-white relative`}>
          <div className={`w-16 h-16 rounded-3xl ${isMasterOwner ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'} border flex items-center justify-center mx-auto shadow-lg`}>
            {isMasterOwner ? <Crown className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {isMasterOwner ? '👑 Master Owner Security Gate' : '🛡️ SR Gateway Admin Security Gate'}
            </h3>
            <p className="text-xs text-slate-400">
              {isMasterOwner
                ? 'Enter the Master Owner Security Password to unlock full configuration, sub-admin management & gateway security.'
                : 'Enter your authorized Administrator Password to access the Admin Control Panel.'}
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
                {isMasterOwner ? 'Master Owner Password' : 'Admin Login Password'}
              </label>
              <input
                type="password"
                placeholder={isMasterOwner ? 'Enter master owner password...' : 'Enter admin password...'}
                value={adminPassInput}
                onChange={(e) => {
                  setAdminPassInput(e.target.value);
                  setPassError(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 ${
                isMasterOwner
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950'
                  : 'bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white'
              } font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl active:scale-95 flex items-center justify-center gap-2`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isMasterOwner ? 'Unlock Owner Panel 👑' : 'Unlock Admin Panel ⚡'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            {isMasterOwner ? 'Master Access Protocol (SR-OWNER-01)' : 'Gateway Administration Protocol (SR-ADMIN)'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Admin Top Header Banner */}
      <div
        className={`rounded-[2rem] border p-6 sm:p-8 shadow-2xl ${
          isMasterOwner
            ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/40 border-amber-500/30'
            : 'bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-900 border-indigo-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`p-1.5 rounded-xl border ${
                  isMasterOwner
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {isMasterOwner ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isMasterOwner ? 'text-amber-300' : 'text-indigo-300'
                }`}
              >
                {isMasterOwner ? 'SR GATEWAY MASTER OWNER CONTROL PANEL' : 'SR GATEWAY ADMIN CONTROL PANEL'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {isMasterOwner ? 'Master Owner Dashboard & Gateway Governance' : 'Admin Control & Operations Center'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isMasterOwner
                ? 'Supreme control • Sub-Admin & staff operations desk • Gateway charges & UPI safety • Master ledger audit trail.'
                : 'Account administration • Verification queue • Financial security rules & transaction audit ledger.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                isMasterOwner
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isMasterOwner ? 'bg-amber-400' : 'bg-indigo-400'} animate-pulse`} />
              <span>{isMasterOwner ? '👑 Master Owner Active' : '🛡️ Admin Session Active'}</span>
            </span>
            <button
              onClick={handleAdminLock}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold font-mono transition flex items-center gap-1.5"
              title="Lock Admin Session"
            >
              <Lock className="h-3 w-3 text-rose-400" />
              <span>Lock Panel</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800/80">
          {[
            { id: 'DASHBOARD', label: 'Overview', icon: ShieldCheck },
            { id: 'USERS', label: `Users (${totalUsersCount})`, icon: Users },
            ...(isMasterOwner ? [{ id: 'SUB_ADMINS', label: `Manage Sub-Admins (${subAdminList.length})`, icon: UserCog, badge: subAdminList.length }] : []),
            { id: 'DEPOSITS', label: `Deposits (${pendingDeposits.length})`, icon: PlusCircle, badge: pendingDeposits.length },
            { id: 'WITHDRAWALS', label: `Withdrawals (${pendingWithdrawals.length})`, icon: ArrowUpRight, badge: pendingWithdrawals.length },
            { id: 'TRANSACTIONS', label: 'Global Transactions (Master Ledger)', icon: FileText },
            { id: 'SETTINGS', label: isSubAdmin ? 'Gateway Configuration & UPI Parameters' : 'Gateway Charges & Controls', icon: Settings },
            ...(isMasterOwner ? [{ id: 'BACKUP', label: 'Backup & Restore', icon: Database }] : []),
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
                    ? isMasterOwner
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-lg shadow-indigo-600/20'
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

      {/* Sticky Maintenance Mode Warning Banner */}
      {settingsForm.maintenance_mode_enabled && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-2 border-amber-500/60 text-amber-200 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/30 text-amber-300 shrink-0 animate-pulse">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>⚠️ MAINTENANCE MODE IS ACTIVE (मेन्टेनेंस मोड चालू है)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 font-mono font-bold border border-red-500/40 animate-pulse">
                  USER ACCESS BLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                The User Panel is locked. Normal users see the maintenance screen with your custom message and Telegram channel link.
              </p>
            </div>
          </div>
          {isMasterOwner ? (
            <button
              type="button"
              onClick={() => toggleMaintenanceMode(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition shrink-0 shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Turn OFF Maintenance Mode</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-950/60 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Owner Access Only (Sub-Admin Cannot Change)</span>
            </div>
          )}
        </div>
      )}

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
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6">
          {actionAlertMsg && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                actionAlertMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{actionAlertMsg.text}</span>
              <button
                onClick={() => setActionAlertMsg(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Master Admin Danger Controls Bar (Master Owner Only) */}
          {isMasterOwner && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">System Maintenance & Global Reset Controls</h4>
                  <p className="text-[11px] text-slate-400">
                    Execute master actions across all registered user accounts with one click
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: Reset All Balances */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-400" />
                      <span className="font-extrabold text-xs text-amber-300">Clear All User Balances</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Instantly sets every user's available and locked balance to <strong className="text-amber-300">₹0.00</strong>. Master Admin balance remains protected.
                    </p>
                  </div>
                  <button
                    id="admin-reset-all-balances-btn"
                    onClick={() => {
                      setResetConfirmText('');
                      setIsResetBalancesModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear All User Balance (0 RS)</span>
                  </button>
                </div>

                {/* Button 2: Wipe All User Data */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span className="font-extrabold text-xs text-rose-300">Wipe All Registered Users</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Permanently deletes all registered user profiles and records. <strong className="text-rose-300">Users can then re-register</strong> with the same mobile, email, or chat ID.
                    </p>
                  </div>
                  <button
                    id="admin-wipe-all-users-btn"
                    onClick={() => {
                      setWipeConfirmText('');
                      setIsWipeUsersModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Factory Wipe All User Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="text-lg font-black text-white">Registered Users Directory</h3>
              <p className="text-xs text-slate-400">
                {isMasterOwner
                  ? `Total Registered: ${allProfiles.filter(p => p.role !== 'ADMIN').length} Users • Add balance, cut balance, or manage accounts`
                  : `Total Registered: ${allProfiles.filter(p => p.role !== 'ADMIN').length} Users • View user details, ban or unban accounts (Owner authority required for balance/quota changes)`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isMasterOwner && (
                <button
                  type="button"
                  id="admin-open-add-user-modal-btn"
                  onClick={() => {
                    setNewUserName('');
                    setNewUserMobile('');
                    setNewUserEmail('');
                    setNewUserPassword('123456');
                    setNewUserRpin('7477');
                    setNewUserBalance('0');
                    setNewUserChatId('');
                    setAddUserError(null);
                    setCreatedUserResult(null);
                    setIsAddUserModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Add / Create User</span>
                </button>
              )}

              <div className="relative sm:w-72">
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
          </div>

          <div className="divide-y divide-slate-800 font-mono text-xs">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No matching user accounts found.</p>
            ) : (
              filteredUsers.map((user) => {
                const cleanMobile = user.mobile ? user.mobile.replace(/[^0-9]/g, '') : '';
                const wallet =
                  allWallets[user.id] ||
                  allWallets[user.user_custom_id] ||
                  (user.mobile && allWallets[user.mobile]) ||
                  (cleanMobile && allWallets[cleanMobile]) ||
                  { available_balance: 0, locked_balance: 0 };
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
                        {user.is_demo && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            DEMO (NO TRANSACTIONS)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mobile: {user.mobile} • Email: {user.email} {user.telegram_id ? `• TG: ${user.telegram_id}` : ''}
                      </div>

                      {/* User Account Credentials Strip (Password, R-PIN, Chat ID) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                        {/* 1. Password with toggle & copy */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Pass:</span>
                            <span className="font-mono font-bold text-amber-300 truncate">
                              {showUserPasswords[user.id] ? (user.password || (user.role === 'ADMIN' ? 'admin' : '123456')) : '••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(user.id)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                              title={showUserPasswords[user.id] ? "Hide Password" : "Show Password"}
                            >
                              {showUserPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(user.password || (user.role === 'ADMIN' ? 'admin' : '123456'), `pwd-${user.id}`)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                              title="Copy Password"
                            >
                              {copiedField === `pwd-${user.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        {/* 2. Security 4-Digit R-PIN */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <Key className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="text-slate-400 text-[10px] uppercase font-bold">R-PIN:</span>
                            <span className="font-mono font-black text-emerald-300 tracking-wider">
                              {user.rpin || '1234'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(user.rpin || '1234', `rpin-${user.id}`)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded shrink-0"
                            title="Copy 4-Digit RPIN"
                          >
                            {copiedField === `rpin-${user.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>

                        {/* 3. Connected Telegram Chat ID */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <Bot className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Chat ID:</span>
                            <span className="font-mono font-bold text-cyan-300 truncate">
                              {user.telegram_chat_id || (user.telegram_id ? user.telegram_id : 'Not Linked')}
                            </span>
                          </div>
                          {(user.telegram_chat_id || user.telegram_id) && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(user.telegram_chat_id || user.telegram_id || '', `tg-${user.id}`)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded shrink-0"
                              title="Copy Telegram ID"
                            >
                              {copiedField === `tg-${user.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Daily HTTPS API Request Quota Indicator */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Gauge className="h-3 w-3 text-indigo-400" />
                          <span>Daily HTTPS Quota:</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                          {user.daily_api_requests_count || 0}/{user.daily_api_requests_limit || 10} Requests Used Today
                        </span>
                        {(user.daily_api_requests_count || 0) >= (user.daily_api_requests_limit || 10) ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                            ⏳ 24h Auto-Unlock Active (Account Safe & Active)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            ⚡ {Math.max(0, (user.daily_api_requests_limit || 10) - (user.daily_api_requests_count || 0))} Requests Remaining
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="text-sm font-black text-emerald-400">{formatINR(wallet.available_balance)}</div>
                        {wallet.locked_balance > 0 && (
                          <div className="text-[10px] text-amber-300">Locked: {formatINR(wallet.locked_balance)}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                        {isMasterOwner && (
                          <>
                            {/* Edit User Credentials */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForModal(user);
                                setCredsForm({
                                  full_name: user.full_name || '',
                                  password: user.password || '',
                                  rpin: user.rpin || '1234',
                                  telegram_chat_id: user.telegram_chat_id || '',
                                  telegram_id: user.telegram_id || '',
                                  mobile: user.mobile || '',
                                  email: user.email || '',
                                  status: user.status,
                                });
                                setAdminActionModal('EDIT_CREDS');
                              }}
                              className="px-2.5 py-1.5 bg-violet-600/30 hover:bg-violet-600/60 text-violet-200 border border-violet-500/40 font-bold rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md cursor-pointer"
                              title="View & Edit User Password, R-PIN & Telegram Chat ID"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Credentials</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUserForModal(user);
                                setAdminActionModal('ADD_BAL');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUserForModal(user);
                                setAdminActionModal('CUT_BAL');
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                              <span>Cut</span>
                            </button>

                            {/* Set Daily HTTPS Request Limit */}
                            <button
                              onClick={() => {
                                setSelectedUserForModal(user);
                                setUserQuotaLimitInput(user.daily_api_requests_limit || 10);
                                setAdminActionModal('SET_LIMIT');
                              }}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition active:scale-95 shadow-md cursor-pointer"
                              title="Change Daily HTTPS Request Limit"
                            >
                              <Gauge className="h-3.5 w-3.5" />
                              <span>Limit ({user.daily_api_requests_limit || 10})</span>
                            </button>

                            {/* Instant Quota Reset / Unlock */}
                            <button
                              onClick={() => handleAdminResetQuotaCount(user)}
                              className="px-2 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                              title="Reset Today's Request Counter to 0 (Instant Unlock)"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset</span>
                            </button>
                          </>
                        )}

                        {/* Ban / Unban User Account (Sub-Admin & Owner both have access) */}
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => banUser(user.id, `${isSubAdmin ? 'Sub-Admin Staff' : 'Master Owner'} manual account restriction`)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl transition border border-rose-500/30 cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
                            title="Ban / Suspend User Account"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>Ban User</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-xl transition border border-emerald-500/30 cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
                            title="Unban / Restore User Account"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Unban User</span>
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
                    isMasterOwner ? (
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => {
                            setRejectDepositId(dep.id);
                          }}
                          className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDepositApprove(dep.id)}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                          Approve & Credit Wallet ⚡
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-semibold justify-end mt-2">
                        <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Master Owner Approval Only (Sub-Admin Read-Only Verification Mode)</span>
                      </div>
                    )
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
                    isMasterOwner ? (
                      <div className="flex flex-wrap gap-2 justify-end pt-2">
                        <button
                          onClick={() => setRejectWithdrawalId(wd.id)}
                          className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>

                        {wd.status === 'PENDING' && (
                          <button
                            onClick={() => handleWithdrawalApprove(wd.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition shadow-md cursor-pointer"
                          >
                            Authorize Payout
                          </button>
                        )}

                        <button
                          onClick={() => setMarkPaidWithdrawalId(wd.id)}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                          Mark Paid (Enter UTR) 💸
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-semibold justify-end mt-2">
                        <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Master Owner Payout Authorization Required (Sub-Admin Read-Only Mode)</span>
                      </div>
                    )
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

      {/* TAB 5: MASTER TRANSACTIONS LEDGER (TNX ID PAIRING & SENDER-RECEIVER AUDIT) */}
      {activeAdminTab === 'TRANSACTIONS' && (() => {
        const filteredMasterTransactions = transactions.filter((tx) => {
          // Type filter
          if (ledgerTypeFilter === 'TRANSFER') {
            if (tx.type !== 'TRANSFER_OUT' && tx.type !== 'TRANSFER_IN') return false;
          } else if (ledgerTypeFilter === 'DEPOSIT') {
            if (tx.type !== 'DEPOSIT') return false;
          } else if (ledgerTypeFilter === 'WITHDRAWAL') {
            if (tx.type !== 'WITHDRAWAL') return false;
          } else if (ledgerTypeFilter === 'ADMIN') {
            if (tx.type !== 'ADMIN_ADJUSTMENT' && tx.type !== 'BONUS' && tx.type !== 'COMMISSION') return false;
          }

          // Search query filter
          if (!ledgerSearchQuery.trim()) return true;
          const q = ledgerSearchQuery.trim().toLowerCase();

          const txnId = (tx.reference_id || tx.id || '').toLowerCase();
          const rawId = (tx.id || '').toLowerCase();
          const userName = (tx.user_name || '').toLowerCase();
          const userCustomId = (tx.user_custom_id || '').toLowerCase();
          const senderName = (tx.sender_name || '').toLowerCase();
          const senderMobile = (tx.sender_mobile || '').toLowerCase();
          const receiverName = (tx.receiver_name || '').toLowerCase();
          const receiverMobile = (tx.receiver_mobile || '').toLowerCase();
          const counterpartyName = (tx.counterparty_name || '').toLowerCase();
          const counterpartyMobile = (tx.counterparty_mobile || '').toLowerCase();
          const desc = (tx.description || '').toLowerCase();

          return (
            txnId.includes(q) ||
            rawId.includes(q) ||
            userName.includes(q) ||
            userCustomId.includes(q) ||
            senderName.includes(q) ||
            senderMobile.includes(q) ||
            receiverName.includes(q) ||
            receiverMobile.includes(q) ||
            counterpartyName.includes(q) ||
            counterpartyMobile.includes(q) ||
            desc.includes(q)
          );
        });

        const totalFilteredVolume = filteredMasterTransactions.reduce((acc, t) => acc + (t.amount || t.net_amount || 0), 0);

        const copyTxnId = (idText: string) => {
          navigator.clipboard.writeText(idText);
          setCopiedLedgerId(idText);
          setTimeout(() => setCopiedLedgerId(null), 2500);
        };

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header & Overview Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      Master Financial Ledger (मास्टर लेजर)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      System-wide live transactions with unified TNX ID 🪪, Sender & Receiver counterparty tracking
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Total Logs: </span>
                  <span className="font-bold text-white">{transactions.length}</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Showing: </span>
                  <span className="font-bold text-sky-400">{filteredMasterTransactions.length}</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono">
                  <span className="text-emerald-400">Volume: </span>
                  <span className="font-black text-emerald-300">{formatINR(totalFilteredVolume)}</span>
                </div>
              </div>
            </div>

            {/* Search Bar & Filter Tabs */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    placeholder="Search by TNX ID 🪪 (e.g. SR-50963 or SR-XXXXX), Sender / Receiver Name, Mobile No, or Note..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {ledgerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLedgerSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer text-xs font-mono"
                    >
                      Clear ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'TRANSFER', label: 'P2P Transfers' },
                    { id: 'DEPOSIT', label: 'Deposits' },
                    { id: 'WITHDRAWAL', label: 'Withdrawals' },
                    { id: 'ADMIN', label: 'Admin / Bonus' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLedgerTypeFilter(f.id as any)}
                      className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap cursor-pointer text-xs font-bold ${
                        ledgerTypeFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Search Highlight Bar */}
              {ledgerSearchQuery && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-center justify-between text-xs font-mono text-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-300">🔍 Filtering TNX ID / Keyword:</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-100 font-bold border border-indigo-500/30">
                      {ledgerSearchQuery}
                    </span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      (Both Sender & Receiver transactions for this TNX ID appear together below)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLedgerSearchQuery('')}
                    className="text-xs text-indigo-400 hover:text-white font-bold hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Master Ledger Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                    <th className="py-3 px-3">Date & Time 📅</th>
                    <th className="py-3 px-3">TNX ID 🪪</th>
                    <th className="py-3 px-3">Flow & Type</th>
                    <th className="py-3 px-3">Sender Details (भेजने वाला)</th>
                    <th className="py-3 px-3">Receiver Details (पाने वाला)</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Wallet Flow</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Note / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono">
                  {filteredMasterTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-slate-600" />
                          <p className="text-sm font-bold text-slate-300">No transactions match your search</p>
                          <p className="text-xs text-slate-500">
                            Try searching for a different TNX ID, user mobile number, or clear filters.
                          </p>
                          {ledgerSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setLedgerSearchQuery('')}
                              className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                            >
                              Clear Search Filter
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMasterTransactions.map((tx) => {
                      // Determine the shared TNX ID
                      const displayTxnId = tx.reference_id || tx.id;
                      const isTransfer = tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN';

                      // Sender Metadata Resolution
                      const senderName =
                        tx.sender_name ||
                        (tx.type === 'TRANSFER_OUT'
                          ? tx.user_name
                          : tx.type === 'TRANSFER_IN'
                          ? (tx.counterparty_name || 'Sender Account')
                          : (tx.user_name || 'System'));

                      const senderIdentifier =
                        tx.sender_mobile ||
                        (tx.type === 'TRANSFER_OUT'
                          ? (tx.user_custom_id || tx.user_id)
                          : tx.type === 'TRANSFER_IN'
                          ? (tx.counterparty_mobile || tx.counterparty_id || '—')
                          : (tx.user_custom_id || 'SR Gateway Gateway'));

                      // Receiver Metadata Resolution
                      const receiverName =
                        tx.receiver_name ||
                        (tx.type === 'TRANSFER_IN'
                          ? tx.user_name
                          : tx.type === 'TRANSFER_OUT'
                          ? (tx.counterparty_name || 'Recipient Account')
                          : (tx.user_name || 'System'));

                      const receiverIdentifier =
                        tx.receiver_mobile ||
                        (tx.type === 'TRANSFER_IN'
                          ? (tx.user_custom_id || tx.user_id)
                          : tx.type === 'TRANSFER_OUT'
                          ? (tx.counterparty_mobile || tx.counterparty_id || '—')
                          : (tx.user_custom_id || 'Bank / Wallet'));

                      return (
                        <tr key={tx.id} className="hover:bg-slate-850/60 transition group">
                          {/* 1. Date & Time */}
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                            <div className="font-bold text-white text-[11px]">
                              {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(tx.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                              })}
                            </div>
                          </td>

                          {/* 2. TNX ID (With Search Pair Trigger) */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                title="Click to filter ledger by this exact TNX ID (shows both Sender & Receiver together)"
                                onClick={() => setLedgerSearchQuery(displayTxnId)}
                                className="font-mono text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                              >
                                {displayTxnId}
                              </button>
                              <button
                                type="button"
                                title="Copy TNX ID"
                                onClick={() => copyTxnId(displayTxnId)}
                                className="p-1 text-slate-500 hover:text-slate-200 transition cursor-pointer"
                              >
                                {copiedLedgerId === displayTxnId ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            {tx.id !== displayTxnId && (
                              <span className="text-[9px] text-slate-600 block mt-0.5">
                                Ref: {tx.id}
                              </span>
                            )}
                          </td>

                          {/* 3. Flow & Type */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {tx.type === 'TRANSFER_OUT' ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                <span>🔴 DEBIT / SENT</span>
                              </span>
                            ) : tx.type === 'TRANSFER_IN' ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>🟢 CREDIT / RECV</span>
                              </span>
                            ) : tx.type === 'DEPOSIT' ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 w-fit">
                                <span>🔵 DEPOSIT</span>
                              </span>
                            ) : tx.type === 'WITHDRAWAL' ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit">
                                <span>🟠 WITHDRAW</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 w-fit">
                                {tx.type}
                              </span>
                            )}
                          </td>

                          {/* 4. Sender Details */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-white font-sans text-xs flex items-center gap-1.5">
                              <span>{senderName}</span>
                              {tx.type === 'TRANSFER_OUT' && (
                                <span className="text-[9px] text-red-400 bg-red-500/10 px-1 rounded font-mono">
                                  Sender
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="text-slate-500">A/C:</span>
                              <button
                                type="button"
                                onClick={() => setLedgerSearchQuery(senderIdentifier)}
                                className="hover:text-sky-400 hover:underline cursor-pointer"
                                title="Filter by Sender"
                              >
                                {senderIdentifier}
                              </button>
                            </div>
                          </td>

                          {/* 5. Receiver Details */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-white font-sans text-xs flex items-center gap-1.5">
                              <span>{receiverName}</span>
                              {tx.type === 'TRANSFER_IN' && (
                                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded font-mono">
                                  Receiver
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="text-slate-500">A/C:</span>
                              <button
                                type="button"
                                onClick={() => setLedgerSearchQuery(receiverIdentifier)}
                                className="hover:text-emerald-400 hover:underline cursor-pointer"
                                title="Filter by Receiver"
                              >
                                {receiverIdentifier}
                              </button>
                            </div>
                          </td>

                          {/* 6. Amount */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <span
                              className={`font-black text-sm ${
                                tx.type === 'TRANSFER_OUT' || tx.type === 'WITHDRAWAL'
                                  ? 'text-red-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {tx.type === 'TRANSFER_OUT' || tx.type === 'WITHDRAWAL' ? '-' : '+'}
                              {formatINR(tx.amount || tx.net_amount)}
                            </span>
                          </td>

                          {/* 7. Wallet Flow */}
                          <td className="py-3 px-3 text-right whitespace-nowrap text-[10px]">
                            {tx.balance_before !== undefined && tx.balance_after !== undefined ? (
                              <div>
                                <span className="text-slate-500">₹{tx.balance_before.toFixed(2)}</span>
                                <span className="text-slate-400 mx-1">➔</span>
                                <span className="font-bold text-slate-200">₹{tx.balance_after.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* 8. Status */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                tx.status === 'SUCCESS'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : tx.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>

                          {/* 9. Description / Note */}
                          <td className="py-3 px-3 font-sans text-slate-300 text-xs max-w-xs truncate" title={tx.description}>
                            {tx.description}
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
      })()}

      {/* TAB: SUB-ADMIN & STAFF MANAGEMENT (OWNER ONLY) */}
      {activeAdminTab === 'SUB_ADMINS' && isMasterOwner && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/30 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                  <UserCog className="h-3.5 w-3.5" />
                  <span>Sub-Admin & Staff Operator Hub</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Staff Sub-Admins Management & Security Controls
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Manage subordinate administrative accounts, reset passwords & 4-digit R-PINs, toggle instant account bans, and audit staff activities. Sub-admins can verify transactions and assist users without accessing gateway banking credentials.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAddSubAdminError(null);
                    setIsAddSubAdminModalOpen(true);
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create New Sub-Admin ⚡</span>
                </button>
              </div>
            </div>

            {/* Metric Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-500/20">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Total Staff Sub-Admins</div>
                <div className="text-2xl font-black text-white mt-1">{subAdminList.length}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold">Active Operators</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  {subAdminList.filter((a) => a.status !== 'BANNED').length}
                </div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-mono text-rose-400 uppercase font-bold">Banned Accounts</div>
                <div className="text-2xl font-black text-rose-300 mt-1">
                  {subAdminList.filter((a) => a.status === 'BANNED').length}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Admins Table Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <span>Authorized Sub-Admin Operators List</span>
              </h4>
              <button
                type="button"
                onClick={fetchSubAdmins}
                disabled={isLoadingSubAdmins}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSubAdmins ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {subAdminList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                No Sub-Admin operators found. Click &quot;Create New Sub-Admin&quot; to add staff.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-3">Operator ID / Name</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Staff Password</th>
                      <th className="py-3 px-3">Security R-PIN</th>
                      <th className="py-3 px-3">Telegram Alerts</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {subAdminList.map((admin) => {
                      const isPwdVisible = showAdminPasswords[admin.id];
                      const isPinVisible = showAdminRpins[admin.id];
                      const isBanned = admin.status === 'BANNED';

                      return (
                        <tr key={admin.id} className="hover:bg-slate-800/40 transition">
                          {/* 1. ID & Name */}
                          <td className="py-3 px-3">
                            <div className="font-black text-white text-sm">{admin.full_name}</div>
                            <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                              <span>{admin.user_custom_id || admin.id}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(admin.user_custom_id || admin.id, `ID-${admin.id}`)}
                                title="Copy Admin ID"
                                className="text-slate-400 hover:text-white"
                              >
                                {copiedField === `ID-${admin.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 2. Contact */}
                          <td className="py-3 px-3 space-y-0.5">
                            <div className="text-slate-200">{admin.mobile}</div>
                            <div className="text-[10px] text-slate-400">{admin.email}</div>
                          </td>

                          {/* 3. Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                                isBanned
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                              <span>{isBanned ? 'BANNED 🚫' : 'ACTIVE 🟢'}</span>
                            </span>
                          </td>

                          {/* 4. Password */}
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                              <span className="font-mono text-slate-300">
                                {isPwdVisible ? admin.password || 'Staff@123' : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAdminPasswords((prev) => ({ ...prev, [admin.id]: !prev[admin.id] }))
                                }
                                className="text-slate-400 hover:text-white"
                                title={isPwdVisible ? 'Hide' : 'Show'}
                              >
                                {isPwdVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(admin.password || 'Staff@123', `PWD-${admin.id}`)}
                                className="text-slate-400 hover:text-white"
                                title="Copy Password"
                              >
                                {copiedField === `PWD-${admin.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 5. R-PIN */}
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                              <span className="font-mono text-amber-300 font-bold">
                                {isPinVisible ? admin.rpin || '1234' : '••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAdminRpins((prev) => ({ ...prev, [admin.id]: !prev[admin.id] }))}
                                className="text-slate-400 hover:text-white"
                                title={isPinVisible ? 'Hide' : 'Show'}
                              >
                                {isPinVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(admin.rpin || '1234', `PIN-${admin.id}`)}
                                className="text-slate-400 hover:text-white"
                                title="Copy PIN"
                              >
                                {copiedField === `PIN-${admin.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 6. Telegram Alert */}
                          <td className="py-3 px-3 text-[11px] text-slate-300">
                            {admin.telegram_chat_id ? (
                              <span className="text-emerald-400">ID: {admin.telegram_chat_id}</span>
                            ) : admin.telegram_id ? (
                              <span className="text-indigo-300">{admin.telegram_id}</span>
                            ) : (
                              <span className="text-slate-500">Not configured</span>
                            )}
                          </td>

                          {/* 7. Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Modal Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditSubAdmin(admin)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                title="Edit Password & Credentials"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              {/* Toggle Ban Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSubAdminBan(admin)}
                                className={`p-1.5 rounded-lg transition ${
                                  isBanned
                                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                                }`}
                                title={isBanned ? 'Unban Sub-Admin' : 'Ban Sub-Admin'}
                              >
                                {isBanned ? <UserCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                              </button>

                              {/* Delete Admin Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSubAdmin(admin)}
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition"
                                title="Remove Sub-Admin"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Live Sub-Admin Staff Activity Log & Tracker for Owner */}
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Sub-Admin Live Activity Tracker (सब-एडमिन लाइव कार्य ट्रैकर)</h4>
                    <p className="text-xs text-slate-400">All actions performed by Sub-Admin staff appear here instantly for Owner oversight</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 border border-slate-800 text-amber-300 rounded-full w-fit">
                  {auditLogs.filter((l) => l.admin_id !== 'owner-001' && l.admin_id !== 'SR-OWNER-01').length} Sub-Admin Actions Logged
                </span>
              </div>

              {auditLogs.filter((l) => l.admin_id !== 'owner-001' && l.admin_id !== 'SR-OWNER-01').length === 0 ? (
                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs font-mono">
                  No Sub-Admin staff actions recorded yet. When a Sub-Admin bans, unbans, or updates any account, it will appear here in real time.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Sub-Admin Staff</th>
                        <th className="py-3 px-3">Action Type</th>
                        <th className="py-3 px-3">Target User</th>
                        <th className="py-3 px-3">Reason / Details</th>
                        <th className="py-3 px-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditLogs
                        .filter((l) => l.admin_id !== 'owner-001' && l.admin_id !== 'SR-OWNER-01')
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white text-xs">{log.admin_name || 'Staff Sub-Admin'}</div>
                              <div className="text-[10px] text-amber-400">{log.admin_id}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.action === 'USER_BANNED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                log.action === 'USER_UNBANNED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="text-white font-bold">{log.target_user_name || 'N/A'}</div>
                              <div className="text-[10px] text-slate-400">{log.target_user_id || '-'}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                              {log.reason}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modal: Add New Sub-Admin */}
          {isAddSubAdminModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <UserCog className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white">Create New Sub-Admin Operator</h4>
                      <p className="text-xs text-slate-400">Add subordinate staff with custom password and 4-digit R-PIN</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddSubAdminModalOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {addSubAdminError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono">
                    {addSubAdminError}
                  </div>
                )}

                <form onSubmit={handleCreateSubAdmin} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Arun Support Staff"
                      value={newAdminFullName}
                      onChange={(e) => setNewAdminFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        placeholder="10-digit mobile"
                        value={newAdminMobile}
                        onChange={(e) => setNewAdminMobile(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="staff@srgateway.in"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Staff Password</label>
                      <input
                        type="text"
                        placeholder="Staff@123"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Staff 4-Digit R-PIN</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={newAdminRpin}
                        onChange={(e) => setNewAdminRpin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-amber-300 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Telegram Chat ID (Optional for alerts)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5629192931"
                      value={newAdminTelegramChatId}
                      onChange={(e) => setNewAdminTelegramChatId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddSubAdminModalOpen(false)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdmin}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl font-black transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmittingAdmin ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                      <span>{isSubmittingAdmin ? 'Creating...' : 'Create Sub-Admin ⚡'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Sub-Admin Credentials */}
          {selectedAdminForEdit && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Edit3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white">
                        Edit Credentials: {selectedAdminForEdit.full_name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{selectedAdminForEdit.user_custom_id}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAdminForEdit(null)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveSubAdminEdit} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editAdminForm.full_name}
                      onChange={(e) => setEditAdminForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Mobile</label>
                      <input
                        type="text"
                        value={editAdminForm.mobile}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, mobile: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Email</label>
                      <input
                        type="email"
                        value={editAdminForm.email}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-amber-300 font-bold mb-1">Change Password 🔑</label>
                      <input
                        type="text"
                        value={editAdminForm.password}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-300 font-bold mb-1">Change R-PIN (4-Digit) 🔐</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={editAdminForm.rpin}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, rpin: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-amber-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Account Status</label>
                      <select
                        value={editAdminForm.status}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                      >
                        <option value="ACTIVE">ACTIVE 🟢</option>
                        <option value="BANNED">BANNED 🚫</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Telegram Chat ID</label>
                      <input
                        type="text"
                        value={editAdminForm.telegram_chat_id}
                        onChange={(e) => setEditAdminForm((prev) => ({ ...prev, telegram_chat_id: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminForEdit(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAdminEdit}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSavingAdminEdit ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>{isSavingAdminEdit ? 'Saving...' : 'Save Credentials 💾'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: EXTRA CONTROLS & SYSTEM SETTINGS */}
      {activeAdminTab === 'SETTINGS' && (
        <form onSubmit={saveSystemSettings} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                <span>{isSubAdmin ? 'Gateway Charges & UPI Parameters (Fixed View)' : 'System Extra Controls & Financial Rules'}</span>
              </h3>
              {isSettingsDirty && !isSubAdmin && (
                <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                  <span>⚠️ Unsaved Changes — Click Save to apply</span>
                </div>
              )}
            </div>

            {/* SUB-ADMIN FIXED NOTICE BANNER */}
            {isSubAdmin && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 text-amber-200 shadow-xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>🔒 FIXED GATEWAY CHARGES &amp; BANKING PARAMETERS (फिक्स्ड गेटवे चार्ज)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                      LOCKED BY OWNER
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                    All UPI gateway IDs, bank account details, deposit fee %, withdrawal charge %, and transaction limits are fixed by Master Owner (SR-OWNER-01). Sub-Admin personnel have read-only visibility for transaction tracking, but cannot alter or override them.
                  </p>
                </div>
              </div>
            )}

            {/* MAINTENANCE MODE CONTROLS (USER PANEL LOCK) */}
            <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
              settingsForm.maintenance_mode_enabled
                ? 'bg-amber-950/30 border-amber-500/60 shadow-xl shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    settingsForm.maintenance_mode_enabled
                      ? 'bg-amber-500/30 text-amber-300 animate-pulse'
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>Maintenance Mode (मेन्टेनेंस मोड)</span>
                      {settingsForm.maintenance_mode_enabled ? (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold animate-pulse">
                          🔴 LIVE LOCK ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          🟢 NORMAL ACTIVE
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      When turned ON, all user dashboard, deposits, withdrawals and transfers are completely locked with the Maintenance Screen.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => toggleMaintenanceMode(!settingsForm.maintenance_mode_enabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition shadow-lg flex items-center gap-2 ${
                      settingsForm.maintenance_mode_enabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>
                      {settingsForm.maintenance_mode_enabled
                        ? 'Disable Maintenance Mode'
                        : 'Enable Maintenance Mode'}
                    </span>
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settingsForm.maintenance_mode_enabled)}
                      onChange={(e) => handleSettingChange('maintenance_mode_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Maintenance Screen Content Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Maintenance Screen Title (शीर्षक)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.maintenance_mode_title || ''}
                    onChange={(e) => handleSettingChange('maintenance_mode_title', e.target.value)}
                    placeholder="⚡ SYSTEM UNDER SCHEDULED UPGRADE"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Estimated Time (अनुमानित समय)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.maintenance_estimated_time || ''}
                    onChange={(e) => handleSettingChange('maintenance_estimated_time', e.target.value)}
                    placeholder="15-30 Minutes"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Official Telegram Channel Link (लाइव अपडेट लिंक)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.maintenance_channel_url || settingsForm.telegram_channel_url || ''}
                    onChange={(e) => handleSettingChange('maintenance_channel_url', e.target.value)}
                    placeholder="https://t.me/SRTECHNOLOGYLTD1"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Maintenance Message for Users (उपयोगकर्ता संदेश)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.maintenance_mode_message || ''}
                    onChange={(e) => handleSettingChange('maintenance_mode_message', e.target.value)}
                    placeholder="Our engineers are currently upgrading SR Gateway payment nodes and core servers to deliver ultra-fast UPI processing and 100% uptime. Services will resume shortly."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-sans text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

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
                  onChange={(e) => handleSettingChange('deposit_enabled', e.target.checked)}
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
                  onChange={(e) => handleSettingChange('withdraw_enabled', e.target.checked)}
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
                  onChange={(e) => handleSettingChange('minimum_deposit', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Minimum Withdraw (₹)</label>
                <input
                  type="number"
                  value={settingsForm.minimum_withdraw}
                  onChange={(e) => handleSettingChange('minimum_withdraw', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deposit Charge (%)</label>
                <input
                  type="number"
                  value={settingsForm.deposit_charge_percent}
                  onChange={(e) => handleSettingChange('deposit_charge_percent', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Withdraw Charge (%)</label>
                <input
                  type="number"
                  value={settingsForm.withdraw_charge_percent}
                  onChange={(e) => handleSettingChange('withdraw_charge_percent', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            {/* 🛡️ Advanced DDoS Shield & WAF Security */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <span>🛡️ Enterprise DDoS Shield &amp; WAF Protection</span>
                      {settingsForm.ddos_shield_enabled !== false ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          SHIELD ACTIVE ({settingsForm.ddos_shield_mode || 'NORMAL'})
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          SHIELD DISABLED
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Real-time sliding-window rate limiting, anti-bot scanner inspection (SQLi / path traversal) and automated temporary IP bans for high frequency traffic.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.ddos_shield_enabled !== false}
                  onChange={(e) => handleSettingChange('ddos_shield_enabled', e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {settingsForm.ddos_shield_enabled !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Protection Profile</label>
                    <select
                      value={settingsForm.ddos_shield_mode || 'NORMAL'}
                      onChange={(e) => handleSettingChange('ddos_shield_mode', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    >
                      <option value="NORMAL">Standard Mode (120 req/min limit)</option>
                      <option value="HIGH_SECURITY">High Security (60 req/min limit)</option>
                      <option value="UNDER_ATTACK">Under Attack (30 req/min + Strict Auto-Ban)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Anti-Bot &amp; Exploit Filter</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={settingsForm.ddos_bot_protection !== false}
                        onChange={(e) => handleSettingChange('ddos_bot_protection', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-emerald-400 text-xs">Block SQLi, scanner probes &amp; malicious user-agents</span>
                    </div>
                  </div>
                </div>
              )}
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
                      <span>Dynamic Welcome Bonus Control</span>
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
                      Dynamic bonus auto-credited when a user makes their 1st transaction (Min. ₹1 Send/Transfer) within 24 hours of registration. If no transaction is done within 24h, the bonus expires.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.signup_bonus_enabled}
                  onChange={(e) => handleSettingChange('signup_bonus_enabled', e.target.checked)}
                  className="w-5 h-5 accent-purple-500 cursor-pointer"
                />
              </div>

              {settingsForm.signup_bonus_enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                      Welcome Bonus Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50 or 100"
                      value={settingsForm.signup_bonus_amount}
                      onChange={(e) =>
                        handleSettingChange('signup_bonus_amount', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Set ₹50, ₹100, or any custom amount to auto-unlock on 1st transaction within 24 hours
                    </p>
                  </div>
                  <div className="flex items-center p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                    <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mr-2" />
                    <span className="text-[11px] text-purple-200">
                      When enabled, new users see the ₹{settingsForm.signup_bonus_amount || 0} Welcome Bonus offer. Making their 1st transfer (Min. ₹1) within 24 hours automatically credits ₹{settingsForm.signup_bonus_amount || 0} with instant Telegram & Email alert!
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
                  onChange={(e) => handleSettingChange('notice_banner_enabled', e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={settingsForm.notice_banner_title}
                  onChange={(e) => handleSettingChange('notice_banner_title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
                <textarea
                  placeholder="Notice Message Body"
                  value={settingsForm.notice_banner_message}
                  onChange={(e) => handleSettingChange('notice_banner_message', e.target.value)}
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
                      onChange={(e) => handleSettingChange('admin_qr_url', e.target.value)}
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
                      onChange={(e) => handleSettingChange('admin_bank_name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SR Gateway Payments"
                      value={settingsForm.admin_bank_account_name || ''}
                      onChange={(e) => handleSettingChange('admin_bank_account_name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50200088192031"
                      value={settingsForm.admin_bank_account_no || ''}
                      onChange={(e) => handleSettingChange('admin_bank_account_no', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001092"
                      value={settingsForm.admin_bank_ifsc || ''}
                      onChange={(e) => handleSettingChange('admin_bank_ifsc', e.target.value)}
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
                    onChange={(e) => handleSettingChange('telegram_channel_name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Telegram Channel URL</label>
                  <input
                    type="text"
                    placeholder="Telegram Channel URL"
                    value={settingsForm.telegram_channel_url}
                    onChange={(e) => handleSettingChange('telegram_channel_url', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Admin UPI ID for Deposits</label>
                  <input
                    type="text"
                    placeholder="Admin UPI ID for Deposits"
                    value={settingsForm.admin_upi_id}
                    onChange={(e) => handleSettingChange('admin_upi_id', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono uppercase mb-1">Admin Support URL</label>
                  <input
                    type="text"
                    placeholder="Admin Support URL"
                    value={settingsForm.support_url}
                    onChange={(e) => handleSettingChange('support_url', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Official Customer Support & Forgot Password Helpdesk (WhatsApp & Telegram 24x7) */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg">
                    💬
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Official Customer Support & Forgot Password Channels</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        24x7 LOGIN RECOVERY
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Configure WhatsApp and Telegram support channels. These will automatically appear in the Login page "Forgot Password" modal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* WhatsApp Support Number */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <label className="block text-emerald-400 font-bold text-[11px] uppercase">
                    WhatsApp Support Mobile No.
                  </label>
                  <input
                    type="text"
                    placeholder="+91 7477661867"
                    value={settingsForm.whatsapp_support_number || ''}
                    onChange={(e) => handleSettingChange('whatsapp_support_number', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-500">
                    Displayed on login password recovery card. Users can click to message directly.
                  </p>
                </div>

                {/* WhatsApp Support Direct URL */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <label className="block text-emerald-400 font-bold text-[11px] uppercase">
                    WhatsApp Direct Chat URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://wa.me/917477661867"
                    value={settingsForm.whatsapp_support_url || ''}
                    onChange={(e) => handleSettingChange('whatsapp_support_url', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Custom wa.me link or pre-filled message URL. If left empty, defaults to wa.me with number above.
                  </p>
                </div>

                {/* Telegram Support Username */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <label className="block text-sky-400 font-bold text-[11px] uppercase">
                    Telegram Support Username / Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@SRGatewayBot"
                    value={settingsForm.support_telegram_username || ''}
                    onChange={(e) => handleSettingChange('support_telegram_username', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sky-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-500">
                    Official Telegram username or bot handle for 24x7 support.
                  </p>
                </div>

                {/* Telegram Support Direct Link */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <label className="block text-sky-400 font-bold text-[11px] uppercase">
                    Telegram Support Direct Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://t.me/SRGatewayBot"
                    value={settingsForm.support_url || ''}
                    onChange={(e) => handleSettingChange('support_url', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Direct t.me link. Opens Telegram app / web for password reset inquiry.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  📌 <strong className="text-slate-200">Live Preview:</strong> Users clicking "Forgot Password? 🔑" on the login screen will see buttons pointing to these exact channels.
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  Active in Login Portal
                </span>
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
                      placeholder="@SRGatewayBot"
                      value={settingsForm.otp_telegram_bot_username || ''}
                      onChange={(e) =>
                        handleSettingChange('otp_telegram_bot_username', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    e.g. @SRGatewayBot or your custom Telegram Bot handle
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-mono text-[11px]">
                    Telegram Bot API Token (HTTP API)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Paste HTTP API token from @BotFather"
                      value={settingsForm.otp_telegram_bot_token || ''}
                      onChange={(e) =>
                        handleSettingChange('otp_telegram_bot_token', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Token from @BotFather for sending OTPs and alerts (e.g. 7829103847:AAHx...)
                  </p>
                </div>
              </div>

              {/* Telegram Webhook & Cloud Gateway Status */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-indigo-500/30 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-bold text-[12px] flex items-center gap-1.5">
                      Railway Webhook & Live Bot Sync
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ONLINE
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isCheckingBotStatus}
                      onClick={fetchTelegramBotStatus}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-mono flex items-center gap-1 transition"
                    >
                      <RefreshCw className={`h-3 w-3 ${isCheckingBotStatus ? 'animate-spin' : ''}`} />
                      Check Health
                    </button>
                    <button
                      type="button"
                      disabled={isSettingWebhook}
                      onClick={handleSetRailwayWebhook}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition shadow"
                    >
                      <Zap className="h-3 w-3 text-amber-300" />
                      {isSettingWebhook ? 'Connecting...' : 'Connect Railway Webhook'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Live Webhook Endpoint:</span>
                    <span className="text-emerald-400 font-bold truncate max-w-[280px]">
                      https://sr-gateway-in.up.railway.app/api/v1/telegram-webhook
                    </span>
                  </div>
                  {telegramStatusData && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-800/60 text-slate-300 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        Bot: <strong className="text-cyan-300">{telegramStatusData.bot?.first_name || 'SR Gateway Bot'}</strong> (@{telegramStatusData.bot?.username || 'SRGatewayBot'})
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Mode:</span>
                        {telegramStatusData.is_webhook_active ? (
                          <span className="text-emerald-400 font-bold">⚡ Webhook Active (Zero Polling Conflict)</span>
                        ) : (
                          <span className="text-amber-400 font-bold">Polling Mode</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Telegram Message / Bot Test Console */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-200 font-bold text-[11px]">
                      Live Bot Hook: <strong className="text-cyan-400">{settingsForm.otp_telegram_bot_username || '@SRGatewayBot'}</strong>
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                    REAL-TIME DISPATCH TEST
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">
                      Enter Target Telegram Chat ID or @Username (e.g. 6624207638):
                    </label>
                    <input
                      type="text"
                      placeholder="6624207638 or @username"
                      value={testTelegramChatId}
                      onChange={(e) => setTestTelegramChatId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-auto self-end">
                    <button
                      type="button"
                      disabled={isTestingTelegram}
                      onClick={handleTestTelegramDispatch}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-900/30 disabled:opacity-50"
                    >
                      {isTestingTelegram ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Test Telegram Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {testTelegramResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-mono transition ${
                      testTelegramResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {testTelegramResult.success ? '✅ Success:' : '❌ Dispatch Notice:'}
                      <span>{testTelegramResult.message}</span>
                    </div>
                    {testTelegramResult.help && (
                      <div className="mt-1 text-[11px] text-amber-300">
                        💡 <strong>Hint:</strong> {testTelegramResult.help}
                      </div>
                    )}
                  </div>
                )}
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
                      handleSettingChange('support_telegram_bot_username', cleanBot);
                      handleSettingChange('support_url', `https://t.me/${botHandle.replace('@', '')}`);
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
                    onChange={(e) => handleSettingChange('support_url', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    User panel redirect destination URL
                  </p>
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1 font-mono text-[11px] flex items-center justify-between">
                    <span>Permanent Gateway App URL</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">CORE APP URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://srgateway-5jj4.onrender.com"
                    value={settingsForm.app_url || 'https://srgateway-5jj4.onrender.com'}
                    onChange={(e) => handleSettingChange('app_url', e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Permanent production URL used in Telegram Bot callbacks, Webhook endpoints, and Developer API docs.
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
                  onChange={(e) => handleSettingChange('email_alerts_enabled', e.target.checked)}
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
                    onChange={(e) => handleSettingChange('email_login_alert_enabled', e.target.checked)}
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
                    onChange={(e) => handleSettingChange('email_deposit_alert_enabled', e.target.checked)}
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
                    onChange={(e) => handleSettingChange('email_withdraw_alert_enabled', e.target.checked)}
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
                      onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={settingsForm.smtp_port || 587}
                      onChange={(e) => handleSettingChange('smtp_port', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">SMTP Username / Gmail ID</label>
                    <input
                      type="text"
                      placeholder="support@srgateway.in or gmail"
                      value={settingsForm.smtp_user || ''}
                      onChange={(e) => handleSettingChange('smtp_user', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">App Password / Secret</label>
                    <input
                      type="password"
                      placeholder="Google App Password (16-char)"
                      value={settingsForm.smtp_pass || ''}
                      onChange={(e) => handleSettingChange('smtp_pass', e.target.value)}
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
                      onChange={(e) => handleSettingChange('smtp_from_name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Sender From Email Address (Gmail / Verified Email)</label>
                    <input
                      type="text"
                      placeholder="sr.notify.hub@gmail.com"
                      value={settingsForm.smtp_from_email || settingsForm.smtp_user || 'sr.notify.hub@gmail.com'}
                      onChange={(e) => handleSettingChange('smtp_from_email', e.target.value)}
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
                      placeholder="sr.notify.hub@gmail.com"
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

            {isSubAdmin ? (
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/40 text-amber-300 text-center font-mono text-xs flex items-center justify-center gap-2 shadow-lg">
                <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Fixed Gateway Configuration: All UPI IDs, banking credentials and charges are fixed &amp; locked by Master Owner (SR-OWNER-01). Sub-Admin modifications are restricted.</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-rose-600/25 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving & Synchronizing Settings...</span>
                  </>
                ) : (
                  <span>Save All System Configuration Settings 💾</span>
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* TAB: BACKUP & RESTORE / MIGRATION HUB */}
      {activeAdminTab === 'BACKUP' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                  <Database className="h-3.5 w-3.5" />
                  <span>Zero-Data-Loss Migration & Backup Engine</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Full Database Export & Migration to Koyeb / New Host
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Render bandwidth limit exceed hone par agar aap Koyeb, Railway ya kisi naye host par app shift kar rahe hain,
                  to aapka ek bhi user ya balance <strong>kabhi loss nahi hoga</strong>. Yahan se pura database download karein aur naye URL ke Admin Panel par 1-click me restore kar dein!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  disabled={isExportingDb}
                  onClick={handleExportDatabase}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition active:scale-95 disabled:opacity-60"
                >
                  <Download className={`h-4 w-4 ${isExportingDb ? 'animate-bounce' : ''}`} />
                  <span>{isExportingDb ? 'Exporting Database...' : 'Download Backup (.json) 📦'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRawDatabaseJson}
                  className="px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition active:scale-95"
                >
                  {copiedField === 'RAW_DB_JSON' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-indigo-400" />
                      <span>Copy Raw JSON 📋</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step-by-Step Koyeb Migration Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">How to Migrate to Koyeb (Step-by-Step Guide / कैसे करें)</h4>
                <p className="text-xs text-slate-400">Follow these 4 simple steps to move without losing any user, password, or balance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Step 1 • Backup</div>
                <div className="font-bold text-white">Download JSON File</div>
                <p className="text-slate-400 text-[11px]">
                  Click the <strong>Download Backup (.json)</strong> button above. This saves all users, passwords, R-PINs, and wallets in one secure file.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Step 2 • Deploy</div>
                <div className="font-bold text-white">Deploy on Koyeb.com</div>
                <p className="text-slate-400 text-[11px]">
                  Connect your GitHub repo on Koyeb. Choose <strong>Web Service</strong>, set build type Node.js, and port <strong>3000</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">Step 3 • Environment</div>
                <div className="font-bold text-white">Add Env Variables</div>
                <p className="text-slate-400 text-[11px]">
                  In Koyeb settings, copy over your Render environment variables like <code>TELEGRAM_BOT_TOKEN</code> and your new Koyeb <code>APP_URL</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">Step 4 • Restore</div>
                <div className="font-bold text-white">1-Click Restore</div>
                <p className="text-slate-400 text-[11px]">
                  Open your new Koyeb Admin Panel &rarr; Backup & Restore &rarr; Upload your JSON file. <strong>Done! All users & balances live instantly!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Export vs Import Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Current Database Diagnostics */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Current Database Snapshot</h4>
                    <p className="text-xs text-slate-400">All data currently live in persistent storage</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ● SYNCED WITH DISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase text-slate-400">Total Registered Users</div>
                  <div className="text-2xl font-black text-white">{allProfiles.length}</div>
                  <div className="text-[10px] text-indigo-400">All with Passwords & R-PINs</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase text-slate-400">Total Wallets Tracked</div>
                  <div className="text-2xl font-black text-emerald-400">{Object.keys(allWallets).length}</div>
                  <div className="text-[10px] text-emerald-300">
                    {formatINR(Object.values(allWallets).reduce((s, w: any) => s + (w?.available_balance || 0), 0))} Total Bal
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase text-slate-400">Telegram Connected</div>
                  <div className="text-2xl font-black text-cyan-400">
                    {allProfiles.filter((u) => u.telegram_chat_id || u.telegram_id).length}
                  </div>
                  <div className="text-[10px] text-cyan-300">Bot Chat IDs active</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase text-slate-400">Transactions Logged</div>
                  <div className="text-2xl font-black text-amber-400">{transactions.length}</div>
                  <div className="text-[10px] text-amber-300">Ledger history entries</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Backend Storage File:</span>
                  <span className="text-indigo-300 font-bold">/data/srgateway_database.json</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Persistence Status:</span>
                  <span className="text-emerald-400 font-bold">Auto-persisted on every transaction</span>
                </div>
              </div>
            </div>

            {/* Box 2: Restore / Import Database */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Restore / Import Database</h4>
                  <p className="text-xs text-slate-400">Upload your JSON backup or paste JSON text directly</p>
                </div>
              </div>

              {importFeedback && (
                <div
                  className={`p-3.5 rounded-2xl font-mono text-xs border flex items-center gap-2 ${
                    importFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {importFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                  <span>{importFeedback.message}</span>
                </div>
              )}

              {/* Upload via File Picker */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isImportingDb}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-950/20 hover:bg-indigo-950/40 rounded-2xl text-center transition group cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-indigo-400 mx-auto mb-1.5 group-hover:scale-110 transition" />
                  <div className="font-bold text-xs text-white">Click to Select JSON Backup File (.json)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Loads and restores database in 1 second</div>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider relative z-10">
                  OR PASTE RAW JSON BELOW
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
              </div>

              {/* Paste JSON Area */}
              <div className="space-y-2 font-mono">
                <textarea
                  rows={4}
                  placeholder="Paste database JSON payload here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  disabled={isImportingDb || !importJsonText.trim()}
                  onClick={() => handleRestoreDatabase(importJsonText)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isImportingDb ? 'animate-spin' : ''}`} />
                  <span>{isImportingDb ? 'Restoring Database...' : 'Restore Full Database From Pasted JSON ⚡'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
      {(adminActionModal === 'ADD_BAL' || adminActionModal === 'CUT_BAL') && selectedUserForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <h3 className="text-base font-extrabold text-white font-sans">
              {adminActionModal === 'ADD_BAL' ? 'Credit Balance to User' : 'Deduct Balance from User'}
            </h3>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div className="font-bold text-white font-sans">{selectedUserForModal.full_name}</div>
              <div className="text-[10px] text-slate-400">ID: {selectedUserForModal.user_custom_id}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-bold">
                Current Balance: {formatINR(
                  allWallets[selectedUserForModal.id]?.available_balance ??
                  allWallets[selectedUserForModal.user_custom_id]?.available_balance ??
                  (selectedUserForModal.mobile && allWallets[selectedUserForModal.mobile]?.available_balance) ??
                  0
                )}
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
                disabled={isAdjustingBalance}
                onClick={() => setAdminActionModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isAdjustingBalance}
                onClick={adminActionModal === 'ADD_BAL' ? handleAdminAddBalance : handleAdminCutBalance}
                className={`px-5 py-2 text-xs font-black rounded-xl text-slate-950 flex items-center gap-1.5 ${
                  adminActionModal === 'ADD_BAL' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-amber-500 hover:bg-amber-400'
                } ${isAdjustingBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAdjustingBalance ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm {adminActionModal === 'ADD_BAL' ? 'Credit' : 'Deduction'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SET DAILY HTTPS REQUEST LIMIT */}
      {adminActionModal === 'SET_LIMIT' && selectedUserForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-sans">Set Daily HTTPS Request Limit</h3>
                <p className="text-[11px] text-slate-400 font-sans">Adjust quota for this specific user wallet</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white font-sans">{selectedUserForModal.full_name}</div>
              <div className="text-[10px] text-slate-400">ID: {selectedUserForModal.user_custom_id} • Mobile: {selectedUserForModal.mobile}</div>
              <div className="text-[11px] text-indigo-300 pt-1">
                Current Usage Today: <strong>{selectedUserForModal.daily_api_requests_count || 0} / {selectedUserForModal.daily_api_requests_limit || 10} Requests</strong>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-sans">Daily HTTPS Requests Limit (Per 24h Cycle)</label>
              <input
                type="number"
                min={1}
                max={1000000}
                value={userQuotaLimitInput}
                onChange={(e) => setUserQuotaLimitInput(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1.5 font-sans">Quick Presets:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 50, 100, 500, 1000, 5000, 10000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUserQuotaLimitInput(preset)}
                    className={`py-1.5 px-2 rounded-lg font-mono font-bold text-xs transition border ${
                      userQuotaLimitInput === preset
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed">
              💡 <strong>Non-Destructive Quota:</strong> If the user hits their limit, their HTTPS request sending is temporarily suspended until the daily 24h reset. Their account is <strong>NOT banned</strong> and stays active.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdminActionModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminUpdateQuota}
                className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg transition active:scale-95"
              >
                Save Daily Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER CREDENTIALS (PASSWORD, R-PIN, TELEGRAM CHAT ID) */}
      {adminActionModal === 'EDIT_CREDS' && selectedUserForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-violet-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-violet-500/20 text-violet-400 rounded-2xl border border-violet-500/30">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-sans">Edit User Credentials & Access</h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    View & update Password, 4-digit R-PIN & Telegram Chat ID for {selectedUserForModal.full_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminActionModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserCredentials} className="space-y-4">
              {/* User Identity Info */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-white font-sans text-sm">{selectedUserForModal.full_name}</div>
                  <div className="text-[10px] text-slate-400">SR ID: {selectedUserForModal.user_custom_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Available Balance</div>
                  <div className="text-sm font-black text-emerald-400">
                    {formatINR((allWallets[selectedUserForModal.id]?.available_balance) || 0)}
                  </div>
                </div>
              </div>

              {/* 1. Password Field */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 font-sans flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>User Login Password</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Used to login to dashboard</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={credsForm.password}
                    onChange={(e) => setCredsForm({ ...credsForm, password: e.target.value })}
                    placeholder="Enter user login password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credsForm.password, 'modal-pwd')}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white"
                    title="Copy Password"
                  >
                    {copiedField === 'modal-pwd' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Security 4-Digit R-PIN */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 font-sans flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Security 4-Digit R-PIN</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Used for withdrawal & API verification</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={4}
                    value={credsForm.rpin}
                    onChange={(e) => setCredsForm({ ...credsForm, rpin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="4-digit PIN (e.g. 1234)"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-emerald-300 font-mono font-black text-sm tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credsForm.rpin, 'modal-rpin')}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white"
                    title="Copy R-PIN"
                  >
                    {copiedField === 'modal-rpin' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 3. Telegram Chat ID & Telegram ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Telegram Chat ID</span>
                  </label>
                  <input
                    type="text"
                    value={credsForm.telegram_chat_id}
                    onChange={(e) => setCredsForm({ ...credsForm, telegram_chat_id: e.target.value })}
                    placeholder="e.g. 123456789"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Telegram Username/ID</label>
                  <input
                    type="text"
                    value={credsForm.telegram_id}
                    onChange={(e) => setCredsForm({ ...credsForm, telegram_id: e.target.value })}
                    placeholder="e.g. @username"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Mobile Number</label>
                  <input
                    type="text"
                    value={credsForm.mobile}
                    onChange={(e) => setCredsForm({ ...credsForm, mobile: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1 font-sans">Email Address</label>
                  <input
                    type="email"
                    value={credsForm.email}
                    onChange={(e) => setCredsForm({ ...credsForm, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Account Status */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 font-sans">Account Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCredsForm({ ...credsForm, status: 'ACTIVE' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                      credsForm.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ACTIVE (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCredsForm({ ...credsForm, status: 'BANNED' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                      credsForm.status === 'BANNED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    BANNED (Restricted)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdminActionModal(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCreds}
                  className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isSavingCreds ? 'Saving Changes...' : 'Save User Credentials'}</span>
                </button>
              </div>
            </form>
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

      {/* MODAL: RESET ALL BALANCES CONFIRMATION */}
      {isResetBalancesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl font-sans">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Reset All User Balances to ₹0?</h3>
                <p className="text-xs text-amber-400 font-semibold">Mass Balance Cleansing Action</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <p>
                ⚠️ This will immediately set all non-admin user wallets (<strong className="text-white">{allProfiles.filter(p => p.role !== 'ADMIN').length} accounts</strong>) to:
              </p>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center font-mono font-black text-amber-300 text-sm">
                Available: ₹0.00 • Locked: ₹0.00
              </div>
              <p className="text-[11px] text-slate-400">
                • Master Admin balance and system logs will be preserved.<br />
                • Real-time notifications and audit entries will be recorded.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Type <span className="font-mono text-amber-400 font-black">RESET</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="Type RESET"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm tracking-wider outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isResetBalancesLoading}
                onClick={() => {
                  setIsResetBalancesModalOpen(false);
                  setResetConfirmText('');
                }}
                className="px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetBalancesLoading || resetConfirmText !== 'RESET'}
                onClick={handleConfirmResetAllBalances}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition shadow-lg flex items-center gap-2 ${
                  resetConfirmText === 'RESET' && !isResetBalancesLoading
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isResetBalancesLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Resetting Balances...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>Confirm Reset (0 RS)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FACTORY WIPE ALL USERS CONFIRMATION */}
      {isWipeUsersModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl font-sans">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Factory Wipe All User Data?</h3>
                <p className="text-xs text-rose-400 font-semibold">Delete All Registered User Accounts</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <p>
                🚨 <strong className="text-rose-400">All registered user profiles, credentials, and data will be permanently wiped</strong> ({allProfiles.filter(p => p.role !== 'ADMIN').length} registered users).
              </p>
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed">
                ✅ <strong>Re-registration allowed:</strong> Users can immediately register fresh accounts using the same mobile numbers, Gmail addresses, and Telegram Chat IDs.
              </div>
              <p className="text-[10px] text-slate-400">
                • Master Admin (<span className="text-white font-mono">admin-001</span>) remains safe and logged in.<br />
                • System will clear user registry cache and sync with server.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Type <span className="font-mono text-rose-400 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="Type DELETE"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm tracking-wider outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isWipeUsersLoading}
                onClick={() => {
                  setIsWipeUsersModalOpen(false);
                  setWipeConfirmText('');
                }}
                className="px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWipeUsersLoading || wipeConfirmText !== 'DELETE'}
                onClick={handleConfirmWipeAllUsers}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition shadow-lg flex items-center gap-2 ${
                  wipeConfirmText === 'DELETE' && !isWipeUsersLoading
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isWipeUsersLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Wiping All Users...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm Wipe All Users</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / CREATE USER MODAL                                                   */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create New User Account</h3>
                  <p className="text-xs text-slate-400">Admin Portal Manual Account Creation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setCreatedUserResult(null);
                  setAddUserError(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {addUserError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            {/* SUCCESS STATE */}
            {createdUserResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-300">Account Created & Saved Successfully!</h4>
                  <p className="text-xs text-slate-300">
                    The user account and wallet have been saved to the persistent database.
                  </p>
                </div>

                {/* Credentials Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2.5">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Full Name:</span>
                    <span className="text-white font-bold">{createdUserResult.user.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">User ID (SR-ID):</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {createdUserResult.user.user_custom_id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Mobile / Login ID:</span>
                    <span className="text-white font-bold">{createdUserResult.user.mobile}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Email / Gmail:</span>
                    <span className="text-slate-300">{createdUserResult.user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Login Password:</span>
                    <span className="text-amber-300 font-bold bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/30">
                      {createdUserResult.password}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Security R-PIN (4 Digits):</span>
                    <span className="text-purple-300 font-bold bg-purple-950/30 px-2 py-0.5 rounded border border-purple-800/30">
                      {createdUserResult.rpin}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-sans">Opening Wallet Balance:</span>
                    <span className="text-emerald-400 font-bold">₹{createdUserResult.balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Telegram info notice */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 leading-relaxed">
                  <span className="font-bold">📱 Telegram Security Link: </span>
                  {createdUserResult.user.telegram_chat_id ? (
                    <span>Connected with Chat ID: <code className="text-white font-bold">{createdUserResult.user.telegram_chat_id}</code></span>
                  ) : (
                    <span>
                      Chat ID khali hai. User apne <b>Mobile & Password</b> se login karega, fir <b>Profile &gt; Security</b> section me jakar <b>Telegram Bot OTP</b> se apna Chat ID 1-click me connect karke account secure kar sakta hai!
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCreatedUserCreds}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {copiedAllCreds ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy All Credentials</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserName('');
                      setNewUserMobile('');
                      setNewUserEmail('');
                      setNewUserPassword('123456');
                      setNewUserRpin('7477');
                      setNewUserBalance('0');
                      setNewUserChatId('');
                      setCreatedUserResult(null);
                      setAddUserError(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    + Add Another User
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUserModalOpen(false);
                      setCreatedUserResult(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* FORM STATE */
              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma or Sk Rihan"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mobile Number (10 Digits) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 7477661867"
                      value={newUserMobile}
                      onChange={(e) => setNewUserMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used by user to log in</span>
                  </div>

                  {/* Gmail / Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email / Gmail <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@gmail.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">For OTPs & payment alerts</span>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Login Password <span className="text-slate-500 text-[10px] font-normal">(Default: 123456)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* R-PIN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Security R-PIN (4 Digits) <span className="text-slate-500 text-[10px] font-normal">(Default: 7477)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="7477"
                      value={newUserRpin}
                      onChange={(e) => setNewUserRpin(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Opening Balance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Opening Balance (₹) <span className="text-slate-500 text-[10px] font-normal">(Default: ₹0)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={newUserBalance}
                      onChange={(e) => setNewUserBalance(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Telegram Chat ID (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Telegram Chat ID <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6624207638 (or leave blank)"
                      value={newUserChatId}
                      onChange={(e) => setNewUserChatId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Helpful Note about Telegram Bot OTP */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                    <Bot className="h-3.5 w-3.5 text-blue-400" />
                    <span>Telegram Chat ID connect nahi kiya to?</span>
                  </div>
                  <p className="leading-relaxed">
                    Koi baat nahi! Aap ise khali chhod sakte hain. Account create hone ke baad user khud apne <b>Mobile Number</b> aur <b>Password</b> se login karega, aur apni profile me <b>Telegram Bot OTP</b> option se apna Chat ID connect karke account secure kar lega.
                  </p>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUserModalOpen(false);
                      setAddUserError(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingUser ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        <span>Create User Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
