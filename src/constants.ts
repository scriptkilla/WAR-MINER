import { Miner, Clan, LootChest, LabUpgrade, Rarity } from './types';

export const RARITY_STYLES: Record<Rarity, { bg: string; border: string; text: string; color: string; weight: number }> = {
  Common: { bg: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-400', color: '#71717a', weight: 1 },
  Rare: { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-400', color: '#60a5fa', weight: 2 },
  Epic: { bg: 'bg-violet-950/40', border: 'border-violet-800/40', text: 'text-violet-400', color: '#a78bfa', weight: 3 },
  Legendary: { bg: 'bg-amber-950/40', border: 'border-amber-700/40', text: 'text-amber-400', color: '#fbbf24', weight: 4 },
};

export const NEXT_RARITY_MAP: Record<Rarity, Rarity | null> = {
  Common: 'Rare',
  Rare: 'Epic',
  Epic: 'Legendary',
  Legendary: null,
};

export const INITIAL_FLEET: Miner[] = [
  { id: 1042, name: 'War Miner #1042', rarity: 'Legendary', th: 420, wth: 19, level: 8, xp: 72, dailyWar: 32.4, maintenance: 2.1, color: 'from-amber-600 to-orange-700', condition: 94, status: 'ONLINE' },
  { id: 889, name: 'War Miner #889', rarity: 'Epic', th: 240, wth: 22, level: 5, xp: 45, dailyWar: 18.2, maintenance: 1.4, color: 'from-violet-600 to-fuchsia-700', condition: 88, status: 'ONLINE' },
  { id: 1210, name: 'War Miner #1210', rarity: 'Rare', th: 180, wth: 24, level: 3, xp: 88, dailyWar: 13.6, maintenance: 0.9, color: 'from-cyan-600 to-blue-700', condition: 76, status: 'ONLINE' },
  { id: 332, name: 'War Miner #332', rarity: 'Common', th: 120, wth: 28, level: 2, xp: 20, dailyWar: 8.9, maintenance: 0.7, color: 'from-zinc-600 to-zinc-800', condition: 62, status: 'ONLINE' },
  { id: 1577, name: 'War Miner #1577', rarity: 'Epic', th: 285, wth: 21, level: 6, xp: 61, dailyWar: 21.8, maintenance: 1.7, color: 'from-emerald-600 to-teal-700', condition: 100, status: 'ONLINE' },
  { id: 441, name: 'War Miner #441', rarity: 'Rare', th: 152, wth: 25, level: 4, xp: 33, dailyWar: 11.2, maintenance: 0.8, color: 'from-orange-600 to-red-700', condition: 81, status: 'ONLINE' },
];

export const MARKET_LISTINGS: Miner[] = [
  { id: 2011, name: 'War Miner #2011', rarity: 'Legendary', th: 500, wth: 18, level: 1, xp: 0, dailyWar: 39.1, maintenance: 2.4, color: 'from-amber-500 to-orange-600', condition: 100, status: 'ONLINE' },
  { id: 2012, name: 'War Miner #2012', rarity: 'Epic', th: 310, wth: 20, level: 1, xp: 0, dailyWar: 24.3, maintenance: 1.9, color: 'from-violet-500 to-indigo-600', condition: 100, status: 'ONLINE' },
  { id: 2013, name: 'War Miner #2013', rarity: 'Rare', th: 195, wth: 23, level: 1, xp: 0, dailyWar: 15.1, maintenance: 1.0, color: 'from-sky-500 to-blue-600', condition: 100, status: 'ONLINE' },
  { id: 2014, name: 'War Miner #2014', rarity: 'Common', th: 110, wth: 29, level: 1, xp: 0, dailyWar: 7.8, maintenance: 0.6, color: 'from-zinc-500 to-zinc-700', condition: 100, status: 'ONLINE' },
  { id: 2015, name: 'War Miner #2015', rarity: 'Epic', th: 275, wth: 21, level: 3, xp: 20, dailyWar: 20.9, maintenance: 1.6, color: 'from-violet-600 to-blue-700', condition: 92, status: 'ONLINE' },
  { id: 2016, name: 'War Miner #2016', rarity: 'Rare', th: 165, wth: 24, level: 2, xp: 10, dailyWar: 12.2, maintenance: 0.9, color: 'from-cyan-600 to-teal-700', condition: 88, status: 'ONLINE' },
];

export const CLANS_DATA: Clan[] = [
  { id: 'alpha', name: 'Alpha Legion', members: 1240, hash: 48200, color: 'from-red-600 to-orange-600' },
  { id: 'bravo', name: 'Bravo Squad', members: 980, hash: 36100, color: 'from-blue-600 to-cyan-600' },
  { id: 'reaper', name: 'Reaper Unit', members: 1510, hash: 59400, color: 'from-zinc-700 to-zinc-900' },
  { id: 'ghost', name: 'Ghost Division', members: 1120, hash: 42300, color: 'from-violet-600 to-indigo-700' },
];

export const CHESTS_DATA: LootChest[] = [
  { id: 'recruit', name: 'Recruit Chest', cost: 500, rarities: 'Common-Rare', color: 'from-zinc-600 to-zinc-800', icon: '📦' },
  { id: 'veteran', name: 'Veteran Crate', cost: 1500, rarities: 'Rare-Epic', color: 'from-blue-600 to-violet-700', icon: '🧰' },
  { id: 'warlord', name: 'Warlord Vault', cost: 5000, rarities: 'Epic-Legendary', color: 'from-amber-500 to-orange-600', icon: '🏆' },
];

export const TOKENOMICS_DATA = [
  { label: 'Mining Rewards', value: 45, color: '#FF6A00' },
  { label: 'Ecosystem', value: 20, color: '#FF9A44' },
  { label: 'Liquidity', value: 15, color: '#2A2A2E' },
  { label: 'Burn Reserve', value: 10, color: '#4A4A4E' },
  { label: 'Team (locked)', value: 10, color: '#1A1A1E' },
];

export const BURN_SOURCES_DATA = [
  { label: 'Fees', value: 42, color: '#FF6A00' },
  { label: 'Mints', value: 28, color: '#FF9A44' },
  { label: 'Market', value: 18, color: '#2A2A2E' },
  { label: 'Upgrades', value: 12, color: '#4A4A4E' },
];

export const LAB_UPGRADES_DATA: LabUpgrade[] = [
  { id: 'hash', name: 'Hash Boost', desc: '+15% TH/s per fleet application', icon: '⚡', baseCost: 120, owned: 0, effect: '+8% TH fleet' },
  { id: 'cool', name: 'Liquid Cooling', desc: '-3 W/TH permanent', icon: '❄️', baseCost: 200, owned: 0, effect: '-2 W/TH' },
  { id: 'over', name: 'Overclock Module', desc: '+22% yield, +5% burn risk', icon: '🔥', baseCost: 350, owned: 0, effect: '+22% yield' },
  { id: 'stake', name: 'Stake Discount', desc: 'Reduce maintenance via staking', icon: '🔒', baseCost: 500, owned: 0, effect: '-15% maint' },
];

export const formatNumber = (num: number, digits: number = 2): string =>
  num.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits > 2 ? 2 : 0 });

export const generateHash = (): string =>
  '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);

export const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};
