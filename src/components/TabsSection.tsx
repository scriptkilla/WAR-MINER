import React, { useState } from 'react';
import {
  Miner,
  TxItem,
  Rarity,
  CompletedMissionRecord,
  Mission,
  SolanaWalletAccount,
  UserProfile,
  AppPage,
} from '../types';
import { MARKET_LISTINGS, LAB_UPGRADES_DATA, MISSION_TIER_STYLES } from '../constants';
import { ProfilePage } from './ProfilePage';
import {
  ShoppingBag,
  FlaskConical,
  Target,
  Calculator,
  History,
  Download,
  Search,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Award,
  Calendar,
  Flame,
} from 'lucide-react';

interface TabsSectionProps {
  activeTab: AppPage;
  onChangeTab: (tab: AppPage) => void;
  mining: boolean;
  miners: Miner[];
  avgEfficiency: number;
  history: TxItem[];
  marketRarity: 'All' | Rarity;
  onChangeMarketRarity: (rarity: 'All' | Rarity) => void;
  onBuyMiner: (m: Miner) => void;
  labUpgrades: Record<string, number>;
  onApplyLabUpgrade: (id: 'hash' | 'cool' | 'over' | 'stake') => void;
  calcHashrate: number;
  onChangeCalcHashrate: (val: number) => void;
  calcEfficiency: number;
  onChangeCalcEfficiency: (val: number) => void;
  calcPowerCost: number;
  onChangeCalcPowerCost: (val: number) => void;
  warPrice: number;
  onChangeWarPrice: (val: number) => void;
  halvingDays: number;
  burnedWar: number;
  dailyWarRate: number;
  onExportTaxCSV: () => void;
  onClearHistory: () => void;
  completedMissions: CompletedMissionRecord[];
  missions?: Mission[];
  streak?: number;
  streakBoost?: number;
  onCheckInStreak?: () => void;
  onClaimMission?: (id: string) => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  activeWallet?: SolanaWalletAccount | null;
  wallets?: SolanaWalletAccount[];
  onOpenWalletModal?: (tab?: 'create' | 'import' | 'connect' | 'wallets') => void;
  onAirdropSol?: (walletId: string) => void;
  onSendSolanaTx?: (recipient: string, amount: number, token: 'SOL' | 'WAR') => boolean;
  userClan?: string;
  effectiveTH?: number;
  rawTH?: number;
}

