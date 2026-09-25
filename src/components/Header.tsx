import React from 'react';
import { formatNumber } from '../constants';
import { UserProfile } from '../types';
import { Sparkles, User, Wallet } from 'lucide-react';
import { formatSolanaAddress } from '../utils/solana';

interface HeaderProps {
  connected: boolean;
  address: string;
  balance: number;
  solBalance?: number;
  effectiveTH: number;
  rawTH: number;
  warPrice: number;
  burnedWar: number;
  minedSeconds: number;
  userProfile?: UserProfile;
  activeWalletName?: string;
  onOpenWallet: () => void;
  onOpenCreateWallet?: () => void;
  onNavigateToProfile?: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connected,
  address,
  balance,
  solBalance = 2.5,
  effectiveTH,
  rawTH,
  warPrice,
  burnedWar,
  minedSeconds,
  userProfile,
  activeWalletName,
  onOpenWallet,
  onOpenCreateWallet,
  onNavigateToProfile,
  onDisconnect,
}) => {
  return (
    <header className="relative z-20 sticky top-0 backdrop-blur-xl bg-[#0A0A0B]/85 border-b border-white/[0.06]">
      <div className="max-w-[1700px] mx-auto px-4 md:px-6 h-[66px] flex items-center justify-between gap-4">
        {/* Left: Brand & Protocol Metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#9945FF] via-[#7B2CBF] to-[#FF6A00] flex items-center justify-center font-black text-white text-[15px] shadow-md shadow-purple-950/40">
              ◎
            </div>
            <div className="leading-none">
              <div className="font-display font-black tracking-[-0.02em] text-[15px] flex items-center gap-2">
                <span>WAR MINING</span>
                <span className="opacity-30 font-medium">//</span>
                <span className="font-semibold bg-gradient-to-r from-purple-400 to-[#14F195] bg-clip-text text-transparent">
                  SOLANA
                </span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono-num text-purple-300">
                  DEVNET v2.5
                </span>
              </div>
              <div className="font-mono-num text-[10px] tracking-[0.16em] text-zinc-400 mt-[2px]">
                PROOF-OF-WAR PROTOCOL • {minedSeconds.toFixed(0)}s mined
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-num text-[11px] text-zinc-400">SOLANA CLUSTER</span>
            </div>
            <div className="font-mono-num text-[12px] flex items-center gap-3">
              <span className="text-zinc-500">$WAR</span>
              <span className="font-semibold text-white">${warPrice.toFixed(4)}</span>
              <span className="text-emerald-400">+2.4%</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="font-mono-num text-[11px] text-zinc-500">
              NETWORK <span className="text-zinc-200 ml-1">4.2 EH/s</span>
              <span className="mx-2 opacity-30">|</span>
              BLOCK <span className="text-zinc-200 ml-1">#842,901</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="font-mono-num text-[11px] text-zinc-500">
              BURNED <span className="text-[#FF6A00] ml-1">{Math.floor(burnedWar).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Profile & Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mining Power Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] font-mono-num text-[11px]">
            <div className="w-2 h-2 rounded-full bg-[#14F195]" />
            <span className="text-zinc-400">POW</span>
            <span className="text-white font-bold">{effectiveTH.toFixed(0)} TH/s</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{rawTH} raw</span>
          </div>

          {/* Profile Shortcut Button */}
          {userProfile && onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              title="Open Operator Profile Page"
              className="h-9 px-3 rounded-full bg-white/[0.05] hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 flex items-center gap-2 transition cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-[#14F195] flex items-center justify-center text-[10px] text-black font-black">
                {userProfile.handle.slice(0, 1).toUpperCase()}
              </div>
              <span className="font-display font-bold text-[11px] text-zinc-300 group-hover:text-white hidden sm:inline">
                {userProfile.handle}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono-num text-[9px] font-bold">
                LVL {userProfile.level}
              </span>
            </button>
          )}

          {!connected ? (
            <div className="flex items-center gap-2">
              {onOpenCreateWallet && (
                <button
                  onClick={onOpenCreateWallet}
                  className="h-9 px-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF6A00] text-white font-display font-bold text-[11px] hover:opacity-95 transition shadow-lg shadow-purple-950/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Solana Wallet</span>
                </button>
              )}

              <button
                onClick={onOpenWallet}
                className="h-9 px-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-display font-bold text-[12px] border border-white/10 transition cursor-pointer"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenCreateWallet && (
                <button
                  onClick={onOpenCreateWallet}
                  title="Run Solana Wallet Creation Walkthrough"
                  className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-mono-num text-[11px] font-bold transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#14F195]" />
                  <span>+ Create Wallet</span>
                </button>
              )}

              {/* Solana Wallet Pill */}
              <button
                onClick={onOpenWallet}
                title="Manage Solana Wallets & Keypairs"
                className="flex items-center gap-2.5 h-9 px-3 rounded-full bg-[#161420] border border-purple-500/30 hover:border-purple-400 transition cursor-pointer text-left"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-[#14F195] to-emerald-400 flex items-center justify-center text-[10px] font-bold text-black">
                  ◎
                </div>
                <div className="font-mono-num text-[11px] leading-tight">
                  <div className="text-zinc-200 font-medium flex items-center gap-1.5">
                    <span>{formatSolanaAddress(address, 4)}</span>
                    <span className="text-emerald-400 font-bold">{solBalance.toFixed(2)} SOL</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {formatNumber(balance)} $WAR
                  </div>
                </div>
              </button>

              <button
                onClick={onDisconnect}
                title="Disconnect Solana Wallet"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 transition cursor-pointer"
              >
                ↗
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
