export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Miner {
  id: number;
  name: string;
  rarity: Rarity;
  th: number;
  wth: number;
  level: number;
  xp: number;
  dailyWar: number;
  maintenance: number;
  color: string;
  condition: number;
  status: 'ONLINE' | 'OFFLINE';
}

export interface TxItem {
  id: string;
  time: string;
  type: string;
  amount: number;
  desc: string;
  hash: string;
}

export interface Mission {
  id: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
}

export interface Clan {
  id: string;
  name: string;
  members: number;
  hash: number;
  color: string;
}

export interface LootChest {
  id: string;
  name: string;
  cost: number;
  rarities: string;
  color: string;
  icon: string;
}

export interface VeLock {
  amount: number;
  lockDays: number;
  veAmount: number;
  expiry: number;
  apy: number;
}

export interface ToastMsg {
  id: number;
  text: string;
  type: 'success' | 'info' | 'error';
}

export interface LabUpgrade {
  id: 'hash' | 'cool' | 'over' | 'stake';
  name: string;
  desc: string;
  icon: string;
  baseCost: number;
  owned: number;
  effect: string;
}
