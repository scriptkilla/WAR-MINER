import React, { useState, useEffect } from 'react';
import { Miner, VeLock } from '../types';

interface MiningConsoleProps {
  mining: boolean;
  onToggleMining: () => void;
  onClaim: () => void;
  effectiveTH: number;
  rawTH: number;
  dailyWarRate: number;
  avgEfficiency: number;
  pendingRewards: number;
  totalBoost: number;
  totalMaintenance: number;
  veDiscountPercent: number;
  autoCompound: boolean;
  onToggleAutoCompound: () => void;
  miners: Miner[];
  veLock: VeLock | null;
  stakeAmount: number;
  onChangeStakeAmount: (amount: number) => void;
  stakeDays: number;
  onChangeStakeDays: (days: number) => void;
  onStake: () => void;
  onUnstake: () => void;
  balance: number;
  lpStaked: boolean;
  onToggleLP: () => void;
  warPrice: number;
  streak?: number;
  streakBoost?: number;
  onCheckInStreak?: () => void;
  veBoost?: number;
  lpBoost?: number;
  clanBoost?: number;
}

export const MiningConsole: React.FC<MiningConsoleProps> = ({
  mining,
  onToggleMining,
  onClaim,
  effectiveTH,
  rawTH,
  dailyWarRate,
  avgEfficiency,
  pendingRewards,
  totalBoost,
  totalMaintenance,
  veDiscountPercent,
  autoCompound,
  onToggleAutoCompound,
  miners,
  veLock,
  stakeAmount,
  onChangeStakeAmount,
  stakeDays,
  onChangeStakeDays,
  onStake,
  onUnstake,
  balance,
  lpStaked,
  onToggleLP,
  warPrice,
  streak = 5,
  streakBoost = 0.10,
  onCheckInStreak,
  veBoost = 0,
  lpBoost = 0,
  clanBoost = 0.05,
}) => {
  const avgCondition = miners.length
    ? miners.reduce((acc, m) => acc + m.condition, 0) / miners.length
    : 100;

  // Real-time micro-fluctuations simulating active ASIC cryptographic hash search
  const [liveJitter, setLiveJitter] = useState(0);
  const [blockCycleProgress, setBlockCycleProgress] = useState(42);

  useEffect(() => {
    if (!mining) {
      setLiveJitter(0);
      return;
    }

    const jitterInterval = setInterval(() => {
      // Subtle micro-entropy fluctuation around current effectiveTH (±1.5%)
      const delta = (Math.random() - 0.48) * Math.min(8, Math.max(1, effectiveTH * 0.015));
      setLiveJitter(delta);
    }, 1100);

    const blockCycleInterval = setInterval(() => {
      setBlockCycleProgress((prev) => (prev >= 100 ? 5 : prev + Math.random() * 14 + 6));
    }, 280);

    return () => {
      clearInterval(jitterInterval);
      clearInterval(blockCycleInterval);
    };
  }, [mining, effectiveTH]);

  const displayedHashrate = Math.max(0, effectiveTH + (mining ? liveJitter : 0));
  const hashrateLoad = Math.min(1.5, displayedHashrate / 1000);

  // Dynamic animation speeds reflecting real-time hashrate updates:
  // Higher TH/s triggers accelerated wave streams (0.35s) and hyper-pulse cycles
  const streamDuration = mining
    ? `${Math.max(0.35, 2.2 - hashrateLoad * 1.35).toFixed(2)}s`
    : '2.8s';
  const pulseSpeed = mining
    ? `${Math.max(0.4, 1.9 - hashrateLoad * 1.1).toFixed(2)}s`
    : '3.0s';
  const sparkColor = displayedHashrate >= 900 ? '#9945FF' : displayedHashrate >= 400 ? '#14F195' : '#FF6A00';

  const hashratePercent = Math.min(100, Math.max(4, (displayedHashrate / 1500) * 100));
  const efficiencyPercent = Math.min(100, Math.max(5, (28 / Math.max(12, avgEfficiency)) * 65));

  const livePerSec =
    effectiveTH *
    0.0000675 *
    (28 / Math.max(10, avgEfficiency)) *
    (1 + totalBoost);

  return (
    <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
      {/* MINING CONSOLE */}
      <div className="card rounded-[20px] p-5 inner-shadow relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF6A00]/[0.08] blur-[50px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-[12px] text-zinc-400 tracking-wide">
              MINING CONSOLE
            </h2>
            <span className="font-mono-num text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold flex items-center gap-1 shadow-sm">
              <span>🔥</span>
              <span>STREAK {streak}D (+{(streakBoost * 100).toFixed(0)}%)</span>
            </span>
          </div>
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono-num font-bold tracking-widest border ${
              mining
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800 border-white/10 text-zinc-500'
            }`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                mining ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            {mining ? 'MINING ACTIVE' : 'STANDBY'}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={onToggleMining}
            className={`relative w-[200px] h-[200px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              mining ? 'amber-glow-strong scale-[1.02]' : 'amber-glow hover:scale-[1.01]'
            }`}
            style={{
              background: mining
                ? 'radial-gradient(60% 60% at 50% 40%, #FF8A33 0%, #FF6A00 45%, #7A3200 100%)'
                : 'radial-gradient(60% 60% at 50% 40%, #2A2A2E 0%, #141416 55%, #0A0A0B 100%)',
              border: `2px solid ${mining ? '#FF8A33' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <div className="absolute inset-[14px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-[28px] rounded-full border border-white/[0.06] border-dashed pointer-events-none" />

            {mining && (
              <>
                <div className="absolute inset-0 rounded-full border border-[#FF6A00]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                <div className="absolute inset-[-10px] rounded-full border border-[#FF6A00]/15 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] pointer-events-none" />
              </>
            )}

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`font-display font-black text-[28px] tracking-[-0.02em] leading-none ${
                  mining ? 'text-black' : 'text-white'
                }`}
              >
                {mining ? 'MINING' : 'MINE'}
              </div>
              <div
                className={`font-mono-num text-[10px] tracking-[0.2em] mt-1 ${
                  mining ? 'text-black/70' : 'text-zinc-500'
                }`}
              >
                {mining ? `${displayedHashrate.toFixed(0)} TH/s` : 'PRESS TO START'}
              </div>

              <div
                className={`mt-3 w-8 h-8 rounded-full flex items-center justify-center ${
                  mining ? 'bg-black/20' : 'bg-white/10'
                }`}
              >
                {!mining ? (
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-[2px]" />
                ) : (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-black/60 rounded-full" />
                    <div className="w-1 h-4 bg-black/60 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* REAL-TIME SOLANA HASHRATE TELEMETRY TRACK */}
          <div
            className={`mt-4 w-full rounded-[14px] bg-[#121215] border p-3 flex flex-col gap-2 transition-all duration-300 ${
              mining ? 'border-emerald-500/30 hashrate-pulse-container' : 'border-white/10'
            }`}
            style={{
              '--hashrate-stream-duration': streamDuration,
              '--hashrate-pulse-speed': pulseSpeed,
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between text-[11px] font-mono-num">
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${mining ? 'bg-[#14F195] animate-ping' : 'bg-zinc-600'}`} />
                <span className={mining ? 'text-[#14F195]' : 'text-zinc-400'}>
                  {mining ? 'SOLANA CLUSTER MINING ACTIVE' : 'CLUSTER TELEMETRY STANDBY'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {mining && (
                  <div
                    className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded bg-black/40 border border-white/10"
                    title="Real-time cryptographic hashrate frequency"
                  >
                    <span
                      className="w-0.5 rounded-full bg-[#14F195] equalizer-bar"
                      style={{ animationDelay: '0s', '--hashrate-pulse-speed': pulseSpeed } as React.CSSProperties}
                    />
                    <span
                      className="w-0.5 rounded-full bg-[#14F195] equalizer-bar"
                      style={{ animationDelay: '0.18s', '--hashrate-pulse-speed': pulseSpeed } as React.CSSProperties}
                    />
                    <span
                      className="w-0.5 rounded-full bg-[#FF8A33] equalizer-bar"
                      style={{ animationDelay: '0.36s', '--hashrate-pulse-speed': pulseSpeed } as React.CSSProperties}
                    />
                    <span
                      className="w-0.5 rounded-full bg-[#9945FF] equalizer-bar"
                      style={{ animationDelay: '0.12s', '--hashrate-pulse-speed': pulseSpeed } as React.CSSProperties}
                    />
                  </div>
                )}
                <div className="text-[10px] text-zinc-400 font-mono-num">
                  {mining ? `${streamDuration} CYCLE` : 'IDLE'}
                </div>
              </div>
            </div>

            {/* Real-time Block Hash Stream Bar */}
            <div className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 hashrate-track-grid">
              <div
                className={`h-full rounded-full relative ${
                  mining ? 'hashrate-bar-animated' : 'hashrate-bar-idle'
                }`}
                style={{
                  width: `${mining ? Math.min(100, Math.max(8, blockCycleProgress)) : 10}%`,
                  background: mining
                    ? 'linear-gradient(90deg, #FF6A00 0%, #FF8A33 30%, #14F195 70%, #9945FF 100%)'
                    : 'rgba(255,255,255,0.15)',
                  '--hashrate-stream-duration': streamDuration,
                  '--hashrate-pulse-speed': pulseSpeed,
                  '--spark-color': sparkColor,
                } as React.CSSProperties}
              >
                {mining && <div className="hashrate-shimmer" />}
                {mining && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white hashrate-spark shadow-[0_0_8px_#14F195]" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-500">
              <span>REAL-TIME: <strong className="text-white">{displayedHashrate.toFixed(1)} TH/s</strong></span>
              <span>EFF: <strong className="text-[#14F195]">{(avgCondition).toFixed(0)}%</strong></span>
              <span>SOL SPEED: <strong className="text-purple-300">{(displayedHashrate * 12.8).toFixed(0)} H/s</strong></span>
            </div>
          </div>

          <div className="mt-3 w-full grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-500 tracking-widest">
                  <span>HASHRATE EFF</span>
                  {mining && <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />}
                </div>
                <div className="font-mono-num font-bold text-[16px] text-white mt-1 flex items-baseline gap-1">
                  <span>{displayedHashrate.toFixed(1)}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">TH/s</span>
                </div>
                <div className="font-mono-num text-[10px] text-zinc-500 mt-0.5">
                  RAW {rawTH} • COND {avgCondition.toFixed(0)}%
                </div>
              </div>

              {/* Dynamic Animated Progress Bar */}
              <div className="mt-2.5 relative">
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden p-[1px] border border-white/10 hashrate-track-grid">
                  <div
                    className={`h-full rounded-full relative ${
                      mining ? 'hashrate-bar-animated' : 'hashrate-bar-idle'
                    }`}
                    style={{
                      width: `${hashratePercent}%`,
                      background: mining
                        ? displayedHashrate >= 900
                          ? 'linear-gradient(90deg, #14F195 0%, #00C2FF 50%, #9945FF 100%)'
                          : 'linear-gradient(90deg, #FF6A00 0%, #FF8A33 35%, #14F195 75%, #9945FF 100%)'
                        : '#FF6A00',
                      '--hashrate-stream-duration': streamDuration,
                      '--hashrate-pulse-speed': pulseSpeed,
                      '--spark-color': sparkColor,
                    } as React.CSSProperties}
                  >
                    {mining && <div className="hashrate-shimmer" />}
                    {mining && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white hashrate-spark shadow-[0_0_6px_#14F195]" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between font-mono-num text-[8px] text-zinc-500 mt-1">
                  <span>0 TH/s</span>
                  <span className="text-zinc-400 font-bold flex items-center gap-1">
                    {mining && <span className="inline-block w-1 h-1 rounded-full bg-[#14F195] animate-ping" />}
                    {hashratePercent.toFixed(0)}% LOAD
                  </span>
                  <span>1.5K TARGET</span>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-500 tracking-widest">
                  <span>DAILY YIELD</span>
                  <span className="text-[9px] text-[#FF6A00] font-mono-num font-bold">WAR/d</span>
                </div>
                <div className="font-mono-num font-bold text-[16px] text-[#FF6A00] mt-1 flex items-baseline gap-1">
                  <span>{(dailyWarRate * (mining ? (1 + (liveJitter / Math.max(1, effectiveTH))) : 1)).toFixed(1)}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">WAR</span>
                </div>
                <div className="font-mono-num text-[10px] text-zinc-500 mt-0.5">
                  ≈ ${(dailyWarRate * warPrice).toFixed(2)}/day • {avgEfficiency.toFixed(1)} W/TH
                </div>
              </div>

              {/* Dynamic Animated Progress Bar */}
              <div className="mt-2.5 relative">
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden p-[1px] border border-white/10 hashrate-track-grid">
                  <div
                    className={`h-full rounded-full relative ${
                      mining ? 'hashrate-bar-animated' : 'hashrate-bar-idle'
                    }`}
                    style={{
                      width: `${efficiencyPercent}%`,
                      background: mining
                        ? 'linear-gradient(90deg, #F59E0B 0%, #FF6A00 50%, #EF4444 100%)'
                        : '#FF6A00',
                      '--hashrate-stream-duration': streamDuration,
                      '--hashrate-pulse-speed': pulseSpeed,
                      '--spark-color': '#FF6A00',
                    } as React.CSSProperties}
                  >
                    {mining && <div className="hashrate-shimmer" />}
                    {mining && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white hashrate-spark shadow-[0_0_6px_#FF6A00]" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between font-mono-num text-[8px] text-zinc-500 mt-1">
                  <span>LOW EFF</span>
                  <span className="text-[#FF6A00] font-bold">{efficiencyPercent.toFixed(0)}% OPTIMAL</span>
                  <span>PEAK EFF</span>
                </div>
              </div>
            </div>
          </div>

          {/* DAILY STREAK MULTIPLIER CARD */}
          <div className="mt-4 w-full rounded-[14px] bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 p-3 flex flex-col gap-2 relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.06)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono-num text-[11px] font-bold text-amber-400">
                <span>🔥</span>
                <span>DAILY STREAK MULTIPLIER</span>
              </div>
              <span className="font-mono-num text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold shadow-sm">
                +{(streakBoost * 100).toFixed(0)}% REWARD BOOST
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-num font-black text-[22px] text-white tracking-tight">
                  {streak}
                </span>
                <span className="font-mono-num text-[11px] text-zinc-300 font-medium">Days Active</span>
                <span className="font-mono-num text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/15">
                  {(1 + streakBoost).toFixed(2)}x Multiplier
                </span>
              </div>

              {onCheckInStreak && (
                <button
                  onClick={onCheckInStreak}
                  className="h-6 px-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-[10px] transition cursor-pointer shadow flex items-center gap-1"
                  title="Check in daily to increase your Proof-of-War multiplier"
                >
                  <span>🔥</span>
                  <span>Check-In +</span>
                </button>
              )}
            </div>

            {/* Streak Progress Towards Next Reward Milestone */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex justify-between font-mono-num text-[9px] text-zinc-400">
                <span>+2.0% reward per active day (applied to all mined WAR)</span>
                <span className="text-amber-400 font-medium">
                  Next: Day {streak + 1} (+{Math.min(50, (streak + 1) * 2)}%)
                </span>
              </div>
              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden p-[0.5px] border border-white/10 relative hashrate-track-grid">
                <div
                  className="h-full rounded-full hashrate-bar-animated relative"
                  style={{
                    width: `${Math.min(100, (streak / 25) * 100)}%`,
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FF6A00 50%, #EF4444 100%)',
                    '--hashrate-stream-duration': streamDuration,
                    '--hashrate-pulse-speed': pulseSpeed,
                  } as React.CSSProperties}
                >
                  <div className="hashrate-shimmer" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 w-full rounded-[12px] bg-[#121214] border border-white/[0.06] p-3 flex flex-col gap-3">
            <div className="flex justify-between font-mono-num text-[11px]">
              <span className="text-zinc-500">
                LIVE EARNINGS • {livePerSec.toFixed(6)} WAR/sec
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  mining ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'
                }`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="font-mono-num font-bold text-[22px] tracking-tight text-white">
                {pendingRewards.toFixed(6)}
              </div>
              <div className="font-mono-num text-[11px] text-zinc-500">$WAR</div>
              <div className="ml-auto flex items-center gap-1 font-mono-num text-[10px]">
                <span className="text-[#FF6A00] font-bold">BOOST +{(totalBoost * 100).toFixed(0)}%</span>
                <span className="text-amber-400 font-medium">(+{ (streakBoost * 100).toFixed(0) }% 🔥)</span>
              </div>
            </div>

            {/* Boost breakdown chips */}
            <div className="flex flex-wrap items-center justify-between text-[9px] font-mono-num text-zinc-500 bg-black/30 p-1.5 rounded-lg border border-white/[0.04]">
              <span className="text-zinc-400 font-medium">MULTIPLIERS:</span>
              <span className="text-amber-400 font-bold">Streak +{(streakBoost * 100).toFixed(0)}% 🔥</span>
              <span>•</span>
              <span className="text-zinc-300">veWAR +{(veBoost * 100).toFixed(0)}%</span>
              <span>•</span>
              <span className="text-zinc-300">LP +{(lpBoost * 100).toFixed(0)}%</span>
              <span>•</span>
              <span className="text-zinc-300">Clan +{(clanBoost * 100).toFixed(0)}%</span>
            </div>

            <div className="h-px bg-white/5" />

            <div className="grid grid-cols-2 gap-3 font-mono-num text-[11px]">
              <div>
                <div className="text-zinc-500">MAINTENANCE</div>
                <div className="text-white mt-1">
                  {totalMaintenance.toFixed(1)} WAR/day • -{veDiscountPercent}% ve
                </div>
              </div>
              <div>
                <div className="text-zinc-500">AUTO-COMPOUND</div>
                <button
                  onClick={onToggleAutoCompound}
                  className={`mt-1 h-6 px-3 rounded-full text-[10px] font-bold border transition ${
                    autoCompound
                      ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  {autoCompound ? 'ON • AUTO-UP' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full grid grid-cols-2 gap-2">
            <button
              onClick={onToggleMining}
              className={`h-11 rounded-full font-display font-bold text-[12px] tracking-wide transition cursor-pointer ${
                mining
                  ? 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
                  : 'bg-[#FF6A00] text-black hover:bg-[#FF7A1A] amber-glow'
              }`}
            >
              {mining ? 'STOP MINING' : 'START MINING'}
            </button>
            <button
              onClick={onClaim}
              className="h-11 rounded-full bg-white text-black font-display font-bold text-[12px] hover:bg-zinc-100 flex items-center justify-center gap-1 cursor-pointer transition"
            >
              CLAIM <span className="font-mono-num text-[11px] opacity-70">{pendingRewards.toFixed(2)}</span>
            </button>
          </div>

          <div className="mt-3 w-full flex flex-wrap items-center justify-center gap-2 font-mono-num text-[10px] text-zinc-500">
            <span className="text-amber-400 font-bold">STREAK +{(streakBoost * 100).toFixed(0)}% 🔥</span>
            <span className="w-1 h-1 bg-zinc-600 rounded-full" />
            <span>MAINT {totalMaintenance.toFixed(1)} WAR/d</span>
            <span className="w-1 h-1 bg-zinc-600 rounded-full" />
            <span>FEE BURN 5%</span>
            <span className="w-1 h-1 bg-zinc-600 rounded-full" />
            <span>VE DISCOUNT {veDiscountPercent}%</span>
          </div>
        </div>
      </div>

      {/* veWAR STAKING */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            veWAR STAKING
          </h3>
          <div className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00]">
            {veLock ? 'LOCKED' : 'IDLE'}
          </div>
        </div>

        {veLock ? (
          <div className="space-y-3">
            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3 font-mono-num text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">STAKED</span>
                <span className="text-white font-bold">{veLock.amount} WAR</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-zinc-500">veWAR</span>
                <span className="text-[#FF6A00] font-bold">{veLock.veAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-zinc-500">APY</span>
                <span className="text-emerald-400 font-bold">{veLock.apy}%</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-zinc-500">UNLOCK IN</span>
                <span className="text-white">
                  {Math.max(0, Math.floor((veLock.expiry - Date.now()) / 86400000))}d{' '}
                  {Math.max(0, Math.floor(((veLock.expiry - Date.now()) % 86400000) / 3600000))}h
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A00]"
                  style={{
                    width: `${Math.max(
                      0,
                      100 - ((veLock.expiry - Date.now()) / (veLock.lockDays * 86400000)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono-num text-[10px]">
              <div className="rounded-[10px] bg-[#FF6A00]/10 border border-[#FF6A00]/20 p-2">
                <div className="text-zinc-500">DISCOUNT</div>
                <div className="text-[#FF6A00] font-bold text-[13px]">
                  -{veDiscountPercent}% MAINT
                </div>
              </div>
              <div className="rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 p-2">
                <div className="text-zinc-500">BOOST</div>
                <div className="text-emerald-400 font-bold text-[13px]">
                  +{veLock.lockDays >= 365 ? '40' : veLock.lockDays >= 90 ? '25' : veLock.lockDays >= 30 ? '15' : '5'}% YIELD
                </div>
              </div>
            </div>

            <button
              onClick={onUnstake}
              className="w-full h-9 rounded-full bg-white/5 border border-white/10 font-bold text-[11px] hover:bg-white/10 transition cursor-pointer text-zinc-300"
            >
              Unstake {Date.now() >= veLock.expiry ? '' : ' (locked)'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="font-mono-num text-[11px] text-zinc-500">AMOUNT WAR</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => onChangeStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 h-9 rounded-full bg-black/50 border border-white/10 px-4 font-mono-num text-[12px] text-white outline-none focus:border-[#FF6A00]/40"
              />
              <button
                onClick={() => onChangeStakeAmount(Math.floor(balance))}
                className="h-9 px-3 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold hover:bg-white/20 transition cursor-pointer"
              >
                MAX
              </button>
            </div>

            <div className="font-mono-num text-[11px] text-zinc-500">LOCK DURATION</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { d: 7, label: '1W', mult: '0.25x', disc: '5%' },
                { d: 30, label: '1M', mult: '1x', disc: '15%' },
                { d: 90, label: '3M', mult: '2x', disc: '25%' },
                { d: 365, label: '1Y', mult: '4x', disc: '40%' },
              ].map((opt) => (
                <button
                  key={opt.d}
                  onClick={() => onChangeStakeDays(opt.d)}
                  className={`rounded-[12px] border p-2 font-mono-num text-[10px] transition cursor-pointer ${
                    stakeDays === opt.d
                      ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-bold'
                      : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[9px] opacity-70">{opt.mult}</div>
                  <div className="text-[9px]">{opt.disc}</div>
                </button>
              ))}
            </div>

            <div className="rounded-[10px] bg-[#121214] border border-white/[0.06] p-3 font-mono-num text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">You receive</span>
                <span className="text-white font-bold">
                  {(
                    stakeAmount *
                    (stakeDays >= 365 ? 4 : stakeDays >= 90 ? 2 : stakeDays >= 30 ? 1 : 0.25)
                  ).toFixed(0)}{' '}
                  veWAR
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-zinc-500">APY</span>
                <span className="text-emerald-400">
                  {stakeDays >= 365 ? 84 : stakeDays >= 90 ? 54 : stakeDays >= 30 ? 32 : 18}%
                </span>
              </div>
            </div>

            <button
              onClick={onStake}
              className="w-full h-10 rounded-full bg-[#FF6A00] text-black font-display font-bold text-[12px] hover:bg-[#FF7A1A] transition cursor-pointer"
            >
              Stake {stakeAmount} WAR
            </button>
          </div>
        )}
      </div>

      {/* LIQUIDITY MINING */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display font-bold text-[12px] text-zinc-400">LIQUIDITY MINING</h3>
          <div className="font-mono-num text-[10px] text-emerald-400 font-bold">APR 84%</div>
        </div>

        <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3">
          <div className="font-mono-num text-[11px] flex justify-between">
            <span className="text-zinc-500">WAR/USDC POOL</span>
            <span className="text-white font-medium">TVL $1.24M</span>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="flex-1 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center px-3 font-mono-num text-[11px] text-zinc-300">
              +5% TH/s bonus if staked
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 font-mono-num text-[10px]">
            <div className="rounded-[8px] bg-[#121214] p-2">
              <div className="text-zinc-500">YOUR LP</div>
              <div className="text-white font-bold">{lpStaked ? '1,240 LP' : '0 LP'}</div>
            </div>
            <div className="rounded-[8px] bg-[#121214] p-2">
              <div className="text-zinc-500">REWARDS</div>
              <div className="text-[#FF6A00] font-bold">{lpStaked ? '12.4 WAR/d' : '—'}</div>
            </div>
          </div>

          <button
            onClick={onToggleLP}
            className={`w-full mt-3 h-9 rounded-full font-bold text-[11px] transition cursor-pointer ${
              lpStaked
                ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            {lpStaked ? 'Unstake LP' : 'Add WAR/USDC + Stake'}
          </button>
        </div>
      </div>
    </div>
  );
};
