import React from 'react';
import { Miner, LootChest, Mission, Clan } from '../types';
import { RARITY_STYLES, CHESTS_DATA, CLANS_DATA } from '../constants';

interface MinerFleetProps {
  miners: Miner[];
  mining: boolean;
  effectiveTH: number;
  avgEfficiency: number;
  dailyWarRate: number;
  totalBoost: number;
  mergeMode: boolean;
  mergeSelected: number[];
  onToggleMergeMode: () => void;
  onSelectForMerge: (id: number) => void;
  onExecuteMerge: () => void;
  onMint: (cost?: number) => void;
  onUpgradeMiner: (id: number) => void;
  onRepairMiner: (id: number) => void;
  onSellMiner: (id: number) => void;
  onPayMaintenance: (id: number) => void;
  openingBox: string | null;
  onOpenLootbox: (id: string) => void;
  missions: Mission[];
  streak: number;
  onClaimMission: (id: string) => void;
  userClan: string;
  onJoinClan: (id: string) => void;
  clanWarTimer: number;
}

export const MinerFleet: React.FC<MinerFleetProps> = ({
  miners,
  mining,
  effectiveTH,
  avgEfficiency,
  dailyWarRate,
  totalBoost,
  mergeMode,
  mergeSelected,
  onToggleMergeMode,
  onSelectForMerge,
  onExecuteMerge,
  onMint,
  onUpgradeMiner,
  onRepairMiner,
  onSellMiner,
  onPayMaintenance,
  openingBox,
  onOpenLootbox,
  missions,
  streak,
  onClaimMission,
  userClan,
  onJoinClan,
  clanWarTimer,
}) => {
  return (
    <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
      {/* Header controls for Fleet */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-bold text-[13px] flex items-center gap-3">
          <span className="text-zinc-100">War Miners Fleet</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 font-mono-num text-[11px] text-zinc-400">
            {miners.length}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 font-mono-num text-[10px] text-zinc-500">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {effectiveTH.toFixed(0)} TH/s EFF • {miners.filter((m) => m.status === 'OFFLINE').length} OFFLINE
          </span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMergeMode}
            className={`h-8 px-3 rounded-full font-display font-bold text-[11px] border transition cursor-pointer ${
              mergeMode
                ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
          >
            {mergeMode ? `MERGE MODE (${mergeSelected.length}/2)` : 'MERGE MODE'}
          </button>

          {mergeMode && (
            <button
              onClick={onExecuteMerge}
              className="h-8 px-3 rounded-full bg-white text-black font-bold text-[11px] cursor-pointer hover:bg-zinc-200 transition"
            >
              Confirm Merge
            </button>
          )}

          <button
            onClick={() => onMint()}
            className="h-8 px-3 rounded-full bg-white text-black font-display font-bold text-[11px] hover:bg-zinc-100 flex items-center gap-1 transition cursor-pointer"
          >
            <span className="text-[14px] leading-none">+</span> MINT 1200 WAR
          </button>
        </div>
      </div>

      {/* Fleet Stats Banner */}
      <div className="card rounded-[14px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono-num text-[11px]">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-zinc-500">FLEET POWER</span>{' '}
            <span className="text-white ml-2 font-bold">{effectiveTH.toFixed(0)} TH/s</span>
          </div>
          <div>
            <span className="text-zinc-500">AVG EFF</span>{' '}
            <span className="text-white ml-2">{avgEfficiency.toFixed(1)} W/TH</span>
          </div>
          <div>
            <span className="text-zinc-500">DAILY</span>{' '}
            <span className="text-[#FF6A00] ml-2 font-bold">+{dailyWarRate.toFixed(1)} WAR</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">BOOST</span>
          <span className="text-emerald-400 font-bold">+{(totalBoost * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Miners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {miners.map((miner) => {
          const isSelected = mergeMode && mergeSelected.includes(miner.id);
          const rarityConfig = RARITY_STYLES[miner.rarity];
          const upgradeCost = 250 * miner.level;
          const repairCost = Math.round((100 - miner.condition) * 0.8);
          const maintCost = Number((miner.maintenance * 3).toFixed(1));

          return (
            <div
              key={miner.id}
              onClick={() => onSelectForMerge(miner.id)}
              className={`group card card-hover rounded-[18px] overflow-hidden inner-shadow transition-all duration-200 border cursor-pointer ${
                rarityConfig.border
              } ${isSelected ? '!border-[#FF6A00] ring-1 ring-[#FF6A00]/30' : ''} ${
                miner.status === 'OFFLINE' ? 'opacity-60 grayscale-[0.3]' : ''
              }`}
            >
              {/* Miner Visual Banner */}
              <div className={`relative h-[148px] bg-gradient-to-br ${miner.color} p-[1px]`}>
                <div className="w-full h-full bg-[#0F0F10] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-60">
                    <div className={`absolute inset-0 bg-gradient-to-br ${miner.color} opacity-30`} />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 12px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 16px)',
                      }}
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] h-[56%]">
                      <div className="w-full h-full rounded-[8px] border border-white/15 bg-black/40 backdrop-blur flex flex-col p-2 gap-1.5">
                        <div className="flex gap-1">
                          <div className="w-6 h-1.5 rounded-full bg-white/20" />
                          <div className="w-10 h-1.5 rounded-full bg-white/10" />
                          <div className="ml-auto w-4 h-1.5 rounded-full bg-[#FF6A00]/60" />
                        </div>
                        <div className="grid grid-cols-4 gap-1 flex-1">
                          {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`rounded-[4px] ${
                                idx % 3 === 0 ? 'bg-white/15' : 'bg-white/5'
                              } border border-white/5 flex items-center justify-center`}
                            >
                              <div
                                className={`w-1 h-1 rounded-full ${
                                  mining && miner.status === 'ONLINE'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : 'bg-zinc-600'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <div className="h-1 flex-1 bg-[#FF6A00]/40 rounded-full" />
                          <div className="h-1 w-8 bg-white/10 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 left-2 right-2 flex justify-between">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold tracking-widest border backdrop-blur ${rarityConfig.bg} ${rarityConfig.border} ${rarityConfig.text}`}
                    >
                      {miner.rarity.toUpperCase()}
                    </div>
                    <div className="flex gap-1">
                      <div
                        className={`px-2 py-0.5 rounded-full font-mono-num text-[10px] border ${
                          miner.status === 'ONLINE'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/15 border-red-500/30 text-red-400'
                        }`}
                      >
                        {miner.status}
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 font-mono-num text-[10px] text-white">
                        LVL {miner.level}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-[10px]">
                      ⚡
                    </div>
                    <div className="font-mono-num text-[10px] text-white/70">{miner.wth} W/TH</div>
                    <div className="ml-2 font-mono-num text-[10px] text-white/50">
                      {miner.condition.toFixed(0)}% COND
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 font-mono-num text-[10px] text-white/50">
                    ID {miner.id}
                  </div>
                </div>
              </div>

              {/* Miner Body & Actions */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display font-bold text-[13px] text-white">{miner.name}</div>
                    <div className="font-mono-num text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                      <span className="text-white font-bold">{miner.th} TH/s</span>
                      <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                      <span>{miner.maintenance} WAR/d</span>
                      <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                      <span className="text-[#FF6A00]">
                        {((miner.th * miner.condition) / 100).toFixed(0)} eff
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-num text-[11px] text-[#FF6A00] font-bold">
                      +{miner.dailyWar.toFixed(1)} WAR
                    </div>
                    <div className="font-mono-num text-[10px] text-zinc-500">/day</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex justify-between font-mono-num text-[10px] text-zinc-500 mb-1">
                      <span>LVL {miner.level} XP</span>
                      <span>{miner.xp.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-zinc-400 to-white"
                        style={{ width: `${miner.xp}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono-num text-[10px] text-zinc-500 mb-1">
                      <span>CONDITION</span>
                      <span
                        className={
                          miner.condition < 40
                            ? 'text-red-400'
                            : miner.condition < 70
                            ? 'text-amber-400'
                            : 'text-zinc-300'
                        }
                      >
                        {miner.condition.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          miner.condition < 40
                            ? 'bg-red-500'
                            : miner.condition < 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${miner.condition}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgradeMiner(miner.id);
                    }}
                    className="h-8 rounded-full bg-[#FF6A00] text-black font-display font-bold text-[11px] hover:bg-[#FF7A1A] transition cursor-pointer"
                  >
                    {upgradeCost} WAR UP
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRepairMiner(miner.id);
                    }}
                    className="h-8 rounded-full bg-white/5 border border-white/10 font-bold text-[11px] text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                  >
                    Repair {repairCost}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSellMiner(miner.id);
                    }}
                    className="h-8 rounded-full bg-white/5 border border-white/10 font-bold text-[11px] text-zinc-400 hover:bg-white/10 transition cursor-pointer"
                  >
                    Sell
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayMaintenance(miner.id);
                    }}
                    className={`h-7 rounded-full font-bold text-[10px] border transition cursor-pointer ${
                      miner.status === 'OFFLINE'
                        ? 'bg-red-500/20 border-red-500/30 text-red-300'
                        : 'bg-black/40 border-white/10 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Pay Maint {maintCost}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForMerge(miner.id);
                    }}
                    className="h-7 rounded-full bg-black/40 border border-white/10 font-bold text-[10px] text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Merge Select
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LOOTBOXES */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            WAR CHEST LOOTBOXES
          </h3>
          <span className="font-mono-num text-[10px] text-zinc-500">
            BURN 10% • RANDOM MINER
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {CHESTS_DATA.map((box: LootChest) => (
            <div
              key={box.id}
              className={`relative rounded-[16px] border border-white/10 p-[1px] bg-gradient-to-br ${
                box.color
              } ${openingBox === box.id ? 'animate-pulse' : ''}`}
            >
              <div className="rounded-[15px] bg-[#121214] p-4 h-full flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center text-[20px]">
                    {box.icon}
                  </div>
                  <div className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-black/50 border border-white/10 text-zinc-400">
                    {box.rarities}
                  </div>
                </div>

                <div className="font-display font-bold text-[14px] mt-3 text-white">
                  {box.name}
                </div>
                <div className="font-mono-num text-[11px] text-zinc-500 mt-1">
                  {box.cost} WAR • Open animation
                </div>

                <div className="mt-3 flex-1">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6A00]"
                      style={{
                        width: box.id === 'warlord' ? '92%' : box.id === 'veteran' ? '68%' : '42%',
                      }}
                    />
                  </div>
                  <div className="font-mono-num text-[9px] text-zinc-600 mt-1">
                    DROP RATE{' '}
                    {box.id === 'warlord'
                      ? 'LEGENDARY 35%'
                      : box.id === 'veteran'
                      ? 'EPIC 28%'
                      : 'RARE 22%'}
                  </div>
                </div>

                <button
                  onClick={() => onOpenLootbox(box.id)}
                  disabled={Boolean(openingBox)}
                  className={`mt-3 w-full h-9 rounded-full font-bold text-[11px] transition cursor-pointer ${
                    openingBox === box.id
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-[#FF6A00] text-black hover:bg-[#FF7A1A] amber-glow'
                  }`}
                >
                  {openingBox === box.id ? 'OPENING...' : `OPEN ${box.cost} WAR`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY WAR ORDERS */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            DAILY WAR ORDERS
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              STREAK {streak} 🔥
            </span>
            <span className="font-mono-num text-[10px] text-zinc-500">RESET 08:14:22</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {missions.map((m) => (
            <div
              key={m.id}
              className="rounded-[14px] bg-black/40 border border-white/[0.06] p-3 flex flex-col"
            >
              <div className="flex justify-between">
                <div className="font-display font-bold text-[12px] text-white">{m.title}</div>
                <div
                  className={`font-mono-num text-[10px] px-2 py-0.5 rounded-full border ${
                    m.progress >= m.target
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}
                >
                  {m.progress >= m.target ? 'DONE' : `${m.progress.toFixed(0)}/${m.target}`}
                </div>
              </div>
              <div className="font-mono-num text-[11px] text-zinc-500 mt-1">{m.desc}</div>

              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A00]"
                  style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono-num text-[11px] text-[#FF6A00] font-bold">
                  +{m.reward} WAR
                </span>
                {m.claimed ? (
                  <span className="font-mono-num text-[10px] text-zinc-600">CLAIMED</span>
                ) : (
                  <button
                    disabled={m.progress < m.target}
                    onClick={() => onClaimMission(m.id)}
                    className="h-7 px-3 rounded-full bg-white text-black font-bold text-[11px] disabled:opacity-30 cursor-pointer hover:bg-zinc-200 transition"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLANS */}
      <div className="card rounded-[20px] p-5 inner-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[12px] tracking-wide text-zinc-400">
            CLANS / SQUADS
          </h3>
          <div className="font-mono-num text-[10px] text-zinc-500">
            WAR TIMER {Math.floor(clanWarTimer / 3600)}h {Math.floor((clanWarTimer % 3600) / 60)}m{' '}
            {clanWarTimer % 60}s • POT 50,000 WAR
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {CLANS_DATA.map((clan: Clan) => (
            <div
              key={clan.id}
              className={`rounded-[14px] border p-3 flex items-center justify-between transition ${
                userClan === clan.id
                  ? 'border-[#FF6A00]/40 bg-[#FF6A00]/5'
                  : 'border-white/[0.06] bg-black/40 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${clan.color} flex items-center justify-center font-black text-white text-[12px]`}
                >
                  {clan.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-display font-bold text-[12px] text-white">{clan.name}</div>
                  <div className="font-mono-num text-[11px] text-zinc-500">
                    {clan.members} members • {clan.hash.toLocaleString()} TH/s
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {userClan === clan.id ? (
                  <span className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-[#FF6A00] text-black font-bold">
                    YOUR CLAN
                  </span>
                ) : (
                  <button
                    onClick={() => onJoinClan(clan.id)}
                    className="h-7 px-3 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold hover:bg-white/20 transition cursor-pointer"
                  >
                    Join
                  </button>
                )}
                <span className="font-mono-num text-[10px] text-zinc-600">
                  {(clan.hash / 1000).toFixed(1)}% DOM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
