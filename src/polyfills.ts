import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment needed by @solana/web3.js, bip39, etc.
if (typeof window !== 'undefined') {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  (window as unknown as { global: typeof window }).global = window;
  if (!(window as unknown as { process: unknown }).process) {
    (window as unknown as { process: { env: Record<string, string> } }).process = { env: {} };
  }
}

if (typeof globalThis !== 'undefined') {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}
