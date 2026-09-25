import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Download,
  Share2,
  Layers,
  ArrowRight,
  Maximize2,
  Hash,
} from 'lucide-react';
import { Miner } from '../types';

interface MintingImageSynthesisModalProps {
  isOpen: boolean;
  miner: Miner | null;
  onClose: () => void;
  onDeployToFleet?: () => void;
}

export const MintingImageSynthesisModal: React.FC<MintingImageSynthesisModalProps> = ({
  isOpen,
  miner,
  onClose,
  onDeployToFleet,
}) => {
  const [stage, setStage] = useState<'scanning' | 'synthesizing' | 'complete'>('scanning');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !miner) {
      setStage('scanning');
      setProgress(0);
      return;
    }

    // Run synthesis animation
    setStage('scanning');
    setProgress(15);

    const t1 = setTimeout(() => {
      setStage('synthesizing');
      setProgress(65);
    }, 900);

    const t2 = setTimeout(() => {
      setStage('complete');
      setProgress(100);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, miner?.id]);

  if (!isOpen || !miner) return null;

  const isLegendary = miner.rarity === 'Legendary';
  const glowColor = isLegendary ? '#F59E0B' : '#A855F7';
  const borderColor = isLegendary ? 'border-amber-500/50' : 'border-purple-500/50';
  const bgGlow = isLegendary
    ? 'from-amber-600/30 via-orange-600/20 to-transparent'
    : 'from-purple-600/30 via-indigo-600/20 to-transparent';

  const handleDownloadAvatar = () => {
    if (!miner.avatarUrl) return;
    const link = document.createElement('a');
    link.href = miner.avatarUrl;
    link.download = `${miner.name.toLowerCase().replace(/\s+/g, '-')}-avatar.svg`;
    link.click();
  };

  const handleFastForward = () => {
    setStage('complete');
    setProgress(100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-[12px]"
        onClick={onClose}
      />

      {/* Main Dialog */}
      <div className={`relative w-full max-w-[540px] bg-[#0C0C0F] border ${borderColor} rounded-[28px] shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center inner-shadow`}>
        {/* Top ambient glow */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-r ${bgGlow} opacity-40 blur-3xl rounded-full`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#14F195] animate-pulse" />
            <span className="font-display font-black text-[12px] tracking-wider text-white">
              VISUAL IDENTIFIER SYNTHESIS // ARIES CHAIN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full font-mono-num text-[10px] font-bold border ${
              isLegendary ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
            }`}>
              {miner.rarity.toUpperCase()} RIG #{miner.id}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dynamic Image Generation Stage */}
        <div className="my-5 relative w-full flex flex-col items-center">
          {/* Avatar Container with holographic styling */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[24px] p-2 bg-[#121218] border-2 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden group">
            {/* Ambient neon rim */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
              }}
            />

            {/* Generated Visual Avatar */}
            {miner.avatarUrl ? (
              <img
                src={miner.avatarUrl}
                alt={miner.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain rounded-[18px] transition-all duration-700 ${
                  stage === 'complete' ? 'scale-100 opacity-100' : 'scale-95 opacity-80 blur-[2px]'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 rounded-[18px]">
                <Cpu className="w-12 h-12 text-zinc-500 animate-spin" />
              </div>
            )}

            {/* Scanning Laser Beam Overlay when generating */}
            {stage !== 'complete' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#14F195] to-transparent animate-bounce shadow-[0_0_15px_#14F195]" />
                <div className="absolute bottom-4 font-mono-num text-[11px] text-[#14F195] bg-black/80 px-3 py-1 rounded-full border border-[#14F195]/40 animate-pulse">
                  {stage === 'scanning' ? 'DERIVING ED25519 SEED...' : 'SYNTHESIZING OPTICS & CORE...'}
                </div>
              </div>
            )}

            {/* Completed Hologram Stamp */}
            {stage === 'complete' && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/70 border border-emerald-500/40 text-emerald-400 font-mono-num text-[9px] flex items-center gap-1 backdrop-blur shadow">
                <CheckCircle2 className="w-3 h-3" />
                <span>IDENTIFIER VERIFIED</span>
              </div>
            )}
          </div>

          {/* Progress Bar & Telemetry Status */}
          <div className="w-full max-w-xs mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
              <span>{stage === 'complete' ? 'SYNTHESIS COMPLETE' : 'GENERATING UNIQUE IDENTIFIER'}</span>
              <span className="font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-[#14F195] to-[#FF6A00] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Miner Identity & Traits Breakdown */}
        {stage === 'complete' && (
          <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-display font-black text-[18px] text-white tracking-wide">
                {miner.name}
              </h3>
              <div className="font-mono-num text-[12px] text-zinc-400 mt-0.5 flex items-center justify-center gap-2">
                <span className="text-white font-bold">{miner.th} TH/s Hashrate</span>
                <span>•</span>
                <span className="text-[#FF6A00]">+{miner.dailyWar} WAR/day</span>
                <span>•</span>
                <span>{miner.wth} W/TH</span>
              </div>
            </div>

            {/* Visual Traits Grid */}
            {miner.visualTraits && (
              <div className="grid grid-cols-2 gap-2 text-left p-3 rounded-[16px] bg-[#121218] border border-white/10 font-mono-num text-[11px]">
                <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase">Core Reactor</div>
                  <div className="text-zinc-200 font-bold text-[11px] mt-0.5 truncate">
                    {miner.visualTraits.coreType}
                  </div>
                </div>

                <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase">Exoskeleton Chassis</div>
                  <div className="text-zinc-200 font-bold text-[11px] mt-0.5 truncate">
                    {miner.visualTraits.frameType}
                  </div>
                </div>

                <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase">Optics & Lasers</div>
                  <div className="text-zinc-200 font-bold text-[11px] mt-0.5 truncate">
                    {miner.visualTraits.opticsType}
                  </div>
                </div>

                <div className="p-2 rounded-[10px] bg-black/40 border border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase">Hash Signature</div>
                  <div className="text-emerald-400 font-bold text-[11px] mt-0.5 truncate">
                    {miner.visualTraits.hashSignature}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadAvatar}
                className="py-2.5 px-3.5 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-mono-num text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                title="Download SVG avatar"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onDeployToFleet) onDeployToFleet();
                }}
                className={`flex-1 py-3 px-4 rounded-[14px] text-black font-display font-black text-[13px] hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isLegendary
                    ? 'bg-gradient-to-r from-amber-500 via-[#FF6A00] to-yellow-400'
                    : 'bg-gradient-to-r from-purple-500 via-[#14F195] to-emerald-400'
                }`}
              >
                <span>Deploy to Fleet Manager</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Fast-forward button if still in animation */}
        {stage !== 'complete' && (
          <button
            type="button"
            onClick={handleFastForward}
            className="mt-3 text-[11px] font-mono-num text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
          >
            Skip Animation & Reveal
          </button>
        )}
      </div>
    </div>
  );
};
