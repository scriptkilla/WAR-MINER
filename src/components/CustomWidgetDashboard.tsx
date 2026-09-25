import React, { useState, useEffect } from 'react';
import {
  DashboardWidget,
  WidgetType,
  WidgetDefinition,
  Miner,
  TxItem,
  Mission,
  SolanaWalletAccount,
  UserProfile,
} from '../types';
import {
  GripVertical,
  Plus,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Zap,
  Cpu,
  TrendingUp,
  Activity,
  Flame,
  Target,
  Gift,
  Coins,
  Calculator,
  Shield,
  Layers,
  Check,
  Copy,
  ExternalLink,
  Search,
  LayoutGrid,
  Radio,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  Server,
  HelpCircle,
} from 'lucide-react';

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    type: 'mining_control',
    name: 'Mining Console & Vault',
    category: 'Mining',
    description: 'Start/stop ASIC hashing engine, view pending $WAR rewards, toggle auto-compound, and claim vault earnings.',
    defaultColSpan: 6,
    badge: 'Core',
  },
  {
    type: 'hashrate_monitor',
    name: 'Real-Time Hashrate Oscilloscope',
    category: 'Mining',
    description: 'Dynamic cluster hashrate wave monitor, raw vs effective TH/s, power efficiency, and uptime telemetry.',
    defaultColSpan: 6,
    badge: 'Telemetry',
  },
  {
    type: 'sol_war_ticker',
    name: 'Solana & $WAR Market Ticker',
    category: 'Finance',
    description: 'Live SOL/USD and WAR/USD pricing, 24h market performance, and total combined vault net worth.',
    defaultColSpan: 4,
    badge: 'Price',
  },
  {
    type: 'fleet_matrix',
    name: 'Fleet Hardware Matrix',
    category: 'Mining',
    description: 'Instant overview of online ASIC rigs, hardware condition percentages, and quick maintenance status.',
    defaultColSpan: 8,
    badge: 'Hardware',
  },
  {
    type: 'daily_missions',
    name: 'Daily Mission Tracker',
    category: 'Social',
    description: 'Track daily protocol quest completion, progress bars, and claim verified $WAR rewards directly from the widget.',
    defaultColSpan: 6,
    badge: 'Quests',
  },
  {
    type: 'staking_vewar',
    name: 'veWAR Lock & Yield Boost',
    category: 'Finance',
    description: 'Lock $WAR tokens into veWAR governance to slash rig maintenance fees and boost mining yields up to 25%.',
    defaultColSpan: 6,
    badge: 'Yield',
  },
  {
    type: 'clan_war_radar',
    name: 'Clan Faction War Radar',
    category: 'Social',
    description: 'Live faction territory control (Alpha, Omega, Sigma), clan war countdown timer, and faction TH/s bonus.',
    defaultColSpan: 4,
    badge: 'Clan',
  },
  {
    type: 'referral_gauge',
    name: 'Referral Network & Bonus Gauge',
    category: 'Social',
    description: 'Your unique referral code, 1-click copy link, active recruit counter, and total $WAR/SOL commission payouts.',
    defaultColSpan: 4,
    badge: 'Affiliate',
  },
  {
    type: 'token_burn',
    name: 'Protocol Burn & Halving Clock',
    category: 'Analytics',
    description: 'Cumulative burned $WAR metrics, 24-hour burn rate, deflationary pressure gauge, and Solana halving countdown.',
    defaultColSpan: 4,
    badge: 'Deflation',
  },
  {
    type: 'gas_tracker',
    name: 'Solana Gas & Network Telemetry',
    category: 'Analytics',
    description: 'Real-time Solana TPS throughput, current slot height, dynamic priority fees, and cluster ping latency.',
    defaultColSpan: 4,
    badge: 'Solana',
  },
  {
    type: 'roi_quick_calc',
    name: 'Rapid Yield & ROI Calculator',
    category: 'Finance',
    description: 'Interactive hashrate slider with real-time daily, monthly, and yearly net profit projections in USD.',
    defaultColSpan: 6,
    badge: 'ROI',
  },
  {
    type: 'daily_streak',
    name: 'Daily Login Streak & Flame',
    category: 'Mining',
    description: 'Active daily check-in streak tracker with consecutive day counter and +10% hashrate multiplier.',
    defaultColSpan: 4,
    badge: 'Boost',
  },
  {
    type: 'lp_booster',
    name: 'Raydium LP Staking Booster',
    category: 'Finance',
    description: 'Toggle WAR/USDC liquidity pool token staking for an instant flat +5% cluster hashrate bonus.',
    defaultColSpan: 4,
    badge: 'DeFi',
  },
  {
    type: 'tx_stream',
    name: 'Live On-Chain Transaction Stream',
    category: 'Analytics',
    description: 'Real-time cryptographic audit ledger showing recent blocks, reward claims, and Solscan explorer signatures.',
    defaultColSpan: 8,
    badge: 'Audit',
  },
];

