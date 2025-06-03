import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, Shuffle, Repeat, BarChart3, History, User, Settings,
  Gift, UserPlus, Coins, Sun, FileText, HelpCircle, Building2,
  Layers, Wrench, Zap, ArrowLeftRight
} from 'lucide-react';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Chains', href: '/chains', icon: Layers },
    { name: 'Create', href: '/create', icon: Wrench },
    { name: 'Deploy', href: '/deploy', icon: Zap },
    { name: 'Swap', href: '/swap', icon: Repeat },
    { name: 'Bridge', href: '/bridge', icon: ArrowLeftRight, badge: 'NEW', description: 'Cross-chain asset bridging with point rewards' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'History', href: '/history', icon: History },
  ];

  const enterpriseNav = [
    { name: 'Enterprise', href: '/enterprise', icon: Building2 },
  ];

  const socialNav = [
    { name: 'Points', href: '/points', icon: Gift },
    { name: 'Referrals', href: '/referrals', icon: UserPlus },
    { name: 'Earn STEX', href: '/earn-stex', icon: Coins },
    { name: 'GM Protocol', href: '/gm', icon: Sun },
  ];

  const accountNav = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const supportNav = [
    { name: 'Documentation', href: '/docs', icon: FileText },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-xl">SCRYPTEX</span>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Main Navigation */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
                Platform
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            {/* Enterprise Navigation */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
                Enterprise
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {enterpriseNav.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            {/* Social & Rewards */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
                Social & Rewards
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {socialNav.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            {/* Account */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
                Account
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {accountNav.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            {/* Support */}
            <li className="mt-auto">
              <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
                Support
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {supportNav.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
