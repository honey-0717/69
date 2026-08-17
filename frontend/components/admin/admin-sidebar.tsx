'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  Star,
  CircleDot,
  CreditCard,
  FileText,
  Share2,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/availability', label: 'Availability', icon: CircleDot },
  { href: '/admin/payments', label: 'Payment Methods', icon: CreditCard },
  { href: '/admin/terms', label: 'Terms & Conditions', icon: FileText },
  { href: '/admin/contacts', label: 'Social Contacts', icon: Share2 },
  { href: '/admin/message-template', label: 'Message Template', icon: MessageSquare },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

let cachedDisplayName = 'HotHarini69';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(cachedDisplayName);

  useEffect(() => {
    navItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch (e) {}
    });

    if (cachedDisplayName === 'HotHarini69') {
      apiRequest('/api/profile').then(({ data }) => {
        if (data?.display_name) {
          cachedDisplayName = data.display_name;
          setDisplayName(data.display_name);
        }
      });
    }
  }, [router]);

  const handleSignOut = async () => {
    toast.success('Signed out');
    window.location.href = '/admin/login';
    await signOut();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 relative">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">{displayName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto premium-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={17} className={cn(active && 'text-primary')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-error hover:bg-error/10 transition-all duration-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
  return (
    <>
      {/* Mobile top header bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0d0512]/95 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0 shadow-sm">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display text-sm font-bold text-white tracking-wide block leading-tight">Admin Panel</span>
            <span className="text-[10px] text-primary/90 font-medium block leading-tight">{displayName}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform touch-manipulation"
        >
          {mobileOpen ? <X size={20} className="text-primary" /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[82vw] max-w-[300px] bg-[#0f0614] border-r border-white/10 flex flex-col shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header with Close Button */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 shrink-0">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-white">Navigation</p>
                  <p className="text-[10px] text-muted-foreground">{displayName}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Links */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto premium-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 touch-manipulation',
                      active
                        ? 'bg-gradient-to-r from-primary/30 to-secondary/30 text-white border border-primary/40 shadow-sm'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon size={18} className={cn(active ? 'text-primary' : 'text-muted-foreground')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Footer */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200 touch-manipulation"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 glass border-r border-white/10 flex-col sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
