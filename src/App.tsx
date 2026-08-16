import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { UserDashboard } from './components/UserDashboard';
import { DepositSection } from './components/DepositSection';
import { WithdrawSection } from './components/WithdrawSection';
import { InternalTransferSection } from './components/InternalTransferSection';
import { TransactionsSection } from './components/TransactionsSection';
import { DeveloperApiSection } from './components/DeveloperApiSection';
import { SupportSection } from './components/SupportSection';
import { AdminPortal } from './components/AdminPortal';
import { TelegramOtpModal } from './components/TelegramOtpModal';
import { ThreeDotsMenuModal } from './components/ThreeDotsMenuModal';
import { UpiApiGatewayModal } from './components/UpiApiGatewayModal';
import { UserProfileSection } from './components/UserProfileSection';
import { RpinModal } from './components/RpinModal';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  Send,
  FileText,
  Code,
  MessageSquare,
  User,
} from 'lucide-react';

function WalletAppContent() {
  const { activeRole, toggleRoleMode, switchUser, rpinModalConfig, closeRpinModal } = useWallet();

  const [activeTab, setActiveTab] = useState<
    'home' | 'deposit' | 'withdraw' | 'transfer' | 'transactions' | 'developer' | 'support' | 'profile'
  >('home');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Check for secret admin portal access via URL query or hash
  useEffect(() => {
    const checkAdminQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const isSecretAdminRoute =
        params.get('admin') === 'portal' ||
        params.get('admin') === 'true' ||
        params.get('route') === 'admin' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#admin-portal';

      if (isSecretAdminRoute && activeRole !== 'ADMIN') {
        switchUser('admin-001');
      }
    };

    checkAdminQuery();
    window.addEventListener('hashchange', checkAdminQuery);
    return () => window.removeEventListener('hashchange', checkAdminQuery);
  }, [activeRole, switchUser]);

  // Modal States
  const [threeDotsOpen, setThreeDotsOpen] = useState(false);
  const [telegramOtpOpen, setTelegramOtpOpen] = useState(false);
  const [upiApiGatewayOpen, setUpiApiGatewayOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header Navigation */}
        <Header
          onOpenTelegram={() => setActiveTab('support')}
          onOpen3DotsMenu={() => setThreeDotsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
          {/* Top Notice Banner (User Mode) */}
          {activeRole === 'USER' && (
            <NoticeBanner onDepositClick={() => setActiveTab('deposit')} />
          )}

          {/* Role Switch Banner Notice */}
          {activeRole === 'ADMIN' ? (
            <AdminPortal />
          ) : (
            <>
              {/* Navigation Tabs Bar for Users */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
                {[
                  { id: 'home', label: 'Wallet Hub', icon: Wallet },
                  { id: 'deposit', label: 'Deposit (INR)', icon: PlusCircle },
                  { id: 'withdraw', label: 'Withdraw (Payout)', icon: ArrowUpRight },
                  { id: 'transfer', label: 'USER TO USER SEND', icon: Send },
                  { id: 'transactions', label: 'Transaction History', icon: FileText },
                  { id: 'profile', label: 'User Profile', icon: User },
                  { id: 'developer', label: 'Devloper api setting', icon: Code, badge: '⚡ REST' },
                  { id: 'support', label: 'Support & Telegram', icon: MessageSquare },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* USER TAB CONTENT */}
              {activeTab === 'home' && (
                <UserDashboard
                  onOpenDeposit={() => setActiveTab('deposit')}
                  onOpenWithdraw={() => setActiveTab('withdraw')}
                  onOpenTransfer={() => setActiveTab('transfer')}
                  onOpenTransactions={() => setActiveTab('transactions')}
                  onOpenDeveloper={() => setActiveTab('developer')}
                  onOpenSupport={() => setActiveTab('support')}
                  onOpenTelegramOtp={() => setTelegramOtpOpen(true)}
                  onOpenUpiApiGateway={() => setUpiApiGatewayOpen(true)}
                  onOpenProfile={() => setActiveTab('profile')}
                />
              )}

              {activeTab === 'deposit' && <DepositSection />}
              {activeTab === 'withdraw' && <WithdrawSection />}
              {activeTab === 'transfer' && <InternalTransferSection />}
              {activeTab === 'transactions' && <TransactionsSection />}
              {activeTab === 'developer' && <DeveloperApiSection />}
              {activeTab === 'profile' && (
                <UserProfileSection
                  onOpenDeveloper={() => setActiveTab('developer')}
                />
              )}
              {activeTab === 'support' && <SupportSection />}
            </>
          )}
        </main>
      </div>

      {/* MODALS RENDERED GLOBAL */}
      <TelegramOtpModal
        isOpen={telegramOtpOpen}
        onClose={() => setTelegramOtpOpen(false)}
      />

      <UpiApiGatewayModal
        isOpen={upiApiGatewayOpen}
        onClose={() => setUpiApiGatewayOpen(false)}
      />

      <ThreeDotsMenuModal
        isOpen={threeDotsOpen}
        onClose={() => setThreeDotsOpen(false)}
        onOpenTelegramOtp={() => setTelegramOtpOpen(true)}
        onOpenUpiApiGateway={() => setUpiApiGatewayOpen(true)}
        onOpenDeveloper={() => setActiveTab('developer')}
        onOpenSupport={() => setActiveTab('support')}
      />

      <RpinModal
        isOpen={rpinModalConfig.isOpen}
        mode={rpinModalConfig.mode}
        title={rpinModalConfig.title}
        description={rpinModalConfig.description}
        amount={rpinModalConfig.amount}
        recipientName={rpinModalConfig.recipientName}
        onClose={closeRpinModal}
        onSuccess={() => {
          if (rpinModalConfig.onSuccessCallback) {
            rpinModalConfig.onSuccessCallback();
          }
        }}
      />

      {/* Mobile Bottom Quick Navigation Bar */}
      {activeRole === 'USER' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 py-2 px-4 md:hidden">
          <div className="flex justify-around items-center max-w-md mx-auto text-[10px] font-bold">
            {[
              { id: 'home', label: 'Hub', icon: Wallet },
              { id: 'deposit', label: 'Deposit', icon: PlusCircle },
              { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
              { id: 'transfer', label: 'Transfer', icon: Send },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                    isActive ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400 scale-110' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-extrabold text-slate-400">SR GATEWAY IN • Complete Internal Wallet & Ledger Platform</p>
          <p className="text-[10px] text-slate-600">
            Internal Ledger System. External INR/UPI transfers are manually verified by authorized administrators.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <WalletAppContent />
    </WalletProvider>
  );
}
