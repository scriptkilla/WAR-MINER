import React from 'react';
import { formatNumber } from '../constants';

interface HeaderProps {
  connected: boolean;
  address: string;
  balance: number;
  effectiveTH: number;
  rawTH: number;
  warPrice: number;
  burnedWar: number;
  minedSeconds: number;
  onOpenWallet: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connected,
  address,
  balance,
  effectiveTH,
  rawTH,
  warPrice,
  burnedWar,
  minedSeconds,
  onOpenWallet,
  onDisconnect,
}) => {
  return (
    <header className="relative z-20 sticky top-0 backdrop-blur-xl bg-[#0A0A0B]/80 border-b border-white/[0.06]">
      <div className="max-w-[1700px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#FF6A00] flex items-center justify-center font-black text-black text-[16px]">
              W
            </div>
            <div className="leading-none">
              <div className="font-display font-black tracking-[-0.02em] text-[15px] flex items-center gap-2">
                <span>WAR MINING</span>
                <span className="opacity-30 font-medium">//</span>
                <span className="font-semibold opacity-60">ARIES</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/20 text-[10px] font-mono-num text-[#FF6A00]">
                  V2 COMPLETE
                </span>
              </div>
              <div className="font-mono-num text-[10px] tracking-[0.18em] text-zinc-500 mt-[2px]">
                PROOF-OF-WAR PROTOCOL v2.4 • {minedSeconds.toFixed(0)}s mined
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-num text-[11px] text-zinc-400">LIVE</span>
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

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] font-mono-num text-[11px]">
            <div className="w-2 h-2 rounded-full bg-[#FF6A00]" />
            <span className="text-zinc-400">POW</span>
            <span className="text-white font-bold">{effectiveTH.toFixed(0)} TH/s</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{rawTH} raw</span>
          </div>

          {!connected ? (
            <button
              onClick={onOpenWallet}
              className="h-9 px-4 rounded-full bg-white text-black font-display font-bold text-[12px] hover:bg-zinc-100 transition shadow"
            >
              Connect Aries Wallet
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3 h-9 px-3 rounded-full bg-[#1C1C1E] border border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600" />
                <div className="font-mono-num text-[11px] leading-none">
                  <div className="text-zinc-300 font-medium">{address}</div>
                  <div className="text-[10px] text-zinc-500">{formatNumber(balance)} $WAR</div>
                </div>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <div className="font-mono-num text-[11px] text-[#FF6A00] font-bold">
                  {effectiveTH.toFixed(0)} TH
                </div>
              </div>
              <button
                onClick={onDisconnect}
                title="Disconnect"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition"
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
