import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Eye,
  SlidersHorizontal,
  FlaskConical,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { gatewayStore } from '../lib/store';
import { modeMeta } from '../lib/utils';
import { PolicyConfig } from '../types/gateway';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: Array<{ group: string; items: NavItem[] }> = [
  {
    group: 'Operate',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
      { to: '/sessions', label: 'Sessions', icon: Activity },
      { to: '/decoy-preview', label: 'Decoy preview', icon: Eye },
    ],
  },
  {
    group: 'Tune',
    items: [
      { to: '/policy', label: 'Risk policy', icon: SlidersHorizontal },
      { to: '/simulator', label: 'Simulator', icon: FlaskConical },
    ],
  },
  {
    group: 'Govern',
    items: [
      { to: '/audit', label: 'Audit trail', icon: ScrollText },
      { to: '/settings', label: 'Settings', icon: Settings2 },
      { to: '/security', label: 'Trust boundaries', icon: ShieldCheck },
    ],
  },
];

export function ConsoleLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [policy, setPolicy] = useState<PolicyConfig>(gatewayStore.getPolicy());
  const location = useLocation();

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      setPolicy(gatewayStore.getPolicy());
    });
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const mode = policy.mode;
  const modeBadgeColor =
    mode === 'monitor'
      ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
      : mode === 'challenge'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-teal-500/30 bg-teal-500/10 text-teal-300';

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-7">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 bg-primary/10">
            <ShieldAlert className="h-4 w-4 text-primary" strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold tracking-tight">
              Adaptive Deception
            </span>
            <span className="label-mono">Gateway console</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-6">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group}>
              <p className="label-mono px-2.5 pb-2">{grp.group}</p>
              <div className="flex flex-col gap-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-accent text-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          <Link
            to="/protected-app"
            onClick={onNavigate}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span>Open sample app</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <p className="label-mono">Deployment mode</p>
        <p className="mt-1 font-mono text-[10.5px]">v1.0 · zero credential storage</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background subtle radial gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(65%_60%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1560px]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col justify-between border-r border-border/70 px-4 py-6 lg:flex">
          <NavContent />
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-[280px] border-r border-border bg-background px-4 py-6 shadow-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-5 rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md border border-border p-2 text-muted-foreground lg:hidden hover:text-foreground"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <span className="label-mono">Deception gateway</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-[12px] text-muted-foreground">Operator workspace</span>
            </div>

            {/* Mode & Policy Badge */}
            <div className="ml-auto flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${modeBadgeColor}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {modeMeta[policy.mode]}
                </span>
                <span className="hidden font-mono text-[10px] opacity-70 sm:inline">
                  {policy.policy_version}
                </span>
              </div>
            </div>
          </header>

          {/* Main Route Content */}
          <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
