import { useState, useEffect, useRef, useMemo } from 'react';
import { Miner, TxItem, Mission, VeLock, ToastMsg, Rarity } from './types';
import {
  INITIAL_FLEET,
  NEXT_RARITY_MAP,
  CHESTS_DATA,
  LAB_UPGRADES_DATA,
  generateHash,
} from './constants';
import { Header } from './components/Header';
import { MiningConsole } from './components/MiningConsole';
import { MinerFleet } from './components/MinerFleet';
import { BurnDashboard } from './components/BurnDashboard';
import { TabsSection } from './components/TabsSection';
import { WalletModal } from './components/WalletModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(12450.2);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [mining, setMining] = useState(false);
  const [miners, setMiners] = useState<Miner[]>(INITIAL_FLEET);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [activeTab, setActiveTab] = useState<'mining' | 'market' | 'upgrades' | 'stats' | 'history'>('mining');
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

  const [missions, setMissions] = useState<Mission[]>([
    { id: 'mine', title: 'Mine 2h', desc: 'Keep rigs online 2h', progress: 68, target: 120, reward: 20, claimed: false },
    { id: 'upgrade', title: 'Upgrade 1 miner', desc: 'Level up any miner', progress: 0, target: 1, reward: 50, claimed: false },
    { id: 'stake', title: 'Stake 100 WAR', desc: 'Lock WAR to veWAR', progress: 0, target: 100, reward: 30, claimed: false },
  ]);
  const [streak] = useState(5);
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
        if (parsed.missions) setMissions(parsed.missions);
        if (parsed.userClan) setUserClan(parsed.userClan);
        if (parsed.lpStaked) setLpStaked(parsed.lpStaked);
        if (parsed.autoCompound !== undefined) setAutoCompound(parsed.autoCompound);
        if (parsed.pendingRewards) setPendingRewards(parsed.pendingRewards);
        if (parsed.labUpgrades) setLabUpgrades(parsed.labUpgrades);
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
      streak,
      userClan,
      lpStaked,
      autoCompound,
      pendingRewards,
      labUpgrades,
    };
    try {
      localStorage.setItem('war_mining_v2_state', JSON.stringify(payload));
    } catch {
      // Ignored
    }
  }, [balance, miners, address, connected, history, veLock, missions, streak, userClan, lpStaked, autoCompound, pendingRewards, labUpgrades]);

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

  const dailyWarRate = useMemo(
    () => miners.filter((m) => m.status === 'ONLINE').reduce((acc, m) => acc + (m.dailyWar * m.condition) / 100, 0),
    [miners]
  );

  const totalMaintenance = useMemo(() => miners.reduce((acc, m) => acc + m.maintenance, 0), [miners]);

  const avgEfficiency = useMemo(() => {
    const online = miners.filter((m) => m.status === 'ONLINE');
    if (!online.length) return 28;
    return online.reduce((acc, m) => acc + m.wth, 0) / online.length;
  }, [miners]);

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
  const totalBoost = veBoost + lpBoost + clanBoost;

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

  // Wallet Actions
  const handleConnectWallet = (walletName: string) => {
    setConnectingWallet(walletName);
    setTimeout(() => {
      const generated = `0xAri${Math.floor(Math.random() * 9000) + 1000}...${Math.floor(
        Math.random() * 9000
      )}`;
      setAddress(generated);
      setConnected(true);
      setWalletModalOpen(false);
      setConnectingWallet(null);
      addToast(`${walletName} connected // SECURE LINK ESTABLISHED`);
      recordTx('CONNECT', 0, `Connected ${walletName} ${generated}`);
    }, 800);
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
    recordTx('MISSION', target.reward, `Mission ${target.title}`);
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
        effectiveTH={effectiveTH}
        rawTH={rawTH}
        warPrice={warPrice}
        burnedWar={burnedWar}
        minedSeconds={minedSeconds}
        onOpenWallet={() => setWalletModalOpen(true)}
        onDisconnect={handleDisconnect}
      />

      {/* Main 3-Column Grid */}
      <div className="relative z-10 max-w-[1700px] mx-auto px-4 md:px-6 py-5 grid grid-cols-12 gap-5">
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
        />

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
        />

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

        {/* 5-Tab Extended Suite */}
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
        />
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        connectingWallet={connectingWallet}
        onClose={() => setWalletModalOpen(false)}
        onConnect={handleConnectWallet}
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