export const TabsSection: React.FC<TabsSectionProps> = ({
  activeTab,
  onChangeTab,
  mining,
  miners,
  avgEfficiency,
  history,
  marketRarity,
  onChangeMarketRarity,
  onBuyMiner,
  labUpgrades,
  onApplyLabUpgrade,
  calcHashrate,
  onChangeCalcHashrate,
  calcEfficiency,
  onChangeCalcEfficiency,
  calcPowerCost,
  onChangeCalcPowerCost,
  warPrice,
  onChangeWarPrice,
  halvingDays,
  burnedWar,
  dailyWarRate,
  onExportTaxCSV,
  onClearHistory,
  completedMissions,
  missions = [],
  streak = 5,
  streakBoost = 0.1,
  onCheckInStreak = () => {},
  onClaimMission,
  userProfile,
  onUpdateProfile = () => {},
  activeWallet = null,
  wallets = [],
  onOpenWalletModal = () => {},
  onAirdropSol = () => {},
  onSendSolanaTx = () => false,
  userClan = 'alpha',
  effectiveTH = 0,
  rawTH = 0,
}) => {
  // Market filter
  const filteredListings =
    marketRarity === 'All'
      ? MARKET_LISTINGS
      : MARKET_LISTINGS.filter((m) => m.rarity === marketRarity);

  // ROI Calculator Math
  const calcDailyWar = calcHashrate * 0.078 * (28 / Math.max(14, calcEfficiency));
  const calcDailyNetUsd =
    calcDailyWar * warPrice - ((calcHashrate * calcEfficiency * 24) / 1000) * calcPowerCost;
  const calcMonthlyNetUsd = calcDailyNetUsd * 30;
  const calcYearlyNetUsd = calcDailyNetUsd * 365;
  const estHardwareCostUsd = calcHashrate * 4.2 * warPrice;
  const paybackDays = calcDailyNetUsd > 0 ? estHardwareCostUsd / calcDailyNetUsd : 999;

  // Completed Missions View State
  const [missionCategoryFilter, setMissionCategoryFilter] = useState<string>('All');
  const [missionSearchQuery, setMissionSearchQuery] = useState<string>('');
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  const totalClaimedMissionRewards = completedMissions.reduce((acc, m) => acc + m.reward, 0);

  const filteredCompletedMissions = completedMissions.filter((item) => {
    const matchesCategory =
      missionCategoryFilter === 'All' || item.tier === missionCategoryFilter;
    const query = missionSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.txHash.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedTxHash(txHash);
    setTimeout(() => setCopiedTxHash(null), 2000);
  };

  const handleExportMissionsCSV = () => {
    const csvContent =
      'id,missionId,title,desc,reward_war,claimedAt,txHash,tier\n' +
      completedMissions
        .map(
          (m) =>
            `"${m.id}","${m.missionId}","${m.title.replace(/"/g, '""')}","${m.desc.replace(
              /"/g,
              '""'
            )}",${m.reward},"${m.claimedAt}","${m.txHash}","${m.tier}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed_missions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1. DEDICATED MARKETPLACE PAGE
  if (activeTab === 'market') {
    return (
      <div className="card rounded-[24px] p-6 inner-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white tracking-wide">
                  WAR MINER MARKETPLACE
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono-num text-[10px]">
                  PEER-TO-PEER TRADING
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Acquire verified ASIC & Quantum mining rigs directly on Solana Aries PoW.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(['All', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map((rarity) => (
              <button
                key={rarity}
                type="button"
                onClick={() => onChangeMarketRarity(rarity)}
                className={`h-8 px-3 rounded-full font-mono-num text-[11px] font-bold border transition cursor-pointer ${
                  marketRarity === rarity
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-[16px] bg-[#121214] border border-white/10 hover:border-white/20 p-3 transition flex flex-col justify-between"
            >
              <div>
                <div
                  className={`h-[96px] rounded-[12px] bg-gradient-to-br ${listing.color} relative overflow-hidden shadow-inner`}
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)',
                    }}
                  />
                  <div className="absolute bottom-2 left-2 font-mono-num text-[11px] text-white font-bold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {listing.th} TH/s
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono-num text-white">
                    {listing.rarity}
                  </div>
                </div>

                <div className="mt-2.5 flex justify-between items-baseline font-mono-num text-[11px]">
                  <span className="text-white font-bold truncate">{listing.name}</span>
                  <span className="text-[#FF6A00] font-bold">{(listing.th * 4.2).toFixed(0)} WAR</span>
                </div>

                <div className="font-mono-num text-[10px] text-zinc-400 mt-1 flex justify-between">
                  <span>{listing.wth} W/TH</span>
                  <span>{listing.maintenance} WAR/d</span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => onBuyMiner(listing)}
                  className="w-full h-8 rounded-full bg-white text-black font-display font-bold text-[11px] hover:bg-zinc-200 transition cursor-pointer shadow"
                >
                  Buy Rig • ${(listing.th * 4.2 * warPrice).toFixed(1)}
                </button>
                <a
                  href={`https://explorer.solana.com/tx/${listing.id}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center font-mono-num text-[9.5px] text-zinc-500 hover:text-[#FF6A00] transition"
                >
                  View Solscan ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. DEDICATED UPGRADES LAB PAGE
  if (activeTab === 'upgrades') {
    return (
      <div className="card rounded-[24px] p-6 inner-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white tracking-wide">
                  CYBERNETIC UPGRADES LAB
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono-num text-[10px] font-bold">
                  R&D RESEARCH BAY
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Research hardware enhancements to boost hashrates, reduce cooling power draw, and optimize maintenance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAB_UPGRADES_DATA.map((upg) => {
            const count = labUpgrades[upg.id] || 0;
            const cost = Math.round(upg.baseCost * Math.pow(1.35, count));

            return (
              <div
                key={upg.id}
                className="rounded-[18px] bg-[#121214] border border-white/10 hover:border-purple-500/30 p-5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <div className="w-11 h-11 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-[20px]">
                      {upg.icon}
                    </div>
                    <div className="font-mono-num text-[10.5px] px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                      TIER {count}
                    </div>
                  </div>

                  <div className="font-display font-bold text-[15px] mt-4 text-white">
                    {upg.name}
                  </div>
                  <div className="font-mono-num text-[11px] text-zinc-400 mt-1.5 leading-[1.5]">
                    {upg.desc}
                  </div>
                  <div className="mt-3 font-mono-num text-[11px] text-[#14F195] font-bold">
                    {upg.effect} • Scaling 1.35x
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-num text-[13px] text-[#FF6A00] font-bold">
                      {cost} WAR
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyLabUpgrade(upg.id)}
                      className="h-8 px-4 rounded-full bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white font-display font-bold text-[11px] hover:opacity-90 transition cursor-pointer shadow"
                    >
                      Research Upgrade
                    </button>
                  </div>

                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-[#14F195] transition-all"
                      style={{ width: `${Math.min(100, count * 12)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. DEDICATED MISSIONS & QUESTS PAGE
  if (activeTab === 'missions') {
    return (
      <div className="space-y-6">
        {/* Top Active Protocol Missions */}
        <div className="card rounded-[24px] p-6 inner-shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5 text-[#14F195]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg text-white tracking-wide">
                    MISSIONS & PROTOCOL QUESTS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono-num text-[10px] font-bold">
                    DAILY OBJECTIVES
                  </span>
                </div>
                <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                  Complete active operational mining objectives, earn verified $WAR rewards, and review your audit record.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono-num text-[11px]">
              <span className="text-zinc-400">STREAK:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span>🔥</span>
                <span>{streak} DAYS (+{(streakBoost * 100).toFixed(0)}%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {missions.map((m) => {
              const pct = Math.min(100, (m.progress / m.target) * 100);
              const tierInfo = MISSION_TIER_STYLES[m.tier] || MISSION_TIER_STYLES.Common;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-[16px] bg-[#121214] border transition flex flex-col justify-between ${
                    m.claimed
                      ? 'border-white/5 opacity-60'
                      : pct >= 100
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono-num font-bold ${tierInfo.badge}`}>
                        {tierInfo.icon} {m.tier.toUpperCase()} • {m.multiplier}
                      </span>
                      <span className="font-mono-num text-[11px] text-[#FF6A00] font-bold">
                        +{m.reward} WAR
                      </span>
                    </div>

                    <div className="font-display font-bold text-[14px] text-white mt-3">
                      {m.title}
                    </div>
                    <div className="font-mono-num text-[11px] text-zinc-400 mt-1">
                      {m.desc}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex justify-between font-mono-num text-[10px] text-zinc-400">
                      <span>{pct.toFixed(0)}% PROGRESS</span>
                      <span>
                        {m.progress.toFixed(0)} / {m.target}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-[#14F195]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="pt-1">
                      {m.claimed ? (
                        <div className="text-center font-mono-num text-[11px] text-emerald-400 font-bold py-1">
                          ✓ REWARD CLAIMED
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={m.progress < m.target || !onClaimMission}
                          onClick={() => onClaimMission && onClaimMission(m.id)}
                          className="w-full h-8 rounded-full bg-white text-black font-display font-bold text-[11px] hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer shadow"
                        >
                          {m.progress >= m.target ? 'Claim Reward' : 'In Progress...'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Missions History Table */}
        <div className="card rounded-[24px] p-6 inner-shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-base text-white tracking-wide">
                  VERIFIED COMPLETED MISSIONS AUDIT LEDGER
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono-num text-[10px] font-bold">
                  {completedMissions.length} COMPLETED
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Immutable cryptographic ledger of claimed mission payouts verified on Solana.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMissionsCSV}
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-mono-num text-[11px] text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Legendary', 'Rare', 'Common'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMissionCategoryFilter(cat)}
                  className={`h-7 px-3 rounded-full font-mono-num text-[10px] font-bold border transition cursor-pointer ${
                    missionCategoryFilter === cat
                      ? 'bg-purple-600 text-white border-transparent'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={missionSearchQuery}
                onChange={(e) => setMissionSearchQuery(e.target.value)}
                placeholder="Search missions or tx..."
                className="w-full bg-[#121216] border border-white/10 rounded-[10px] pl-8 pr-3 py-1.5 font-mono-num text-[11px] text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="rounded-[16px] border border-white/[0.08] overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_140px_100px] gap-3 px-4 py-2.5 bg-black/50 font-mono-num text-[10.5px] text-zinc-400 tracking-wider">
              <span>MISSION OBJECTIVE</span>
              <span>DATE</span>
              <span>REWARD</span>
              <span className="text-right">TX PROOF</span>
            </div>

            <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-auto">
              {filteredCompletedMissions.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_120px_140px_100px] gap-3 px-4 py-3 font-mono-num text-[11.5px] hover:bg-white/[0.02] items-center"
                >
                  <div>
                    <div className="font-display font-bold text-white text-[13px]">{item.title}</div>
                    <div className="text-[10.5px] text-zinc-400">{item.desc}</div>
                  </div>
                  <div className="text-zinc-400 text-[11px]">{item.claimedAt}</div>
                  <div className="text-[#FF6A00] font-bold text-[13px]">
                    +{item.reward} $WAR
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleCopyTx(item.txHash)}
                      className="text-purple-400 hover:text-purple-300 text-[10.5px] font-mono-num inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedTxHash === item.txHash ? (
                        <span className="text-emerald-400">Copied!</span>
                      ) : (
                        <span>{item.txHash.slice(0, 8)}...</span>
                      )}
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. DEDICATED ROI CALCULATOR PAGE
  if (activeTab === 'calculator') {
    return (
      <div className="card rounded-[24px] p-6 inner-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white tracking-wide">
                  MINING ROI & PROFITABILITY CALCULATOR
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono-num text-[10px] font-bold">
                  ECONOMIC SIMULATOR
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Simulate hashrate, electrical consumption, and token valuation to project net daily, monthly, and annual returns.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[380px_1fr] gap-6">
          <div className="rounded-[18px] bg-[#121214] border border-white/10 p-5 space-y-4">
            <div>
              <div className="font-mono-num text-[11px] text-zinc-400 font-bold">
                SIMULATED HASHRATE (TH/s)
              </div>
              <input
                type="range"
                min={10}
                max={5000}
                value={calcHashrate}
                onChange={(e) => onChangeCalcHashrate(parseInt(e.target.value))}
                className="w-full accent-[#FF6A00] mt-2 cursor-pointer"
              />
              <div className="flex justify-between font-mono-num text-[12px] text-white mt-1">
                <span className="font-bold text-[#FF6A00]">{calcHashrate} TH/s</span>
                <span className="text-zinc-500">${(calcHashrate * 4.2).toFixed(0)} est. rig cost</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono-num text-[10px] text-zinc-400 font-bold">EFFICIENCY (W/TH)</div>
                <input
                  type="number"
                  value={calcEfficiency}
                  onChange={(e) => onChangeCalcEfficiency(parseFloat(e.target.value) || 22)}
                  className="mt-1 w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 font-mono-num text-[11px] text-white outline-none focus:border-[#FF6A00]/40"
                />
              </div>
              <div>
                <div className="font-mono-num text-[10px] text-zinc-400 font-bold">POWER ($/kWh)</div>
                <input
                  type="number"
                  step={0.01}
                  value={calcPowerCost}
                  onChange={(e) => onChangeCalcPowerCost(parseFloat(e.target.value) || 0.08)}
                  className="mt-1 w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 font-mono-num text-[11px] text-white outline-none focus:border-[#FF6A00]/40"
                />
              </div>
            </div>

            <div>
              <div className="font-mono-num text-[10px] text-zinc-400 font-bold">WAR TOKEN PRICE ($)</div>
              <input
                type="number"
                step={0.0001}
                value={warPrice}
                onChange={(e) => onChangeWarPrice(parseFloat(e.target.value) || 0.2847)}
                className="mt-1 w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 font-mono-num text-[11px] text-white outline-none focus:border-[#FF6A00]/40"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="rounded-[12px] bg-black/40 border border-white/10 p-3">
                <div className="font-mono-num text-[10px] text-zinc-500 font-bold">DAILY</div>
                <div className="font-mono-num font-bold text-white text-[13px] mt-0.5">
                  {calcDailyWar.toFixed(1)} WAR
                </div>
                <div className="font-mono-num text-[10px] text-emerald-400">
                  ${calcDailyNetUsd.toFixed(2)}
                </div>
              </div>

              <div className="rounded-[12px] bg-black/40 border border-white/10 p-3">
                <div className="font-mono-num text-[10px] text-zinc-500 font-bold">MONTHLY</div>
                <div className="font-mono-num font-bold text-[#FF6A00] text-[13px] mt-0.5">
                  ${calcMonthlyNetUsd.toFixed(0)}
                </div>
                <div className="font-mono-num text-[10px] text-zinc-400">
                  {(calcDailyWar * 30).toFixed(0)} WAR
                </div>
              </div>

              <div className="rounded-[12px] bg-black/40 border border-white/10 p-3">
                <div className="font-mono-num text-[10px] text-zinc-500 font-bold">ANNUAL</div>
                <div className="font-mono-num font-bold text-white text-[13px] mt-0.5">
                  ${calcYearlyNetUsd.toFixed(0)}
                </div>
                <div className="font-mono-num text-[10px] text-emerald-400">
                  {estHardwareCostUsd > 0
                    ? ((calcYearlyNetUsd / estHardwareCostUsd) * 100).toFixed(0)
                    : 0}
                  % APY
                </div>
              </div>
            </div>

            <div className="rounded-[12px] bg-[#FF6A00]/10 border border-[#FF6A00]/20 p-3 font-mono-num text-[11px] text-zinc-300">
              Payback Period:{' '}
              <strong className="text-[#FF6A00]">{paybackDays.toFixed(1)} days</strong> • Estimated Rig Cost{' '}
              <strong>${estHardwareCostUsd.toFixed(0)}</strong>
            </div>
          </div>

          <div className="rounded-[18px] bg-black/40 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="font-mono-num text-[11px] tracking-widest text-zinc-400 font-bold">
                12-MONTH PROJECTION CURVE // SOLANA HALVING IMPACT
              </div>
              <div className="mt-6 h-[200px] flex items-end gap-[4px] px-2">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const heightPercent =
                    25 + Math.sin(idx / 3) * 12 + idx * 2.2 + (idx > 14 ? -8 : 0);
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-[3px] bg-gradient-to-t from-purple-600/30 via-[#FF6A00]/40 to-[#14F195] hover:opacity-100 transition cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                      title={`Month ${(idx / 2.3).toFixed(1)} Yield Matrix`}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between font-mono-num text-[10px] text-zinc-500 px-2">
                <span>TODAY</span>
                <span>HALVING IN {halvingDays} DAYS</span>
                <span>+12M RUNWAY</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 font-mono-num text-[11px]">
              <div className="rounded-[10px] bg-[#121214] p-3 border border-white/5">
                <div className="text-zinc-500 text-[10px]">EST. MONTHLY REVENUE</div>
                <div className="text-white font-bold text-base mt-1">
                  ${(dailyWarRate * warPrice * 30).toFixed(0)}
                </div>
              </div>
              <div className="rounded-[10px] bg-[#121214] p-3 border border-white/5">
                <div className="text-zinc-500 text-[10px]">PROTOCOL UPTIME</div>
                <div className="text-emerald-400 font-bold text-base mt-1">99.98%</div>
              </div>
              <div className="rounded-[10px] bg-[#121214] p-3 border border-white/5">
                <div className="text-zinc-500 text-[10px]">CUMULATIVE BURNED</div>
                <div className="text-[#FF6A00] font-bold text-base mt-1">
                  {Math.floor(burnedWar).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. DEDICATED TRANSACTION HISTORY & TAX ACCOUNTING PAGE
  if (activeTab === 'history') {
    return (
      <div className="card rounded-[24px] p-6 inner-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white tracking-wide">
                  TRANSACTION HISTORY & TAX ACCOUNTING
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono-num text-[10px]">
                  SOLANA AUDIT TRAIL
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Complete audit trail of all vault claims, rig mints, marketplace purchases, and staking operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportTaxCSV}
              className="h-8 px-4 rounded-full bg-white text-black font-display font-bold text-[11px] hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tax CSV</span>
            </button>
            <button
              type="button"
              onClick={onClearHistory}
              className="h-8 px-3 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 font-mono-num text-[11px] text-zinc-400 hover:text-rose-300 transition cursor-pointer"
            >
              Clear History
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="rounded-[16px] border border-white/[0.08] overflow-hidden">
            <div className="grid grid-cols-[100px_100px_110px_1fr_110px] gap-2 px-4 py-2.5 bg-black/50 font-mono-num text-[10px] text-zinc-400 tracking-widest">
              <span>TIME</span>
              <span>TYPE</span>
              <span>AMOUNT</span>
              <span>DESCRIPTION</span>
              <span className="text-right">HASH</span>
            </div>
            <div className="max-h-[460px] overflow-auto divide-y divide-white/[0.04]">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-[100px_100px_110px_1fr_110px] gap-2 px-4 py-3 font-mono-num text-[11.5px] hover:bg-white/[0.02] items-center"
                >
                  <span className="text-zinc-500 text-[10.5px]">{tx.time}</span>
                  <span
                    className={`font-bold ${
                      tx.amount >= 0 ? 'text-emerald-400' : 'text-zinc-300'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span className={tx.amount >= 0 ? 'text-white font-bold' : 'text-zinc-400'}>
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount.toFixed(2)} WAR
                  </span>
                  <span className="text-zinc-300 truncate">{tx.desc}</span>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.hash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 truncate text-right text-[10.5px]"
                  >
                    {tx.hash.slice(0, 8)}...↗
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] bg-[#121214] border border-white/10 p-5 font-mono-num text-[11px] space-y-4">
            <div className="font-display font-bold text-[14px] text-white">TAX ACCOUNTING SUMMARY</div>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Earned</span>
                <span className="text-white font-bold">
                  {history
                    .filter((tx) => tx.amount > 0)
                    .reduce((acc, tx) => acc + tx.amount, 0)
                    .toFixed(2)}{' '}
                  WAR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Spent</span>
                <span className="text-white font-bold">
                  {Math.abs(
                    history
                      .filter((tx) => tx.amount < 0)
                      .reduce((acc, tx) => acc + tx.amount, 0)
                  ).toFixed(2)}{' '}
                  WAR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Burned Protocol Fees (5%)</span>
                <span className="text-[#FF6A00] font-bold">
                  {(
                    history
                      .filter((tx) => tx.amount < 0)
                      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0) * 0.05
                  ).toFixed(2)}{' '}
                  WAR
                </span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-zinc-200">Net Balance Impact</span>
                <span className="text-emerald-400">
                  {history.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)} WAR
                </span>
              </div>
            </div>

            <div className="rounded-[12px] bg-black/40 border border-white/[0.06] p-3 text-[10px] text-zinc-400 leading-[1.5]">
              Exported CSV formatted for standard crypto tax platforms (CoinTracker, Koinly, TokenTax).
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. DEDICATED PROFILE, REFERRALS, OR SETTINGS PAGES
  if (activeTab === 'profile' || activeTab === 'referrals' || activeTab === 'settings') {
    const viewMapping: Record<'profile' | 'referrals' | 'settings', 'overview' | 'referrals' | 'settings'> = {
      profile: 'overview',
      referrals: 'referrals',
      settings: 'settings',
    };

    return userProfile ? (
      <ProfilePage
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
        activeWallet={activeWallet}
        wallets={wallets}
        onOpenWalletModal={onOpenWalletModal}
        onAirdropSol={onAirdropSol}
        onSendSolanaTx={onSendSolanaTx}
        miners={miners}
        effectiveTH={effectiveTH}
        rawTH={rawTH}
        warPrice={warPrice}
        burnedWar={burnedWar}
        streak={streak}
        streakBoost={streakBoost}
        onCheckInStreak={onCheckInStreak}
        userClan={userClan}
        history={history}
        onClearHistory={onClearHistory}
        initialView={viewMapping[activeTab]}
        onChangeView={(view) => {
          if (view === 'overview') onChangeTab('profile');
          else if (view === 'referrals') onChangeTab('referrals');
          else if (view === 'settings') onChangeTab('settings');
        }}
      />
    ) : null;
  }

  return null;
};
