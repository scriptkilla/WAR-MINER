import React from 'react';
import { AppPage } from '../types';
import {
  Zap,
  Cpu,
  ShoppingBag,
  FlaskConical,
  Target,
  Flame,
  Calculator,
  Gift,
  History,
  User,
  Settings,
} from 'lucide-react';

interface NavigationProps {
  activePage: AppPage;
  onChangePage: (page: AppPage) => void;
  mining: boolean;
  minerCount: number;
  unclaimedMissionsCount: number;
  referralCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onChangePage,
  mining,
  minerCount,
  unclaimedMissionsCount,
  referralCount,
}) => {
  const navItems: {
    id: AppPage;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    pulseDot?: boolean;
  }[] = [
    {
      id: 'mining',
      label: 'Mining Console',
      icon: <Zap className="w-3.5 h-3.5" />,
      pulseDot: mining,
    },
    {
      id: 'fleet',
      label: 'Fleet Manager',
      icon: <Cpu className="w-3.5 h-3.5" />,
      badge: `${minerCount}`,
      badgeColor: 'bg-white/10 text-zinc-300',
    },
    {
      id: 'market',
      label: 'Marketplace',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    {
      id: 'upgrades',
      label: 'Upgrades Lab',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
    },
    {
      id: 'missions',
      label: 'Missions & Quests',
      icon: <Target className="w-3.5 h-3.5" />,
      badge: unclaimedMissionsCount > 0 ? `${unclaimedMissionsCount} CLAIM` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse',
    },
    {
      id: 'burn',
      label: 'Burns & Clans',
      icon: <Flame className="w-3.5 h-3.5" />,
    },
    {
      id: 'calculator',
      label: 'ROI Calculator',
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
    {
      id: 'referrals',
      label: 'Referral Network',
      icon: <Gift className="w-3.5 h-3.5" />,
      badge: referralCount > 0 ? `${referralCount}` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'history',
      label: 'Tx History',
      icon: <History className="w-3.5 h-3.5" />,
    },
    {
      id: 'profile',
      label: 'Operator Profile',
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <nav className="relative z-15 border-b border-white/[0.06] bg-[#0A0A0B]/90 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangePage(item.id)}
                type="button"
                className={`shrink-0 h-9 px-3.5 rounded-full font-display font-bold text-[12px] flex items-center gap-2 transition cursor-pointer border select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-[#FF6A00] text-white border-transparent shadow-lg shadow-purple-950/40'
                    : 'bg-[#121216] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/10'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {item.pulseDot && (
                  <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping ml-0.5" />
                )}

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono-num text-[10px] font-bold ${
                      item.badgeColor || (isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-zinc-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
