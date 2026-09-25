import { Buffer } from 'buffer';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { SolanaWalletAccount } from '../types';

if (typeof window !== 'undefined' && !window.Buffer) {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

// Standard Solana derivation path m/44'/501'/0'/0'
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

export function generateSolanaMnemonic(): string {
  return bip39.generateMnemonic(128); // 12 words
}

export function createSolanaKeypairFromMnemonic(mnemonic: string): { keypair: Keypair; seedHex: string } {
  const seed = bip39.mnemonicToSeedSync(mnemonic.trim());
  const derivedSeed = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex')).key;
  const keypair = Keypair.fromSeed(derivedSeed);
  return { keypair, seedHex: seed.toString('hex') };
}

export function createRandomSolanaKeypair(): Keypair {
  return Keypair.generate();
}

export function exportSolanaPrivateKey(keypair: Keypair): string {
  return bs58.encode(keypair.secretKey);
}

export function importSolanaFromPrivateKey(privateKeyBase58: string): Keypair {
  const decoded = bs58.decode(privateKeyBase58.trim());
  if (decoded.length === 64) {
    return Keypair.fromSecretKey(decoded);
  } else if (decoded.length === 32) {
    return Keypair.fromSeed(decoded);
  }
  throw new Error('Invalid private key length. Expected 32 or 64 bytes.');
}

export function formatSolanaAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    const decoded = bs58.decode(address.trim());
    return decoded.length === 32;
  } catch {
    return false;
  }
}

export function generateInitialSolanaWallet(name: string = 'Solana Main Vault'): SolanaWalletAccount {
  const mnemonic = generateSolanaMnemonic();
  const { keypair } = createSolanaKeypairFromMnemonic(mnemonic);
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = exportSolanaPrivateKey(keypair);

  return {
    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    publicKey,
    secretKey,
    mnemonic,
    solBalance: 2.5, // Starter devnet SOL for gas & testing
    warBalance: 12450.2,
    createdAt: Date.now(),
    network: 'devnet',
  };
}