const DEFAULT_WIDGET_LAYOUT: DashboardWidget[] = [
  { id: 'w-mining-control', type: 'mining_control', title: 'Mining Console & Vault', colSpan: 6 },
  { id: 'w-hashrate-monitor', type: 'hashrate_monitor', title: 'Hashrate Wave Oscilloscope', colSpan: 6 },
  { id: 'w-sol-war-ticker', type: 'sol_war_ticker', title: 'Solana & $WAR Market', colSpan: 4 },
  { id: 'w-daily-streak', type: 'daily_streak', title: 'Streak Flame Boost', colSpan: 4 },
  { id: 'w-token-burn', type: 'token_burn', title: 'Burn & Halving Clock', colSpan: 4 },
  { id: 'w-fleet-matrix', type: 'fleet_matrix', title: 'Fleet Hardware Matrix', colSpan: 8 },
  { id: 'w-gas-tracker', type: 'gas_tracker', title: 'Solana Network Telemetry', colSpan: 4 },
  { id: 'w-daily-missions', type: 'daily_missions', title: 'Daily Mission Tracker', colSpan: 6 },
  { id: 'w-staking-vewar', type: 'staking_vewar', title: 'veWAR Lock & Staking', colSpan: 6 },
];

const STORAGE_KEY = 'solana_pow_custom_widgets_layout_v2';

interface CustomWidgetDashboardProps {
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
  veLock: number;
  stakeAmount: number;
  onChangeStakeAmount: (v: number) => void;
  stakeDays: number;
  onChangeStakeDays: (v: number) => void;
  onStake: () => void;
  onUnstake: () => void;
  balance: number;
  lpStaked: boolean;
  onToggleLP: () => void;
  warPrice: number;
  solPrice?: number;
  streak: number;
  streakBoost: number;
  onCheckInStreak: () => void;
  veBoost: number;
  lpBoost: number;
  clanBoost: number;
  burnedWar: number;
  dayBurned: number;
  halvingDays: number;
  userClan: string;
  referralCode: string;
  onCopyRef: () => void;
  missions: Mission[];
  onClaimMission: (id: string) => void;
  history: TxItem[];
  userProfile?: UserProfile;
  onNavigateToPage?: (page: any) => void;
}

