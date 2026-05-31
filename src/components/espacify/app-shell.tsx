'use client';

import { useState } from 'react';
import { useNavigation, useAuth } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  User,
  Settings,
  Shield,
  LogOut,
  Plus,
  Menu,
  Moon,
  Sun,
  ChevronLeft,
  Activity,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
  { id: 'documents' as const, label: 'Documents', icon: FileText },
  { id: 'audit' as const, label: 'Audit Log', icon: Activity, adminOnly: true },
];

const bottomItems = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

function SidebarNav({ collapsed, onToggle, onNavigate }: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const { currentView, navigate } = useNavigation();
  const { user, clearAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/');
    navigate('landing');
    onNavigate?.();
  };

  const handleNav = (id: typeof navItems[number]['id']) => {
    navigate(id);
    onNavigate?.();
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 h-16 border-b">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Image src="/logo.png" alt="Espacify" width={28} height={28} className="rounded-md" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight">Espacify</span>}
        {onToggle && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 flex-shrink-0" onClick={onToggle}>
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Button className="w-full gap-2" onClick={() => handleNav('project-create' as never)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-10',
                  currentView === item.id && 'bg-secondary font-medium'
                )}
                onClick={() => handleNav(item.id)}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            ))}
        </nav>
      </ScrollArea>

      <div className="border-t">
        <div className="px-3 py-2 space-y-1">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-10',
                currentView === item.id && 'bg-secondary font-medium'
              )}
              onClick={() => handleNav(item.id)}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        <Separator />

        <div className="px-3 py-3">
          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 mt-2">
            {!collapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={handleLogout}>
              <LogOut className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-sidebar h-screen sticky top-0 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg h-14 flex items-center px-4 gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Espacify" width={22} height={22} className="rounded" />
            </div>
            <span className="font-bold text-sm">Espacify</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>

        {/* Footer */}
        <footer className="border-t py-4 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} MIMSAR — Espacify</span>
            <span>Confidential</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
