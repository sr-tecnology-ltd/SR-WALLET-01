import {
  UserProfile,
  Wallet,
  DepositRequest,
  WithdrawalRequest,
  Transaction,
  AppSettings,
  AuditLog,
  UserNotification,
  ReferralRecord,
  ApiKeyRecord,
} from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  deposit_enabled: true,
  withdraw_enabled: true,
  minimum_deposit: 10,
  minimum_withdraw: 20,
  maximum_withdraw: 100000,
  deposit_charge_percent: 7,
  withdraw_charge_percent: 10,
  signup_bonus_enabled: false,
  signup_bonus_amount: 0,
  welcome_bonus_min_txn: 1,
  welcome_bonus_expiry_hours: 24,
  referral_enabled: true,
  referral_bonus_type: 'FIXED',
  referral_bonus_amount: 50,
  daily_bonus_enabled: true,
  daily_bonus_amount: 25,
  daily_bonus_interval_hours: 24,
  notice_banner_enabled: true,
  notice_banner_title: '⚡ Instant Deposit Verification Active',
  notice_banner_message: 'Submit your UTR and screenshot for instant wallet crediting within 2 minutes. 7% Deposit Fee active.',
  notice_banner_button_text: 'Deposit Now',
  notice_banner_button_url: '#deposit',
  telegram_channel_enabled: true,
  telegram_channel_name: 'SR TECHNOLOGY LTD',
  telegram_channel_url: 'https://t.me/SRTECHNOLOGYLTD1',
  otp_telegram_bot_token: '',
  otp_telegram_bot_username: '@SRGatewayBot',
  support_telegram_bot_username: '@SRGateway_Support_Bot',
  support_url: 'https://t.me/SRGateway_Support_Bot',
  app_url: 'https://srgateway-5jj4.onrender.com',
  admin_upi_id: 'sk190rihan@mvhdfc',
  admin_qr_url: 'https://cdn.phototourl.com/free/2026-08-27-63157f0f-6206-4166-a6c1-150d1d4bb343.png',
  admin_bank_name: 'AIRTEL PAYMENT BANK',
  admin_bank_account_name: 'SK SAHIL',
  admin_bank_account_no: '7477661867',
  admin_bank_ifsc: 'AIRP0000001',
  maintenance_mode_enabled: false,
  maintenance_mode_title: '⚡ SYSTEM UNDER SCHEDULED UPGRADE',
  maintenance_mode_message: 'Our engineers are currently upgrading SR Gateway payment nodes and core servers to deliver ultra-fast UPI processing and 100% uptime. Services will resume shortly.',
  maintenance_channel_url: 'https://t.me/SRTECHNOLOGYLTD1',
  maintenance_estimated_time: '15-30 Minutes',
  ddos_shield_enabled: true,
  ddos_shield_mode: 'NORMAL',
  ddos_rate_limit_per_minute: 120,
  ddos_auto_ban_threshold: 300,
  ddos_bot_protection: true,
};

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'admin-001',
    user_custom_id: 'SR-ADMIN-01',
    full_name: 'SR Gateway System Admin',
    mobile: '+91 90000 00000',
    email: '',
    telegram_id: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    referral_code: 'ADMIN001',
    rpin: '9999',
    password: 'admin',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-08-12T10:00:00Z',
  },
];

export const INITIAL_WALLETS: Record<string, Wallet> = {
  'admin-001': {
    id: 'w-admin',
    user_id: 'admin-001',
    available_balance: 2500000.0,
    locked_balance: 0.0,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-08-12T10:00:00Z',
  },
};

export const INITIAL_DEPOSITS: DepositRequest[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    admin_id: 'admin-001',
    admin_name: 'SR Gateway System Admin',
    action: 'SETTINGS_UPDATED',
    reason: 'Initial system boot and security settings verified',
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: UserNotification[] = [];

export const INITIAL_REFERRALS: ReferralRecord[] = [];

export const INITIAL_API_KEYS: ApiKeyRecord[] = [
  {
    id: 'KEY-ADMIN',
    user_id: 'admin-001',
    key_name: 'System Admin Master Gateway Key',
    api_key_prefix: 'sr_live_admin_0001',
    secret_key_masked: 'sr_sec_admin_••••••••••••0001',
    permissions: ['balance.read', 'transfer.write', 'deposit.request', 'withdraw.request', 'admin.all'],
    is_active: true,
    created_at: '2026-07-01T00:00:00Z',
    last_used_at: '2026-08-12T12:00:00Z',
  },
];
