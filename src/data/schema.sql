-- ====================================================================
-- SR GATEWAY IN - SUPABASE POSTGRES MIGRATION SCHEMA & POLICIES
-- ====================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'BANNED', 'PENDING_VERIFICATION');
CREATE TYPE deposit_status AS ENUM ('PENDING', 'SUCCESS', 'REJECTED', 'CANCELLED');
CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'APPROVED', 'SUCCESS', 'REJECTED', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT',
  'ADMIN_CREDIT', 'ADMIN_DEBIT', 'REFERRAL_BONUS', 'DAILY_BONUS', 'REFUND'
);
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'REJECTED', 'FAILED', 'CANCELLED');

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_custom_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram_id TEXT,
  role user_role DEFAULT 'USER'::user_role NOT NULL,
  status account_status DEFAULT 'ACTIVE'::account_status NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance NUMERIC(14,2) DEFAULT 0.00 NOT NULL CHECK (available_balance >= 0),
  locked_balance NUMERIC(14,2) DEFAULT 0.00 NOT NULL CHECK (locked_balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(14,2) DEFAULT 0.00 NOT NULL,
  net_amount NUMERIC(14,2) NOT NULL,
  utr TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  screenshot_url TEXT,
  note TEXT,
  status deposit_status DEFAULT 'PENDING'::deposit_status NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(14,2) DEFAULT 0.00 NOT NULL,
  net_payout NUMERIC(14,2) NOT NULL,
  payment_identifier TEXT NOT NULL,
  note TEXT,
  status withdrawal_status DEFAULT 'PENDING'::withdrawal_status NOT NULL,
  approved_by UUID REFERENCES public.profiles(id),
  paid_by UUID REFERENCES public.profiles(id),
  payment_reference TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TRANSACTIONS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  fee NUMERIC(14,2) DEFAULT 0.00 NOT NULL,
  net_amount NUMERIC(14,2) NOT NULL,
  status transaction_status DEFAULT 'SUCCESS'::transaction_status NOT NULL,
  reference_id TEXT NOT NULL,
  description TEXT NOT NULL,
  balance_before NUMERIC(14,2) NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bonus_amount NUMERIC(14,2) NOT NULL,
  status TEXT DEFAULT 'QUALIFIED' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. DAILY BONUS CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.daily_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  streak_day INT DEFAULT 1 NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO' NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id),
  amount NUMERIC(14,2),
  previous_balance NUMERIC(14,2),
  new_balance NUMERIC(14,2),
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_bonus_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Basic Security Policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
