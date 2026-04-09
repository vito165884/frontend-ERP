'use client';

import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ onToggleSidebar, isDarkMode, onToggleDarkMode }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    setUser(authService.getUser());
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="flex h-16 items-center justify-between px-8 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:flex items-center gap-3">
            <div className="h-8 w-8 bg-white text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm">S</div>
            <h1 className="font-bold text-lg text-foreground">Silk Road</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1 h-8 text-xs">
                {selectedYear}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {[2024, 2023, 2022].map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => {
                    setSelectedYear(year.toString());
                    authService.setAccountingYear(year.toString());
                  }}
                  className="text-xs"
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary transition-all">
                <div className="flex items-center justify-center w-7 h-7 bg-secondary rounded-md text-foreground text-xs font-bold border border-border">
                  {isMounted ? (user?.name?.charAt(0).toUpperCase() || 'U') : 'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{isMounted ? (user?.name || 'User') : 'User'}</p>
                <p className="text-xs text-muted-foreground">{isMounted ? (user?.email || '') : ''}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm cursor-pointer hover:bg-secondary">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer hover:bg-secondary">Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-sm text-destructive cursor-pointer hover:bg-secondary">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
