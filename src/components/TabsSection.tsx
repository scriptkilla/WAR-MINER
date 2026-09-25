import React from 'react';
import { Miner, TxItem, Rarity } from '../types';
import { MARKET_LISTINGS, LAB_UPGRADES_DATA } from '../constants';

interface TabsSectionProps {
  activeTab: 'mining' | 'market' | 'upgrades' | 'stats' | 'history';
  onChangeTab: (tab: 'mining' | 'market' | 'upgrades' | 'stats' | 'history') => void;
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
}) => {
  const tabsList = [
    { id: 'mining' as const, label: 'Mining Dashboard' },
    { id: 'market' as const, label: 'Marketplace' },
    { id: 'upgrades' as const, label: 'Upgrades Lab' },
    { id: 'stats' as const, label: 'ROI Calculator' },
    { id: 'history' as const, label: 'Tx History + Tax' },
  ];

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

  return (
    <div className="col-span-12">
      <div className="card rounded-[20px] overflow-hidden inner-shadow">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-2 border-b border-white/[0.06] overflow-x-auto">
          {tabsList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`shrink-0 h-9 px-4 rounded-full font-display font-bold text-[12px] tracking-wide transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="ml-auto hidden md:flex items-center gap-2 font-mono-num text-[10px] text-zinc-500 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ARIES MAINNET // FINALITY 1.2s • EFF{' '}
            {((28 / Math.max(14, avgEfficiency)) * 100).toFixed(0)}% •{' '}
            {mining ? 'MINING' : 'IDLE'}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 md:p-5">
          {/* TAB 1: MINING DASHBOARD */}
          {activeTab === 'mining' && (
            <div className="grid md:grid-cols-3 gap-4 font-mono-num text-[12px]">
              <div className="rounded-[14px] bg-black/40 border border-white/[0.06] p-4">
                <div className="text-zinc-500 text-[11px] tracking-widest">
                  FLEET EFFICIENCY MATRIX
                </div>
                <div className="mt-3 space-y-2">
                  {miners.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-12 text-zinc-400">#{m.id}</div>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6A00]"
                          style={{ width: `${100 - m.wth * 2}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-white">
                        {m.wth} W/TH • {m.condition.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] bg-black/40 border border-white/[0.06] p-4">
                <div className="text-zinc-500 text-[11px] tracking-widest">
                  REWARDS LOG (LIVE)
                </div>
                <div className="mt-3 space-y-2 text-[11px] max-h-[120px] overflow-auto">
                  {history.slice(0, 6).map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className={item.amount >= 0 ? 'text-emerald-400' : 'text-zinc-400'}>
                        {item.amount > 0 ? '+' : ''}
                        {item.amount.toFixed(2)} WAR • {item.type}
                      </span>
                      <span className="text-zinc-600 truncate">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] bg-gradient-to-br from-[#FF6A00]/15 to-orange-900/20 border border-[#FF6A00]/20 p-4">
                <div className="text-[#FF6A00] text-[11px] tracking-widest font-bold">
                  TACTICAL TIP
                </div>
                <div className="text-white text-[12px] leading-[1.5] mt-2">
                  Degradation 0.5%/day. Repair cost = (100-cond)*0.8 WAR. Merge 2 same rarity → next tier +10% TH bonus. Auto-compound spends claims on upgrades.
                </div>
                <button
                  onClick={() => onChangeTab('upgrades')}
                  className="mt-3 h-8 px-3 rounded-full bg-[#FF6A00] text-black font-bold text-[11px] hover:bg-[#FF7A1A] transition cursor-pointer"
                >
                  OPEN LAB
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MARKETPLACE */}
          {activeTab === 'market' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h4 className="font-display font-bold text-[13px]">War Miner Marketplace</h4>
                <div className="flex items-center gap-2">
                  {(['All', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => onChangeMarketRarity(rarity)}
                      className={`h-8 px-3 rounded-full font-mono-num text-[11px] font-bold border transition cursor-pointer ${
                        marketRarity === rarity
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
                <div className="font-mono-num text-[11px] text-zinc-500">
                  {filteredListings.length} LISTINGS • FLOOR 360 WAR
                </div>
              </div>

              <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-[16px] bg-[#121214] border border-white/10 p-3"
                  >
                    <div
                      className={`h-[88px] rounded-[10px] bg-gradient-to-br ${listing.color} relative overflow-hidden`}
                    >
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 10px)',
                        }}
                      />
                      <div className="absolute bottom-2 left-2 font-mono-num text-[11px] text-white font-bold">
                        {listing.th} TH/s
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono-num text-white">
                        {listing.rarity}
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between font-mono-num text-[11px]">
                      <span className="text-white font-bold truncate">{listing.name}</span>
                      <span className="text-[#FF6A00]">{(listing.th * 4.2).toFixed(0)} WAR</span>
                    </div>

                    <div className="font-mono-num text-[10px] text-zinc-500 mt-1">
                      {listing.wth} W/TH • {listing.maintenance} WAR/d
                    </div>

                    <button
                      onClick={() => onBuyMiner(listing)}
                      className="mt-2 w-full h-8 rounded-full bg-white text-black font-bold text-[11px] hover:bg-zinc-100 transition cursor-pointer"
                    >
                      Buy Now
                    </button>
                    <a
                      href={`https://explorer.aries.zone/tx/${listing.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-center font-mono-num text-[10px] text-zinc-600 hover:text-zinc-400"
                    >
                      Aries Explorer ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UPGRADES LAB */}
          {activeTab === 'upgrades' && (
            <div className="grid md:grid-cols-4 gap-3">
              {LAB_UPGRADES_DATA.map((upg) => {
                const count = labUpgrades[upg.id] || 0;
                const cost = Math.round(upg.baseCost * Math.pow(1.35, count));

                return (
                  <div
                    key={upg.id}
                    className="rounded-[16px] bg-[#121214] border border-white/10 p-4 flex flex-col"
                  >
                    <div className="flex justify-between">
                      <div className="w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">
                        {upg.icon}
                      </div>
                      <div className="font-mono-num text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                        OWNED {count}
                      </div>
                    </div>

                    <div className="font-display font-bold text-[13px] mt-3 text-white">
                      {upg.name}
                    </div>
                    <div className="font-mono-num text-[11px] text-zinc-500 mt-1 leading-[1.4]">
                      {upg.desc}
                    </div>
                    <div className="mt-2 font-mono-num text-[10px] text-[#FF6A00]">
                      {upg.effect} • Scaling 1.35x
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-mono-num text-[11px] text-[#FF6A00] font-bold">
                        {cost} WAR
                      </span>
                      <button
                        onClick={() => onApplyLabUpgrade(upg.id)}
                        className="h-7 px-3 rounded-full bg-[#FF6A00] text-black font-bold text-[11px] hover:bg-[#FF7A1A] transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6A00]"
                        style={{ width: `${Math.min(100, count * 12)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: ROI CALCULATOR */}
          {activeTab === 'stats' && (
            <div className="grid md:grid-cols-[360px_1fr] gap-5">
              <div className="rounded-[16px] bg-[#121214] border border-white/10 p-4">
                <div className="font-display font-bold text-[12px] tracking-wide">
                  ROI CALCULATOR
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="font-mono-num text-[11px] text-zinc-500">YOUR TH/s</div>
                    <input
                      type="range"
                      min={10}
                      max={5000}
                      value={calcHashrate}
                      onChange={(e) => onChangeCalcHashrate(parseInt(e.target.value))}
                      className="w-full accent-[#FF6A00] mt-2 cursor-pointer"
                    />
                    <div className="flex justify-between font-mono-num text-[11px] text-white mt-1">
                      <span>{calcHashrate} TH/s</span>
                      <span className="text-zinc-500">
                        ${(calcHashrate * 4.2).toFixed(0)} est. cost
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-mono-num text-[10px] text-zinc-500">
                        EFFICIENCY W/TH
                      </div>
                      <input
                        type="number"
                        value={calcEfficiency}
                        onChange={(e) => onChangeCalcEfficiency(parseFloat(e.target.value) || 22)}
                        className="mt-1 w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 font-mono-num text-[11px] text-white outline-none focus:border-[#FF6A00]/40"
                      />
                    </div>
                    <div>
                      <div className="font-mono-num text-[10px] text-zinc-500">POWER $/kWh</div>
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
                    <div className="font-mono-num text-[10px] text-zinc-500">WAR PRICE $</div>
                    <input
                      type="number"
                      step={0.0001}
                      value={warPrice}
                      onChange={(e) => onChangeWarPrice(parseFloat(e.target.value) || 0.2847)}
                      className="mt-1 w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 font-mono-num text-[11px] text-white outline-none focus:border-[#FF6A00]/40"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-[10px] bg-black/40 border border-white/10 p-3">
                      <div className="font-mono-num text-[10px] text-zinc-500">DAILY</div>
                      <div className="font-mono-num font-bold text-white text-[12px]">
                        {calcDailyWar.toFixed(1)} WAR
                      </div>
                      <div className="font-mono-num text-[10px] text-zinc-500">
                        ${calcDailyNetUsd.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-[10px] bg-black/40 border border-white/10 p-3">
                      <div className="font-mono-num text-[10px] text-zinc-500">MONTHLY</div>
                      <div className="font-mono-num font-bold text-[#FF6A00] text-[12px]">
                        ${calcMonthlyNetUsd.toFixed(0)}
                      </div>
                      <div className="font-mono-num text-[10px] text-zinc-500">
                        {(calcDailyWar * 30).toFixed(1)} WAR
                      </div>
                    </div>
                    <div className="rounded-[10px] bg-black/40 border border-white/10 p-3">
                      <div className="font-mono-num text-[10px] text-zinc-500">YEARLY</div>
                      <div className="font-mono-num font-bold text-white text-[12px]">
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

                  <div className="rounded-[10px] bg-[#FF6A00]/10 border border-[#FF6A00]/20 p-3 font-mono-num text-[11px] text-zinc-300">
                    Payback:{' '}
                    <span className="text-[#FF6A00] font-bold">{paybackDays.toFixed(1)} days</span> •
                    Cost ${estHardwareCostUsd.toFixed(0)} • Power{' '}
                    {((calcHashrate * calcEfficiency) / 1000 * 24).toFixed(1)} kWh/d
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-black/40 border border-white/10 p-4">
                <div className="font-mono-num text-[11px] tracking-widest text-zinc-500">
                  PROJECTION // 12 MONTHS • HALVING IMPACT
                </div>
                <div className="mt-4 h-[160px] flex items-end gap-[3px]">
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const heightPercent =
                      20 + Math.sin(idx / 3) * 10 + idx * 2.5 + (idx > 12 ? -10 : 0);
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-[3px] bg-gradient-to-t from-[#FF6A00]/20 to-[#FF6A00]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between font-mono-num text-[10px] text-zinc-600">
                  <span>NOW</span>
                  <span>HALVING {halvingDays}d</span>
                  <span>+12M • Burn ↑</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 font-mono-num text-[10px]">
                  <div className="rounded-[8px] bg-[#121214] p-2">
                    <div className="text-zinc-500">EST. MONTHLY</div>
                    <div className="text-white font-bold">
                      ${(dailyWarRate * warPrice * 30).toFixed(0)}
                    </div>
                  </div>
                  <div className="rounded-[8px] bg-[#121214] p-2">
                    <div className="text-zinc-500">UPTIME</div>
                    <div className="text-white font-bold">99.94%</div>
                  </div>
                  <div className="rounded-[8px] bg-[#121214] p-2">
                    <div className="text-zinc-500">BURNED</div>
                    <div className="text-[#FF6A00] font-bold">
                      {Math.floor(burnedWar).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTION HISTORY + TAX */}
          {activeTab === 'history' && (
            <div className="grid md:grid-cols-[1fr_320px] gap-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-[13px]">Transaction History</h4>
                  <button
                    onClick={onExportTaxCSV}
                    className="h-8 px-3 rounded-full bg-white text-black font-bold text-[11px] hover:bg-zinc-100 transition cursor-pointer"
                  >
                    Export Tax CSV
                  </button>
                </div>

                <div className="rounded-[12px] border border-white/[0.06] overflow-hidden">
                  <div className="grid grid-cols-[80px_90px_90px_1fr_90px] gap-2 px-3 py-2 bg-black/40 font-mono-num text-[10px] text-zinc-500 tracking-widest">
                    <span>TIME</span>
                    <span>TYPE</span>
                    <span>AMOUNT</span>
                    <span>DESC</span>
                    <span>HASH</span>
                  </div>
                  <div className="max-h-[320px] overflow-auto divide-y divide-white/[0.04]">
                    {history.map((tx) => (
                      <div
                        key={tx.id}
                        className="grid grid-cols-[80px_90px_90px_1fr_90px] gap-2 px-3 py-2 font-mono-num text-[11px] hover:bg-white/[0.02]"
                      >
                        <span className="text-zinc-500">{tx.time}</span>
                        <span
                          className={`font-bold ${
                            tx.amount >= 0 ? 'text-emerald-400' : 'text-zinc-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className={tx.amount >= 0 ? 'text-white' : 'text-zinc-400'}>
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount.toFixed(2)}
                        </span>
                        <span className="text-zinc-400 truncate">{tx.desc}</span>
                        <a
                          href={`https://explorer.aries.zone/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-[#FF6A00] truncate"
                        >
                          {tx.hash.slice(0, 12)}↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] bg-[#121214] border border-white/10 p-4 font-mono-num text-[11px]">
                <div className="font-display font-bold text-[12px] text-white">Tax Summary</div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Earned</span>
                    <span className="text-white">
                      {history
                        .filter((tx) => tx.amount > 0)
                        .reduce((acc, tx) => acc + tx.amount, 0)
                        .toFixed(2)}{' '}
                      WAR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Spent</span>
                    <span className="text-white">
                      {Math.abs(
                        history
                          .filter((tx) => tx.amount < 0)
                          .reduce((acc, tx) => acc + tx.amount, 0)
                      ).toFixed(2)}{' '}
                      WAR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Burned Fees (5%)</span>
                    <span className="text-[#FF6A00]">
                      {(
                        history
                          .filter((tx) => tx.amount < 0)
                          .reduce((acc, tx) => acc + Math.abs(tx.amount), 0) * 0.05
                      ).toFixed(2)}{' '}
                      WAR
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-300">Net</span>
                    <span className="text-emerald-400">
                      {history.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)} WAR
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] bg-black/40 border border-white/[0.06] p-3 text-[10px] text-zinc-500 leading-[1.5]">
                  CSV includes timestamp, type, amount, description, Aries explorer hash. For tax purposes. Mock data for demo.
                </div>

                <button
                  onClick={onClearHistory}
                  className="mt-3 w-full h-8 rounded-full bg-white/5 border border-white/10 font-bold text-[11px] text-zinc-400 hover:bg-white/10 transition cursor-pointer"
                >
                  Clear History (local)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
