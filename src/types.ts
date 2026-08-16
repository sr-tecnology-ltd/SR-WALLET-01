export type UserRole = 'USER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'BANNED' | 'PENDING_VERIFICATION';

export interface UserProfile {
  id: string;
  user_custom_id: string; // e.g. "SR-10029"
  full_name: string;
  mobile: string;
  email: string;
  telegram_id?: string;
  telegram_chat_id?: string; // numeric Chat ID from Telegram Bot
  role: UserRole;
  status: AccountStatus;
  referral_code: string;
  referred_by?: string;
  rpin?: string; // 4-digit security RPIN
  theme?: 'DARK' | 'LIGHT';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  locked_balance: number;
  created_at: string;
  updated_at: string;
}

export type DepositStatus = 'PENDING' | 'SUCCESS' | 'REJECTED' | 'CANCELLED';

export interface DepositRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_custom_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  utr: string;
  payment_method: 'UPI' | 'BANK_TRANSFER' | 'QR_CODE' | 'WALLET_GW';
  screenshot_url?: string;
  note?: string;
  status: DepositStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'SUCCESS' | 'REJECTED' | 'CANCELLED';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_custom_id: string;
  amount: number;
  fee: number;
  net_payout: number;
  payment_identifier: string; // UPI ID or Bank account/wallet address
  note?: string;
  status: WithdrawalStatus;
  approved_by?: string;
  paid_by?: string;
  payment_reference?: string; // UTR when marked paid
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'REFERRAL_BONUS'
  | 'DAILY_BONUS'
  | 'REFUND';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'REJECTED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  user_id: string;
  user_name?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  net_amount: number;
  status: TransactionStatus;
  reference_id: string; // e.g. UTR or TXN ID
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referred_user_name: string;
  bonus_amount: number;
  status: 'PENDING' | 'QUALIFIED' | 'PAID';
  created_at: string;
}

export interface DailyBonusClaim {
  id: string;
  user_id: string;
  amount: number;
  streak_day: number;
  claimed_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  created_at: string;
}

export type AuditActionType =
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_MARKED_PAID'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'SETTINGS_UPDATED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'TELEGRAM_CHAT_ID_UPDATED'
  | 'USER_LOGIN';

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: AuditActionType;
  target_user_id?: string;
  target_user_name?: string;
  amount?: number;
  previous_balance?: number;
  new_balance?: number;
  reason: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AppSettings {
  deposit_enabled: boolean;
  withdraw_enabled: boolean;
  minimum_deposit: number;
  minimum_withdraw: number;
  maximum_withdraw: number;
  deposit_charge_percent: number;
  withdraw_charge_percent: number;
  signup_bonus_enabled: boolean;
  signup_bonus_amount: number; // e.g. ₹0 (disabled) or custom amount set by admin
  referral_enabled: boolean;
  referral_bonus_type: 'FIXED' | 'PERCENTAGE';
  referral_bonus_amount: number; // e.g. ₹50 or 5%
  daily_bonus_enabled: boolean;
  daily_bonus_amount: number; // e.g. ₹10
  daily_bonus_interval_hours: number;
  notice_banner_enabled: boolean;
  notice_banner_title: string;
  notice_banner_message: string;
  notice_banner_button_text: string;
  notice_banner_button_url: string;
  telegram_channel_enabled: boolean;
  telegram_channel_name: string;
  telegram_channel_url: string;
  otp_telegram_bot_token?: string;
  otp_telegram_bot_username?: string;
  support_telegram_bot_username?: string;
  support_url: string;
  admin_upi_id: string;
  admin_qr_url: string;
  admin_bank_name?: string;
  admin_bank_account_name?: string;
  admin_bank_account_no?: string;
  admin_bank_ifsc?: string;
}

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  key_name: string;
  api_key_prefix: string;
  secret_key_masked: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface WebhookLog {
  id: string;
  event_type: string;
  payload_summary: string;
  response_status: number;
  created_at: string;
}
