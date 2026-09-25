import React from 'react';
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
}) => {
  const avgCondition = miners.length
    ? miners.reduce((acc, m) => acc + m.condition, 0) / miners.length
    : 100;

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
          <h2 className="font-display font-bold text-[12px] text-zinc-400 tracking-wide">
            MINING CONSOLE
          </h2>
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
                {mining ? `${effectiveTH.toFixed(0)} TH/s` : 'PRESS TO START'}
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

          <div className="mt-6 w-full grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3">
              <div className="font-mono-num text-[10px] text-zinc-500 tracking-widest">
                HASHRATE EFF
              </div>
              <div className="font-mono-num font-bold text-[15px] text-white mt-1">
                {effectiveTH.toFixed(0)}{' '}
                <span className="text-[11px] text-zinc-500 font-normal">TH/s</span>
              </div>
              <div className="font-mono-num text-[10px] text-zinc-500 mt-1">
                RAW {rawTH} • COND AVG {avgCondition.toFixed(0)}%
              </div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A00]"
                  style={{ width: `${Math.min(100, (effectiveTH / 2000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3">
              <div className="font-mono-num text-[10px] text-zinc-500 tracking-widest">
                DAILY YIELD
              </div>
              <div className="font-mono-num font-bold text-[15px] text-[#FF6A00] mt-1">
                {dailyWarRate.toFixed(1)}{' '}
                <span className="text-[11px] text-zinc-500 font-normal">WAR</span>
              </div>
              <div className="font-mono-num text-[10px] text-zinc-500 mt-1">
                ≈ ${(dailyWarRate * warPrice).toFixed(2)}/day • EFF {avgEfficiency.toFixed(1)} W/TH
              </div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A00]"
                  style={{ width: `${(28 / Math.max(14, avgEfficiency)) * 50}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 w-full rounded-[12px] bg-[#121214] border border-white/[0.06] p-3 flex flex-col gap-3">
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
              <div className="ml-auto font-mono-num text-[10px] text-[#FF6A00]">
                BOOST +{(totalBoost * 100).toFixed(0)}%
              </div>
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
