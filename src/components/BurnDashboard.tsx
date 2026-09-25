import React from 'react';
import { TOKENOMICS_DATA, BURN_SOURCES_DATA, CLANS_DATA, polarToCartesian } from '../constants';

interface BurnDashboardProps {
  burnedWar: number;
  dayBurned: number;
  halvingDays: number;
  leaderboardTab: 'hash' | 'burn' | 'clan';
  onChangeLeaderboardTab: (tab: 'hash' | 'burn' | 'clan') => void;
  rawTH: number;
  dailyWarRate: number;
  userClan: string;
  referralCode: string;
  onCopyRef: () => void;
}

export const BurnDashboard: React.FC<BurnDashboardProps> = ({
  burnedWar,
  dayBurned,
  halvingDays,
  leaderboardTab,
  onChangeLeaderboardTab,
  rawTH,
  dailyWarRate,
  userClan,
  referralCode,
  onCopyRef,
}) => {
  // Donut chart calculations for Burn Sources
  const burnSegs = BURN_SOURCES_DATA.reduce(
    (acc, cur) => {
      const start = acc.next;
      const end = start + cur.value * 3.6;
      acc.segs.push({ ...cur, start, end });
      acc.next = end;
      return acc;
    },
    { next: 0, segs: [] as any[] }
  ).segs;

  // Donut chart calculations for Tokenomics
  const tokenomicsSegs = TOKENOMICS_DATA.reduce(
    (acc, cur) => {
      const start = acc.next;
      const end = start + cur.value * 3.6;
      acc.segs.push({ ...cur, start, end });
      acc.next = end;
      return acc;
    },
    { next: 0, segs: [] as any[] }
  ).segs;

  const currentClanName = CLANS_DATA.find((c) => c.id === userClan)?.name || 'Alpha Legion';

  const leaderboardList =
    leaderboardTab === 'hash'
      ? [
          { rank: 1, name: '0xAri...9f2a', th: 12420, war: '1,240' },
          { rank: 2, name: '0xAri...3c1e', th: 9840, war: '892' },
          { rank: 3, name: '0xAri...7b44', th: 7210, war: '654' },
          { rank: 4, name: 'You', th: rawTH, war: dailyWarRate.toFixed(0), you: true },
          { rank: 5, name: '0xAri...a2d9', th: 620, war: '54' },
        ]
      : leaderboardTab === 'burn'
      ? [
          { rank: 1, name: '0xBurn...aa11', th: 54200, war: '5.4k' },
          { rank: 2, name: '0xBurn...bb22', th: 32100, war: '3.2k' },
          { rank: 3, name: '0xAri...7b44', th: 18200, war: '1.8k' },
          { rank: 4, name: 'You', th: Math.floor(burnedWar / 1000), war: (burnedWar / 10000).toFixed(1), you: true },
          { rank: 5, name: '0xAri...cc33', th: 4200, war: '420' },
        ]
      : [
          { rank: 1, name: 'Reaper Unit', th: 59400, war: '50k pot' },
          { rank: 2, name: 'Alpha Legion', th: 48200, war: '35k' },
          { rank: 3, name: 'Ghost Division', th: 42300, war: '20k' },
          { rank: 4, name: 'Bravo Squad', th: 36100, war: '10k' },
          { rank: 5, name: `You • ${currentClanName}`, th: rawTH, war: 'clan', you: true },
        ];

  return (
    <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
      {/* BURN DASHBOARD */}
      <div className="card rounded-[20px] p-5 inner-shadow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6A00]/[0.12] blur-[30px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            BURN DASHBOARD
          </h3>
          <div className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            🔥 LIVE
          </div>
        </div>

        <div className="text-center">
          <div className="font-mono-num font-black text-[28px] tracking-tight text-white">
            {Math.floor(burnedWar).toLocaleString()}
          </div>
          <div className="font-mono-num text-[11px] tracking-widest text-zinc-500">
            TOTAL WAR BURNED
          </div>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 font-mono-num text-[11px]">
            <span className="text-zinc-500">24h</span>
            <span className="text-[#FF6A00] font-bold">+{dayBurned.toFixed(1)} WAR</span>
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3">
            <div className="font-mono-num text-[10px] text-zinc-500 tracking-widest">
              HALVING IN
            </div>
            <div className="font-mono-num font-bold text-white mt-1 text-[18px]">
              {halvingDays}d
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6A00]"
                style={{ width: `${((730 - halvingDays) / 730) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3">
            <div className="font-mono-num text-[10px] text-zinc-500 tracking-widest">
              NEXT REWARD
            </div>
            <div className="font-mono-num font-bold text-[#FF6A00] mt-1">-50% EMISSION</div>
            <div className="font-mono-num text-[10px] text-zinc-500 mt-1">Target 100M burn</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-mono-num text-[10px] tracking-widest text-zinc-500 mb-2">
            BURN SOURCES
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-[88px] h-[88px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {burnSegs.map((seg: any) => {
                  const p1 = polarToCartesian(50, 50, 32, seg.start);
                  const p2 = polarToCartesian(50, 50, 32, seg.end);
                  const large = seg.value * 3.6 > 180 ? 1 : 0;
                  return (
                    <path
                      key={seg.label}
                      d={`M ${p1.x} ${p1.y} A 32 32 0 ${large} 1 ${p2.x} ${p2.y}`}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono-num font-bold text-[12px] text-white">
                100%
              </div>
            </div>

            <div className="flex-1 space-y-1.5">
              {BURN_SOURCES_DATA.map((item) => (
                <div key={item.label} className="flex justify-between font-mono-num text-[11px]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-zinc-400">{item.label}</span>
                  </span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOKENOMICS */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            TOKENOMICS
          </h3>
          <div className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00]">
            PROOF-OF-WAR
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-[96px] h-[96px] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {tokenomicsSegs.map((seg: any) => {
                const p1 = polarToCartesian(50, 50, 30, seg.start);
                const p2 = polarToCartesian(50, 50, 30, seg.end);
                const large = seg.value * 3.6 > 180 ? 1 : 0;
                return (
                  <path
                    key={seg.label}
                    d={`M ${p1.x} ${p1.y} A 30 30 0 ${large} 1 ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono-num font-bold text-[13px] text-white">1B</div>
              <div className="font-mono-num text-[8px] text-zinc-500 tracking-widest">SUPPLY</div>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {TOKENOMICS_DATA.map((item) => (
              <div key={item.label} className="flex justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="font-mono-num text-[11px] text-zinc-400 truncate">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono-num text-[11px] text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            GLOBAL LEADERBOARD
          </h3>
          <div className="flex gap-1">
            {(['hash', 'burn', 'clan'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onChangeLeaderboardTab(tab)}
                className={`h-6 px-2 rounded-full font-mono-num text-[10px] font-bold border transition cursor-pointer ${
                  leaderboardTab === tab
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {leaderboardList.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between rounded-full px-3 py-2 border ${
                entry.you
                  ? 'bg-[#FF6A00]/10 border-[#FF6A00]/30'
                  : 'bg-black/30 border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono-num text-[11px] font-bold ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-black'
                      : entry.rank === 2
                      ? 'bg-zinc-300 text-black'
                      : entry.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {entry.rank}
                </div>
                <span
                  className={`font-mono-num text-[11px] ${
                    entry.you ? 'text-[#FF6A00] font-bold' : 'text-zinc-300'
                  }`}
                >
                  {entry.name}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono-num text-[11px]">
                <span className="text-white">
                  {entry.th.toLocaleString()}{' '}
                  {leaderboardTab === 'hash' ? 'TH' : leaderboardTab === 'burn' ? 'burn' : 'TH'}
                </span>
                <span className="text-zinc-500">{entry.war}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REFERRAL SYSTEM */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            REFERRAL // WAR BONUS
          </h3>
          <span className="font-mono-num text-[10px] text-emerald-400">+5% TH 7d</span>
        </div>

        <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3 font-mono-num text-[11px]">
          <div className="text-zinc-500">YOUR LINK</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex-1 truncate text-white font-bold">
              war.mining/aries?ref={referralCode}
            </span>
            <button
              onClick={onCopyRef}
              className="h-7 px-3 rounded-full bg-white text-black font-bold text-[11px] hover:bg-zinc-200 transition cursor-pointer"
            >
              Copy
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-white font-bold text-[14px]">3</div>
              <div className="text-zinc-500 text-[10px]">INVITES</div>
            </div>
            <div>
              <div className="text-[#FF6A00] font-bold text-[14px]">840</div>
              <div className="text-zinc-500 text-[10px]">WAR EARNED</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-[14px]">+5%</div>
              <div className="text-zinc-500 text-[10px]">BONUS ACTIVE</div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-zinc-500 leading-[1.4]">
            Both you and invitee get +5% TH/s for 7 days. Bonus stacks up to 25%.
          </div>
        </div>
      </div>
    </div>
  );
};
