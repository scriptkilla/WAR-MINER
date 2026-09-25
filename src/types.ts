export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface MinerVisualTraits {
  coreType: string;
  frameType: string;
  opticsType: string;
  auraColor: string;
  hashSignature: string;
}

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
  avatarUrl?: string; // Unique visual identifier SVG / Data-URL
  visualTraits?: MinerVisualTraits;
}

export interface TxItem {
  id: string;
  time: string;
  type: string;
  amount: number;
  desc: string;
  hash: string;
}

export type MissionTier = 'Common' | 'Rare' | 'Legendary';
export type MissionDifficulty = 'Standard' | 'Challenging' | 'Elite';

export interface Mission {
  id: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
  tier: MissionTier;
  difficulty: MissionDifficulty;
  multiplier: string;
}

export interface CompletedMissionRecord {
  id: string;
  missionId: string;
  title: string;
  desc: string;
  reward: number;
  claimedAt: string;
  txHash: string;
  tier: string;
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

export interface SolanaWalletAccount {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string; // Base58 encoded private key
  mnemonic?: string; // 12-word seed phrase
  solBalance: number;
  warBalance: number;
  createdAt: number;
  network: 'devnet' | 'mainnet-beta';
}

export interface UserSettings {
  // General & Identity
  clan: string;
  themeColor: 'solana-purple' | 'emerald-green' | 'amber-orange' | 'cyan-electric';
  currency: 'USD' | 'SOL' | 'EUR';
  numberFormat: 'compact' | 'full';

  // Solana & Security
  networkCluster: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcEndpoint: string;
  autoAirdropOnLow: boolean;
  priorityFeeLevel: 'normal' | 'turbo' | 'ultra';
  requirePinForExport: boolean;
  securityPin?: string;

  // Mining Automation
  autoRepairThreshold: number; // 0 (off), 30, 50
  autoCompoundStaking: boolean;
  soundEffects: boolean;
  hashrateAlerts: boolean;
  compactFleetView: boolean;
  neonGlowEffects: boolean;
}

export interface ReferralRecord {
  id: string;
  refereeHandle: string;
  refereeAddress: string;
  date: string;
  bonusAmount: number; // in $WAR
  bonusSol?: number;   // in SOL
  status: 'completed' | 'pending';
  rigMinted?: string;
  rewardTier?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  txHash?: string;
}

export interface UserProfile {
  handle: string;
  title: string;
  bio: string;
  avatar: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  joinedBlock: number;
  joinedDate: string;
  primaryWalletId?: string;
  favoriteMinerId?: number;
  achievementsUnlocked: string[];
  settings?: UserSettings;
  referralCode?: string;
  referralHistory?: ReferralRecord[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'mining' | 'wallet' | 'social' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'solana';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardWar: number;
  rewardXp: number;
}

export type AppPage =
  | 'dashboard'
  | 'mining'
  | 'fleet'
  | 'market'
  | 'upgrades'
  | 'missions'
  | 'burn'
  | 'calculator'
  | 'referrals'
  | 'history'
  | 'profile'
  | 'settings';

export type WidgetType =
  | 'mining_control'
  | 'hashrate_monitor'
  | 'sol_war_ticker'
  | 'fleet_matrix'
  | 'staking_vewar'
  | 'clan_war_radar'
  | 'daily_missions'
  | 'referral_gauge'
  | 'token_burn'
  | 'roi_quick_calc'
  | 'tx_stream'
  | 'gas_tracker'
  | 'daily_streak'
  | 'lp_booster';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  colSpan: 4 | 6 | 8 | 12; // 12-column grid span
  minimized?: boolean;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  category: 'Mining' | 'Finance' | 'Social' | 'Analytics';
  description: string;
  defaultColSpan: 4 | 6 | 8 | 12;
  badge?: string;
}

