import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Miner,
  TxItem,
  Mission,
  VeLock,
  ToastMsg,
  Rarity,
  CompletedMissionRecord,
  SolanaWalletAccount,
  UserProfile,
  UserSettings,
  ReferralRecord,
  AppPage,
} from './types';
import {
  INITIAL_FLEET,
  NEXT_RARITY_MAP,
  CHESTS_DATA,
  LAB_UPGRADES_DATA,
  INITIAL_COMPLETED_MISSIONS,
  generateHash,
} from './constants';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MiningConsole } from './components/MiningConsole';
import { MinerFleet } from './components/MinerFleet';
import { BurnDashboard } from './components/BurnDashboard';
import { TabsSection } from './components/TabsSection';
import { WalletModal } from './components/WalletModal';
import { MintingImageSynthesisModal } from './components/MintingImageSynthesisModal';
import { ToastContainer } from './components/ToastContainer';
import { generateMinerAvatarUrl } from './utils/minerAvatarGenerator';
import {
  generateInitialSolanaWallet,
  createRandomSolanaKeypair,
  exportSolanaPrivateKey,
} from './utils/solana';

const INITIAL_SETTINGS: UserSettings = {
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

const INITIAL_REFERRALS: ReferralRecord[] = [
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
];

const INITIAL_PROFILE: UserProfile = {
  handle: 'SolanaValkyrie',
  title: 'Elite Hash-Smith',
  bio: 'Mining blocks at the speed of Solana light ⚡ Proof-of-War Veteran',
  avatar: 'valkyrie',
  level: 14,
  xp: 8450,
  xpNextLevel: 10000,
  joinedBlock: 842901,
  joinedDate: 'Jan 2026',
  achievementsUnlocked: ['sol_pioneer', 'streak_flame', 'vewar_governor'],
  settings: INITIAL_SETTINGS,
  referralCode: 'VALKYRIE-SOL-88',
  referralHistory: INITIAL_REFERRALS,
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState<'create' | 'import' | 'connect' | 'wallets'>('create');
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(12450.2);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [mining, setMining] = useState(false);
  const [miners, setMiners] = useState<Miner[]>(INITIAL_FLEET);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Minting Image Generation Synthesis State
  const [synthesizingMiner, setSynthesizingMiner] = useState<Miner | null>(null);
  const [synthesisModalOpen, setSynthesisModalOpen] = useState(false);

  // Solana Wallets & Operator Profile State
  const [wallets, setWallets] = useState<SolanaWalletAccount[]>(() => {
    return [generateInitialSolanaWallet('Solana Main Rig Vault')];
  });
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const [activeTab, setActiveTab] = useState<AppPage>('mining');
  const [marketRarity, setMarketRarity] = useState<'All' | Rarity>('All');
  const [history, setHistory] = useState<TxItem[]>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'CLAIM', amount: 12.4, desc: 'Vault claim', hash: generateHash() },
    { id: '2', time: new Date().toLocaleTimeString(), type: 'MINT', amount: -1200, desc: 'Minted War Miner #1042', hash: generateHash() },
  ]);

  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState<number[]>([]);
  const [openingBox, setOpeningBox] = useState<string | null>(null);
  const [autoCompound, setAutoCompound] = useState(false);
  const [lpStaked, setLpStaked] = useState(false);
  const [veLock, setVeLock] = useState<VeLock | null>(null);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [stakeDays, setStakeDays] = useState(30);

  const [warPrice, setWarPrice] = useState(0.2847);
  const [burnedWar, setBurnedWar] = useState(85423109);
  const [dayBurned, setDayBurned] = useState(124502);
  const [halvingDays] = useState(178);

  const INITIAL_MISSIONS: Mission[] = [
    {
      id: 'mine',
      title: 'Mine 2h',
      desc: 'Keep rigs online 2h',
      progress: 68,
      target: 120,
      reward: 20,
      claimed: false,
      tier: 'Common',
      difficulty: 'Standard',
      multiplier: '1.0x',
    },
    {
      id: 'upgrade',
      title: 'Upgrade 1 miner',
      desc: 'Level up any miner',
      progress: 0,
      target: 1,
      reward: 50,
      claimed: false,
      tier: 'Rare',
      difficulty: 'Challenging',
      multiplier: '1.5x',
    },
    {
      id: 'stake',
      title: 'Stake 100 WAR',
      desc: 'Lock WAR to veWAR',
      progress: 0,
      target: 100,
      reward: 90,
      claimed: false,
      tier: 'Legendary',
      difficulty: 'Elite',
      multiplier: '3.0x',
    },
  ];

  const enrichMissionsWithTiers = (items: any[]): Mission[] => {
    return items.map((m) => {
      if (m.id === 'mine') {
        return {
          ...m,
          tier: m.tier || 'Common',
          difficulty: m.difficulty || 'Standard',
          multiplier: m.multiplier || '1.0x',
        };
      }
      if (m.id === 'upgrade') {
        return {
          ...m,
          tier: m.tier || 'Rare',
          difficulty: m.difficulty || 'Challenging',
          multiplier: m.multiplier || '1.5x',
        };
      }
      if (m.id === 'stake') {
        return {
          ...m,
          tier: m.tier || 'Legendary',
          difficulty: m.difficulty || 'Elite',
          multiplier: m.multiplier || '3.0x',
        };
      }
      return {
        ...m,
        tier: m.tier || 'Common',
        difficulty: m.difficulty || 'Standard',
        multiplier: m.multiplier || '1.0x',
      };
    });
  };

  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [completedMissions, setCompletedMissions] = useState<CompletedMissionRecord[]>(INITIAL_COMPLETED_MISSIONS);
  const [streak, setStreak] = useState(5);
  const [userClan, setUserClan] = useState('alpha');
  const [leaderboardTab, setLeaderboardTab] = useState<'hash' | 'burn' | 'clan'>('hash');

  const [calcHashrate, setCalcHashrate] = useState(1000);
  const [calcEfficiency, setCalcEfficiency] = useState(22);
  const [calcPowerCost, setCalcPowerCost] = useState(0.08);

  const [clanWarTimer, setClanWarTimer] = useState(8040);
  const [referralCode] = useState(() => 'WAR-' + Math.random().toString(36).slice(2, 6).toUpperCase());
  const [minedSeconds, setMinedSeconds] = useState(0);

  const [labUpgrades, setLabUpgrades] = useState<Record<string, number>>({
    hash: 0,
    cool: 0,
    over: 0,
    stake: 0,
  });

  const miningTimerRef = useRef<number | null>(null);
  const degradationTimerRef = useRef<number | null>(null);
  const maintenanceTimerRef = useRef<number | null>(null);

  // Restore saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('war_mining_v2_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.balance) setBalance(parsed.balance);
        if (parsed.miners) setMiners(parsed.miners);
        if (parsed.address) {
          setAddress(parsed.address);
          setConnected(true);
        }
        if (parsed.history) setHistory(parsed.history);
        if (parsed.veLock) setVeLock(parsed.veLock);
        if (parsed.missions) setMissions(enrichMissionsWithTiers(parsed.missions));
        if (parsed.completedMissions) setCompletedMissions(parsed.completedMissions);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.userClan) setUserClan(parsed.userClan);
        if (parsed.lpStaked) setLpStaked(parsed.lpStaked);
        if (parsed.autoCompound !== undefined) setAutoCompound(parsed.autoCompound);
        if (parsed.pendingRewards) setPendingRewards(parsed.pendingRewards);
        if (parsed.labUpgrades) setLabUpgrades(parsed.labUpgrades);
        if (parsed.wallets && Array.isArray(parsed.wallets) && parsed.wallets.length) {
          setWallets(parsed.wallets);
        }
        if (parsed.activeWalletId) {
          setActiveWalletId(parsed.activeWalletId);
        }
        if (parsed.userProfile) {
          setUserProfile(parsed.userProfile);
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const payload = {
      balance,
      miners,
      address: connected ? address : '',
      history: history.slice(0, 40),
      veLock,
      missions,
      completedMissions,
      streak,
      userClan,
      lpStaked,
      autoCompound,
      pendingRewards,
      labUpgrades,
      wallets,
      activeWalletId,
      userProfile,
    };
    try {
      localStorage.setItem('war_mining_v2_state', JSON.stringify(payload));
    } catch {
      // Ignored
    }
  }, [
    balance,
    miners,
    address,
    connected,
    history,
    veLock,
    missions,
    completedMissions,
    streak,
    userClan,
    lpStaked,
    autoCompound,
    pendingRewards,
    labUpgrades,
    wallets,
    activeWalletId,
    userProfile,
  ]);

  // Ambient tickers
  useEffect(() => {
    const priceInterval = window.setInterval(() => {
      setWarPrice((p) => +(p + (Math.random() - 0.5) * 0.001).toFixed(4));
    }, 1200);

    const burnInterval = window.setInterval(() => {
      setBurnedWar((b) => b + Math.random() * 12);
      setDayBurned((d) => d + Math.random() * 0.8);
    }, 800);

    const warTimerInterval = window.setInterval(() => {
      setClanWarTimer((t) => (t > 0 ? t - 1 : 7200));
    }, 1000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(burnInterval);
      clearInterval(warTimerInterval);
    };
  }, []);

  // Fleet stats computation
  const effectiveTH = useMemo(
    () => miners.reduce((acc, m) => acc + (m.status === 'ONLINE' ? (m.th * m.condition) / 100 : 0), 0),
    [miners]
  );

  const rawTH = useMemo(() => miners.reduce((acc, m) => acc + m.th, 0), [miners]);

  const totalMaintenance = useMemo(() => miners.reduce((acc, m) => acc + m.maintenance, 0), [miners]);

  const avgEfficiency = useMemo(() => {
    const online = miners.filter((m) => m.status === 'ONLINE');
    if (!online.length) return 28;
    return online.reduce((acc, m) => acc + m.wth, 0) / online.length;
  }, [miners]);

  // Active Solana Wallet & SOL balance
  const activeWallet = useMemo(() => {
    if (!wallets.length) return null;
    return wallets.find((w) => w.id === activeWalletId) || wallets[0];
  }, [wallets, activeWalletId]);

  const solBalance = activeWallet?.solBalance || 2.5;

  // Sync address with active Solana wallet
  useEffect(() => {
    if (activeWallet && (!address || !address.length)) {
      setAddress(activeWallet.publicKey);
    }
  }, [activeWallet, address]);

  // Boost multipliers
  const veBoost = useMemo(() => {
    if (!veLock) return 0;
    if (veLock.lockDays >= 365) return 0.4;
    if (veLock.lockDays >= 90) return 0.25;
    if (veLock.lockDays >= 30) return 0.15;
    return 0.05;
  }, [veLock]);

  const veDiscountPercent = useMemo(() => {
    if (!veLock) return 0;
    if (veLock.lockDays >= 365) return 40;
    if (veLock.lockDays >= 90) return 25;
    if (veLock.lockDays >= 30) return 15;
    return 5;
  }, [veLock]);

  const lpBoost = lpStaked ? 0.05 : 0;
  const clanBoost = 0.05;
  const streakBoost = useMemo(() => {
    // Daily streak reward bonus: 2% per active day (e.g. 5 days = +10% bonus, capped at 50%)
    return Math.min(0.50, Math.max(0, streak * 0.02));
  }, [streak]);
  const totalBoost = veBoost + lpBoost + clanBoost + streakBoost;

  const dailyWarRate = useMemo(
    () =>
      miners
        .filter((m) => m.status === 'ONLINE')
        .reduce((acc, m) => acc + (m.dailyWar * m.condition) / 100, 0) * (1 + totalBoost),
    [miners, totalBoost]
  );

  // Mining cycle loop
  useEffect(() => {
    if (mining) {
      miningTimerRef.current = window.setInterval(() => {
        const effFactor = 28 / Math.max(10, avgEfficiency);
        const earned = effectiveTH * 0.0000675 * effFactor * (1 + totalBoost);
        setPendingRewards((p) => p + earned / 10);
        setMinedSeconds((s) => s + 0.1);

        setMissions((prev) =>
          prev.map((m) =>
            m.id === 'mine'
              ? { ...m, progress: Math.min(m.target, m.progress + 0.1 / 60) }
              : m
          )
        );

        setMiners((prev) =>
          prev.map((m) =>
            m.status === 'ONLINE' ? { ...m, xp: Math.min(100, m.xp + 0.03) } : m
          )
        );
      }, 100);

      degradationTimerRef.current = window.setInterval(() => {
        setMiners((prev) =>
          prev.map((m) => ({
            ...m,
            condition: Math.max(0, +(m.condition - 0.02).toFixed(2)),
          }))
        );
      }, 8000);

      maintenanceTimerRef.current = window.setInterval(() => {
        const hourlyMaint = totalMaintenance / 24;
        if (hourlyMaint <= 0) return;
        if (balance >= hourlyMaint) {
          setBalance((b) => b - hourlyMaint);
          recordTx('MAINT', -hourlyMaint, `Hourly maintenance ${hourlyMaint.toFixed(2)} WAR`);
          setBurnedWar((b) => b + hourlyMaint * 0.05);
        } else {
          setMiners((prev) => {
            const worst = [...prev].sort((a, b) => b.maintenance - a.maintenance)[0]?.id;
            return prev.map((m) => (m.id === worst ? { ...m, status: 'OFFLINE' } : m));
          });
        }
      }, 30000);
    } else {
      if (miningTimerRef.current) clearInterval(miningTimerRef.current);
      if (degradationTimerRef.current) clearInterval(degradationTimerRef.current);
      if (maintenanceTimerRef.current) clearInterval(maintenanceTimerRef.current);
    }

    return () => {
      if (miningTimerRef.current) clearInterval(miningTimerRef.current);
      if (degradationTimerRef.current) clearInterval(degradationTimerRef.current);
      if (maintenanceTimerRef.current) clearInterval(maintenanceTimerRef.current);
    };
  }, [mining, effectiveTH, avgEfficiency, totalBoost, totalMaintenance, balance]);

  // Daily streak check-in handler
  const handleCheckInStreak = () => {
    setStreak((s) => {
      const next = s + 1;
      const boostPct = Math.min(50, next * 2);
      addToast(`🔥 DAILY STREAK CHECK-IN // DAY ${next} (+${boostPct}% MINING BONUS)`);
      recordTx('STREAK', 0, `Daily check-in streak advanced to day ${next} (+${boostPct}% mining multiplier)`);
      return next;
    });
  };

  // Toast and Tx Helpers
  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const recordTx = (type: string, amount: number, desc: string) => {
    const tx: TxItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      type,
      amount,
      desc,
      hash: generateHash(),
    };
    setHistory((h) => [tx, ...h].slice(0, 80));
    return tx.hash;
  };

  // Solana Wallet Actions
  const handleConnectWallet = (walletName: string) => {
    setConnectingWallet(walletName);
    setTimeout(() => {
      // Create or bind authentic Solana Ed25519 Keypair
      const kp = createRandomSolanaKeypair();
      const pub = kp.publicKey.toBase58();
      const sec = exportSolanaPrivateKey(kp);

      const newW: SolanaWalletAccount = {
        id: `sol_${Date.now()}`,
        name: `${walletName} Account`,
        publicKey: pub,
        secretKey: sec,
        solBalance: 2.5,
        warBalance: balance || 12450.2,
        createdAt: Date.now(),
        network: 'devnet',
      };

      setWallets((prev) => [newW, ...prev]);
      setActiveWalletId(newW.id);
      setAddress(pub);
      setConnected(true);
      setWalletModalOpen(false);
      setConnectingWallet(null);
      addToast(`${walletName} connected // SOLANA ED25519 VERIFIED`);
      recordTx('CONNECT', 0, `Connected ${walletName} (${pub.slice(0, 8)}...)`);
    }, 800);
  };

  const handleSaveNewWallet = (newWallet: SolanaWalletAccount) => {
    setWallets((prev) => [newWallet, ...prev.filter((w) => w.id !== newWallet.id)]);
    setActiveWalletId(newWallet.id);
    setAddress(newWallet.publicKey);
    setConnected(true);
    setBalance(newWallet.warBalance);
    addToast(`SOLANA WALLET ACTIVATED // ${newWallet.name}`);
    recordTx('SOL-WALLET-CREATE', 0, `Created Solana Keypair ${newWallet.publicKey.slice(0, 8)}...`);
    setUserProfile((prev) => ({
      ...prev,
      xp: prev.xp + 500,
      achievementsUnlocked: Array.from(new Set([...prev.achievementsUnlocked, 'sol_pioneer'])),
    }));
  };

  const handleSelectWallet = (walletId: string) => {
    const target = wallets.find((w) => w.id === walletId);
    if (!target) return;
    setActiveWalletId(walletId);
    setAddress(target.publicKey);
    setConnected(true);
    addToast(`SWITCHED TO ${target.name.toUpperCase()}`);
    recordTx('WALLET-SWITCH', 0, `Switched active Solana wallet to ${target.name}`);
  };

  const handleAirdropSol = (walletId: string) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, solBalance: +(w.solBalance + 1.0).toFixed(3) } : w))
    );
    addToast('+1.0 DEVNET SOL AIRDROP RECEIVED // FAUCET SUCCESS');
    recordTx('SOL-AIRDROP', 1.0, 'Devnet Faucet airdrop +1.0 SOL');
  };

  const handleDeleteWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
    if (activeWalletId === walletId) {
      const remaining = wallets.filter((w) => w.id !== walletId);
      if (remaining.length > 0) {
        setActiveWalletId(remaining[0].id);
        setAddress(remaining[0].publicKey);
      } else {
        setActiveWalletId(null);
        setConnected(false);
        setAddress('');
      }
    }
    addToast('SOLANA KEYPAIR REMOVED FROM BROWSER', 'info');
  };

  const handleSendSolanaTx = (recipient: string, amount: number, token: 'SOL' | 'WAR'): boolean => {
    if (token === 'SOL') {
      if (!activeWallet || activeWallet.solBalance < amount) {
        addToast('INSUFFICIENT SOL BALANCE', 'error');
        return false;
      }
      setWallets((prev) =>
        prev.map((w) =>
          w.id === activeWallet.id ? { ...w, solBalance: +(w.solBalance - amount).toFixed(3) } : w
        )
      );
      recordTx('SOL-SEND', -amount, `Transferred ${amount} SOL to ${recipient.slice(0, 6)}...`);
      addToast(`TRANSFERRED ${amount} SOL // SOLANA TX CONFIRMED`);
    } else {
      if (balance < amount) {
        addToast('INSUFFICIENT $WAR BALANCE', 'error');
        return false;
      }
      setBalance((b) => +(b - amount).toFixed(2));
      setWallets((prev) =>
        prev.map((w) =>
          w.id === (activeWallet?.id || '') ? { ...w, warBalance: +(w.warBalance - amount).toFixed(2) } : w
        )
      );
      recordTx('WAR-SEND', -amount, `Sent ${amount} WAR to ${recipient.slice(0, 6)}...`);
      addToast(`TRANSFERRED ${amount} $WAR // ON SOLANA DEVNET`);
    }
    return true;
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const mergedSettings = updated.settings
        ? { ...(prev.settings || INITIAL_SETTINGS), ...updated.settings }
        : prev.settings;
      if (mergedSettings?.clan) {
        setUserClan(mergedSettings.clan);
      }
      return {
        ...prev,
        ...updated,
        settings: mergedSettings,
      };
    });
    addToast('OPERATOR PROFILE & SETTINGS SAVED', 'success');
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress('');
    setMining(false);
    addToast('WALLET DISCONNECTED // RIGS STANDBY', 'info');
  };

  // Mining Toggle
  const handleToggleMining = () => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }
    const nextState = !mining;
    setMining(nextState);
    addToast(
      nextState ? 'MINING ACTIVE // PROOF-OF-WAR ENGAGED' : 'MINING HALTED // RIGS STANDBY',
      nextState ? 'success' : 'info'
    );
    if (nextState) {
      recordTx('MINING', 0, 'Started mining');
    }
  };

  // Claim Rewards
  const handleClaim = () => {
    if (pendingRewards < 0.001) {
      addToast('NOTHING TO CLAIM', 'info');
      return;
    }

    const claimAmt = pendingRewards;

    // Check Auto-compound
    if (autoCompound && miners.length) {
      const cheapest = miners.reduce((min, cur) =>
        250 * min.level < 250 * cur.level ? min : cur
      );
      const upgradeCost = 250 * cheapest.level;
      if (claimAmt >= upgradeCost) {
        setPendingRewards(0);
        setMiners((prev) =>
          prev.map((m) =>
            m.id === cheapest.id
              ? {
                  ...m,
                  th: Math.round(m.th * 1.15),
                  wth: Math.max(15, +(m.wth * 0.97).toFixed(1)),
                  level: Math.min(20, m.level + 1),
                  xp: 0,
                  dailyWar: m.dailyWar * 1.12,
                  condition: Math.min(100, m.condition + 2),
                }
              : m
          )
        );
        recordTx('AUTO-UP', -upgradeCost, `Auto-compound upgraded #${cheapest.id}`);
        addToast(`AUTO-COMPOUND // UPGRADED #${cheapest.id} +15% TH`);

        const remainder = claimAmt - upgradeCost;
        if (remainder > 0) {
          setBalance((b) => b + remainder);
          recordTx('CLAIM', remainder, `Claimed ${remainder.toFixed(4)} WAR (after auto)`);
        }
        return;
      }
    }

    setBalance((b) => b + claimAmt);
    setPendingRewards(0);
    addToast(`CLAIMED ${claimAmt.toFixed(4)} $WAR // TO VAULT`);
    recordTx('CLAIM', claimAmt, `Claimed ${claimAmt.toFixed(4)} WAR`);

    setMissions((prev) =>
      prev.map((m) =>
        m.id === 'mine' ? { ...m, progress: Math.min(m.target, m.progress + 2) } : m
      )
    );
  };

  // Miner Operations
  const handleUpgradeMiner = (id: number) => {
    const target = miners.find((m) => m.id === id);
    if (!target) return;
    const cost = 250 * target.level;
    if (balance < cost) {
      addToast('INSUFFICIENT $WAR // REFUEL REQUIRED', 'info');
      return;
    }
    setBalance((b) => b - cost);
    setMiners((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              th: Math.round(m.th * 1.15),
              wth: Math.max(15, +(m.wth * 0.97).toFixed(1)),
              level: Math.min(20, m.level + 1),
              xp: 0,
              dailyWar: m.dailyWar * 1.12,
              condition: Math.min(100, m.condition + 5),
            }
          : m
      )
    );
    addToast(`UPGRADED #${id} // +15% TH/s // LVL ${target.level + 1}`);
    recordTx('UPGRADE', -cost, `Upgraded #${id} to Lvl ${target.level + 1}`);
    setBurnedWar((b) => b + cost * 0.05);

    setMissions((prev) =>
      prev.map((m) => (m.id === 'upgrade' ? { ...m, progress: 1 } : m))
    );
  };

  const handleMintMiner = (costOverride?: number) => {
    const cost = costOverride ?? 1200;
    if (balance < cost) {
      addToast('INSUFFICIENT BALANCE FOR MINT', 'info');
      return;
    }
    setBalance((b) => b - cost);

    const rand = Math.random();
    let rarity: Rarity = 'Common';
    if (rand > 0.97) rarity = 'Legendary';
    else if (rand > 0.85) rarity = 'Epic';
    else if (rand > 0.55) rarity = 'Rare';

    const thRanges = {
      Common: 90 + Math.random() * 60,
      Rare: 140 + Math.random() * 80,
      Epic: 220 + Math.random() * 100,
      Legendary: 360 + Math.random() * 140,
    };

    const newMiner: Miner = {
      id: Math.floor(2000 + Math.random() * 9000),
      name: `War Miner #${Math.floor(2000 + Math.random() * 9000)}`,
      rarity,
      th: Math.round(thRanges[rarity]),
      wth: rarity === 'Legendary' ? 18 : rarity === 'Epic' ? 21 : rarity === 'Rare' ? 24 : 28,
      level: 1,
      xp: 0,
      dailyWar: Math.round(thRanges[rarity] * 0.078 * 10) / 10,
      maintenance: +(Math.random() * 1.5 + 0.5).toFixed(1),
      color:
        rarity === 'Legendary'
          ? 'from-amber-600 to-orange-700'
          : rarity === 'Epic'
          ? 'from-violet-600 to-indigo-700'
          : rarity === 'Rare'
          ? 'from-blue-600 to-cyan-700'
          : 'from-zinc-600 to-zinc-800',
      condition: 100,
      status: 'ONLINE',
    };

    if (rarity === 'Legendary' || rarity === 'Epic') {
      const { avatarUrl, traits } = generateMinerAvatarUrl({
        id: newMiner.id,
        name: newMiner.name,
        rarity,
        th: newMiner.th,
      });
      newMiner.avatarUrl = avatarUrl;
      newMiner.visualTraits = traits;
      setSynthesizingMiner(newMiner);
      setSynthesisModalOpen(true);
    }

    setMiners((prev) => [newMiner, ...prev]);
    addToast(`MINTED ${newMiner.name} // ${rarity.toUpperCase()} // DEPLOYED`);
    recordTx('MINT', -cost, `Minted ${newMiner.name} ${rarity}`);
    setBurnedWar((b) => b + cost * 0.05);
  };

  const handleSellMiner = (id: number) => {
    const target = miners.find((m) => m.id === id);
    if (!target) return;
    const refund = target.th * 4.2 * 0.6;
    setMiners((prev) => prev.filter((m) => m.id !== id));
    setBalance((b) => b + refund);
    addToast(`SOLD #${id} // +${refund.toFixed(0)} WAR`);
    recordTx('SELL', refund, `Sold #${id}`);
  };

  const handleRepairMiner = (id: number) => {
    const target = miners.find((m) => m.id === id);
    if (!target) return;
    const cost = (100 - target.condition) * 0.8;
    if (cost <= 0) {
      addToast('ALREADY 100%', 'info');
      return;
    }
    if (balance < cost) {
      addToast('INSUFFICIENT WAR FOR REPAIR', 'info');
      return;
    }
    setBalance((b) => b - cost);
    setMiners((prev) =>
      prev.map((m) => (m.id === id ? { ...m, condition: 100 } : m))
    );
    addToast(`REPAIRED #${id} // ${cost.toFixed(1)} WAR`);
    recordTx('REPAIR', -cost, `Repaired #${id}`);
  };

  const handlePayMaintenance = (id: number) => {
    const target = miners.find((m) => m.id === id);
    if (!target) return;
    const cost = target.maintenance * 3;
    if (balance < cost) {
      addToast('INSUFFICIENT WAR', 'info');
      return;
    }
    setBalance((b) => b - cost);
    setMiners((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'ONLINE' } : m))
    );
    addToast(`MAINT PAID #${id} // ONLINE`);
    recordTx('MAINT-PAY', -cost, `Paid maintenance #${id}`);
  };

  // Merge Mode
  const handleSelectForMerge = (id: number) => {
    if (!mergeMode) return;
    setMergeSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleExecuteMerge = () => {
    if (mergeSelected.length !== 2) {
      addToast('SELECT 2 MINERS SAME RARITY', 'info');
      return;
    }
    const m1 = miners.find((m) => m.id === mergeSelected[0]);
    const m2 = miners.find((m) => m.id === mergeSelected[1]);
    if (!m1 || !m2 || m1.rarity !== m2.rarity) {
      addToast('MUST BE SAME RARITY', 'info');
      return;
    }
    const nextRarity = NEXT_RARITY_MAP[m1.rarity];
    if (!nextRarity) {
      addToast('LEGENDARY CANNOT MERGE', 'info');
      return;
    }

    const mergedTH = Math.round((m1.th + m2.th) * 1.1);
    const newMergedMiner: Miner = {
      id: Math.floor(Math.random() * 90000),
      name: `War Miner #${Math.floor(2000 + Math.random() * 9000)}`,
      rarity: nextRarity,
      th: mergedTH,
      wth: Math.max(15, Math.min(m1.wth, m2.wth) - 1),
      level: 1,
      xp: 0,
      dailyWar: mergedTH * 0.078,
      maintenance: (m1.maintenance + m2.maintenance) * 0.8,
      color:
        nextRarity === 'Legendary'
          ? 'from-amber-600 to-orange-700'
          : nextRarity === 'Epic'
          ? 'from-violet-600 to-indigo-700'
          : 'from-blue-600 to-cyan-700',
      condition: 100,
      status: 'ONLINE',
    };

    if (nextRarity === 'Legendary' || nextRarity === 'Epic') {
      const { avatarUrl, traits } = generateMinerAvatarUrl({
        id: newMergedMiner.id,
        name: newMergedMiner.name,
        rarity: nextRarity,
        th: newMergedMiner.th,
      });
      newMergedMiner.avatarUrl = avatarUrl;
      newMergedMiner.visualTraits = traits;
      setSynthesizingMiner(newMergedMiner);
      setSynthesisModalOpen(true);
    }

    setMiners((prev) => [newMergedMiner, ...prev.filter((m) => !mergeSelected.includes(m.id))]);
    setMergeSelected([]);
    setMergeMode(false);
    addToast(`MERGED // CREATED ${nextRarity.toUpperCase()} #${newMergedMiner.id} // +10% BONUS`);
    recordTx('MERGE', 0, `Merged ${m1.id}+${m2.id} => ${nextRarity} ${newMergedMiner.id}`);
    setBurnedWar((b) => b + 50);
  };

  // Lootboxes
  const handleOpenLootbox = (id: string) => {
    const chest = CHESTS_DATA.find((c) => c.id === id);
    if (!chest) return;
    if (balance < chest.cost) {
      addToast('INSUFFICIENT WAR', 'info');
      return;
    }
    setOpeningBox(id);
    setTimeout(() => {
      setBalance((b) => b - chest.cost);

      let pool: Rarity[] = ['Common', 'Rare'];
      if (id === 'recruit') pool = ['Common', 'Common', 'Common', 'Rare'];
      if (id === 'veteran') pool = ['Rare', 'Rare', 'Epic'];
      if (id === 'warlord') pool = ['Epic', 'Epic', 'Legendary'];

      const chosenRarity = pool[Math.floor(Math.random() * pool.length)];
      const thRanges = {
        Common: 90 + Math.random() * 60,
        Rare: 140 + Math.random() * 80,
        Epic: 220 + Math.random() * 100,
        Legendary: 360 + Math.random() * 140,
      };

      const newMiner: Miner = {
        id: Math.floor(Math.random() * 90000),
        name: `War Miner #${Math.floor(2000 + Math.random() * 9000)}`,
        rarity: chosenRarity,
        th: Math.round(thRanges[chosenRarity]),
        wth: chosenRarity === 'Legendary' ? 18 : chosenRarity === 'Epic' ? 21 : chosenRarity === 'Rare' ? 24 : 28,
        level: 1,
        xp: 0,
        dailyWar: Math.round(thRanges[chosenRarity] * 0.078 * 10) / 10,
        maintenance: +(Math.random() * 1.5 + 0.5).toFixed(1),
        color:
          chosenRarity === 'Legendary'
            ? 'from-amber-600 to-orange-700'
            : chosenRarity === 'Epic'
            ? 'from-violet-600 to-indigo-700'
            : chosenRarity === 'Rare'
            ? 'from-blue-600 to-cyan-700'
            : 'from-zinc-600 to-zinc-800',
        condition: 100,
        status: 'ONLINE',
      };

      if (chosenRarity === 'Legendary' || chosenRarity === 'Epic') {
        const { avatarUrl, traits } = generateMinerAvatarUrl({
          id: newMiner.id,
          name: newMiner.name,
          rarity: chosenRarity,
          th: newMiner.th,
        });
        newMiner.avatarUrl = avatarUrl;
        newMiner.visualTraits = traits;
        setSynthesizingMiner(newMiner);
        setSynthesisModalOpen(true);
      }

      setMiners((prev) => [newMiner, ...prev]);
      setOpeningBox(null);
      addToast(`LOOTBOX ${chest.name} OPENED // ${chosenRarity.toUpperCase()} #${newMiner.id}`);
      recordTx('LOOT', -chest.cost, `Opened ${chest.name} got ${chosenRarity} #${newMiner.id}`);
      setBurnedWar((b) => b + chest.cost * 0.1);
    }, 1200);
  };

  // veWAR Staking
  const handleStake = () => {
    if (stakeAmount > balance) {
      addToast('INSUFFICIENT BALANCE', 'info');
      return;
    }
    const mult = stakeDays >= 365 ? 4 : stakeDays >= 90 ? 2 : stakeDays >= 30 ? 1 : 0.25;
    const veAmt = stakeAmount * mult;
    const apy = stakeDays >= 365 ? 84 : stakeDays >= 90 ? 54 : stakeDays >= 30 ? 32 : 18;
    const expiry = Date.now() + stakeDays * 86400000;

    setBalance((b) => b - stakeAmount);
    setVeLock({
      amount: stakeAmount,
      lockDays: stakeDays,
      veAmount: veAmt,
      expiry,
      apy,
    });
    addToast(`STAKED ${stakeAmount} WAR -> ${veAmt.toFixed(0)} veWAR // ${stakeDays}d LOCK`);
    recordTx('STAKE', -stakeAmount, `Staked ${stakeAmount} WAR ${stakeDays}d`);

    setMissions((prev) =>
      prev.map((m) =>
        m.id === 'stake' ? { ...m, progress: Math.min(m.target, m.progress + stakeAmount) } : m
      )
    );
  };

  const handleUnstake = () => {
    if (!veLock) return;
    if (Date.now() < veLock.expiry) {
      addToast('LOCKED // WAIT EXPIRY', 'info');
      return;
    }
    setBalance((b) => b + veLock.amount);
    addToast(`UNSTAKED ${veLock.amount} WAR`);
    recordTx('UNSTAKE', veLock.amount, `Unstaked ${veLock.amount} WAR`);
    setVeLock(null);
  };

  // Missions
  const handleClaimMission = (id: string) => {
    const target = missions.find((m) => m.id === id);
    if (!target || target.progress < target.target || target.claimed) return;
    setBalance((b) => b + target.reward);
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, claimed: true } : m))
    );
    addToast(`MISSION CLAIMED // +${target.reward} WAR`);
    const txHash = recordTx('MISSION', target.reward, `Mission ${target.title}`);

    const newRecord: CompletedMissionRecord = {
      id: `cm-${Date.now()}`,
      missionId: target.id,
      title: target.title,
      desc: target.desc,
      reward: target.reward,
      claimedAt: new Date().toLocaleTimeString() + ', Today',
      txHash: txHash || generateHash(),
      tier: target.tier,
    };
    setCompletedMissions((prev) => [newRecord, ...prev]);
  };

  // Buy from Marketplace
  const handleBuyMiner = (listing: Miner) => {
    const price = listing.th * 4.2;
    if (balance < price) {
      addToast('INSUFFICIENT $WAR', 'info');
      return;
    }
    setBalance((b) => b - price);
    const newFleetMiner: Miner = {
      ...listing,
      id: Math.floor(Math.random() * 90000),
      condition: 100,
      status: 'ONLINE',
    };
    setMiners((prev) => [newFleetMiner, ...prev]);
    addToast(`ACQUIRED ${listing.name} // FLEET UPDATED`);
    recordTx('MARKET-BUY', -price, `Bought ${listing.name}`);
  };

  // Upgrades Lab
  const handleApplyLabUpgrade = (id: 'hash' | 'cool' | 'over' | 'stake') => {
    const item = LAB_UPGRADES_DATA.find((x) => x.id === id);
    const currentOwned = labUpgrades[id] || 0;
    const baseCost = item?.baseCost || 100;
    const cost = Math.round(baseCost * Math.pow(1.35, currentOwned));

    if (balance < cost) {
      addToast('INSUFFICIENT WAR', 'info');
      return;
    }

    setBalance((b) => b - cost);
    setLabUpgrades((prev) => ({ ...prev, [id]: currentOwned + 1 }));

    if (id === 'hash') {
      setMiners((prev) => prev.map((m) => ({ ...m, th: Math.round(m.th * 1.08) })));
    } else if (id === 'cool') {
      setMiners((prev) => prev.map((m) => ({ ...m, wth: Math.max(14, +(m.wth - 2).toFixed(1)) })));
    } else if (id === 'over') {
      setMiners((prev) => prev.map((m) => ({ ...m, dailyWar: m.dailyWar * 1.08 })));
    } else if (id === 'stake') {
      setMiners((prev) => prev.map((m) => ({ ...m, maintenance: +(m.maintenance * 0.85).toFixed(2) })));
    }

    addToast(`${id.toUpperCase()} LAB UPGRADED // OWNED ${currentOwned + 1}`);
    recordTx('LAB', -cost, `Lab upgrade ${id} x${currentOwned + 1}`);
    setBurnedWar((b) => b + cost * 0.05);
  };

  // Export Tax CSV
  const handleExportTaxCSV = () => {
    const csvContent =
      'time,type,amount,desc,hash\n' +
      history.map((t) => `${t.time},${t.type},${t.amount},"${t.desc}",${t.hash}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `war_mining_tax_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('TAX CSV EXPORTED');
  };

  // Copy Referral
  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://war.mining/aries?ref=${referralCode}`);
    addToast('REF LINK COPIED');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 selection:bg-[#FF6A00]/30 relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-[300px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#FF6A00]/[0.07] blur-[120px] rounded-full" />

      {/* Header */}
      <Header
        connected={connected}
        address={address}
        balance={balance}
        solBalance={solBalance}
        effectiveTH={effectiveTH}
        rawTH={rawTH}
        warPrice={warPrice}
        burnedWar={burnedWar}
        minedSeconds={minedSeconds}
        userProfile={userProfile}
        activeWalletName={activeWallet?.name}
        onOpenWallet={() => {
          setWalletModalTab('wallets');
          setWalletModalOpen(true);
        }}
        onOpenCreateWallet={() => {
          setWalletModalTab('create');
          setWalletModalOpen(true);
        }}
        onNavigateToProfile={() => setActiveTab('profile')}
        onDisconnect={handleDisconnect}
      />

      {/* Primary Page Navigation */}
      <Navigation
        activePage={activeTab}
        onChangePage={setActiveTab}
        mining={mining}
        minerCount={miners.length}
        unclaimedMissionsCount={missions.filter((m) => !m.claimed && m.progress >= m.target).length}
        referralCount={userProfile?.referralHistory?.length || 4}
      />

      {/* Main Dedicated Page View */}
      <main className="relative z-10 max-w-[1700px] mx-auto px-4 md:px-6 py-6">
        {/* PAGE 1: MINING CONSOLE & STAKING */}
        {activeTab === 'mining' && (
          <div className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 lg:col-span-4 xl:col-span-4">
              <MiningConsole
                mining={mining}
                onToggleMining={handleToggleMining}
                onClaim={handleClaim}
                effectiveTH={effectiveTH}
                rawTH={rawTH}
                dailyWarRate={dailyWarRate}
                avgEfficiency={avgEfficiency}
                pendingRewards={pendingRewards}
                totalBoost={totalBoost}
                totalMaintenance={totalMaintenance}
                veDiscountPercent={veDiscountPercent}
                autoCompound={autoCompound}
                onToggleAutoCompound={() => setAutoCompound(!autoCompound)}
                miners={miners}
                veLock={veLock}
                stakeAmount={stakeAmount}
                onChangeStakeAmount={setStakeAmount}
                stakeDays={stakeDays}
                onChangeStakeDays={setStakeDays}
                onStake={handleStake}
                onUnstake={handleUnstake}
                balance={balance}
                lpStaked={lpStaked}
                onToggleLP={() => {
                  const nextLp = !lpStaked;
                  setLpStaked(nextLp);
                  addToast(nextLp ? 'LP STAKED // +5% TH BOOST' : 'LP UNSTAKED');
                  if (nextLp) recordTx('LP-STAKE', 0, 'Staked WAR/USDC LP');
                }}
                warPrice={warPrice}
                streak={streak}
                streakBoost={streakBoost}
                onCheckInStreak={handleCheckInStreak}
                veBoost={veBoost}
                lpBoost={lpBoost}
                clanBoost={clanBoost}
              />
            </div>

            {/* Mining telemetry status & live fleet power matrix */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-8 space-y-6">
              <div className="card rounded-[24px] p-6 inner-shadow space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div>
                    <h3 className="font-display font-black text-lg text-white tracking-wide">
                      FLEET OPERATIONAL TELEMETRY
                    </h3>
                    <p className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                      Live ASIC status, real-time TH/s output, and active cryptographic workload across your mining fleet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('fleet')}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 font-display font-bold text-[11px] text-white transition cursor-pointer"
                    >
                      Manage Rigs →
                    </button>
                    <button
                      onClick={() => setActiveTab('upgrades')}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white font-display font-bold text-[11px] hover:opacity-90 transition cursor-pointer shadow"
                    >
                      Open Lab Upgrades
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[14px] bg-[#141418] border border-white/5">
                    <div className="text-[10px] font-mono-num text-zinc-400">ACTIVE MINERS</div>
                    <div className="font-mono-num text-2xl font-black text-white mt-1">
                      {miners.filter((m) => m.status === 'ONLINE').length} / {miners.length}
                    </div>
                    <div className="text-[10px] font-mono-num text-emerald-400 mt-0.5">Online Status</div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#141418] border border-white/5">
                    <div className="text-[10px] font-mono-num text-zinc-400">FLEET HASHRATE</div>
                    <div className="font-mono-num text-2xl font-black text-[#14F195] mt-1">
                      {effectiveTH.toFixed(0)} <span className="text-[12px] text-zinc-400 font-normal">TH/s</span>
                    </div>
                    <div className="text-[10px] font-mono-num text-zinc-400 mt-0.5">{rawTH} TH/s Raw</div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#141418] border border-white/5">
                    <div className="text-[10px] font-mono-num text-zinc-400">DAILY RUN-RATE</div>
                    <div className="font-mono-num text-2xl font-black text-[#FF6A00] mt-1">
                      {dailyWarRate.toFixed(1)} <span className="text-[12px] text-zinc-400 font-normal">WAR</span>
                    </div>
                    <div className="text-[10px] font-mono-num text-zinc-400 mt-0.5">
                      ≈ ${(dailyWarRate * warPrice).toFixed(2)}/day
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#141418] border border-white/5">
                    <div className="text-[10px] font-mono-num text-zinc-400">AVG EFFICIENCY</div>
                    <div className="font-mono-num text-2xl font-black text-purple-300 mt-1">
                      {avgEfficiency.toFixed(1)} <span className="text-[12px] text-zinc-400 font-normal">W/TH</span>
                    </div>
                    <div className="text-[10px] font-mono-num text-zinc-400 mt-0.5">Optimized Cooling</div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[#121214] border border-white/10 p-4">
                  <div className="flex justify-between items-center text-[11px] font-mono-num text-zinc-400 mb-3">
                    <span>RIG HARDWARE MATRIX</span>
                    <span className="text-zinc-500">CONDITION & EFFICIENCY</span>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-auto pr-1">
                    {miners.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-[10px] bg-black/40 border border-white/5 text-[11.5px] font-mono-num"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              m.status === 'ONLINE' ? 'bg-[#14F195]' : 'bg-zinc-600'
                            }`}
                          />
                          <span className="text-white font-bold">{m.name}</span>
                          <span className="text-zinc-400 text-[10px] px-1.5 py-0.2 rounded bg-white/5">
                            {m.rarity}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[#FF6A00] font-bold">{m.th} TH/s</span>
                          <span className="text-zinc-400">{m.wth} W/TH</span>
                          <span className={m.condition < 50 ? 'text-rose-400' : 'text-emerald-400'}>
                            {m.condition.toFixed(0)}% COND
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Live Claimed Stream Log */}
                <div className="rounded-[16px] bg-[#121214] border border-white/10 p-4">
                  <div className="flex justify-between items-center text-[11px] font-mono-num text-zinc-400 mb-2">
                    <span>REAL-TIME TRANSACTION STREAM</span>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-purple-400 hover:text-purple-300 text-[10.5px]"
                    >
                      View Full Ledger →
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-auto">
                    {history.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px] font-mono-num py-1 border-b border-white/[0.03]">
                        <span className="text-zinc-400">{item.time}</span>
                        <span className="text-white truncate max-w-[240px]">{item.desc}</span>
                        <span className={item.amount >= 0 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} WAR
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: FLEET MANAGER */}
        {activeTab === 'fleet' && (
          <div className="w-full">
            <MinerFleet
              miners={miners}
              mining={mining}
              effectiveTH={effectiveTH}
              avgEfficiency={avgEfficiency}
              dailyWarRate={dailyWarRate}
              totalBoost={totalBoost}
              mergeMode={mergeMode}
              mergeSelected={mergeSelected}
              onToggleMergeMode={() => {
                setMergeMode(!mergeMode);
                setMergeSelected([]);
              }}
              onSelectForMerge={handleSelectForMerge}
              onExecuteMerge={handleExecuteMerge}
              onMint={handleMintMiner}
              onUpgradeMiner={handleUpgradeMiner}
              onRepairMiner={handleRepairMiner}
              onSellMiner={handleSellMiner}
              onPayMaintenance={handlePayMaintenance}
              openingBox={openingBox}
              onOpenLootbox={handleOpenLootbox}
              missions={missions}
              streak={streak}
              onClaimMission={handleClaimMission}
              userClan={userClan}
              onJoinClan={(clanId) => {
                setUserClan(clanId);
                addToast(`JOINED CLAN`);
                recordTx('CLAN', 0, `Joined clan ${clanId}`);
              }}
              clanWarTimer={clanWarTimer}
              onInspectMiner={(m) => {
                setSynthesizingMiner(m);
                setSynthesisModalOpen(true);
              }}
            />
          </div>
        )}

        {/* PAGE 3: BURNS & CLAN LEADERBOARDS */}
        {activeTab === 'burn' && (
          <div className="w-full max-w-[1200px] mx-auto">
            <BurnDashboard
              burnedWar={burnedWar}
              dayBurned={dayBurned}
              halvingDays={halvingDays}
              leaderboardTab={leaderboardTab}
              onChangeLeaderboardTab={setLeaderboardTab}
              rawTH={rawTH}
              dailyWarRate={dailyWarRate}
              userClan={userClan}
              referralCode={referralCode}
              onCopyRef={handleCopyRef}
            />
          </div>
        )}

        {/* PAGES 4 TO 11: MARKETPLACE, UPGRADES, MISSIONS, CALCULATOR, REFERRALS, HISTORY, PROFILE, SETTINGS */}
        {activeTab !== 'mining' && activeTab !== 'fleet' && activeTab !== 'burn' && (
          <TabsSection
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            mining={mining}
            miners={miners}
            avgEfficiency={avgEfficiency}
            history={history}
            marketRarity={marketRarity}
            onChangeMarketRarity={setMarketRarity}
            onBuyMiner={handleBuyMiner}
            labUpgrades={labUpgrades}
            onApplyLabUpgrade={handleApplyLabUpgrade}
            calcHashrate={calcHashrate}
            onChangeCalcHashrate={setCalcHashrate}
            calcEfficiency={calcEfficiency}
            onChangeCalcEfficiency={setCalcEfficiency}
            calcPowerCost={calcPowerCost}
            onChangeCalcPowerCost={setCalcPowerCost}
            warPrice={warPrice}
            onChangeWarPrice={setWarPrice}
            halvingDays={halvingDays}
            burnedWar={burnedWar}
            dailyWarRate={dailyWarRate}
            onExportTaxCSV={handleExportTaxCSV}
            onClearHistory={() => {
              setHistory([]);
              addToast('HISTORY CLEARED');
            }}
            completedMissions={completedMissions}
            missions={missions}
            streak={streak}
            streakBoost={streakBoost}
            onCheckInStreak={handleCheckInStreak}
            onClaimMission={handleClaimMission}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            activeWallet={activeWallet}
            wallets={wallets}
            onOpenWalletModal={(tab) => {
              setWalletModalTab(tab || 'create');
              setWalletModalOpen(true);
            }}
            onAirdropSol={handleAirdropSol}
            onSendSolanaTx={handleSendSolanaTx}
            userClan={userClan}
            effectiveTH={effectiveTH}
            rawTH={rawTH}
          />
        )}
      </main>

      {/* Solana Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        connectingWallet={connectingWallet}
        onClose={() => setWalletModalOpen(false)}
        onConnect={handleConnectWallet}
        wallets={wallets}
        activeWalletId={activeWallet?.id || null}
        onSelectWallet={handleSelectWallet}
        onSaveNewWallet={handleSaveNewWallet}
        onAirdropSol={handleAirdropSol}
        onDeleteWallet={handleDeleteWallet}
        initialTab={walletModalTab}
        onNavigateToProfile={() => setActiveTab('profile')}
      />

      {/* Minting Image Synthesis Modal for Legendary & Epic Miners */}
      <MintingImageSynthesisModal
        isOpen={synthesisModalOpen}
        miner={synthesizingMiner}
        onClose={() => setSynthesisModalOpen(false)}
        onDeployToFleet={() => {
          setSynthesisModalOpen(false);
          setActiveTab('mining');
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      {/* Footer */}
      <footer className="relative z-10 max-w-[1700px] mx-auto px-6 py-6 font-mono-num text-[10px] text-zinc-600 flex flex-col md:flex-row justify-between gap-2 border-t border-white/[0.06] mt-2">
        <span>
          WAR MINING V2 COMPLETE // ARIES CHAIN • CONTRACT 0xWAR...Aries • {balance.toFixed(0)} WAR •{' '}
          {miners.length} MINERS • {effectiveTH.toFixed(0)} TH/s • BURN{' '}
          {Math.floor(burnedWar).toLocaleString()}
        </span>
        <span className="flex items-center gap-3">
          <span>DOCS</span>
          <span>•</span>
          <span>WAR PAPER</span>
          <span>•</span>
          <span className="text-zinc-400">
            BUILT FOR $WAR HOLDERS • veWAR {veLock ? veLock.veAmount.toFixed(0) : 0} • CLAN{' '}
            {userClan.toUpperCase()}
          </span>
        </span>
      </footer>
    </div>
  );
}
