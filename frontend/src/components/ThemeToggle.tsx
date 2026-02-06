'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage and current class
    const savedTheme = localStorage.getItem('theme');
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(savedTheme === 'dark' || hasDarkClass);
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return <div className="w-14 h-7 rounded-full bg-neutral-200" />;
  }

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors p-1 flex items-center"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`absolute w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-violet-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
      <Sun className={`w-3.5 h-3.5 ml-0.5 transition-opacity ${isDark ? 'opacity-30' : 'opacity-0'} text-neutral-400`} />
      <Moon className={`w-3.5 h-3.5 ml-auto mr-0.5 transition-opacity ${isDark ? 'opacity-0' : 'opacity-30'} text-neutral-400`} />
    </button>
  );
}
