import { Miner, MinerVisualTraits, Rarity } from '../types';

const LEGENDARY_CORES = [
  'Solar Singularity Core',
  'Quantum Titan Reactor',
  'Solana Stellar Matrix',
  'Aries Gilded Photon Core',
  'Celestial Fusion Cell',
];

const EPIC_CORES = [
  'Amethyst Nexus Core',
  'Cyber-Spectre Coil',
  'Hyper-Flux Conduit',
  'Vanguard Plasma Ring',
  'Dark Matter Resonator',
];

const LEGENDARY_FRAMES = [
  'Mk-VII Solar Aegis',
  'Aurum Hex-Armor Chassis',
  'Gilded Celestial Exoskeleton',
  'Titan Obsidian Frame',
];

const EPIC_FRAMES = [
  'Amethyst Titanium Weave',
  'Cobalt Void Chassis',
  'Spectre Nanotech Plate',
  'Cybernetic Shadow Frame',
];

const LEGENDARY_OPTICS = [
  'Twin Solar Laser Lenses',
  'Gilded Ocular Matrix',
  'Amber Quantum Sight',
  'Photon Ray Array',
];

const EPIC_OPTICS = [
  'Neon Cyan Targeting Visor',
  'Amethyst Dual Lasers',
  'Ultraviolet Scanner Eye',
  'Prismatic Sensor Beam',
];

/**
 * Deterministically generates unique visual traits for a miner based on its ID and rarity
 */
export function generateMinerTraits(minerId: number, rarity: Rarity): MinerVisualTraits {
  const seed = Math.abs(minerId);
  const isLegendary = rarity === 'Legendary';

  const coreList = isLegendary ? LEGENDARY_CORES : EPIC_CORES;
  const frameList = isLegendary ? LEGENDARY_FRAMES : EPIC_FRAMES;
  const opticsList = isLegendary ? LEGENDARY_OPTICS : EPIC_OPTICS;

  const coreType = coreList[seed % coreList.length];
  const frameType = frameList[(seed >> 2) % frameList.length];
  const opticsType = opticsList[(seed >> 4) % opticsList.length];

  const auraColor = isLegendary
    ? (seed % 2 === 0 ? '#F59E0B' : '#FF6A00')
    : (seed % 2 === 0 ? '#8B5CF6' : '#6366F1');

  // Pseudo-hash signature
  const hexPart = Math.abs(Math.sin(minerId) * 100000000).toString(16).padEnd(8, '0').slice(0, 8);
  const hashSignature = `0x${hexPart}${minerId.toString(16).padStart(4, '0')}`;

  return {
    coreType,
    frameType,
    opticsType,
    auraColor,
    hashSignature,
  };
}

/**
 * Generates an SVG Data-URL for a Legendary or Epic miner visual identifier avatar.
 */
