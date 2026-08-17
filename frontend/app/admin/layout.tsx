'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/auth-context';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }, [user, loading, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
