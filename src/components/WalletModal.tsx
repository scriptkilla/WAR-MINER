import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Key,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Trash2,
  Download,
  Lock,
  QrCode,
  Sliders,
  CheckCheck,
  Info,
} from 'lucide-react';
import { SolanaWalletAccount } from '../types';
import {
  generateSolanaMnemonic,
  createSolanaKeypairFromMnemonic,
  exportSolanaPrivateKey,
  importSolanaFromPrivateKey,
  formatSolanaAddress,
  isValidSolanaAddress,
} from '../utils/solana';

interface WalletModalProps {
  isOpen: boolean;
  connectingWallet: string | null;
  onClose: () => void;
  onConnect: (walletName: string) => void;
  // Extended Solana Wallet Management
  wallets?: SolanaWalletAccount[];
  activeWalletId?: string | null;
  onSelectWallet?: (walletId: string) => void;
  onSaveNewWallet?: (wallet: SolanaWalletAccount) => void;
  onAirdropSol?: (walletId: string) => void;
  onDeleteWallet?: (walletId: string) => void;
  initialTab?: 'create' | 'import' | 'connect' | 'wallets';
  onNavigateToProfile?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  connectingWallet,
  onClose,
  onConnect,
  wallets = [],
  activeWalletId,
  onSelectWallet,
  onSaveNewWallet,
  onAirdropSol,
  onDeleteWallet,
  initialTab = 'create',
  onNavigateToProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'import' | 'connect' | 'wallets'>(initialTab);