export function generateMinerAvatarUrl(miner: { id: number; name: string; rarity: Rarity; th: number }): {
  avatarUrl: string;
  traits: MinerVisualTraits;
} {
  const traits = generateMinerTraits(miner.id, miner.rarity);
  const isLegendary = miner.rarity === 'Legendary';

  // Primary & secondary color palettes
  const primaryGlow = isLegendary ? '#F59E0B' : '#A855F7';
  const secondaryGlow = isLegendary ? '#FF6A00' : '#3B82F6';
  const accentNeon = isLegendary ? '#14F195' : '#06B6D4';
  const bgDark1 = isLegendary ? '#181206' : '#140D24';
  const bgDark2 = isLegendary ? '#0B0803' : '#090514';

  const seed = Math.abs(miner.id);
  const rotationAngle = (seed % 36) * 10;
  const coreRadius = 38 + (seed % 10);
  const outerHexPoints = "200,30 350,115 350,285 200,370 50,285 50,115";
  const innerHexPoints = "200,55 325,125 325,275 200,345 75,275 75,125";

  // Build SVG Markup
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgDark1}"/>
        <stop offset="100%" stop-color="${bgDark2}"/>
      </linearGradient>

      <linearGradient id="primaryCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryGlow}"/>
        <stop offset="100%" stop-color="${secondaryGlow}"/>
      </linearGradient>

      <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isLegendary ? '#FBBF24' : '#C084FC'}"/>
        <stop offset="50%" stop-color="${isLegendary ? '#78350F' : '#4C1D95'}"/>
        <stop offset="100%" stop-color="${isLegendary ? '#D97706' : '#9333EA'}"/>
      </linearGradient>

      <radialGradient id="reactorPulse" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accentNeon}" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="${primaryGlow}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${primaryGlow}" stop-opacity="0"/>
      </radialGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Background Space & Grid -->
    <rect width="400" height="400" fill="url(#bgGrad)" rx="24"/>

    <!-- Subtle Cyber Circuit Grid -->
    <g opacity="0.15" stroke="${primaryGlow}" stroke-width="1">
      <line x1="50" y1="0" x2="50" y2="400"/>
      <line x1="200" y1="0" x2="200" y2="400"/>
      <line x1="350" y1="0" x2="350" y2="400"/>
      <line x1="0" y1="100" x2="400" y2="100"/>
      <line x1="0" y1="200" x2="400" y2="200"/>
      <line x1="0" y1="300" x2="400" y2="300"/>
    </g>

    <!-- Outer Armor Chassis Hexagon -->
    <polygon points="${outerHexPoints}" fill="none" stroke="url(#frameGrad)" stroke-width="6" filter="url(#glow)"/>
    <polygon points="${innerHexPoints}" fill="#0A0A0E" stroke="${primaryGlow}" stroke-width="2" stroke-dasharray="8 4" opacity="0.8"/>

    <!-- Corner Fortification Accents -->
    <circle cx="50" cy="115" r="7" fill="${primaryGlow}" filter="url(#glow)"/>
    <circle cx="350" cy="115" r="7" fill="${primaryGlow}" filter="url(#glow)"/>
    <circle cx="350" cy="285" r="7" fill="${primaryGlow}" filter="url(#glow)"/>
    <circle cx="50" cy="285" r="7" fill="${primaryGlow}" filter="url(#glow)"/>
    <circle cx="200" cy="30" r="9" fill="${accentNeon}" filter="url(#glow)"/>
    <circle cx="200" cy="370" r="9" fill="${accentNeon}" filter="url(#glow)"/>

    <!-- Rotating Tech Gear Rings -->
    <g transform="rotate(${rotationAngle} 200 200)">
      <circle cx="200" cy="200" r="95" fill="none" stroke="${secondaryGlow}" stroke-width="2" stroke-dasharray="14 8" opacity="0.7"/>
      <circle cx="200" cy="200" r="75" fill="none" stroke="${primaryGlow}" stroke-width="3" stroke-dasharray="20 10"/>
    </g>

    <g transform="rotate(-${rotationAngle * 1.5} 200 200)">
      <circle cx="200" cy="200" r="60" fill="none" stroke="${accentNeon}" stroke-width="2" stroke-dasharray="10 6" opacity="0.8"/>
      <!-- Crosshairs -->
      <line x1="200" y1="130" x2="200" y2="150" stroke="${accentNeon}" stroke-width="2"/>
      <line x1="200" y1="250" x2="200" y2="270" stroke="${accentNeon}" stroke-width="2"/>
      <line x1="130" y1="200" x2="150" y2="200" stroke="${accentNeon}" stroke-width="2"/>
      <line x1="250" y1="200" x2="270" y2="200" stroke="${accentNeon}" stroke-width="2"/>
    </g>

    <!-- Central Singularity Reactor Core -->
    <circle cx="200" cy="200" r="${coreRadius + 14}" fill="url(#reactorPulse)"/>
    <circle cx="200" cy="200" r="${coreRadius}" fill="url(#primaryCoreGrad)" filter="url(#glow)"/>

    <!-- Central Solana Icon / Core Insignia -->
    <g transform="translate(182, 182) scale(0.9)">
      <path d="M4 8h28l4 6H8z" fill="#000" opacity="0.8"/>
      <path d="M8 18h28l-4 6H4z" fill="#000" opacity="0.8"/>
      <path d="M4 28h28l4 6H8z" fill="#000" opacity="0.8"/>
      <path d="M6 10h24l3 4H9z" fill="${accentNeon}"/>
      <path d="M9 19h24l-3 4H6z" fill="#FFF"/>
      <path d="M6 29h24l3 4H9z" fill="${accentNeon}"/>
    </g>

    <!-- Energy Conduits / Laser Optics -->
    <line x1="110" y1="200" x2="160" y2="200" stroke="${accentNeon}" stroke-width="3" filter="url(#glow)"/>
    <line x1="240" y1="200" x2="290" y2="200" stroke="${accentNeon}" stroke-width="3" filter="url(#glow)"/>

    <!-- Data Stamping & Labels -->
    <text x="200" y="325" font-family="monospace" font-size="11" font-weight="bold" fill="${primaryGlow}" text-anchor="middle" letter-spacing="2">
      ${isLegendary ? 'LEGENDARY // SOLAR CORE' : 'EPIC // QUANTUM NEXUS'}
    </text>

    <text x="200" y="342" font-family="monospace" font-size="9" fill="#9CA3AF" text-anchor="middle">
      RIG #${miner.id} • ${miner.th} TH/s • ${traits.hashSignature}
    </text>
  </svg>`;

  const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
  return {
    avatarUrl: encodedSvg,
    traits,
  };
}
