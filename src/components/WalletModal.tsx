import React from 'react';

interface WalletModalProps {
  isOpen: boolean;
  connectingWallet: string | null;
  onClose: () => void;
  onConnect: (walletName: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  connectingWallet,
  onClose,
  onConnect,
}) => {
  if (!isOpen) return null;

  const walletOptions = [
    { name: 'Aries Wallet', desc: 'Native • Proof-of-War ready', badge: 'RECOMMENDED' },
    { name: 'Phantom', desc: 'Solana / EVM compatible', badge: null },
    { name: 'Backpack', desc: 'xNFT enabled', badge: null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
        onClick={() => !connectingWallet && onClose()}
      />
      <div className="relative w-full max-w-[380px] card rounded-[20px] p-5 inner-shadow">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-[13px] tracking-wide">
            CONNECT ARIES WALLET
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.name}
              disabled={Boolean(connectingWallet)}
              onClick={() => onConnect(wallet.name)}
              className="w-full flex items-center justify-between p-3.5 rounded-[14px] bg-[#0F0F10] border border-white/10 hover:border-[#FF6A00]/30 hover:bg-[#151517] transition text-left group disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-[14px] group-hover:from-[#FF6A00] group-hover:to-orange-700 group-hover:text-black transition">
                  {wallet.name[0]}
                </div>
                <div>
                  <div className="font-display font-bold text-[13px] text-white flex items-center gap-2">
                    {wallet.name}
                    {connectingWallet === wallet.name && (
                      <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="font-mono-num text-[11px] text-zinc-500">{wallet.desc}</div>
                </div>
              </div>
              {wallet.badge && (
                <div className="font-mono-num text-[9px] px-2 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/20 text-[#FF6A00]">
                  {wallet.badge}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 font-mono-num text-[10px] text-zinc-600 text-center leading-[1.4]">
          800ms secure link • Generates address, 12,450 WAR demo balance • localStorage persisted. Mock connection for demo.
        </div>
      </div>
    </div>
  );
};