  // 5-Step Creation Walkthrough State
  const [walkthroughStep, setWalkthroughStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [newWalletName, setNewWalletName] = useState('Solana Rig Vault #1');
  const [walletTheme, setWalletTheme] = useState<'purple' | 'emerald' | 'amber' | 'cyan'>('purple');
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(true);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [downloadedBackup, setDownloadedBackup] = useState(false);

  // Security checkboxes in Step 2
  const [ackNeverShare, setAckNeverShare] = useState(false);
  const [ackSavedOffline, setAckSavedOffline] = useState(false);

  // Step 3: Verification challenge state (2 random word positions)
  const [firstCheckIndex, setFirstCheckIndex] = useState<number>(2); // 0-indexed (word #3)
  const [secondCheckIndex, setSecondCheckIndex] = useState<number>(6); // 0-indexed (word #7)
  const [firstCheckInput, setFirstCheckInput] = useState('');
  const [secondCheckInput, setSecondCheckInput] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Step 4: Vault PIN protection
  const [vaultPin, setVaultPin] = useState('7788');
  const [requirePinForExport, setRequirePinForExport] = useState(false);
  const [enableAutoAirdrop, setEnableAutoAirdrop] = useState(true);

  // Step 5: Created keypair result & celebration
  const [newlyCreatedWallet, setNewlyCreatedWallet] = useState<SolanaWalletAccount | null>(null);
  const [showCreatedQr, setShowCreatedQr] = useState(false);

  // Import State
  const [importInput, setImportInput] = useState('');
  const [importName, setImportName] = useState('Imported Solana Rig');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Wallets List State
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Generate new fresh mnemonic and pick random test words
  const initCreationSession = () => {
    const generated = generateSolanaMnemonic();
    setMnemonicPhrase(generated);
    setWalkthroughStep(1);
    setAckNeverShare(false);
    setAckSavedOffline(false);
    setFirstCheckInput('');
    setSecondCheckInput('');
    setVerificationError('');
    setNewlyCreatedWallet(null);
    setShowCreatedQr(false);
    setDownloadedBackup(false);

    // Pick 2 distinct word indices between 0 and 11
    const idx1 = Math.floor(Math.random() * 5); // 0..4
    const idx2 = Math.floor(Math.random() * 6) + 5; // 5..10
    setFirstCheckIndex(idx1);
    setSecondCheckIndex(idx2);
  };

  useEffect(() => {
    if (isOpen) {
      if (wallets.length > 0 && initialTab === 'wallets') {
        setActiveTab('wallets');
      } else {
        setActiveTab(initialTab || (wallets.length === 0 ? 'create' : 'connect'));
      }
      initCreationSession();
      setImportInput('');
      setImportError('');
    }
  }, [isOpen, initialTab]);

  const mnemonicWords = useMemo(() => {
    return mnemonicPhrase.split(' ').filter(Boolean);
  }, [mnemonicPhrase]);

  // Shuffled word options for interactive click-to-fill in Step 3
  const shuffledOptions = useMemo(() => {
    if (mnemonicWords.length === 0) return [];
    // Take the two correct words plus 6 random words from the phrase
    const correct1 = mnemonicWords[firstCheckIndex];
    const correct2 = mnemonicWords[secondCheckIndex];
    const others = mnemonicWords.filter((w) => w !== correct1 && w !== correct2);
    const pool = [correct1, correct2, ...others.slice(0, 6)];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [mnemonicWords, firstCheckIndex, secondCheckIndex]);

  if (!isOpen) return null;

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonicPhrase);
    setCopiedMnemonic(true);
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  const handleDownloadBackup = () => {
    const textContent = `=====================================================
SOLANA ED25519 WALLET RECOVERY PHRASE BACKUP
=====================================================
Wallet Label: ${newWalletName || 'Solana Miner Vault'}
Created At: ${new Date().toISOString()}
Cluster: Solana Devnet

12-WORD MASTER SEED PHRASE:
${mnemonicPhrase}

CRITICAL SECURITY RULES:
1. Never share this recovery phrase with anyone.
2. Anyone who has these 12 words has permanent access to all your funds, rigs, and SPL tokens.
3. Keep this file in an encrypted offline storage or delete after printing.
=====================================================`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solana-wallet-seed-backup-${Date.now().toString().slice(-6)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadedBackup(true);
  };

  const handleVerifyStep3 = () => {
    setVerificationError('');
    const target1 = mnemonicWords[firstCheckIndex]?.toLowerCase().trim();
    const target2 = mnemonicWords[secondCheckIndex]?.toLowerCase().trim();

    const in1 = firstCheckInput.toLowerCase().trim();
    const in2 = secondCheckInput.toLowerCase().trim();

    if (in1 !== target1) {
      setVerificationError(`Word #${firstCheckIndex + 1} does not match. Please re-check your seed phrase.`);
      return;
    }
    if (in2 !== target2) {
      setVerificationError(`Word #${secondCheckIndex + 1} does not match. Please re-check your seed phrase.`);
      return;
    }

    // Passed verification challenge -> Go to step 4 (Local PIN)
    setWalkthroughStep(4);
  };

  const handleDemoAutofillVerification = () => {
    setFirstCheckInput(mnemonicWords[firstCheckIndex] || '');
    setSecondCheckInput(mnemonicWords[secondCheckIndex] || '');
    setVerificationError('');
  };

  const handleFinalizeKeypair = () => {
    try {
      const { keypair } = createSolanaKeypairFromMnemonic(mnemonicPhrase);
      const publicKey = keypair.publicKey.toBase58();
      const secretKey = exportSolanaPrivateKey(keypair);

      const created: SolanaWalletAccount = {
        id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: newWalletName.trim() || 'Solana Rig Vault',
        publicKey,
        secretKey,
        mnemonic: mnemonicPhrase,
        solBalance: 2.5, // 2.5 SOL starter devnet airdrop
        warBalance: 12450.2, // Starter $WAR proof-of-war balance
        createdAt: Date.now(),
        network: 'devnet',
      };

      setNewlyCreatedWallet(created);
      if (onSaveNewWallet) {
        onSaveNewWallet(created);
      }
      setWalkthroughStep(5);
    } catch (err: any) {
      setVerificationError(err?.message || 'Failed to derive Solana Ed25519 keypair.');
    }
  };

  const handleImportWallet = () => {
    setImportError('');
    const input = importInput.trim();
    if (!input) {
      setImportError('Please enter a 12-word mnemonic phrase or Base58 private key.');
      return;
    }

    try {
      let publicKey = '';
      let secretKey = '';
      let mnemonic: string | undefined = undefined;

      const words = input.split(/\s+/);
      if (words.length === 12 || words.length === 24) {
        const { keypair } = createSolanaKeypairFromMnemonic(input);
        publicKey = keypair.publicKey.toBase58();
        secretKey = exportSolanaPrivateKey(keypair);
        mnemonic = input;
      } else {
        const keypair = importSolanaFromPrivateKey(input);
        publicKey = keypair.publicKey.toBase58();
        secretKey = exportSolanaPrivateKey(keypair);
      }

      const imported: SolanaWalletAccount = {
        id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: importName.trim() || 'Imported Solana Rig',
        publicKey,
        secretKey,
        mnemonic,
        solBalance: 1.8,
        warBalance: 8500.0,
        createdAt: Date.now(),
        network: 'devnet',
      };

      if (onSaveNewWallet) {
        onSaveNewWallet(imported);
      }
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportError('Invalid Solana credentials. Check your 12-word recovery phrase or Base58 key.');
    }
  };

  const walletOptions = [
    {
      name: 'Phantom',
      desc: 'Solana native extension & mobile wallet',
      badge: 'POPULAR',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      name: 'Solflare',
      desc: 'Institutional Solana hardware & web',
      badge: 'SOLANA',
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Backpack',
      desc: 'xNFT and Solana ecosystem vault',
      badge: 'xNFT',
      color: 'from-red-500 to-rose-700',
    },
    {
      name: 'Aries Solana',
      desc: 'Native Proof-of-War rig controller',
      badge: 'RECOMMENDED',
      color: 'from-[#FF6A00] to-orange-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-[10px]"
        onClick={() => !connectingWallet && onClose()}
      />

      {/* Main Modal Window */}
      <div className="relative w-full max-w-[620px] bg-[#0C0C0E] border border-white/10 rounded-[26px] shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[94vh] flex flex-col inner-shadow">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#FF6A00] opacity-25 blur-3xl rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#9945FF] via-[#7B2CBF] to-[#14F195] p-[1.5px] shadow-lg shadow-purple-950/40">
              <div className="w-full h-full bg-[#0C0C0E] rounded-[12px] flex items-center justify-center">
                <span className="font-black text-sm bg-gradient-to-r from-[#14F195] to-[#9945FF] bg-clip-text text-transparent">
                  SOL
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-[15px] tracking-wide text-white">
                  SOLANA CHAIN WALLET
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono-num text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DEVNET READY
                </span>
              </div>
              <div className="font-mono-num text-[11px] text-zinc-400 mt-0.5">
                Proof-of-War Protocol • Ed25519 Cryptographic Vault
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/50 rounded-[14px] border border-white/[0.06] my-3.5 relative z-10">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-2 rounded-[10px] font-display font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creation Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-2 rounded-[10px] font-display font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`py-2 px-2 rounded-[10px] font-display font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`py-2 px-2 rounded-[10px] font-display font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === 'wallets'
                ? 'bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Vault</span>
            {wallets.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#14F195] text-black font-mono-num text-[9px] flex items-center justify-center font-bold">
                {wallets.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto pr-1 flex-1 relative z-10 space-y-4">
          {/* TAB 1: GUIDED 5-STEP WALLET CREATION WALKTHROUGH */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              {/* Walkthrough Visual Stepper */}
              <div className="p-3 rounded-[16px] bg-[#121216] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-num">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
                    <span>WALKTHROUGH: STEP {walkthroughStep} OF 5</span>
                  </span>
                  <span className="text-[#14F195] font-semibold">
                    {walkthroughStep === 1 && '1. Vault Identity'}
                    {walkthroughStep === 2 && '2. Secret Recovery Phrase'}
                    {walkthroughStep === 3 && '3. Backup Verification Quiz'}
                    {walkthroughStep === 4 && '4. Vault Security & PIN'}
                    {walkthroughStep === 5 && '5. On-Chain Keypair Genesis'}
                  </span>
                </div>

                {/* Progress Track */}
                <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-full rounded-full transition-all duration-300 ${
                        s <= walkthroughStep
                          ? 'bg-gradient-to-r from-purple-500 via-[#14F195] to-[#FF6A00]'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* WALKTHROUGH STEP 1: WELCOME & IDENTITY CONFIG */}
              {walkthroughStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-[18px] bg-gradient-to-r from-purple-950/40 via-black to-[#FF6A00]/10 border border-purple-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-display font-bold text-[13px]">
                      <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                      <span>WELCOME TO YOUR SELF-CUSTODIAL SOLANA VAULT</span>
                    </div>
                    <p className="font-mono-num text-[11.5px] text-zinc-300 leading-relaxed">
                      You are about to generate an authentic <strong>Ed25519 cryptographic keypair</strong>. You will hold complete custody over your wallet, starter Devnet SOL, and all Proof-of-War mining rewards.
                    </p>
                  </div>

                  {/* Wallet Label & Presets */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono-num text-zinc-400">
                      WALLET CALLSIGN / NAME
                    </label>
                    <input
                      type="text"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder="e.g. Solana Rig Vault #1"
                      className="w-full bg-[#141416] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-display text-[13px] text-white focus:outline-none focus:border-purple-500"
                    />

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono-num text-zinc-500">Suggested:</span>
                      {['Solana Rig Vault #1', 'Alpha Mining Key', 'Cyber Stash', 'Devnet Core'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewWalletName(preset)}
                          className="px-2 py-0.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-[10px] font-mono-num text-zinc-300 cursor-pointer border border-white/5 transition"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Network & Starter Rewards Included */}
                  <div className="p-3.5 rounded-[16px] bg-[#121216] border border-white/10 space-y-2.5">
                    <div className="text-[11px] font-mono-num text-zinc-400 flex items-center justify-between">
                      <span>INITIALIZED WITH DEVNET STARTER AIRDROP:</span>
                      <span className="text-[#14F195] font-bold">100% FREE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono-num">
                      <div className="p-2.5 rounded-[10px] bg-black/50 border border-white/5">
                        <div className="text-[10px] text-zinc-500">DEVNET SOL GAS</div>
                        <div className="text-[14px] font-bold text-emerald-400 mt-0.5">+2.50 SOL</div>
                      </div>
                      <div className="p-2.5 rounded-[10px] bg-black/50 border border-white/5">
                        <div className="text-[10px] text-zinc-500">PROOF-OF-WAR TOKEN</div>
                        <div className="text-[14px] font-bold text-[#FF6A00] mt-0.5">+12,450.2 $WAR</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWalkthroughStep(2)}
                    className="w-full py-3.5 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF6A00] text-white font-display font-bold text-[13px] hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Proceed to 12-Word Recovery Phrase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* WALKTHROUGH STEP 2: GENERATE & REVEAL PHRASE */}
              {walkthroughStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#121215] border border-white/10 rounded-[18px] p-4 relative overflow-hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                        <span className="font-display font-bold text-[12px] text-white">
                          YOUR 12-WORD SECRET RECOVERY PHRASE
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMnemonic(!showMnemonic)}
                          className="text-[11px] font-mono-num text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showMnemonic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showMnemonic ? 'Hide' : 'Reveal'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyMnemonic}
                          className="px-2.5 py-1 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono-num text-[#14F195] flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedMnemonic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMnemonic ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={initCreationSession}
                          title="Generate fresh random words"
                          className="p-1 rounded-[8px] bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 12-Word Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {mnemonicWords.map((word, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-[12px] border border-white/5 flex items-center gap-2 transition ${
                            showMnemonic ? 'bg-black/50 border-purple-500/20' : 'bg-black/80 blur-[4px] select-none'
                          }`}
                        >
                          <span className="font-mono-num text-[10px] text-zinc-500 w-4 font-bold">
                            {idx + 1}.
                          </span>
                          <span className="font-mono-num text-[12px] font-bold text-zinc-100">
                            {word}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Download Backup File CTA */}
                    <div className="flex items-center justify-between p-3 rounded-[12px] bg-purple-950/30 border border-purple-500/30">
                      <div className="text-[11px] font-mono-num text-purple-200">
                        Want an offline backup on your device?
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="px-3 py-1.5 rounded-[10px] bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/50 text-white font-mono-num text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {downloadedBackup ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{downloadedBackup ? 'Saved Backup' : 'Save Backup File'}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-[12px] bg-amber-500/[0.08] border border-amber-500/20 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] font-mono-num text-amber-200/90 leading-relaxed">
                        Never share these 12 words with anyone. Anyone with this phrase can drain all SOL and miner rigs permanently.
                      </div>
                    </div>
                  </div>

                  {/* Guided Security Checkboxes */}
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition">
                      <input
                        type="checkbox"
                        checked={ackNeverShare}
                        onChange={(e) => setAckNeverShare(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-black text-[#FF6A00] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11.5px] font-mono-num text-zinc-300">
                        I understand that Proof-of-War administrators will <strong>never ask</strong> for this recovery phrase.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition">
                      <input
                        type="checkbox"
                        checked={ackSavedOffline}
                        onChange={(e) => setAckSavedOffline(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-black text-[#FF6A00] focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11.5px] font-mono-num text-zinc-300">
                        I have written down or safely downloaded my 12-word recovery phrase.
                      </span>
                    </label>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWalkthroughStep(1)}
                      className="py-3 px-4 rounded-[14px] bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white font-display text-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={!ackNeverShare || !ackSavedOffline}
                      onClick={() => setWalkthroughStep(3)}
                      className="flex-1 py-3 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF6A00] text-white font-display font-bold text-[13px] hover:opacity-95 disabled:opacity-35 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Take Verification Challenge</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* WALKTHROUGH STEP 3: INTERACTIVE WORD VERIFICATION CHALLENGE */}
              {walkthroughStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-[18px] bg-[#121215] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-400 font-display font-bold text-[13px]">
                        <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                        <span>CONFIRM SEED PHRASE BACKUP</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDemoAutofillVerification}
                        className="text-[10px] font-mono-num text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-[8px] border border-purple-500/30 hover:bg-purple-900/60 cursor-pointer"
                        title="Auto-fill correct words for rapid demo"
                      >
                        Auto-fill Correct Words
                      </button>
                    </div>

                    <p className="text-[12px] font-mono-num text-zinc-300">
                      Tap the word chips below or type to confirm <strong className="text-[#FF6A00]">Word #{firstCheckIndex + 1}</strong> and <strong className="text-[#14F195]">Word #{secondCheckIndex + 1}</strong>:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Check Word 1 */}
                      <div className="p-3 rounded-[14px] bg-black/50 border border-white/10 space-y-1.5">
                        <div className="text-[11px] font-mono-num text-zinc-400 flex items-center justify-between">
                          <span>WORD #{firstCheckIndex + 1}</span>
                          {firstCheckInput.toLowerCase().trim() === mnemonicWords[firstCheckIndex] && (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={firstCheckInput}
                          onChange={(e) => {
                            setFirstCheckInput(e.target.value);
                            setVerificationError('');
                          }}
                          placeholder={`Enter Word #${firstCheckIndex + 1}`}
                          className="w-full bg-[#18181B] border border-white/10 rounded-[10px] px-3 py-2 font-mono-num text-[13px] text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Check Word 2 */}
                      <div className="p-3 rounded-[14px] bg-black/50 border border-white/10 space-y-1.5">
                        <div className="text-[11px] font-mono-num text-zinc-400 flex items-center justify-between">
                          <span>WORD #{secondCheckIndex + 1}</span>
                          {secondCheckInput.toLowerCase().trim() === mnemonicWords[secondCheckIndex] && (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={secondCheckInput}
                          onChange={(e) => {
                            setSecondCheckInput(e.target.value);
                            setVerificationError('');
                          }}
                          placeholder={`Enter Word #${secondCheckIndex + 1}`}
                          className="w-full bg-[#18181B] border border-white/10 rounded-[10px] px-3 py-2 font-mono-num text-[13px] text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {verificationError && (
                      <div className="p-2.5 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono-num text-rose-400">
                        {verificationError}
                      </div>
                    )}

                    {/* Interactive Word Chips Tray */}
                    <div className="pt-2">
                      <div className="text-[10px] font-mono-num text-zinc-500 mb-2">
                        TAP TO ASSIGN WORDS:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {shuffledOptions.map((word, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!firstCheckInput) {
                                setFirstCheckInput(word);
                              } else if (!secondCheckInput) {
                                setSecondCheckInput(word);
                              } else {
                                setSecondCheckInput(word);
                              }
                              setVerificationError('');
                            }}
                            className="px-3 py-1.5 rounded-[8px] bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-[11px] font-mono-num text-zinc-300 hover:text-white transition cursor-pointer"
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWalkthroughStep(2)}
                      className="py-3 px-4 rounded-[14px] bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-display text-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Review Phrase</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyStep3}
                      className="flex-1 py-3 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 to-[#14F195] text-black font-display font-black text-[13px] hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Confirm Words & Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* WALKTHROUGH STEP 4: VAULT PIN & PREFERENCES */}
              {walkthroughStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-[18px] bg-[#121215] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-[#14F195] font-display font-bold text-[13px]">
                      <Lock className="w-4 h-4" />
                      <span>LOCAL VAULT PROTECTION PIN (OPTIONAL)</span>
                    </div>
                    <p className="text-[12px] font-mono-num text-zinc-300 leading-relaxed">
                      Set a quick 4-digit PIN for this browser session. This safeguards your private keys from being revealed without authorization.
                    </p>

                    <div>
                      <label className="block text-[11px] font-mono-num text-zinc-400 mb-1">
                        4-DIGIT SECURITY PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={vaultPin}
                        onChange={(e) => setVaultPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="7788"
                        className="w-40 bg-black/60 border border-white/15 rounded-[12px] px-3.5 py-2.5 font-mono-num text-center tracking-[0.4em] text-[18px] text-white focus:outline-none focus:border-[#14F195]"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-3 p-2.5 rounded-[10px] bg-white/[0.02] border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requirePinForExport}
                          onChange={(e) => setRequirePinForExport(e.target.checked)}
                          className="rounded border-white/20 bg-black text-[#FF6A00] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11.5px] font-mono-num text-zinc-300">
                          Require PIN before revealing private key or mnemonic
                        </span>
                      </label>

                      <label className="flex items-center gap-3 p-2.5 rounded-[10px] bg-white/[0.02] border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableAutoAirdrop}
                          onChange={(e) => setEnableAutoAirdrop(e.target.checked)}
                          className="rounded border-white/20 bg-black text-[#14F195] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11.5px] font-mono-num text-zinc-300">
                          Automatically request 1.0 SOL Devnet airdrop if balance &lt; 0.2 SOL
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWalkthroughStep(3)}
                      className="py-3 px-4 rounded-[14px] bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-display text-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalizeKeypair}
                      className="flex-1 py-3 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 via-indigo-600 to-[#14F195] text-black font-display font-black text-[13px] hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Derive Ed25519 Keypair & Activate</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* WALKTHROUGH STEP 5: KEYPAIR ACTIVATION & CELEBRATION */}
              {walkthroughStep === 5 && newlyCreatedWallet && (
                <div className="space-y-4 text-center py-1 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/40">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="font-display font-black text-[17px] text-white tracking-wide">
                      SOLANA VAULT CREATED & ACTIVATED!
                    </h4>
                    <p className="font-mono-num text-[11.5px] text-zinc-400 mt-0.5">
                      {newlyCreatedWallet.name} • On-Chain Ed25519 Keypair Initialized on Devnet
                    </p>
                  </div>

                  {/* Public Key Display */}
                  <div className="p-4 rounded-[18px] bg-[#121215] border border-white/10 text-left space-y-3">
                    <div>
                      <div className="text-[10px] font-mono-num text-zinc-400 flex items-center justify-between">
                        <span>SOLANA PUBLIC KEY (BASE58)</span>
                        <span className="text-emerald-400 text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          ED25519 VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1.5 p-2.5 rounded-[12px] bg-black/60 border border-white/5">
                        <span className="font-mono-num text-[12px] text-zinc-100 break-all select-all">
                          {newlyCreatedWallet.publicKey}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(newlyCreatedWallet.publicKey);
                              setCopiedAddressId(newlyCreatedWallet.id);
                              setTimeout(() => setCopiedAddressId(null), 1500);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                            title="Copy Address"
                          >
                            {copiedAddressId === newlyCreatedWallet.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreatedQr(!showCreatedQr)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition"
                            title="Toggle QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://solscan.io/account/${newlyCreatedWallet.publicKey}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-400 transition"
                            title="View on Solscan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* QR Code expansion */}
                    {showCreatedQr && (
                      <div className="p-3 bg-white rounded-[14px] w-40 h-40 mx-auto flex flex-col items-center justify-center shadow-lg border-2 border-purple-500">
                        <div className="w-full h-full border-2 border-black p-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center">
                              <div className="w-2 h-2 bg-black" />
                            </div>
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center">
                              <div className="w-2 h-2 bg-black" />
                            </div>
                          </div>
                          <div className="text-center font-black text-purple-700 text-sm">◎ SOL</div>
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center">
                              <div className="w-2 h-2 bg-black" />
                            </div>
                            <div className="w-4 h-4 bg-black" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Funded Balances */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
                        <div className="font-mono-num text-[10px] text-zinc-400">DEVNET SOL GAS</div>
                        <div className="font-mono-num text-[16px] font-bold text-emerald-400 mt-0.5">
                          {newlyCreatedWallet.solBalance.toFixed(2)} SOL
                        </div>
                        <div className="text-[10px] font-mono-num text-zinc-500">Gas Funded</div>
                      </div>
                      <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]">
                        <div className="font-mono-num text-[10px] text-zinc-400">STARTER $WAR TOKEN</div>
                        <div className="font-mono-num text-[16px] font-bold text-[#FF6A00] mt-0.5">
                          {newlyCreatedWallet.warBalance.toLocaleString()} $WAR
                        </div>
                        <div className="text-[10px] font-mono-num text-zinc-500">Ready to Mine</div>
                      </div>
                    </div>
                  </div>

                  {/* Guided Next Steps Quick-Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigateToProfile) onNavigateToProfile();
                      }}
                      className="py-3 px-3 rounded-[14px] bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono-num text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Profile Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="py-3 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 via-[#FF6A00] to-emerald-500 text-black font-display font-black text-[13px] hover:opacity-95 transition shadow-lg cursor-pointer"
                    >
                      Enter Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT WALLET */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-num text-zinc-400 mb-1.5">
                  WALLET LABEL
                </label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="e.g. Cold Rig Keypair"
                  className="w-full bg-[#141416] border border-white/10 rounded-[12px] px-3.5 py-2.5 font-display text-[13px] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-num text-zinc-400 mb-1.5">
                  12/24-WORD RECOVERY PHRASE OR BASE58 PRIVATE KEY
                </label>
                <textarea
                  rows={4}
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    setImportError('');
                  }}
                  placeholder="Paste your 12-word seed phrase (space separated) or Base58 encoded Solana private key..."
                  className="w-full bg-[#141416] border border-white/10 rounded-[14px] p-3.5 font-mono-num text-[12px] text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
                {importError && (
                  <div className="text-[11px] font-mono-num text-rose-400 mt-1.5">
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="text-[11px] font-mono-num text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Solana wallet imported and connected successfully!</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-[12px] bg-purple-500/[0.08] border border-purple-500/20 text-[11px] font-mono-num text-purple-300">
                🔒 Keys are derived client-side and saved to your browser session. No secrets leave your browser.
              </div>

              <button
                type="button"
                onClick={handleImportWallet}
                className="w-full py-3 px-4 rounded-[14px] bg-gradient-to-r from-purple-600 to-[#FF6A00] text-white font-display font-bold text-[13px] hover:opacity-95 transition shadow-lg cursor-pointer"
              >
                Import Solana Wallet
              </button>
            </div>
          )}

          {/* TAB 3: CONNECT EXTENSION */}
          {activeTab === 'connect' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono-num text-zinc-400 mb-2">
                SELECT SOLANA BROWSER EXTENSION OR MOBILE APP:
              </div>

              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  disabled={Boolean(connectingWallet)}
                  onClick={() => onConnect(wallet.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[14px] bg-[#141416] border border-white/10 hover:border-purple-500/40 hover:bg-[#1A1A1E] transition text-left group disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-[10px] bg-gradient-to-br ${wallet.color} flex items-center justify-center font-bold text-[14px] text-white shadow-md`}
                    >
                      {wallet.name[0]}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[13px] text-white flex items-center gap-2">
                        {wallet.name}
                        {connectingWallet === wallet.name && (
                          <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        )}
                      </div>
                      <div className="font-mono-num text-[11px] text-zinc-400">{wallet.desc}</div>
                    </div>
                  </div>
                  {wallet.badge && (
                    <div className="font-mono-num text-[9px] px-2 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      {wallet.badge}
                    </div>
                  )}
                </button>
              ))}

              <div className="mt-3 p-3 rounded-[12px] bg-black/40 border border-white/5 text-[11px] font-mono-num text-zinc-500 leading-relaxed text-center">
                Instant Ed25519 handshake • Generates or binds Solana address on Devnet/Mainnet
              </div>
            </div>
          )}

          {/* TAB 4: WALLETS LIST / VAULT */}
          {activeTab === 'wallets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
                <span>MANAGE SOLANA KEYPAIRS ({wallets.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    initCreationSession();
                    setActiveTab('create');
                  }}
                  className="text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Run Creation Walkthrough</span>
                </button>
              </div>

              {wallets.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-[16px] bg-white/[0.02] border border-white/5 space-y-3">
                  <Wallet className="w-8 h-8 text-zinc-600 mx-auto" />
                  <div className="font-display font-bold text-zinc-400 text-[13px]">
                    No Solana Wallets Stored Yet
                  </div>
                  <p className="text-[11px] font-mono-num text-zinc-500 max-w-xs mx-auto">
                    Create a new Solana wallet with a 12-word seed phrase or import an existing Ed25519 key.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      initCreationSession();
                      setActiveTab('create');
                    }}
                    className="py-2 px-4 rounded-[10px] bg-purple-600 hover:bg-purple-500 text-white font-display text-[12px] font-bold cursor-pointer"
                  >
                    Start Wallet Creation Walkthrough
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {wallets.map((w) => {
                    const isActive = w.id === activeWalletId;
                    const isKeyRevealed = revealedKeyId === w.id;

                    return (
                      <div
                        key={w.id}
                        className={`p-3.5 rounded-[16px] border transition ${
                          isActive
                            ? 'bg-[#181524] border-purple-500/50 shadow-lg shadow-purple-950/20'
                            : 'bg-[#121215] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-[13px] text-white">
                                {w.name}
                              </span>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono-num text-emerald-400">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="font-mono-num text-[11px] text-zinc-400 flex items-center gap-2 mt-1">
                              <span>{formatSolanaAddress(w.publicKey, 6)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(w.publicKey);
                                  setCopiedAddressId(w.id);
                                  setTimeout(() => setCopiedAddressId(null), 1500);
                                }}
                                className="text-zinc-400 hover:text-white"
                                title="Copy address"
                              >
                                {copiedAddressId === w.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`https://solscan.io/account/${w.publicKey}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-400 hover:text-purple-400"
                                title="View on Solscan"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <div className="text-right font-mono-num text-[12px]">
                            <div className="font-bold text-emerald-400">{w.solBalance.toFixed(2)} SOL</div>
                            <div className="text-[10px] text-zinc-400">{w.warBalance.toLocaleString()} $WAR</div>
                          </div>
                        </div>

                        {/* Actions for this wallet */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-mono-num">
                          <div className="flex items-center gap-2">
                            {!isActive && onSelectWallet && (
                              <button
                                type="button"
                                onClick={() => onSelectWallet(w.id)}
                                className="px-2.5 py-1 rounded-[8px] bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 font-bold cursor-pointer"
                              >
                                Connect This
                              </button>
                            )}
                            {onAirdropSol && (
                              <button
                                type="button"
                                onClick={() => onAirdropSol(w.id)}
                                className="px-2 py-1 rounded-[8px] bg-white/5 hover:bg-white/10 text-emerald-400 flex items-center gap-1 cursor-pointer"
                                title="Request +1.0 SOL Devnet Airdrop"
                              >
                                <Coins className="w-3 h-3" />
                                <span>+1.0 SOL</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRevealedKeyId(isKeyRevealed ? null : w.id)}
                              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                            >
                              {isKeyRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{isKeyRevealed ? 'Hide Key' : 'Export'}</span>
                            </button>
                            {wallets.length > 1 && onDeleteWallet && (
                              <button
                                type="button"
                                onClick={() => onDeleteWallet(w.id)}
                                className="text-zinc-600 hover:text-rose-400 cursor-pointer"
                                title="Delete wallet from browser"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Exported Key Details */}
                        {isKeyRevealed && (
                          <div className="mt-2.5 p-2.5 rounded-[10px] bg-black/80 border border-rose-500/20 text-[10px] font-mono-num space-y-1.5">
                            <div className="text-rose-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>CONFIDENTIAL PRIVATE KEY</span>
                            </div>
                            <div className="break-all text-zinc-300 select-all p-1.5 bg-black rounded border border-white/10">
                              {w.secretKey}
                            </div>
                            {w.mnemonic && (
                              <div>
                                <div className="text-zinc-500 mt-1">12-Word Mnemonic:</div>
                                <div className="text-zinc-300 select-all p-1.5 bg-black rounded border border-white/10">
                                  {w.mnemonic}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
