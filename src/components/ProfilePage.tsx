import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Zap,
  Sparkles,
  Award,
  Send,
  Coins,
  QrCode,
  Key,
  Eye,
  EyeOff,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Cpu,
  TrendingUp,
  Clock,
  ChevronRight,
  Download,
  Upload,
  RotateCcw,
  CheckCheck,
  Globe,
  Lock,
  Volume2,
  VolumeX,
  Bell,
  Palette,
  DollarSign,
  Layers,
  Save,
  Users,
  UserPlus,
  Gift,
  Link2,
  Calendar,
  Search,
} from 'lucide-react';
import {
  SolanaWalletAccount,
  UserProfile,
  UserSettings,
  Achievement,
  Miner,
  TxItem,
  ReferralRecord,
} from '../types';
import { formatSolanaAddress, isValidSolanaAddress } from '../utils/solana';
import { formatNumber } from '../constants';

interface ProfilePageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  activeWallet: SolanaWalletAccount | null;
  wallets: SolanaWalletAccount[];
  onOpenWalletModal: (tab?: 'create' | 'import' | 'connect' | 'wallets') => void;
  onAirdropSol: (walletId: string) => void;
  onSendSolanaTx: (recipient: string, amount: number, token: 'SOL' | 'WAR') => boolean;
  miners: Miner[];
  effectiveTH: number;
  rawTH: number;
  warPrice: number;
  burnedWar: number;
  streak: number;
  streakBoost: number;
  onCheckInStreak: () => void;
  userClan: string;
  history: TxItem[];
  onClearHistory?: () => void;
  initialView?: 'overview' | 'referrals' | 'settings';
  onChangeView?: (view: 'overview' | 'referrals' | 'settings') => void;
}

const AVATAR_OPTIONS = [
  { id: 'valkyrie', name: 'Solana Valkyrie', bg: 'from-purple-600 via-indigo-600 to-cyan-500', icon: '⚡' },
  { id: 'samurai', name: 'Cyber Samurai', bg: 'from-rose-600 via-orange-600 to-amber-500', icon: '🗡️' },
  { id: 'spectre', name: 'Quantum Spectre', bg: 'from-cyan-500 via-blue-600 to-indigo-800', icon: '🔮' },
  { id: 'mecha', name: 'Mecha Hash-Lord', bg: 'from-emerald-500 via-teal-600 to-cyan-700', icon: '🤖' },
  { id: 'void', name: 'Void Wanderer', bg: 'from-fuchsia-600 via-purple-700 to-zinc-900', icon: '🌌' },
  { id: 'titan', name: 'Aries Titan', bg: 'from-[#FF6A00] via-amber-600 to-red-600', icon: '🦅' },
  { id: 'sentinel', name: 'Solar Sentinel', bg: 'from-yellow-500 via-orange-500 to-red-600', icon: '🌋' },
  { id: 'cipher', name: 'Cipher Ghost', bg: 'from-zinc-700 via-zinc-800 to-black', icon: '👁️' },
];

const CLAN_OPTIONS = [
  { id: 'alpha', name: 'Alpha Miners', desc: '+5% Daily Hashrate Boost', color: '#EF4444', icon: '🔥' },
  { id: 'syndicate', name: 'Hash Syndicate', desc: '+8% $WAR Yield Multiplier', color: '#14F195', icon: '⚡' },
  { id: 'phantoms', name: 'Cyber Phantoms', desc: '+10% veWAR Governance Staking', color: '#8B5CF6', icon: '🔮' },
  { id: 'forge', name: 'Aries Forge', desc: '-15% Rig Maintenance Overhead', color: '#F59E0B', icon: '⚒️' },
];

