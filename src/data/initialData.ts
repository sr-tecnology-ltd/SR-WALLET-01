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
  minimum_deposit: 100,
  minimum_withdraw: 500,
  maximum_withdraw: 100000,
  deposit_charge_percent: 0,
  withdraw_charge_percent: 5,
  signup_bonus_enabled: true,
  signup_bonus_amount: 50,
  welcome_bonus_min_txn: 1,
  welcome_bonus_expiry_hours: 24,
  referral_enabled: true,
  referral_bonus_type: 'FIXED',
  referral_bonus_amount: 100,
  daily_bonus_enabled: true,
  daily_bonus_amount: 25,
  daily_bonus_interval_hours: 24,
  notice_banner_enabled: true,
  notice_banner_title: '⚡ Instant Deposit Verification Active',
  notice_banner_message: 'Submit your UTR and screenshot for instant wallet crediting within 2 minutes. 0% Deposit Fee active today!',
  notice_banner_button_text: 'Deposit Now',
  notice_banner_button_url: '#deposit',
  telegram_channel_enabled: true,
  telegram_channel_name: 'SR TECHNOLOGY LTD',
  telegram_channel_url: 'https://t.me/SRTECHNOLOGYLTD1',
  otp_telegram_bot_token: '',
  otp_telegram_bot_username: '@SRGatewayBot',
  support_telegram_bot_username: '@SRGateway_Support_Bot',
  support_url: 'https://t.me/SRGateway_Support_Bot',
  admin_upi_id: 'srgateway@icici',
  admin_qr_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  admin_bank_name: 'HDFC Bank Ltd',
  admin_bank_account_name: 'SR Gateway Payments',
  admin_bank_account_no: '50200088192031',
  admin_bank_ifsc: 'HDFC0001092',
};

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'admin-001',
    user_custom_id: 'SR-ADMIN-01',
    full_name: 'SR Gateway System Admin',
    mobile: '+91 90000 00000',
    email: 'sr.notify.hub@gmail.com',
    telegram_id: '@srgateway_official',
    role: 'ADMIN',
    status: 'ACTIVE',
    referral_code: 'ADMIN001',
    rpin: '9999',
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