export const CustomWidgetDashboard: React.FC<CustomWidgetDashboardProps> = ({
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
  solPrice = 142.5,
  streak,
  streakBoost,
  onCheckInStreak,
  veBoost,
  lpBoost,
  clanBoost,
  burnedWar,
  dayBurned,
  halvingDays,
  userClan,
  referralCode,
  onCopyRef,
  missions,
  onClaimMission,
  history,
  userProfile,
  onNavigateToPage,
}) => {
  // Widget Layout state initialized from localStorage
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_WIDGET_LAYOUT;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [widgetFilterCategory, setWidgetFilterCategory] = useState<string>('All');
  const [widgetSearchQuery, setWidgetSearchQuery] = useState<string>('');
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null);
  const [dragOverWidgetIndex, setDragOverWidgetIndex] = useState<number | null>(null);
  const [copiedCodeFeedback, setCopiedCodeFeedback] = useState(false);
  const [quickCalcTH, setQuickCalcTH] = useState<number>(rawTH || 140);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Save to localStorage when widgets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch {
      // ignore
    }
  }, [widgets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Move Widget Operations
  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(index, 1);
    newWidgets.splice(targetIndex, 0, moved);
    setWidgets(newWidgets);
    showToast(`Moved "${moved.title}" ${direction}`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedWidgetIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or ghost image
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidgetIndex !== index) {
      setDragOverWidgetIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedWidgetIndex === null || draggedWidgetIndex === targetIndex) {
      setDraggedWidgetIndex(null);
      setDragOverWidgetIndex(null);
      return;
    }
    const newWidgets = [...widgets];
    const [dragged] = newWidgets.splice(draggedWidgetIndex, 1);
    newWidgets.splice(targetIndex, 0, dragged);
    setWidgets(newWidgets);
    setDraggedWidgetIndex(null);
    setDragOverWidgetIndex(null);
    showToast(`Repositioned "${dragged.title}"`);
  };

  const handleDragEnd = () => {
    setDraggedWidgetIndex(null);
    setDragOverWidgetIndex(null);
  };

  // Change Width / ColSpan
  const handleChangeColSpan = (id: string, colSpan: 4 | 6 | 8 | 12) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, colSpan } : w))
    );
    showToast(`Updated widget width to ${colSpan}/12 columns`);
  };

  // Toggle Minimized
  const handleToggleMinimize = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  // Remove Widget
  const handleRemoveWidget = (id: string) => {
    const target = widgets.find((w) => w.id === id);
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    showToast(`Removed "${target?.title || 'Widget'}"`);
  };

  // Add Widget from Catalog
  const handleAddWidget = (def: WidgetDefinition) => {
    const newWidget: DashboardWidget = {
      id: `w-${def.type}-${Date.now()}`,
      type: def.type,
      title: def.name,
      colSpan: def.defaultColSpan,
      minimized: false,
    };
    setWidgets((prev) => [...prev, newWidget]);
    showToast(`Added "${def.name}" to dashboard!`);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setWidgets(DEFAULT_WIDGET_LAYOUT);
    showToast('Reset dashboard to default widget arrangement');
  };

  // Presets
  const handleApplyPreset = (preset: 'balanced' | 'hardcore' | 'defi' | 'analytics') => {
    if (preset === 'balanced') {
      setWidgets(DEFAULT_WIDGET_LAYOUT);
    } else if (preset === 'hardcore') {
      setWidgets([
        { id: 'w-mc', type: 'mining_control', title: 'Mining Console & Vault', colSpan: 6 },
        { id: 'w-hm', type: 'hashrate_monitor', title: 'Hashrate Oscilloscope', colSpan: 6 },
        { id: 'w-fm', type: 'fleet_matrix', title: 'Fleet Hardware Matrix', colSpan: 12 },
        { id: 'w-cw', type: 'clan_war_radar', title: 'Clan War Radar', colSpan: 4 },
        { id: 'w-st', type: 'daily_streak', title: 'Streak Flame Boost', colSpan: 4 },
        { id: 'w-gt', type: 'gas_tracker', title: 'Solana Network Telemetry', colSpan: 4 },
      ]);
    } else if (preset === 'defi') {
      setWidgets([
        { id: 'w-tk', type: 'sol_war_ticker', title: 'Solana & $WAR Market', colSpan: 6 },
        { id: 'w-stk', type: 'staking_vewar', title: 'veWAR Lock & Staking', colSpan: 6 },
        { id: 'w-lp', type: 'lp_booster', title: 'Raydium LP Staking Booster', colSpan: 4 },
        { id: 'w-roi', type: 'roi_quick_calc', title: 'Rapid Yield & ROI Calculator', colSpan: 4 },
        { id: 'w-bn', type: 'token_burn', title: 'Burn & Halving Clock', colSpan: 4 },
      ]);
    } else if (preset === 'analytics') {
      setWidgets([
        { id: 'w-hm', type: 'hashrate_monitor', title: 'Hashrate Oscilloscope', colSpan: 8 },
        { id: 'w-gt', type: 'gas_tracker', title: 'Solana Network Telemetry', colSpan: 4 },
        { id: 'w-tx', type: 'tx_stream', title: 'Live On-Chain Transaction Stream', colSpan: 8 },
        { id: 'w-bn', type: 'token_burn', title: 'Burn & Halving Clock', colSpan: 4 },
      ]);
    }
    showToast(`Loaded ${preset.toUpperCase()} preset layout`);
  };

  // Helper for copying referral
  const handleCopyWidgetRef = () => {
    navigator.clipboard.writeText(referralCode || 'VALKYRIE-SOL-88');
    setCopiedCodeFeedback(true);
    setTimeout(() => setCopiedCodeFeedback(false), 2000);
  };

  // Render content of each widget type
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'mining_control':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[16px] bg-black/40 border border-white/5">
              <div>
                <div className="text-[10px] font-mono-num text-zinc-400">PENDING VAULT REWARDS</div>
                <div className="font-mono-num text-2xl font-black text-[#FF6A00] flex items-baseline gap-1 mt-0.5">
                  <span>{pendingRewards.toFixed(3)}</span>
                  <span className="text-[12px] font-normal text-zinc-400">$WAR</span>
                </div>
                <div className="text-[10px] font-mono-num text-zinc-500">
                  ≈ ${(pendingRewards * warPrice).toFixed(2)} USD
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMining}
                  className={`h-9 px-4 rounded-full font-display font-bold text-[11.5px] flex items-center gap-2 transition cursor-pointer shadow ${
                    mining
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-950/40'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${mining ? 'animate-pulse' : ''}`} />
                  <span>{mining ? 'HALT MINING' : 'START MINING'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClaim}
                  disabled={pendingRewards <= 0}
                  className="h-9 px-4 rounded-full bg-white text-black font-display font-bold text-[11.5px] hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer shadow"
                >
                  Claim Vault
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-num text-[11px]">
              <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[9.5px] block">DAILY RATE</span>
                <span className="text-white font-bold">{dailyWarRate.toFixed(1)} WAR</span>
              </div>
              <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[9.5px] block">TOTAL BOOST</span>
                <span className="text-purple-400 font-bold">+{(totalBoost * 100).toFixed(0)}%</span>
              </div>
              <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 text-[9.5px] block">MAINTENANCE</span>
                <span className="text-amber-400 font-bold">-{totalMaintenance.toFixed(1)} W/d</span>
              </div>
              <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 text-[9.5px] block">AUTO-COMPOUND</span>
                  <span className={autoCompound ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {autoCompound ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleAutoCompound}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    autoCompound ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      autoCompound ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'hashrate_monitor':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono-num text-zinc-400">EFFECTIVE CLUSTER HASHRATE</div>
                <div className="font-mono-num text-3xl font-black text-[#14F195] flex items-baseline gap-1 mt-0.5">
                  <span>{effectiveTH.toFixed(1)}</span>
                  <span className="text-sm font-normal text-zinc-400">TH/s</span>
                </div>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-[10px] text-zinc-500">RAW ASIC BASE</div>
                <div className="text-base text-zinc-200 font-bold">{rawTH} TH/s</div>
                <div className="text-[10px] text-purple-400 font-bold">
                  +{(effectiveTH - rawTH).toFixed(1)} Boost
                </div>
              </div>
            </div>

            {/* Simulated Live Hashrate Wave Visualizer */}
            <div className="h-16 flex items-end gap-1 px-1 bg-black/40 rounded-[12px] p-2 border border-white/5 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => {
                const height = mining
                  ? 30 + Math.sin((i + Date.now() / 400) / 2) * 25 + Math.random() * 20
                  : 15;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-[2px] transition-all duration-300 ${
                      mining
                        ? 'bg-gradient-to-t from-emerald-500/20 via-purple-500/60 to-[#14F195]'
                        : 'bg-white/10'
                    }`}
                    style={{ height: `${Math.min(100, Math.max(10, height))}%` }}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between font-mono-num text-[11px] text-zinc-400 pt-1">
              <span>EFFICIENCY: <strong className="text-white">{avgEfficiency.toFixed(1)} W/TH</strong></span>
              <span>UPTIME: <strong className="text-emerald-400">99.98%</strong></span>
              <span>NETWORK: <strong className="text-purple-400">ARIES POW</strong></span>
            </div>
          </div>
        );

      case 'sol_war_ticker':
        return (
          <div className="space-y-3 font-mono-num">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-[12px] bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">SOLANA (SOL)</div>
                <div className="text-lg font-black text-white mt-0.5">
                  ${solPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">+4.18% 24h</div>
              </div>

              <div className="p-3 rounded-[12px] bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">WAR TOKEN</div>
                <div className="text-lg font-black text-[#FF6A00] mt-0.5">
                  ${warPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">+12.65% 24h</div>
              </div>
            </div>

            <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">EST. COMBINED VAULT</span>
              <span className="text-white font-bold">
                ${(balance * warPrice + 0.45 * solPrice).toFixed(2)} USD
              </span>
            </div>
          </div>
        );

      case 'fleet_matrix':
        return (
          <div className="space-y-3 font-mono-num">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
              <span className="text-zinc-400">
                ACTIVE FLEET: <strong className="text-white">{miners.length} RIGS</strong>
              </span>
              <button
                type="button"
                onClick={() => onNavigateToPage?.('fleet')}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                Open Fleet Deck →
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-auto pr-1">
              {miners.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-[12px] bg-black/40 border border-white/5 hover:border-white/10 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status === 'ONLINE' ? 'bg-[#14F195]' : 'bg-zinc-600'
                      }`}
                    />
                    <div>
                      <div className="text-white font-bold text-[11.5px] truncate max-w-[120px]">
                        {m.name}
                      </div>
                      <div className="text-[9.5px] text-zinc-400">{m.rarity}</div>
                    </div>
                  </div>

                  <div className="text-right text-[11px]">
                    <div className="text-[#FF6A00] font-bold">{m.th} TH/s</div>
                    <div className={m.condition < 50 ? 'text-rose-400' : 'text-emerald-400'}>
                      {m.condition.toFixed(0)}% COND
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'daily_missions':
        return (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono-num text-[11px] pb-1 border-b border-white/5">
              <span className="text-zinc-400">DAILY OBJECTIVES</span>
              <button
                type="button"
                onClick={() => onNavigateToPage?.('missions')}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                All Quests →
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
              {missions.slice(0, 3).map((m) => {
                const pct = Math.min(100, (m.progress / m.target) * 100);
                return (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-[12px] bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold truncate">{m.title}</span>
                        <span className="text-[#FF6A00] font-mono-num font-bold shrink-0">
                          +{m.reward} WAR
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-[#14F195]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      {m.claimed ? (
                        <span className="text-emerald-400 font-mono-num text-[10px] font-bold">
                          CLAIMED ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={m.progress < m.target}
                          onClick={() => onClaimMission(m.id)}
                          className="h-7 px-3 rounded-full bg-white text-black font-display font-bold text-[10px] hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'staking_vewar':
        return (
          <div className="space-y-3 font-mono-num">
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-purple-950/20 border border-purple-500/20">
              <div>
                <div className="text-[10px] text-purple-300">CURRENT LOCKED veWAR</div>
                <div className="text-xl font-black text-white mt-0.5">{veLock.toFixed(1)} veWAR</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400">YIELD MULTIPLIER</div>
                <div className="text-base font-black text-[#14F195]">
                  +{(veBoost * 100).toFixed(0)}% BOOST
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-zinc-500 text-[10px] block">AMOUNT (WAR)</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => onChangeStakeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 rounded-full bg-black/40 border border-white/10 px-3 text-white text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] block">LOCK DAYS ({stakeDays}d)</label>
                <input
                  type="range"
                  min={7}
                  max={365}
                  value={stakeDays}
                  onChange={(e) => onChangeStakeDays(parseInt(e.target.value) || 7)}
                  className="w-full mt-2 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onStake}
                className="flex-1 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-display font-bold text-[11px] transition cursor-pointer"
              >
                Lock veWAR
              </button>
              {veLock > 0 && (
                <button
                  type="button"
                  onClick={onUnstake}
                  className="h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-display font-bold text-[11px] transition cursor-pointer"
                >
                  Unstake
                </button>
              )}
            </div>
          </div>
        );

      case 'clan_war_radar':
        return (
          <div className="space-y-3 font-mono-num text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-black/40 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-zinc-400 text-[10px] block">YOUR FACTION</span>
                  <span className="text-white font-bold uppercase">{userClan} Clan</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block">FACTION BOOST</span>
                <span className="text-emerald-400 font-bold">+{(clanBoost * 100).toFixed(0)}% TH</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>TERRITORY CONTROL</span>
                <span className="text-amber-400 font-bold">WAR ENDS IN 2h 45m</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-white/10">
                <div className="bg-purple-500" style={{ width: '42%' }} title="Alpha 42%" />
                <div className="bg-[#FF6A00]" style={{ width: '35%' }} title="Omega 35%" />
                <div className="bg-[#14F195]" style={{ width: '23%' }} title="Sigma 23%" />
              </div>
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span className="text-purple-400">Alpha 42%</span>
                <span className="text-[#FF6A00]">Omega 35%</span>
                <span className="text-[#14F195]">Sigma 23%</span>
              </div>
            </div>
          </div>
        );

      case 'referral_gauge':
        return (
          <div className="space-y-3 font-mono-num text-[11px]">
            <div className="p-3 rounded-[12px] bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-500">REFERRAL CODE</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white tracking-widest text-[13px]">
                  {referralCode || 'VALKYRIE-SOL-88'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyWidgetRef}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-zinc-200 text-[10px] flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedCodeFeedback ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-[10px] bg-white/[0.02] border border-white/5">
                <div className="text-[9.5px] text-zinc-500">RECRUITS</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {userProfile?.referralHistory?.length || 4}
                </div>
              </div>
              <div className="p-2 rounded-[10px] bg-white/[0.02] border border-white/5">
                <div className="text-[9.5px] text-zinc-500">TOTAL COMMISSION</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  +1,850 WAR
                </div>
              </div>
            </div>
          </div>
        );

      case 'token_burn':
        return (
          <div className="space-y-3 font-mono-num">
            <div className="p-3 rounded-[12px] bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>CUMULATIVE BURNED</span>
                <Flame className="w-3.5 h-3.5 text-[#FF6A00]" />
              </div>
              <div className="font-mono-num text-xl font-black text-[#FF6A00] mt-0.5">
                {Math.floor(burnedWar).toLocaleString()} $WAR
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                +{(dayBurned || 420).toFixed(0)} WAR Burned in 24h
              </div>
            </div>

            <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">SOLANA HALVING</span>
              <span className="text-amber-400 font-bold">{halvingDays} DAYS</span>
            </div>
          </div>
        );

      case 'gas_tracker':
        return (
          <div className="space-y-2.5 font-mono-num text-[11px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-[12px] bg-black/40 border border-white/5">
                <div className="text-[9.5px] text-zinc-500">SOLANA TPS</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">2,842</div>
                <div className="text-[9px] text-zinc-500">Mainnet-grade speed</div>
              </div>
              <div className="p-2.5 rounded-[12px] bg-black/40 border border-white/5">
                <div className="text-[9.5px] text-zinc-500">PRIORITY FEE</div>
                <div className="text-base font-black text-purple-300 mt-0.5">0.000005</div>
                <div className="text-[9px] text-zinc-500">SOL / tx</div>
              </div>
            </div>

            <div className="p-2.5 rounded-[12px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <span className="text-zinc-400">CLUSTER PING</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>32 ms</span>
              </span>
            </div>
          </div>
        );

      case 'roi_quick_calc':
        const simDaily = quickCalcTH * 0.078 * (28 / Math.max(14, avgEfficiency));
        const simMonthlyUsd = simDaily * warPrice * 30;
        return (
          <div className="space-y-3 font-mono-num text-[11px]">
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>SIMULATED HASHRATE</span>
                <span className="text-[#FF6A00] font-bold">{quickCalcTH} TH/s</span>
              </div>
              <input
                type="range"
                min={20}
                max={2000}
                value={quickCalcTH}
                onChange={(e) => setQuickCalcTH(parseInt(e.target.value) || 100)}
                className="w-full mt-1.5 accent-[#FF6A00] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                <div className="text-[9.5px] text-zinc-500">DAILY YIELD</div>
                <div className="text-sm font-bold text-white mt-0.5">{simDaily.toFixed(1)} WAR</div>
              </div>
              <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                <div className="text-[9.5px] text-zinc-500">MONTHLY NET</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  ${simMonthlyUsd.toFixed(0)} USD
                </div>
              </div>
            </div>
          </div>
        );

      case 'daily_streak':
        return (
          <div className="space-y-3 font-mono-num">
            <div className="p-3 rounded-[12px] bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500">CONSECUTIVE MINING</div>
                <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <span>🔥</span>
                  <span>{streak} DAYS</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500">ACTIVE MULTIPLIER</div>
                <div className="text-base font-black text-emerald-400">
                  +{(streakBoost * 100).toFixed(0)}% TH
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckInStreak}
              className="w-full h-8 rounded-full bg-gradient-to-r from-amber-500 to-[#FF6A00] text-black font-display font-bold text-[11px] hover:opacity-90 transition cursor-pointer shadow"
            >
              Check-In Today (+10% Boost)
            </button>
          </div>
        );

      case 'lp_booster':
        return (
          <div className="space-y-3 font-mono-num text-[11px]">
            <div className="p-3 rounded-[12px] bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block">RAYDIUM WAR/USDC POOL</span>
                <span className="text-white font-bold">Liquidity Staking</span>
              </div>
              <span className="text-purple-400 font-bold text-sm">+5% HASHRATE</span>
            </div>

            <button
              type="button"
              onClick={onToggleLP}
              className={`w-full h-8 rounded-full font-display font-bold text-[11px] transition cursor-pointer border ${
                lpStaked
                  ? 'bg-purple-600/30 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {lpStaked ? 'LP Tokens Staked (Active)' : 'Stake LP Tokens (+5% TH)'}
            </button>
          </div>
        );

      case 'tx_stream':
        return (
          <div className="space-y-2 font-mono-num text-[11px]">
            <div className="space-y-1.5 max-h-[160px] overflow-auto pr-1">
              {history.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-[8px] bg-black/40 border border-white/5 text-[11px]"
                >
                  <span className="text-zinc-500 text-[10px]">{tx.time}</span>
                  <span className="text-zinc-300 truncate max-w-[200px]">{tx.desc}</span>
                  <span className={tx.amount >= 0 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} WAR
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.hash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-[10px]"
                  >
                    Solscan ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="text-zinc-500 text-xs">Widget content loading...</div>;
    }
  };

  // Filtered available widgets for "Add Widget" modal
  const filteredCatalog = AVAILABLE_WIDGETS.filter((w) => {
    const matchesCategory =
      widgetFilterCategory === 'All' || w.category === widgetFilterCategory;
    const matchesSearch =
      widgetSearchQuery.trim() === '' ||
      w.name.toLowerCase().includes(widgetSearchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(widgetSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A22] border border-[#14F195]/40 text-white font-mono-num text-[12px] px-4 py-2.5 rounded-[12px] shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#14F195]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DASHBOARD CONTROL BAR */}
      <div className="card rounded-[24px] p-5 inner-shadow space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-[#FF6A00]/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <LayoutGrid className="w-5 h-5 text-[#14F195]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg text-white tracking-wide">
                  MODULAR COMMAND DECK & WIDGET CANVAS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono-num text-[10px] font-bold">
                  {widgets.length} ACTIVE WIDGETS
                </span>
              </div>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Drag or use directional controls to arrange widgets, resize columns, and add new modules from the catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-[#14F195] text-white font-display font-bold text-[12px] flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-950/40 hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Widget</span>
            </button>

            {/* Layout Preset Dropdown / Quick Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
              <button
                type="button"
                onClick={() => handleApplyPreset('balanced')}
                className="px-2.5 py-1 rounded-full font-mono-num text-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Balanced Layout"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('hardcore')}
                className="px-2.5 py-1 rounded-full font-mono-num text-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Mining Heavy"
              >
                Miner
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('defi')}
                className="px-2.5 py-1 rounded-full font-mono-num text-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="DeFi & Staking"
              >
                DeFi
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="h-9 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-mono-num text-[11px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center gap-1.5"
              title="Reset to default widget arrangement"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>
          </div>
        </div>

        {/* Quick Instructions banner */}
        <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-300">
              <GripVertical className="w-3.5 h-3.5 text-zinc-500" /> Drag handles or use ↑ ↓ / ← → to reorder
            </span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="hidden sm:inline">Use width selector to change grid columns (4, 6, 8, 12)</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Auto-saved to browser
          </span>
        </div>
      </div>

      {/* 12-COLUMN DYNAMIC WIDGET GRID */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {widgets.map((widget, index) => {
          const isDragging = draggedWidgetIndex === index;
          const isDragOver = dragOverWidgetIndex === index;

          // Tailwind grid span mapping
          const spanClass =
            widget.colSpan === 12
              ? 'col-span-12'
              : widget.colSpan === 8
              ? 'col-span-12 lg:col-span-8'
              : widget.colSpan === 6
              ? 'col-span-12 md:col-span-6'
              : 'col-span-12 sm:col-span-6 lg:col-span-4';

          return (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`${spanClass} card rounded-[20px] p-4 inner-shadow transition-all duration-200 relative group ${
                isDragging ? 'opacity-40 scale-[0.98] border-purple-500/50' : ''
              } ${isDragOver ? 'ring-2 ring-[#14F195] border-[#14F195]/60' : ''}`}
            >
              {/* Widget Header with Drag Handle & Actions */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] select-none">
                <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                  <div
                    className="p-1 text-zinc-500 hover:text-white transition rounded"
                    title="Drag to reposition widget"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-black text-[13px] text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
                    {widget.title}
                  </h3>
                </div>

                {/* Header Action Toolbar */}
                <div className="flex items-center gap-1">
                  {/* Directional Move Buttons */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveWidget(index, 'up')}
                    className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                    title="Move earlier in layout"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === widgets.length - 1}
                    onClick={() => handleMoveWidget(index, 'down')}
                    className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                    title="Move later in layout"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Width / ColSpan Selector */}
                  <div className="hidden sm:flex items-center gap-0.5 bg-black/40 rounded-[6px] p-0.5 border border-white/5 ml-1">
                    {([4, 6, 8, 12] as const).map((span) => (
                      <button
                        key={span}
                        type="button"
                        onClick={() => handleChangeColSpan(widget.id, span)}
                        className={`px-1.5 py-0.5 rounded font-mono-num text-[9px] transition cursor-pointer ${
                          widget.colSpan === span
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={`Set to ${span}/12 columns width`}
                      >
                        {span === 12 ? 'Full' : `${span}c`}
                      </button>
                    ))}
                  </div>

                  {/* Minimize Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleMinimize(widget.id)}
                    className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer ml-1"
                    title={widget.minimized ? 'Expand widget' : 'Minimize widget'}
                  >
                    {widget.minimized ? (
                      <Maximize2 className="w-3 h-3" />
                    ) : (
                      <Minimize2 className="w-3 h-3" />
                    )}
                  </button>

                  {/* Close / Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Remove widget from dashboard"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Widget Body Content */}
              {!widget.minimized && renderWidgetContent(widget)}
            </div>
          );
        })}
      </div>

      {/* ADD WIDGET MODAL / CATALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-[24px] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Plus className="w-5 h-5 text-[#14F195]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white tracking-wide">
                    ADD WIDGETS TO DASHBOARD
                  </h3>
                  <p className="font-mono-num text-[11px] text-zinc-400">
                    Choose from specialized telemetry, mining controllers, and DeFi financial modules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-white/5 bg-black/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Mining', 'Finance', 'Social', 'Analytics'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setWidgetFilterCategory(category)}
                    className={`px-3 py-1 rounded-full font-mono-num text-[11px] font-bold border transition cursor-pointer ${
                      widgetFilterCategory === category
                        ? 'bg-purple-600 text-white border-transparent'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={widgetSearchQuery}
                  onChange={(e) => setWidgetSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full bg-[#18181E] border border-white/10 rounded-[10px] pl-8 pr-3 py-1.5 font-mono-num text-[11px] text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredCatalog.map((def) => {
                  const currentInstances = widgets.filter((w) => w.type === def.type).length;
                  return (
                    <div
                      key={def.type}
                      className="p-4 rounded-[16px] bg-[#16161B] border border-white/5 hover:border-white/15 transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-white text-[13.5px]">
                            {def.name}
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-white/5 border border-white/10 font-mono-num text-[9.5px] text-zinc-300">
                            {def.category}
                          </span>
                        </div>
                        <p className="font-mono-num text-[11px] text-zinc-400 mt-1.5 leading-[1.4]">
                          {def.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="font-mono-num text-[10px] text-zinc-500">
                          Default width: {def.defaultColSpan}/12 cols
                          {currentInstances > 0 && (
                            <strong className="text-purple-400 ml-1.5">
                              ({currentInstances} on deck)
                            </strong>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddWidget(def)}
                          className="h-7 px-3.5 rounded-full bg-white text-black font-display font-bold text-[10.5px] hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Add to Deck</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-[11px] font-mono-num text-zinc-400">
              <span>{AVAILABLE_WIDGETS.length} modules available in the repository</span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-display font-bold text-[11px] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
