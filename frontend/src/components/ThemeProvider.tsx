'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  // Sync theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      useThemeStore.setState({ theme: 'dark' });
    } else {
      document.documentElement.classList.remove('dark');
      useThemeStore.setState({ theme: 'light' });
    }
  }, []);

  return <>{children}</>;
}