const OPERATOR_TITLES = [
  'Solana Valkyrie',
  'Elite Hash-Smith',
  'Grand Architect',
  'Master Rig Engineer',
  'Solana Hash-Lord',
  'Cyber Vanguard',
  'Quantum Sovereign',
  'Protocol Overseer',
  'Zero-Knowledge Miner',
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'sol_pioneer',
    title: 'Solana Pioneer',
    description: 'Create or link an active Solana Ed25519 keypair.',
    icon: '🟣',
    category: 'wallet',
    tier: 'solana',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rewardWar: 250,
    rewardXp: 500,
  },
  {
    id: 'streak_flame',
    title: 'Streak Flame Keeper',
    description: 'Maintain a 5-day continuous mining streak.',
    icon: '🔥',
    category: 'mining',
    tier: 'gold',
    progress: 5,
    maxProgress: 5,
    unlocked: true,
    rewardWar: 150,
    rewardXp: 350,
  },
  {
    id: 'hash_titan',
    title: 'Terahash Titan',
    description: 'Reach 500 TH/s in total active mining hashrate.',
    icon: '⚡',
    category: 'mining',
    tier: 'gold',
    progress: 420,
    maxProgress: 500,
    unlocked: false,
    rewardWar: 500,
    rewardXp: 800,
  },
  {
    id: 'rig_smith',
    title: 'Rig Blacksmith',
    description: 'Merge 2 miners into a higher tier rig.',
    icon: '⚒️',
    category: 'mastery',
    tier: 'silver',
    progress: 1,
    maxProgress: 2,
    unlocked: false,
    rewardWar: 200,
    rewardXp: 400,
  },
  {
    id: 'vewar_governor',
    title: 'veWAR Sovereign',
    description: 'Stake WAR into veWAR governance lock for protocol boost.',
    icon: '🏛️',
    category: 'mastery',
    tier: 'solana',
    progress: 1000,
    maxProgress: 1000,
    unlocked: true,
    rewardWar: 400,
    rewardXp: 600,
  },
  {
    id: 'burn_enforcer',
    title: 'Pyromaniac Protocol',
    description: 'Contribute to burning over 50,000 $WAR.',
    icon: '🌋',
    category: 'mining',
    tier: 'bronze',
    progress: 85400,
    maxProgress: 50000,
    unlocked: true,
    rewardWar: 300,
    rewardXp: 450,
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  clan: 'alpha',
  themeColor: 'solana-purple',
  currency: 'USD',
  numberFormat: 'compact',
  networkCluster: 'devnet',
  rpcEndpoint: 'https://api.devnet.solana.com',
  autoAirdropOnLow: true,
  priorityFeeLevel: 'normal',
  requirePinForExport: false,
  securityPin: '7788',
  autoRepairThreshold: 30,
  autoCompoundStaking: false,
  soundEffects: true,
  hashrateAlerts: true,
  compactFleetView: false,
  neonGlowEffects: true,
};

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  onUpdateProfile,
  activeWallet,
  wallets,
  onOpenWalletModal,
  onAirdropSol,
  onSendSolanaTx,
  miners,
  effectiveTH,
  rawTH,
  warPrice,
  burnedWar,
  streak,
  streakBoost,
  onCheckInStreak,
  userClan,
  history,
  onClearHistory,
  initialView = 'overview',
  onChangeView,
}) => {
  // Top-Level Profile View Tab: 'overview' | 'referrals' | 'settings'
  const [profileView, setProfileView] = useState<'overview' | 'referrals' | 'settings'>(initialView);
  const [settingsCategory, setSettingsCategory] = useState<'identity' | 'network' | 'mining' | 'display' | 'backup'>('identity');

  useEffect(() => {
    if (initialView) {
      setProfileView(initialView);
    }
  }, [initialView]);

  const handleSelectProfileView = (view: 'overview' | 'referrals' | 'settings') => {
    setProfileView(view);
    onChangeView?.(view);
  };

  // Referrals State & Filter
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    return (
      userProfile.referralHistory || [
        {
          id: 'ref-1',
          refereeHandle: 'CyberViper_99',
          refereeAddress: '9xQe8Rk8Vb4aBz2p',
          date: 'Sep 21, 2026',
          bonusAmount: 750,
          bonusSol: 0.15,
          status: 'completed',
          rigMinted: 'War Miner #1084 (Epic)',
          rewardTier: 'Epic',
          txHash: '5KnpL93b7wQm1x8v',
        },
        {
          id: 'ref-2',
          refereeHandle: 'NeonDrifter',
          refereeAddress: '4kLm2Pq9Y8pTx5zN',
          date: 'Sep 14, 2026',
          bonusAmount: 500,
          bonusSol: 0.10,
          status: 'completed',
          rigMinted: 'War Miner #942 (Rare)',
          rewardTier: 'Rare',
          txHash: '3HxvJ27c4yRt8m2q',
        },
        {
          id: 'ref-3',
          refereeHandle: 'SolHashMaster',
          refereeAddress: '7vBn6Tr3X2mKq9pL',
          date: 'Aug 29, 2026',
          bonusAmount: 450,
          bonusSol: 0.05,
          status: 'completed',
          rigMinted: 'War Miner #811 (Epic)',
          rewardTier: 'Epic',
          txHash: '8ZkwM14d5vPn3s7j',
        },
        {
          id: 'ref-4',
          refereeHandle: 'ZeroByte_X',
          refereeAddress: '3wRt9Lm2K9sDc4vF',
          date: 'Aug 10, 2026',
          bonusAmount: 150,
          bonusSol: 0.05,
          status: 'completed',
          rigMinted: 'War Miner #715 (Common)',
          rewardTier: 'Common',
          txHash: '2YpqB48g7uLk1z9m',
        },
      ]
    );
  });
  const [referralSearch, setReferralSearch] = useState('');
  const [referralFilterTier, setReferralFilterTier] = useState<string>('All');
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);
  const [referralActionToast, setReferralActionToast] = useState('');

  // Form State for Profile & Settings
  const [handleInput, setHandleInput] = useState(userProfile.handle);
  const [titleInput, setTitleInput] = useState(userProfile.title);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [selectedClan, setSelectedClan] = useState(userProfile.settings?.clan || userClan || 'alpha');
  const [favoriteMinerId, setFavoriteMinerId] = useState<number | undefined>(userProfile.favoriteMinerId || (miners[0]?.id));
  const [referralCodeInput, setReferralCodeInput] = useState(userProfile.referralCode || 'VALKYRIE-SOL-88');

  // Settings State initialized from userProfile.settings or defaults
  const [settings, setSettings] = useState<UserSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(userProfile.settings || {}),
  }));

  // Track if changes have been made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Pin protection state when revealing secret key
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [revealSecret, setRevealSecret] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);

  // Send Token Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendToken, setSendToken] = useState<'SOL' | 'WAR'>('SOL');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [claimedAchievements, setClaimedAchievements] = useState<Record<string, boolean>>({});

  // Sync inputs if userProfile prop updates externally
  useEffect(() => {
    setHandleInput(userProfile.handle);
    setTitleInput(userProfile.title);
    setBioInput(userProfile.bio);
    setSelectedAvatar(userProfile.avatar);
    if (userProfile.settings) {
      setSettings((prev) => ({ ...prev, ...userProfile.settings }));
    }
    if (userProfile.referralHistory && userProfile.referralHistory.length > 0) {
      setReferrals(userProfile.referralHistory);
    }
    if (userProfile.referralCode) {
      setReferralCodeInput(userProfile.referralCode);
    }
  }, [userProfile]);

  const referralCode = userProfile.referralCode || 'VALKYRIE-SOL-88';
  const referralShareUrl = `https://proofofwar.sol/ref/${referralCode}`;

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferralCode(true);
    setTimeout(() => setCopiedReferralCode(false), 2000);
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralShareUrl);
    setCopiedReferralLink(true);
    setTimeout(() => setCopiedReferralLink(false), 2000);
  };

  const handleSimulateNewReferral = () => {
    const candidateHandles = ['AriesRogue_7', 'CryptoVanguard', 'SolMatrix_99', 'NovaMiner_44', 'QuantumForge'];
    const tiers: ('Epic' | 'Rare' | 'Legendary' | 'Common')[] = ['Legendary', 'Epic', 'Rare', 'Epic'];
    const chosenHandle = candidateHandles[Math.floor(Math.random() * candidateHandles.length)] + '_' + Math.floor(Math.random() * 89 + 10);
    const chosenTier = tiers[Math.floor(Math.random() * tiers.length)];
    const bonusWAR = chosenTier === 'Legendary' ? 1200 : chosenTier === 'Epic' ? 650 : chosenTier === 'Rare' ? 400 : 200;
    const bonusSOL = chosenTier === 'Legendary' ? 0.20 : chosenTier === 'Epic' ? 0.12 : 0.05;
    const rigId = Math.floor(Math.random() * 800 + 1300);

    const newRecord: ReferralRecord = {
      id: `ref-${Date.now()}`,
      refereeHandle: chosenHandle,
      refereeAddress: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      bonusAmount: bonusWAR,
      bonusSol: bonusSOL,
      status: 'completed',
      rigMinted: `War Miner #${rigId} (${chosenTier})`,
      rewardTier: chosenTier,
      txHash: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
    };

    const nextList = [newRecord, ...referrals];
    setReferrals(nextList);
    onUpdateProfile({ referralHistory: nextList });
    setReferralActionToast(`🎉 NEW REFERRAL SUCCESS! ${chosenHandle} recruited • +${bonusWAR} $WAR & +${bonusSOL} SOL bonus credited!`);
    setTimeout(() => setReferralActionToast(''), 4500);
  };

  const totalReferralBonusWAR = referrals.reduce((acc, r) => acc + r.bonusAmount, 0);
  const totalReferralBonusSOL = referrals.reduce((acc, r) => acc + (r.bonusSol || 0), 0);

  const updateSettingField = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setHasUnsavedChanges(true);
  };

  const handleSaveAllSettings = () => {
    const updatedProfile: Partial<UserProfile> = {
      handle: handleInput.trim() || userProfile.handle,
      title: titleInput.trim() || userProfile.title,
      bio: bioInput.trim() || userProfile.bio,
      avatar: selectedAvatar,
      favoriteMinerId: favoriteMinerId,
      referralCode: referralCodeInput.trim().toUpperCase() || referralCode,
      referralHistory: referrals,
      settings: {
        ...settings,
        clan: selectedClan,
      },
    };

    onUpdateProfile(updatedProfile);
    setHasUnsavedChanges(false);
    setSaveSuccessMsg('All profile and wallet settings saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all profile settings to defaults? Your Solana keypair will remain intact.')) {
      setSettings(DEFAULT_SETTINGS);
      setSelectedClan('alpha');
      setHasUnsavedChanges(true);
    }
  };

  const handleExportProfileBackup = () => {
    const backupData = {
      app: 'War Mining Solana Proof-of-War',
      exportedAt: new Date().toISOString(),
      userProfile: {
        ...userProfile,
        handle: handleInput,
        title: titleInput,
        bio: bioInput,
        avatar: selectedAvatar,
        settings: settings,
      },
      walletsCount: wallets.length,
      activeWalletPublicKey: activeWallet?.publicKey || null,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solana-profile-backup-${Date.now().toString().slice(-6)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProfileBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.userProfile) {
          onUpdateProfile(parsed.userProfile);
          if (parsed.userProfile.handle) setHandleInput(parsed.userProfile.handle);
          if (parsed.userProfile.title) setTitleInput(parsed.userProfile.title);
          if (parsed.userProfile.bio) setBioInput(parsed.userProfile.bio);
          if (parsed.userProfile.avatar) setSelectedAvatar(parsed.userProfile.avatar);
          if (parsed.userProfile.settings) setSettings(parsed.userProfile.settings);
          setSaveSuccessMsg('Profile configuration imported successfully!');
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleToggleRevealSecret = () => {
    if (revealSecret) {
      setRevealSecret(false);
      return;
    }

    if (settings.requirePinForExport) {
      setPinPromptOpen(true);
      setEnteredPin('');
      setPinError('');
    } else {
      setRevealSecret(true);
    }
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === (settings.securityPin || '7788')) {
      setPinPromptOpen(false);
      setRevealSecret(true);
      setPinError('');
    } else {
      setPinError('Incorrect 4-digit PIN. Check your Security PIN in settings.');
    }
  };

  const handleCopySolanaAddress = () => {
    if (activeWallet?.publicKey) {
      navigator.clipboard.writeText(activeWallet.publicKey);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');

    const recipient = sendRecipient.trim();
    const amountNum = parseFloat(sendAmount);

    if (!isValidSolanaAddress(recipient)) {
      setSendError('Invalid Solana recipient address. Must be a valid 32-byte Base58 address.');
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setSendError('Please enter a valid positive amount to send.');
      return;
    }

    if (sendToken === 'SOL') {
      const maxSol = activeWallet?.solBalance || 0;
      if (amountNum > maxSol) {
        setSendError(`Insufficient SOL balance. Available: ${maxSol.toFixed(3)} SOL`);
        return;
      }
    } else {
      const maxWar = activeWallet?.warBalance || 0;
      if (amountNum > maxWar) {
        setSendError(`Insufficient $WAR balance. Available: ${maxWar.toLocaleString()} $WAR`);
        return;
      }
    }

    const success = onSendSolanaTx(recipient, amountNum, sendToken);
    if (success) {
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setShowSendModal(false);
        setSendRecipient('');
        setSendAmount('');
      }, 1500);
    }
  };

  const handleClaimAchievement = (ach: Achievement) => {
    if (claimedAchievements[ach.id]) return;
    setClaimedAchievements((prev) => ({ ...prev, [ach.id]: true }));
    onUpdateProfile({
      xp: userProfile.xp + ach.rewardXp,
    });
  };

  const currentAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const currentClanObj =
    CLAN_OPTIONS.find((c) => c.id === selectedClan) || CLAN_OPTIONS[0];

  const totalMinersCount = miners.length;
  const onlineMinersCount = miners.filter((m) => m.status === 'ONLINE').length;
  const solPrice = 142.5; // Reference SOL/USD price
  const activeSolBalance = activeWallet?.solBalance || 0;
  const activeWarBalance = activeWallet?.warBalance || 0;
  const totalUsdNetWorth = activeSolBalance * solPrice + activeWarBalance * warPrice;

  // Filtered referrals for history table
  const filteredReferrals = referrals.filter((item) => {
    const matchesSearch =
      referralSearch.trim() === '' ||
      item.refereeHandle.toLowerCase().includes(referralSearch.toLowerCase()) ||
      item.refereeAddress.toLowerCase().includes(referralSearch.toLowerCase()) ||
      (item.rigMinted && item.rigMinted.toLowerCase().includes(referralSearch.toLowerCase()));

    const matchesTier =
      referralFilterTier === 'All' || item.rewardTier === referralFilterTier;

    return matchesSearch && matchesTier;
  });

  const renderReferralSection = () => (
    <div className="card rounded-[24px] p-6 inner-shadow space-y-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-12 w-96 h-48 bg-gradient-to-r from-emerald-500/10 to-purple-600/10 blur-3xl rounded-full" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-[#FF6A00]/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gift className="w-5 h-5 text-[#14F195]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg text-white tracking-wide">
                SUCCESSFUL REFERRALS & FLEET NETWORK
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono-num text-[10px] font-bold">
                ON-CHAIN AFFILIATE
              </span>
            </div>
            <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
              History of verified operator referrals, earned $WAR & SOL commission bonuses, and active network multipliers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateNewReferral}
            className="px-3.5 py-2 rounded-[10px] bg-gradient-to-r from-emerald-500 to-[#14F195] hover:opacity-90 text-black font-display font-bold text-[11.5px] flex items-center gap-1.5 transition cursor-pointer shadow-md"
            title="Simulate a new referee joining with your referral code"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Simulate Recruit (+Bonus)</span>
          </button>
        </div>
      </div>

      {/* Referral Performance Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-[16px] bg-[#141418] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
            <span>TOTAL REFERRALS</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="font-mono-num text-2xl font-black text-white">
            {referrals.length}
          </div>
          <div className="text-[10px] font-mono-num text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
            <span>100% Verified Miners</span>
          </div>
        </div>

        <div className="p-4 rounded-[16px] bg-[#141418] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
            <span>TOTAL $WAR EARNED</span>
            <Coins className="w-3.5 h-3.5 text-[#FF6A00]" />
          </div>
          <div className="font-mono-num text-2xl font-black text-[#FF6A00]">
            +{totalReferralBonusWAR.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
          <div className="text-[10px] font-mono-num text-zinc-400">
            ≈ ${(totalReferralBonusWAR * warPrice).toFixed(2)} USD Payout
          </div>
        </div>

        <div className="p-4 rounded-[16px] bg-[#141418] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
            <span>TOTAL SOL BONUS</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono-num text-2xl font-black text-emerald-400">
            +{totalReferralBonusSOL.toFixed(3)} SOL
          </div>
          <div className="text-[10px] font-mono-num text-zinc-400">
            ≈ ${(totalReferralBonusSOL * solPrice).toFixed(2)} USD Direct
          </div>
        </div>

        <div className="p-4 rounded-[16px] bg-[#141418] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
            <span>COMMISSION TIER</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono-num text-base font-bold text-amber-300">
            Tier 2 • Scout
          </div>
          <div className="text-[10px] font-mono-num text-purple-300">
            +15% Kickback on Mints
          </div>
        </div>
      </div>

      {/* Referral Link & Code Sharing Bar */}
      <div className="p-4 rounded-[18px] bg-purple-950/20 border border-purple-500/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-mono-num text-purple-300 tracking-wider font-bold">
            YOUR SOLANA PROOF-OF-WAR REFERRAL CODE
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono-num text-lg font-black text-white bg-black/60 px-3.5 py-1.5 rounded-[10px] border border-white/10 tracking-widest">
              {referralCode}
            </div>
            <button
              type="button"
              onClick={handleCopyReferralCode}
              className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 font-mono-num text-[11px] text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedReferralCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-mono-num text-zinc-400 tracking-wider font-bold">
            DIRECT INVITE URL
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono-num text-[11px] text-zinc-300 bg-black/60 px-3 py-2 rounded-[10px] border border-white/10 truncate flex-1 select-all">
              {referralShareUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyReferralLink}
              className="px-3 py-1.5 rounded-[10px] bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 font-mono-num text-[11px] text-purple-300 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedReferralLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Link!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for History */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setReferralFilterTier(tier)}
              className={`px-3 py-1 rounded-[8px] font-mono-num text-[11px] transition cursor-pointer ${
                referralFilterTier === tier
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-black/30 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={referralSearch}
            onChange={(e) => setReferralSearch(e.target.value)}
            placeholder="Filter by operator / address..."
            className="w-full bg-[#121216] border border-white/10 rounded-[10px] pl-8 pr-3 py-1.5 font-mono-num text-[11px] text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Referrals History Table / Cards */}
      <div className="space-y-2.5">
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-8 p-4 rounded-[16px] bg-[#121216] border border-white/5 space-y-2">
            <Users className="w-7 h-7 text-zinc-600 mx-auto" />
            <div className="font-display text-[13px] text-zinc-400 font-bold">
              No matching referral records found
            </div>
            <p className="font-mono-num text-[10px] text-zinc-500">
              Try changing your filter query or invite a new miner to your fleet.
            </p>
          </div>
        ) : (
          filteredReferrals.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-[16px] bg-[#121216] border border-white/5 hover:border-white/15 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Referee Identity & Onboarded Rig */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-black/60 border border-white/10 flex items-center justify-center font-mono-num text-[13px] font-bold text-white shrink-0">
                  {item.refereeHandle.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[13px] text-white">
                      {item.refereeHandle}
                    </span>
                    <span className="font-mono-num text-[10px] text-zinc-400">
                      ({item.refereeAddress})
                    </span>
                    {item.rewardTier && (
                      <span
                        className={`px-2 py-0.2 rounded font-mono-num text-[9px] font-bold ${
                          item.rewardTier === 'Legendary'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : item.rewardTier === 'Epic'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : item.rewardTier === 'Rare'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-700/20 text-zinc-400 border border-zinc-700/30'
                        }`}
                      >
                        {item.rewardTier.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="font-mono-num text-[10px] text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-zinc-300 font-medium">
                      Rig: {item.rigMinted || 'War Miner Fleet Rig'}
                    </span>
                    <span>•</span>
                    <span className="text-purple-400 flex items-center gap-1">
                      <span>Tx: {item.txHash || '5KnpL9...4wQm'}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Date of Referral and Earned Bonus Amount */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                {/* Date of Referral */}
                <div className="text-left md:text-right font-mono-num">
                  <div className="text-[10px] text-zinc-500">REFERRAL DATE</div>
                  <div className="text-[12px] text-zinc-200 flex items-center gap-1.5 mt-0.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Earned Bonus Amount */}
                <div className="text-right font-mono-num">
                  <div className="text-[10px] text-zinc-500">EARNED BONUS</div>
                  <div className="text-[15px] font-bold text-emerald-400 flex items-baseline justify-end gap-1 mt-0.5">
                    <span>+{item.bonusAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-500 font-normal">$WAR</span>
                    {item.bonusSol && item.bonusSol > 0 && (
                      <span className="text-[11px] text-purple-300 ml-1 font-bold">
                        (+{item.bonusSol.toFixed(2)} SOL)
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-[#14F195] flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Confirmed On-Chain</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* TOP SUB-NAVIGATION: OVERVIEW VS SETTINGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#0E0E12] border border-white/10 rounded-[20px] inner-shadow">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-[14px] border border-white/5 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelectProfileView('overview')}
            className={`px-4 py-2 rounded-[10px] font-display font-bold text-[12px] flex items-center gap-2 transition cursor-pointer ${
              profileView === 'overview'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Operator Identity & Vault</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectProfileView('referrals')}
            className={`px-4 py-2 rounded-[10px] font-display font-bold text-[12px] flex items-center gap-2 transition cursor-pointer ${
              profileView === 'referrals'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-[#14F195] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-[#14F195]" />
            <span>Referral Network</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono-num font-bold">
              {referrals.length} RECRUITS
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectProfileView('settings')}
            className={`px-4 py-2 rounded-[10px] font-display font-bold text-[12px] flex items-center gap-2 transition cursor-pointer relative ${
              profileView === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#14F195]" />
            <span>Profile Settings</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] text-[9px] font-mono-num font-bold">
              CHANGE STUFF
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
            )}
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 px-2">
          {saveSuccessMsg && (
            <span className="text-[11px] font-mono-num text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}

          {profileView === 'settings' && hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="px-3.5 py-1.5 rounded-[10px] bg-gradient-to-r from-emerald-500 to-[#14F195] text-black font-display font-bold text-[12px] flex items-center gap-1.5 cursor-pointer shadow-lg hover:opacity-95 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenWalletModal('create')}
            className="px-3 py-1.5 rounded-[10px] bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 font-mono-num text-[11px] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#14F195]" />
            <span>Launch Creation Walkthrough</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: OVERVIEW & SOLANA VAULT */}
      {profileView === 'overview' && (
        <div className="space-y-6">
          {/* Top Banner & Operator Identity Card */}
          <div className="relative rounded-[24px] bg-[#0E0E12] border border-white/10 overflow-hidden inner-shadow">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -top-24 -left-12 w-96 h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 opacity-20 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute -bottom-24 -right-12 w-96 h-48 bg-gradient-to-r from-[#FF6A00] to-purple-600 opacity-15 blur-3xl rounded-full" />

            {/* Banner Graphic Header */}
            <div className="h-32 sm:h-36 bg-gradient-to-r from-[#170E28] via-[#0E0E15] to-[#1F120A] border-b border-white/[0.08] relative px-6 flex items-end justify-between pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono-num text-purple-300 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/40">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
                <span>SOLANA CLUSTER // {settings.networkCluster.toUpperCase()}</span>
                <span className="opacity-40">•</span>
                <span className="text-[#FF6A00] font-bold">{currentClanObj.name.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProfileView('settings')}
                  className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-mono-num text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Configure Settings</span>
                </button>
              </div>
            </div>

            {/* Operator Main Identity Row */}
            <div className="p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
                <div className="flex items-end gap-4">
                  {/* Avatar Icon */}
                  <div
                    className={`w-24 h-24 rounded-[22px] bg-gradient-to-br ${currentAvatarObj.bg} p-1 shadow-2xl relative border-2 border-[#0E0E12]`}
                  >
                    <div className="w-full h-full bg-[#121216]/90 rounded-[18px] flex items-center justify-center text-4xl">
                      {currentAvatarObj.icon}
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#14F195] text-black font-mono-num text-[10px] font-black shadow">
                      LVL {userProfile.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-black text-2xl text-white tracking-tight">
                        {userProfile.handle}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono-num text-[10px] font-bold">
                        {userProfile.title}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold flex items-center gap-1"
                        style={{ backgroundColor: `${currentClanObj.color}20`, color: currentClanObj.color }}
                      >
                        <span>{currentClanObj.icon}</span>
                        <span>{currentClanObj.name}</span>
                      </span>
                    </div>

                    <p className="font-mono-num text-[12px] text-zinc-400 mt-1 max-w-xl">
                      {userProfile.bio}
                    </p>
                  </div>
                </div>

                {/* Level XP Progress */}
                <div className="w-full sm:w-64 p-3 rounded-[14px] bg-[#141418] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
                    <span>OPERATOR XP PROGRESS</span>
                    <span className="text-[#14F195] font-bold">
                      {userProfile.xp} / {userProfile.xpNextLevel} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-[#14F195] to-[#FF6A00]"
                      style={{
                        width: `${Math.min(100, (userProfile.xp / userProfile.xpNextLevel) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Highlight Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08]">
                <div className="p-3.5 rounded-[16px] bg-[#141418] border border-white/5">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono-num">
                    <span>EST. NET WORTH</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="font-mono-num text-lg font-black text-white mt-1">
                    ${totalUsdNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-mono-num text-emerald-400">
                    SOL + $WAR Balances
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#141418] border border-white/5">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono-num">
                    <span>ACTIVE STREAK</span>
                    <Flame className="w-3.5 h-3.5 text-[#FF6A00]" />
                  </div>
                  <div className="font-mono-num text-lg font-black text-[#FF6A00] mt-1 flex items-center gap-1.5">
                    <span>{streak} DAYS</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF6A00] font-bold">
                      +{(streakBoost * 100).toFixed(0)}%
                    </span>
                  </div>
                  <button
                    onClick={onCheckInStreak}
                    className="text-[10px] font-mono-num text-zinc-400 hover:text-white underline cursor-pointer mt-0.5"
                  >
                    Check In Daily +
                  </button>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#141418] border border-white/5">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono-num">
                    <span>TOTAL HASHRATE</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="font-mono-num text-lg font-black text-white mt-1">
                    {effectiveTH.toFixed(0)} TH/s
                  </div>
                  <div className="text-[10px] font-mono-num text-zinc-500">
                    {onlineMinersCount}/{totalMinersCount} Rigs Online
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#141418] border border-white/5">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono-num">
                    <span>PROTOCOL BURN</span>
                    <Flame className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="font-mono-num text-lg font-black text-purple-300 mt-1">
                    {Math.floor(burnedWar).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono-num text-zinc-500">
                    Global $WAR Contribution
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content: Solana Chain Vault (Left) & Achievements/Stats (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: SOLANA CHAIN VAULT */}
            <div className="lg:col-span-7 space-y-6">
              {/* Solana Keypair Card */}
              <div className="card rounded-[22px] p-5 inner-shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple-600 to-[#14F195] p-0.5">
                      <div className="w-full h-full bg-[#0E0E12] rounded-[8px] flex items-center justify-center font-bold text-xs text-[#14F195]">
                        ◎
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[14px] text-white">
                        ACTIVE SOLANA KEYPAIR
                      </h3>
                      <div className="font-mono-num text-[10px] text-zinc-400">
                        {activeWallet ? activeWallet.name : 'No Wallet Connected'} • Cluster {settings.networkCluster}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenWalletModal('create')}
                      className="px-2.5 py-1 rounded-[8px] bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[11px] font-mono-num text-purple-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>+ Create Wallet</span>
                    </button>
                    <button
                      onClick={() => onOpenWalletModal('wallets')}
                      className="px-2.5 py-1 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono-num text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Wallet className="w-3 h-3" />
                      <span>Switch ({wallets.length})</span>
                    </button>
                  </div>
                </div>

                {/* Public Address Display */}
                {activeWallet ? (
                  <div className="p-4 rounded-[16px] bg-[#121216] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
                      <span>SOLANA BASE58 PUBLIC ADDRESS</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                        ED25519 VERIFIED
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3 bg-black/60 rounded-[12px] border border-white/5">
                      <span className="font-mono-num text-[12px] text-zinc-200 select-all break-all">
                        {activeWallet.publicKey}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={handleCopySolanaAddress}
                          className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                          title="Copy Address"
                        >
                          {copiedAddress ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setShowQrModal(true)}
                          className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                          title="Display QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://solscan.io/account/${activeWallet.publicKey}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-purple-400 hover:text-purple-300 transition"
                          title="View on Solscan Explorer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Balances Display */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
                        <div className="font-mono-num text-[10px] text-zinc-500">NATIVE SOL</div>
                        <div className="font-mono-num text-base font-bold text-emerald-400 mt-0.5">
                          {activeSolBalance.toFixed(3)} SOL
                        </div>
                        <div className="font-mono-num text-[10px] text-zinc-400">
                          ≈ ${(activeSolBalance * solPrice).toFixed(2)} USD
                        </div>
                      </div>

                      <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
                        <div className="font-mono-num text-[10px] text-zinc-500">$WAR SPL TOKEN</div>
                        <div className="font-mono-num text-base font-bold text-[#FF6A00] mt-0.5">
                          {formatNumber(activeWarBalance)}
                        </div>
                        <div className="font-mono-num text-[10px] text-zinc-400">
                          ≈ ${(activeWarBalance * warPrice).toFixed(2)} USD
                        </div>
                      </div>

                      <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06] col-span-2 sm:col-span-1">
                        <div className="font-mono-num text-[10px] text-zinc-500">NETWORK CLUSTER</div>
                        <div className="font-mono-num text-base font-bold text-purple-300 mt-0.5 capitalize">
                          {settings.networkCluster}
                        </div>
                        <div className="font-mono-num text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Cluster Synced</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => onAirdropSol(activeWallet.id)}
                        className="flex-1 min-w-[130px] py-2.5 px-3 rounded-[12px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono-num text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>+1.0 SOL Airdrop</span>
                      </button>

                      <button
                        onClick={() => setShowSendModal(true)}
                        className="flex-1 min-w-[130px] py-2.5 px-3 rounded-[12px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-mono-num text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Transfer / Send</span>
                      </button>

                      <button
                        onClick={handleToggleRevealSecret}
                        className="py-2.5 px-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 font-mono-num text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {revealSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                        <span>{revealSecret ? 'Hide Key' : 'Export Key'}</span>
                      </button>
                    </div>

                    {/* Export Secret Key Box */}
                    {revealSecret && (
                      <div className="p-3.5 rounded-[12px] bg-black/80 border border-rose-500/30 space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono-num text-[11px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ED25519 PRIVATE KEY (BASE58) - DO NOT SHARE</span>
                        </div>
                        <div className="p-2.5 bg-black rounded-[8px] font-mono-num text-[11px] text-zinc-300 break-all select-all border border-white/10">
                          {activeWallet.secretKey}
                        </div>
                        {activeWallet.mnemonic && (
                          <div>
                            <div className="text-[10px] font-mono-num text-zinc-400 mb-1">
                              12-Word Recovery Seed Phrase:
                            </div>
                            <div className="p-2.5 bg-black rounded-[8px] font-mono-num text-[11px] text-zinc-300 select-all border border-white/10">
                              {activeWallet.mnemonic}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 p-4 rounded-[16px] bg-[#121216] border border-white/5 space-y-3">
                    <Wallet className="w-8 h-8 text-zinc-600 mx-auto" />
                    <div className="font-display font-bold text-zinc-300 text-[14px]">
                      No Solana Wallet Active
                    </div>
                    <p className="text-[11px] font-mono-num text-zinc-500 max-w-sm mx-auto">
                      Create a new Solana wallet or connect an existing one to unlock genuine Ed25519 on-chain mining vaults.
                    </p>
                    <button
                      onClick={() => onOpenWalletModal('create')}
                      className="py-2.5 px-4 rounded-[12px] bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white font-display font-bold text-[12px] cursor-pointer"
                    >
                      Start Wallet Creation Walkthrough
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Solana Transactions / History */}
              <div className="card rounded-[22px] p-5 inner-shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="font-display font-bold text-[13px] text-white">
                      RECENT SOLANA ON-CHAIN ACTIVITY
                    </h3>
                  </div>
                  <span className="font-mono-num text-[11px] text-zinc-500">
                    {history.length} Transactions
                  </span>
                </div>

                <div className="space-y-2">
                  {history.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-[14px] bg-[#121216] border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-mono-num text-[11px] font-bold ${
                            tx.amount >= 0
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-display font-bold text-[12px] text-white">
                            {tx.desc}
                          </div>
                          <div className="font-mono-num text-[10px] text-zinc-500 flex items-center gap-2">
                            <span>{tx.time}</span>
                            <span>•</span>
                            <span className="text-zinc-400">{tx.hash.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono-num">
                        <div
                          className={`text-[12px] font-bold ${
                            tx.amount > 0
                              ? 'text-emerald-400'
                              : tx.amount < 0
                              ? 'text-rose-400'
                              : 'text-zinc-400'
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount < 0 ? tx.amount.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-[9px] text-purple-400 flex items-center gap-1 justify-end">
                          <span>Confirmed</span>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACHIEVEMENTS & FLEET STATS */}
            <div className="lg:col-span-5 space-y-6">
              {/* Operator Achievements Card */}
              <div className="card rounded-[22px] p-5 inner-shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FF6A00]" />
                    <h3 className="font-display font-bold text-[13px] text-white">
                      TROPHIES & ACHIEVEMENTS
                    </h3>
                  </div>
                  <span className="font-mono-num text-[11px] text-zinc-400">
                    {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
                  </span>
                </div>

                <div className="space-y-3">
                  {achievements.map((ach) => {
                    const isClaimed = claimedAchievements[ach.id];

                    return (
                      <div
                        key={ach.id}
                        className={`p-3.5 rounded-[16px] border transition ${
                          ach.unlocked
                            ? 'bg-[#14131C] border-purple-500/30'
                            : 'bg-[#101012] border-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-[10px] bg-black/40 border border-white/10 flex items-center justify-center text-lg shrink-0">
                              {ach.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-[12px] text-white">
                                  {ach.title}
                                </span>
                                {ach.tier === 'solana' && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono-num text-[8px] font-bold">
                                    SOLANA
                                  </span>
                                )}
                              </div>
                              <p className="font-mono-num text-[10px] text-zinc-400 mt-0.5 leading-snug">
                                {ach.description}
                              </p>
                            </div>
                          </div>

                          {ach.unlocked ? (
                            <button
                              type="button"
                              disabled={isClaimed}
                              onClick={() => handleClaimAchievement(ach)}
                              className={`shrink-0 px-2 py-1 rounded-[8px] font-mono-num text-[10px] font-bold transition cursor-pointer ${
                                isClaimed
                                  ? 'bg-white/5 text-zinc-500'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isClaimed ? 'Claimed' : `Claim +${ach.rewardXp} XP`}
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono-num text-zinc-500 shrink-0">
                              Locked
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${ach.unlocked ? 'bg-purple-500' : 'bg-zinc-700'}`}
                              style={{
                                width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono-num text-[9px] text-zinc-500 shrink-0">
                            {ach.progress}/{ach.maxProgress}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fleet Hardware Overview */}
              <div className="card rounded-[22px] p-5 inner-shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display font-bold text-[13px] text-white">
                      RIG FLEET TELEMETRY
                    </h3>
                  </div>
                  <span className="font-mono-num text-[11px] text-[#14F195]">
                    {effectiveTH.toFixed(0)} TH/s Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {miners.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-[14px] bg-[#121216] border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {m.avatarUrl ? (
                          <div className="w-8 h-8 rounded-[8px] bg-black/50 border border-white/10 p-0.5 overflow-hidden shrink-0">
                            <img
                              src={m.avatarUrl}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: m.color,
                              boxShadow: `0 0 8px ${m.color}`,
                            }}
                          />
                        )}
                        <div>
                          <div className="font-display font-bold text-[12px] text-white">
                            {m.name}
                          </div>
                          <div className="font-mono-num text-[10px] text-zinc-500">
                            Lvl {m.level} • {m.condition}% Health • {m.wth} W/TH
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono-num">
                        <div className="text-[12px] font-bold text-white">{m.th} TH/s</div>
                        <div
                          className={`text-[9px] font-semibold ${
                            m.status === 'ONLINE' ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {m.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REFERRAL NETWORK & BONUS HISTORY SECTION */}
          {renderReferralSection()}
        </div>
      )}

      {/* VIEW MODE 2: DEDICATED REFERRAL NETWORK */}
      {profileView === 'referrals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderReferralSection()}
        </div>
      )}

      {/* VIEW MODE 3: DEDICATED PROFILE SETTINGS & CUSTOMIZATION */}
      {profileView === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Settings Top Card & Navigation Subtabs */}
          <div className="card rounded-[24px] p-6 inner-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#14F195]" />
                  <h2 className="font-display font-black text-xl text-white tracking-wide">
                    PROFILE & VAULT SETTINGS
                  </h2>
                </div>
                <p className="font-mono-num text-[12px] text-zinc-400 mt-1">
                  Customize your operator identity, Solana Devnet/Mainnet RPC, fleet automation rules, and visual preferences.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-mono-num text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllSettings}
                  className="px-4 py-2 rounded-[12px] bg-gradient-to-r from-purple-600 via-indigo-600 to-[#14F195] text-black font-display font-black text-[12px] flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>

            {/* Sub-Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSettingsCategory('identity')}
                className={`px-3.5 py-2 rounded-[12px] font-mono-num text-[12px] font-bold flex items-center gap-2 transition cursor-pointer ${
                  settingsCategory === 'identity'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Operator Identity</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsCategory('network')}
                className={`px-3.5 py-2 rounded-[12px] font-mono-num text-[12px] font-bold flex items-center gap-2 transition cursor-pointer ${
                  settingsCategory === 'network'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>2. Solana Cluster & Security</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsCategory('mining')}
                className={`px-3.5 py-2 rounded-[12px] font-mono-num text-[12px] font-bold flex items-center gap-2 transition cursor-pointer ${
                  settingsCategory === 'mining'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>3. Fleet Automation</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsCategory('display')}
                className={`px-3.5 py-2 rounded-[12px] font-mono-num text-[12px] font-bold flex items-center gap-2 transition cursor-pointer ${
                  settingsCategory === 'display'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>4. Display & Interface</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsCategory('backup')}
                className={`px-3.5 py-2 rounded-[12px] font-mono-num text-[12px] font-bold flex items-center gap-2 transition cursor-pointer ${
                  settingsCategory === 'backup'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>5. Backup & Data Management</span>
              </button>
            </div>

            {/* CATEGORY 1: OPERATOR IDENTITY */}
            {settingsCategory === 'identity' && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Handle / Username */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono-num text-zinc-400">
                      OPERATOR CALLSIGN / HANDLE
                    </label>
                    <input
                      type="text"
                      value={handleInput}
                      onChange={(e) => {
                        setHandleInput(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g. SolanaValkyrie"
                      className="w-full bg-[#141418] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-display text-[14px] text-white focus:outline-none focus:border-purple-500"
                    />
                    <div className="text-[10px] font-mono-num text-zinc-500">
                      Displayed on the global mining leaderboard and block verification records.
                    </div>
                  </div>

                  {/* Title / Rank */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono-num text-zinc-400">
                      OPERATOR TITLE / CUSTOM RANK
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={OPERATOR_TITLES.includes(titleInput) ? titleInput : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') {
                            setTitleInput(e.target.value);
                            setHasUnsavedChanges(true);
                          }
                        }}
                        className="bg-[#141418] border border-white/10 rounded-[12px] px-3 py-2.5 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {OPERATOR_TITLES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                        <option value="custom">Custom Title...</option>
                      </select>

                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => {
                          setTitleInput(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Custom Title"
                        className="flex-1 bg-[#141418] border border-white/10 rounded-[12px] px-3 py-2 font-display text-[13px] text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio / Motto */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    BIO / MOTTO
                  </label>
                  <textarea
                    rows={3}
                    value={bioInput}
                    onChange={(e) => {
                      setBioInput(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter your Proof-of-War operator bio..."
                    className="w-full bg-[#141418] border border-white/10 rounded-[12px] p-3 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    CHOOSE OPERATOR AVATAR
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(opt.id);
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3 rounded-[16px] border flex items-center gap-3 transition cursor-pointer text-left ${
                          selectedAvatar === opt.id
                            ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40'
                            : 'bg-[#141418] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${opt.bg} flex items-center justify-center text-xl shrink-0`}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <div className="font-display font-bold text-[12px] text-white">
                            {opt.name}
                          </div>
                          <div className="font-mono-num text-[9px] text-zinc-500">
                            {selectedAvatar === opt.id ? 'SELECTED' : 'Tap to select'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clan Affiliation */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    PRIMARY CLAN AFFILIATION
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {CLAN_OPTIONS.map((clan) => (
                      <button
                        key={clan.id}
                        type="button"
                        onClick={() => {
                          setSelectedClan(clan.id);
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3.5 rounded-[16px] border text-left transition cursor-pointer ${
                          selectedClan === clan.id
                            ? 'bg-[#181524] border-purple-500 shadow-md'
                            : 'bg-[#141418] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{clan.icon}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: clan.color }}
                          />
                        </div>
                        <div className="font-display font-bold text-[13px] text-white">
                          {clan.name}
                        </div>
                        <div className="font-mono-num text-[10px] text-zinc-400 mt-1">
                          {clan.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Favorite Rig Showcase */}
                {miners.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono-num text-zinc-400">
                      FEATURED MINING RIG BADGE
                    </label>
                    <select
                      value={favoriteMinerId || miners[0]?.id}
                      onChange={(e) => {
                        setFavoriteMinerId(Number(e.target.value));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#141418] border border-white/10 rounded-[12px] px-3 py-2.5 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {miners.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.rarity} - {m.th} TH/s - Lvl {m.level})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Referral Code Tag */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    CUSTOM ON-CHAIN REFERRAL TAG / CODE
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => {
                        setReferralCodeInput(e.target.value.toUpperCase());
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g. VALKYRIE-SOL-88"
                      className="flex-1 bg-[#141418] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-mono-num font-bold text-[13px] text-[#14F195] focus:outline-none focus:border-purple-500 tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReferralCodeInput(`WAR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`);
                        setHasUnsavedChanges(true);
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[12px] font-mono-num text-[11px] text-zinc-300 transition cursor-pointer"
                    >
                      Randomize
                    </button>
                  </div>
                  <div className="text-[10px] font-mono-num text-zinc-500">
                    Your unique referral identifier used to track recruitments and award on-chain bonuses.
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY 2: SOLANA NETWORK & RPC */}
            {settingsCategory === 'network' && (
              <div className="space-y-5 pt-2">
                <div className="p-4 rounded-[18px] bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#14F195] shrink-0 mt-0.5" />
                  <div className="font-mono-num text-[11.5px] text-zinc-300 leading-relaxed">
                    Proof-of-War connects directly to Solana clusters. On Devnet, SOL gas is free and tokens are instant. You can switch between Devnet, Testnet, or simulate on Mainnet-Beta.
                  </div>
                </div>

                {/* Network Cluster Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    SOLANA CLUSTER TARGET
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'devnet', name: 'Devnet', badge: 'Active (Free Gas)', desc: 'Fast transactions & faucet' },
                      { id: 'testnet', name: 'Testnet', badge: 'Validator Test', desc: 'Stress testing' },
                      { id: 'mainnet-beta', name: 'Mainnet-Beta', badge: 'Simulated', desc: 'Read-only simulation' },
                    ].map((cl) => (
                      <button
                        key={cl.id}
                        type="button"
                        onClick={() => updateSettingField('networkCluster', cl.id as any)}
                        className={`p-3.5 rounded-[16px] border text-left transition cursor-pointer ${
                          settings.networkCluster === cl.id
                            ? 'bg-[#181524] border-[#14F195] shadow-md shadow-emerald-950/30'
                            : 'bg-[#141418] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-display font-bold text-[13px] text-white">
                          {cl.name}
                        </div>
                        <div className="font-mono-num text-[10px] text-emerald-400 mt-0.5">
                          {cl.badge}
                        </div>
                        <div className="font-mono-num text-[9px] text-zinc-500 mt-1">
                          {cl.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom RPC Endpoint */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    RPC ENDPOINT URL
                  </label>
                  <input
                    type="text"
                    value={settings.rpcEndpoint}
                    onChange={(e) => updateSettingField('rpcEndpoint', e.target.value)}
                    placeholder="https://api.devnet.solana.com"
                    className="w-full bg-[#141418] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    {[
                      { name: 'Official Solana Devnet', url: 'https://api.devnet.solana.com' },
                      { name: 'Helius Devnet', url: 'https://devnet.helius-rpc.com/?api-key=default' },
                      { name: 'QuickNode Devnet', url: 'https://solana-devnet.quiknode.pro' },
                    ].map((rpc) => (
                      <button
                        key={rpc.name}
                        type="button"
                        onClick={() => updateSettingField('rpcEndpoint', rpc.url)}
                        className="px-2.5 py-1 rounded-[6px] bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono-num text-zinc-300 cursor-pointer"
                      >
                        {rpc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Fee Setting */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    PRIORITY COMPUTE UNIT FEE (SOLANA SPEED)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'normal', name: 'Normal', lamports: '5,000 Lamports', desc: 'Standard speed' },
                      { id: 'turbo', name: 'Turbo (Recommended)', lamports: '50,000 Lamports', desc: 'Fast block inclusion' },
                      { id: 'ultra', name: 'Ultra', lamports: '200,000 Lamports', desc: 'Maximum priority' },
                    ].map((fee) => (
                      <button
                        key={fee.id}
                        type="button"
                        onClick={() => updateSettingField('priorityFeeLevel', fee.id as any)}
                        className={`p-3 rounded-[14px] border text-left transition cursor-pointer ${
                          settings.priorityFeeLevel === fee.id
                            ? 'bg-purple-950/60 border-purple-500'
                            : 'bg-[#141418] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-display font-bold text-[12px] text-white">
                          {fee.name}
                        </div>
                        <div className="font-mono-num text-[10px] text-purple-300">
                          {fee.lamports}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security PIN for Key Export */}
                <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-[13px] text-white flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-[#14F195]" />
                        <span>VAULT SECURITY PIN PROTECTION</span>
                      </div>
                      <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                        Require a 4-digit PIN before exporting private keys or seed phrase.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requirePinForExport}
                        onChange={(e) => updateSettingField('requirePinForExport', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {settings.requirePinForExport && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                      <label className="text-[11px] font-mono-num text-zinc-400">
                        CHANGE 4-DIGIT PIN:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={settings.securityPin || '7788'}
                        onChange={(e) => updateSettingField('securityPin', e.target.value.replace(/\D/g, ''))}
                        className="w-24 bg-black border border-white/20 rounded-[8px] px-2 py-1 text-center font-mono-num tracking-[0.3em] text-white text-[14px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CATEGORY 3: FLEET AUTOMATION & MINING */}
            {settingsCategory === 'mining' && (
              <div className="space-y-5 pt-2">
                <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-[13px] text-white flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <span>AUTO-REPAIR FLEET HARDWARE</span>
                      </div>
                      <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                        Automatically restore condition for mining rigs when health drops below threshold.
                      </p>
                    </div>

                    <select
                      value={settings.autoRepairThreshold}
                      onChange={(e) => updateSettingField('autoRepairThreshold', Number(e.target.value))}
                      className="bg-black/60 border border-white/15 rounded-[10px] px-3 py-1.5 font-mono-num text-[12px] text-white cursor-pointer"
                    >
                      <option value={0}>Off (Manual Repair)</option>
                      <option value={50}>Repair when &lt; 50% Health</option>
                      <option value={30}>Repair when &lt; 30% Health</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-[13px] text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#FF6A00]" />
                      <span>AUTO-COMPOUND MINING YIELD</span>
                    </div>
                    <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                      Automatically re-stake harvested $WAR into veWAR governance for yield boosts.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoCompoundStaking}
                      onChange={(e) => updateSettingField('autoCompoundStaking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]"></div>
                  </label>
                </div>

                <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-[13px] text-white flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <span>HASHRATE & RIG ALERTS</span>
                    </div>
                    <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                      Display visual notifications when rigs complete maintenance or streak rewards are ready.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.hashrateAlerts}
                      onChange={(e) => updateSettingField('hashrateAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* CATEGORY 4: DISPLAY & INTERFACE */}
            {settingsCategory === 'display' && (
              <div className="space-y-5 pt-2">
                {/* Primary Currency */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    PRIMARY CURRENCY CONVERSION
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'USD', symbol: '$ USD', desc: 'United States Dollar' },
                      { id: 'SOL', symbol: '◎ SOL', desc: 'Native Solana Units' },
                      { id: 'EUR', symbol: '€ EUR', desc: 'Euro Protocol Standard' },
                    ].map((cur) => (
                      <button
                        key={cur.id}
                        type="button"
                        onClick={() => updateSettingField('currency', cur.id as any)}
                        className={`p-3.5 rounded-[16px] border text-left transition cursor-pointer ${
                          settings.currency === cur.id
                            ? 'bg-purple-950/60 border-purple-500'
                            : 'bg-[#141418] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="font-display font-bold text-[14px] text-white">
                          {cur.symbol}
                        </div>
                        <div className="font-mono-num text-[10px] text-zinc-400 mt-1">
                          {cur.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number Format */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono-num text-zinc-400">
                    NUMBER FORMATTING
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateSettingField('numberFormat', 'compact')}
                      className={`p-3 rounded-[14px] border text-left cursor-pointer transition ${
                        settings.numberFormat === 'compact'
                          ? 'bg-purple-950/60 border-purple-500'
                          : 'bg-[#141418] border-white/10'
                      }`}
                    >
                      <div className="font-display font-bold text-[12px] text-white">
                        Compact Notation
                      </div>
                      <div className="font-mono-num text-[11px] text-zinc-400">
                        e.g. 12.4K $WAR, 85.4M Burned
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSettingField('numberFormat', 'full')}
                      className={`p-3 rounded-[14px] border text-left cursor-pointer transition ${
                        settings.numberFormat === 'full'
                          ? 'bg-purple-950/60 border-purple-500'
                          : 'bg-[#141418] border-white/10'
                      }`}
                    >
                      <div className="font-display font-bold text-[12px] text-white">
                        Full Precision
                      </div>
                      <div className="font-mono-num text-[11px] text-zinc-400">
                        e.g. 12,450.20 $WAR, 85,423,109 Burned
                      </div>
                    </button>
                  </div>
                </div>

                {/* Neon Glow Effects Toggle */}
                <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-[13px] text-white">
                      AMBIENT CYBER NEON GLOWS
                    </div>
                    <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                      Enable glowing blurred lighting accents across the dashboard.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.neonGlowEffects}
                      onChange={(e) => updateSettingField('neonGlowEffects', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14F195]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* CATEGORY 5: BACKUP & DATA MANAGEMENT */}
            {settingsCategory === 'backup' && (
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export Backup JSON */}
                  <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 font-display font-bold text-[13px]">
                      <Download className="w-4 h-4" />
                      <span>EXPORT PROFILE BACKUP</span>
                    </div>
                    <p className="font-mono-num text-[11px] text-zinc-400 leading-relaxed">
                      Download your operator profile, custom titles, clan affiliation, and interface settings to an offline JSON backup.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportProfileBackup}
                      className="w-full py-2.5 px-3 rounded-[12px] bg-purple-600 hover:bg-purple-500 text-white font-mono-num text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download backup.json</span>
                    </button>
                  </div>

                  {/* Import Backup JSON */}
                  <div className="p-4 rounded-[18px] bg-[#141418] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-[#14F195] font-display font-bold text-[13px]">
                      <Upload className="w-4 h-4" />
                      <span>IMPORT PROFILE CONFIG</span>
                    </div>
                    <p className="font-mono-num text-[11px] text-zinc-400 leading-relaxed">
                      Restore your operator persona and settings from a previously saved backup file.
                    </p>
                    <label className="w-full py-2.5 px-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono-num text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose .json file</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportProfileBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-[18px] bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-[13px]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DANGER ZONE // RESET DATA</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono-num text-[11px] text-zinc-400 max-w-md">
                      Clear transaction history or revert your operator identity back to the original genesis defaults.
                    </p>
                    <div className="flex items-center gap-2">
                      {onClearHistory && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Clear all local transaction logs?')) {
                              onClearHistory();
                            }
                          }}
                          className="px-3 py-1.5 rounded-[10px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono-num text-[11px] cursor-pointer"
                        >
                          Clear History
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetToDefaults}
                        className="px-3 py-1.5 rounded-[10px] bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-mono-num text-[11px] cursor-pointer font-bold"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIN PROMPT MODAL */}
      {pinPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setPinPromptOpen(false)}
          />
          <div className="relative w-full max-w-[360px] bg-[#0E0E12] border border-white/15 rounded-[22px] p-6 space-y-4 text-center inner-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-[15px] text-white">
                VAULT PIN REQUIRED
              </h3>
              <p className="font-mono-num text-[11px] text-zinc-400 mt-1">
                Enter your 4-digit security PIN to reveal your Solana Ed25519 private key.
              </p>
            </div>

            <form onSubmit={handleConfirmPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                placeholder="••••"
                className="w-36 mx-auto bg-black/60 border border-white/20 rounded-[12px] px-3.5 py-2.5 font-mono-num text-center tracking-[0.5em] text-[20px] text-white focus:outline-none focus:border-purple-500"
              />

              {pinError && (
                <div className="text-[11px] font-mono-num text-rose-400">{pinError}</div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPinPromptOpen(false)}
                  className="flex-1 py-2 rounded-[10px] bg-white/5 hover:bg-white/10 text-zinc-400 font-mono-num text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-500 text-white font-mono-num text-[11px] font-bold cursor-pointer"
                >
                  Unlock Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQrModal && activeWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowQrModal(false)}
          />
          <div className="relative w-full max-w-[340px] bg-[#0E0E12] border border-white/10 rounded-[22px] p-6 text-center space-y-4 inner-shadow">
            <h3 className="font-display font-bold text-[14px] text-white">
              RECEIVE SOLANA / $WAR
            </h3>

            {/* Visual SVG QR Code Mock with Solana Center Logo */}
            <div className="w-56 h-56 mx-auto bg-white p-4 rounded-[18px] shadow-xl flex flex-col items-center justify-center relative">
              <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-black flex items-center justify-center">
                    <div className="w-4 h-4 bg-black" />
                  </div>
                  <div className="w-10 h-10 border-4 border-black flex items-center justify-center">
                    <div className="w-4 h-4 bg-black" />
                  </div>
                </div>

                <div className="flex items-center justify-center my-auto">
                  <div className="w-12 h-12 rounded-xl bg-purple-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                    ◎
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-black flex items-center justify-center">
                    <div className="w-4 h-4 bg-black" />
                  </div>
                  <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                    <div className="w-2 h-2 bg-black" />
                  </div>
                </div>
              </div>
            </div>

            <div className="font-mono-num text-[11px] text-zinc-300 break-all select-all p-2 bg-black/50 rounded-[10px] border border-white/10">
              {activeWallet.publicKey}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopySolanaAddress}
                className="flex-1 py-2.5 rounded-[12px] bg-purple-600 hover:bg-purple-500 text-white font-mono-num text-[11px] font-bold cursor-pointer"
              >
                {copiedAddress ? 'Address Copied!' : 'Copy Solana Address'}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-zinc-400 font-mono-num text-[11px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND / TRANSFER TOKENS MODAL */}
      {showSendModal && activeWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSendModal(false)}
          />
          <div className="relative w-full max-w-[440px] bg-[#0E0E12] border border-white/10 rounded-[22px] p-6 space-y-4 inner-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                <h3 className="font-display font-bold text-[14px] text-white">
                  TRANSFER ON SOLANA CHAIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSend} className="space-y-4">
              {/* Token Selector */}
              <div>
                <label className="block text-[10px] font-mono-num text-zinc-400 mb-1.5">
                  SELECT ASSET
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendToken('SOL')}
                    className={`p-2.5 rounded-[12px] border text-left flex items-center justify-between cursor-pointer transition ${
                      sendToken === 'SOL'
                        ? 'bg-purple-950/60 border-purple-500'
                        : 'bg-black/40 border-white/10 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold text-[12px] text-white">SOL</div>
                      <div className="font-mono-num text-[10px] text-zinc-400">
                        {activeSolBalance.toFixed(3)} available
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">◎</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendToken('WAR')}
                    className={`p-2.5 rounded-[12px] border text-left flex items-center justify-between cursor-pointer transition ${
                      sendToken === 'WAR'
                        ? 'bg-[#FF6A00]/20 border-[#FF6A00]'
                        : 'bg-black/40 border-white/10 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold text-[12px] text-white">$WAR</div>
                      <div className="font-mono-num text-[10px] text-zinc-400">
                        {activeWarBalance.toLocaleString()} available
                      </div>
                    </div>
                    <span className="text-[#FF6A00] font-bold">W</span>
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono-num text-zinc-400">
                  <span>RECIPIENT SOLANA ADDRESS (BASE58)</span>
                  <button
                    type="button"
                    onClick={() => setSendRecipient('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')}
                    className="text-purple-400 hover:underline cursor-pointer"
                  >
                    Demo Address
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sendRecipient}
                  onChange={(e) => {
                    setSendRecipient(e.target.value);
                    setSendError('');
                  }}
                  placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                  className="w-full bg-[#141418] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono-num text-zinc-400">
                  <span>AMOUNT TO SEND</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSendAmount(
                        sendToken === 'SOL'
                          ? Math.max(0, activeSolBalance - 0.005).toFixed(3)
                          : activeWarBalance.toString()
                      )
                    }
                    className="text-[#FF6A00] hover:underline cursor-pointer"
                  >
                    Max
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  value={sendAmount}
                  onChange={(e) => {
                    setSendAmount(e.target.value);
                    setSendError('');
                  }}
                  placeholder="0.00"
                  className="w-full bg-[#141418] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-mono-num text-[13px] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {sendError && (
                <div className="text-[11px] font-mono-num text-rose-400">{sendError}</div>
              )}

              {sendSuccess && (
                <div className="text-[11px] font-mono-num text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Solana transaction confirmed on Devnet!</span>
                </div>
              )}

              <div className="p-3 rounded-[12px] bg-white/[0.02] border border-white/5 text-[10px] font-mono-num text-zinc-400 flex justify-between">
                <span>Estimated Solana Network Gas:</span>
                <span className="text-zinc-200">~0.000005 SOL ($0.0007)</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-zinc-400 font-mono-num text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-[12px] bg-gradient-to-r from-purple-600 to-[#14F195] text-black font-display font-black text-[12px] cursor-pointer shadow hover:opacity-95 transition"
                >
                  Sign & Broadcast Solana Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
